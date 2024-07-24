import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@user.com',
      password: 'popcorn123',
    })
    .expect(201);
});

it('returns a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'testusercom',
      password: 'popcorn123',
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@user.com',
      password: '1',
    })
    .expect(400);
});

it('returns a 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@user.com',
    })
    .expect(400);
  return request(app)
    .post('/api/users/signup')
    .send({
      password: 'popcorn123',
    })
    .expect(400);
});

it('does not allow duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@user.com',
      password: 'popcorn123',
    })
    .expect(201);
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@user.com',
      password: 'popcorn123',
    })
    .expect(400);
});

it('sets a cookie after successful sign up', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@user.com',
      password: 'popcorn123',
    })
    .expect(201);
  expect(response.get('Set-Cookie')).toBeDefined();
});
