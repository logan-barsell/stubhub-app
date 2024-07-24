import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';

declare global {
  var signup: () => Promise<string[] | undefined>;
}

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'supersecret_key';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signup = async () => {
  const email = 'test@user.com';
  const password = 'popcorn123';

  const response = await request(app)
    .post('/api/users/signup')
    .send({ email, password });
  expect(201);

  const cookie = response.get('Set-Cookie');
  return cookie;
};
