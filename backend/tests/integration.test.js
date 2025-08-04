const request = require('supertest');
const express = require('express');
const { User, Signal } = require('../src/models');
const authRouter = require('../src/routes/auth');
const signalsRouter = require('../src/routes/signals');
const { connectToDatabase, disconnectFromDatabase } = require('../src/utils/database');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use('/signals', signalsRouter);

describe('Integration Tests - Full API Workflows', () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Signal.deleteMany({});
  });

  describe('Complete User Journey', () => {
    it('should allow complete signup -> login -> create signal -> view signals workflow', async () => {
      const userData = {
        username: 'integrationuser',
        email: 'integration@example.com',
        password: 'Test123!'
      };

      const signupResponse = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      expect(signupResponse.body.success).toBe(true);
      expect(signupResponse.body.data.token).toBeDefined();

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      const token = loginResponse.body.data.token;

      const signalData = {
        agent_id: 'integration_agent',
        signal_type: 'HRV',
        timestamp: '2024-01-01T10:00:00.000Z',
        payload: {
          raw: [100, 102, 98, 105, 99],
          avg: 100.8,
          sdnn: 2.5
        },
        context: {
          test: 'integration'
        }
      };

      const createSignalResponse = await request(app)
        .post('/signals')
        .set('Authorization', `Bearer ${token}`)
        .send(signalData)
        .expect(201);

      expect(createSignalResponse.body.success).toBe(true);
      const signalId = createSignalResponse.body.data.signal._id;

      const getSignalsResponse = await request(app)
        .get('/signals')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getSignalsResponse.body.success).toBe(true);
      expect(getSignalsResponse.body.data.signals).toHaveLength(1);
      expect(getSignalsResponse.body.data.signals[0]._id).toBe(signalId);

      const getSignalResponse = await request(app)
        .get(`/signals/${signalId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getSignalResponse.body.success).toBe(true);
      expect(getSignalResponse.body.data.signal._id).toBe(signalId);
    });

    it('should maintain data isolation between users', async () => {
      const user1Data = {
        username: 'user1',
        email: 'user1@example.com',
        password: 'Test123!'
      };

      const user2Data = {
        username: 'user2',
        email: 'user2@example.com',
        password: 'Test123!'
      };

      const user1Signup = await request(app)
        .post('/auth/signup')
        .send(user1Data)
        .expect(201);

      const user2Signup = await request(app)
        .post('/auth/signup')
        .send(user2Data)
        .expect(201);

      const user1Token = user1Signup.body.data.token;
      const user2Token = user2Signup.body.data.token;

      const signalData = {
        agent_id: 'test_agent',
        signal_type: 'GSR',
        timestamp: '2024-01-01T10:00:00.000Z',
        payload: {
          raw: [50, 52, 48],
          avg: 50
        }
      };

      await request(app)
        .post('/signals')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(signalData)
        .expect(201);

      await request(app)
        .post('/signals')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          ...signalData,
          agent_id: 'user2_agent'
        })
        .expect(201);

      const user1Signals = await request(app)
        .get('/signals')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const user2Signals = await request(app)
        .get('/signals')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(user1Signals.body.data.signals).toHaveLength(1);
      expect(user2Signals.body.data.signals).toHaveLength(1);
      expect(user1Signals.body.data.signals[0].agent_id).toBe('test_agent');
      expect(user2Signals.body.data.signals[0].agent_id).toBe('user2_agent');
    });

    it('should handle concurrent signal creation', async () => {
      const userData = {
        username: 'concurrentuser',
        email: 'concurrent@example.com',
        password: 'Test123!'
      };

      const signupResponse = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      const token = signupResponse.body.data.token;

      const signalPromises = [];
      for (let i = 0; i < 5; i++) {
        const signalData = {
          agent_id: `agent_${i}`,
          signal_type: 'HRV',
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          payload: {
            raw: [100 + i, 102 + i, 98 + i],
            avg: 100 + i
          }
        };

        signalPromises.push(
          request(app)
            .post('/signals')
            .set('Authorization', `Bearer ${token}`)
            .send(signalData)
        );
      }

      const responses = await Promise.all(signalPromises);

      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      const getSignalsResponse = await request(app)
        .get('/signals')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getSignalsResponse.body.data.signals).toHaveLength(5);
    });
  });

  describe('Error Handling Workflows', () => {
    it('should handle authentication failures gracefully', async () => {
      const signalData = {
        agent_id: 'test_agent',
        signal_type: 'HRV',
        timestamp: '2024-01-01T10:00:00.000Z',
        payload: {
          raw: [100, 102],
          avg: 101
        }
      };

      await request(app)
        .post('/signals')
        .send(signalData)
        .expect(401);

      await request(app)
        .post('/signals')
        .set('Authorization', 'Bearer invalid-token')
        .send(signalData)
        .expect(401);

      await request(app)
        .get('/signals')
        .expect(401);
    });

    it('should handle validation failures in complete workflows', async () => {
      const invalidUserData = {
        username: 'ab',
        email: 'invalid-email',
        password: 'weak'
      };

      const signupResponse = await request(app)
        .post('/auth/signup')
        .send(invalidUserData)
        .expect(400);

      expect(signupResponse.body.success).toBe(false);
      expect(signupResponse.body.errors.length).toBeGreaterThan(0);

      const validUserData = {
        username: 'validuser',
        email: 'valid@example.com',
        password: 'Valid123!'
      };

      const validSignup = await request(app)
        .post('/auth/signup')
        .send(validUserData)
        .expect(201);

      const token = validSignup.body.data.token;

      const invalidSignalData = {
        agent_id: '',
        signal_type: 'INVALID_TYPE',
        timestamp: 'invalid-date',
        payload: {
          raw: 'not-an-array',
          avg: 'not-a-number'
        }
      };

      const createSignalResponse = await request(app)
        .post('/signals')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidSignalData)
        .expect(400);

      expect(createSignalResponse.body.success).toBe(false);
      expect(createSignalResponse.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Filtering and Pagination Workflows', () => {
    let token;

    beforeEach(async () => {
      const userData = {
        username: 'filteruser',
        email: 'filter@example.com',
        password: 'Test123!'
      };

      const signupResponse = await request(app)
        .post('/auth/signup')
        .send(userData);

      token = signupResponse.body.data.token;

      const signalTypes = ['HRV', 'GSR', 'respiration', 'temperature'];
      const signalPromises = [];

      for (let i = 0; i < 10; i++) {
        const signalData = {
          agent_id: `agent_${i}`,
          signal_type: signalTypes[i % signalTypes.length],
          timestamp: new Date(Date.now() + i * 60000).toISOString(),
          payload: {
            raw: [100 + i, 102 + i],
            avg: 101 + i
          }
        };

        signalPromises.push(
          request(app)
            .post('/signals')
            .set('Authorization', `Bearer ${token}`)
            .send(signalData)
        );
      }

      await Promise.all(signalPromises);
    });

    it('should filter and paginate signals correctly', async () => {
      const hrvSignalsResponse = await request(app)
        .get('/signals?signal_type=HRV&page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(hrvSignalsResponse.body.success).toBe(true);
      expect(hrvSignalsResponse.body.data.signals.length).toBeLessThanOrEqual(2);
      
      hrvSignalsResponse.body.data.signals.forEach(signal => {
        expect(signal.signal_type).toBe('HRV');
      });

      expect(hrvSignalsResponse.body.data.pagination.currentPage).toBe(1);
    });

    it('should handle empty filter results', async () => {
      const emptyResponse = await request(app)
        .get('/signals?signal_type=heart_rate')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(emptyResponse.body.success).toBe(true);
      expect(emptyResponse.body.data.signals).toHaveLength(0);
      expect(emptyResponse.body.data.pagination.totalItems).toBe(0);
    });
  });
});