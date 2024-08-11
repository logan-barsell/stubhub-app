import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  var signup: () => string[] | undefined;
}

jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'supersecret_key';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
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

global.signup = () => {
  // build JWT payload
  const id = new mongoose.Types.ObjectId().toHexString();
  const payload = {
    id,
    email: 'test@user.com',
  };
  // create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // build session object
  const session = { jwt: token };
  // modify to JSON
  const sessionJSON = JSON.stringify(session);
  // encode as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');
  // return string as cookie with the encoded data
  return [`session=${base64}`];
};
