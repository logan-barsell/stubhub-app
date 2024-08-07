import request from 'supertest';
import { app } from '../../app';

it('fails with an email that does not exist', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'unknown@user.com',
      password: 'password',
    })
    .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@user.com',
      password: 'popcorn123',
    })
    .expect(201);
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@user.com',
      password: 'password',
    })
    .expect(400);
});

it('responds with a cookie on successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@user.com',
      password: 'popcorn123',
    })
    .expect(201);
  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@user.com',
      password: 'popcorn123',
    })
    .expect(201);
  expect(response.get('Set-Cookie')).toBeDefined();
});
