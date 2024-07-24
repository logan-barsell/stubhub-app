import request from 'supertest';
import { app } from '../../app';

it('Responds with details about the current authenticated user', async () => {
  const cookie = await global.signup();
  if (cookie) {
    const response = await request(app)
      .get('/api/users/currentUser')
      .set('Cookie', cookie)
      .send()
      .expect(200);
    expect(response.body.currentUser.email).toEqual('test@user.com');
  } else {
    fail('Signup did not provide a cookie');
  }
});

it('Responds with null when not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentUser')
    .send()
    .expect(200);
  expect(response.body.currentUser).toEqual(undefined);
});
