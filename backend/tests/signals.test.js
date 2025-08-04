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

describe('Signals Endpoints', () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Signal.deleteMany({});

    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!'
    };

    const signupResponse = await request(app)
      .post('/auth/signup')
      .send(userData);

    userToken = signupResponse.body.data.token;
    userId = signupResponse.body.data.user._id;
  });

  describe('POST /signals', () => {
    it('should create a signal with valid data', async () => {
      const signalData = {
        agent_id: 'agent_001',
        signal_type: 'HRV',
        timestamp: '2024-01-01T10:00:00.000Z',
        payload: {
          raw: [100, 102, 98, 105, 99],
          avg: 100.8,
          sdnn: 2.5
        },
        context: {
          environment: 'testing'
        }
      };

      const response = await request(app)
        .post('/signals')
        .set('Authorization', `Bearer ${userToken}`)
        .send(signalData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.signal.agent_id).toBe(signalData.agent_id);
      expect(response.body.data.signal.signal_type).toBe(signalData.signal_type);
      expect(response.body.data.signal.user_id).toBe(userId);
    });

    it('should reject signal creation without authentication', async () => {
      const signalData = {
        agent_id: 'agent_001',
        signal_type: 'HRV',
        timestamp: '2024-01-01T10:00:00.000Z',
        payload: {
          raw: [100, 102, 98, 105, 99],
          avg: 100.8
        }
      };

      const response = await request(app)
        .post('/signals')
        .send(signalData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject signal with invalid signal_type', async () => {
      const signalData = {
        agent_id: 'agent_001',
        signal_type: 'INVALID_TYPE',
        timestamp: '2024-01-01T10:00:00.000Z',
        payload: {
          raw: [100, 102, 98, 105, 99],
          avg: 100.8
        }
      };

      const response = await request(app)
        .post('/signals')
        .set('Authorization', `Bearer ${userToken}`)
        .send(signalData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject signal with missing required fields', async () => {
      const signalData = {
        signal_type: 'HRV',
        timestamp: '2024-01-01T10:00:00.000Z'
      };

      const response = await request(app)
        .post('/signals')
        .set('Authorization', `Bearer ${userToken}`)
        .send(signalData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should reject signal with invalid timestamp format', async () => {
      const signalData = {
        agent_id: 'agent_001',
        signal_type: 'HRV',
        timestamp: 'invalid-date',
        payload: {
          raw: [100, 102, 98, 105, 99],
          avg: 100.8
        }
      };

      const response = await request(app)
        .post('/signals')
        .set('Authorization', `Bearer ${userToken}`)
        .send(signalData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /signals', () => {
    beforeEach(async () => {
      const signals = [
        {
          user_id: userId,
          agent_id: 'agent_001',
          signal_type: 'HRV',
          timestamp: new Date('2024-01-01T10:00:00.000Z'),
          payload: { raw: [100, 102], avg: 101 }
        },
        {
          user_id: userId,
          agent_id: 'agent_002',
          signal_type: 'GSR',
          timestamp: new Date('2024-01-01T11:00:00.000Z'),
          payload: { raw: [200, 202], avg: 201 }
        }
      ];

      await Signal.insertMany(signals);
    });

    it('should retrieve all signals for authenticated user', async () => {
      const response = await request(app)
        .get('/signals')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.signals).toHaveLength(2);
      expect(response.body.data.pagination.totalItems).toBe(2);
    });

    it('should filter signals by type', async () => {
      const response = await request(app)
        .get('/signals?signal_type=HRV')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.signals).toHaveLength(1);
      expect(response.body.data.signals[0].signal_type).toBe('HRV');
    });

    it('should paginate signals correctly', async () => {
      const response = await request(app)
        .get('/signals?page=1&limit=1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.signals).toHaveLength(1);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/signals')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid signal_type filter', async () => {
      const response = await request(app)
        .get('/signals?signal_type=INVALID')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /signals/:id', () => {
    let signalId;

    beforeEach(async () => {
      const signal = new Signal({
        user_id: userId,
        agent_id: 'agent_001',
        signal_type: 'HRV',
        timestamp: new Date(),
        payload: { raw: [100, 102], avg: 101 }
      });
      
      const savedSignal = await signal.save();
      signalId = savedSignal._id.toString();
    });

    it('should retrieve specific signal by ID', async () => {
      const response = await request(app)
        .get(`/signals/${signalId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.signal._id).toBe(signalId);
    });

    it('should return 404 for non-existent signal', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/signals/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Signal not found');
    });

    it('should reject invalid MongoDB ID format', async () => {
      const response = await request(app)
        .get('/signals/invalid-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /signals/:id', () => {
    let signalId;

    beforeEach(async () => {
      const signal = new Signal({
        user_id: userId,
        agent_id: 'agent_001',
        signal_type: 'HRV',
        timestamp: new Date(),
        payload: { raw: [100, 102], avg: 101 }
      });
      
      const savedSignal = await signal.save();
      signalId = savedSignal._id.toString();
    });

    it('should delete specific signal by ID', async () => {
      const response = await request(app)
        .delete(`/signals/${signalId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Signal deleted successfully');

      const deletedSignal = await Signal.findById(signalId);
      expect(deletedSignal).toBeNull();
    });

    it('should return 404 when deleting non-existent signal', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/signals/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Signal not found');
    });
  });
});