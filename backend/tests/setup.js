const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

beforeAll(async () => {
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }
  
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'test-jwt-secret';
});

afterAll(async () => {
  if (mongod) {
    await mongod.stop();
  }
});