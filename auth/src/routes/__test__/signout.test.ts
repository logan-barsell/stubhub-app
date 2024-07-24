import request from 'supertest';
import { app } from '../../app';

it('Cookies are cleared upon signing out', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@user.com',
      password: 'popcorn123',
    })
    .expect(201);
  const response = await request(app)
    .post('/api/users/signout')
    .send({
      email: 'test@user.com',
      password: 'popcorn123',
    })
    .expect(200);
  let cookie = response.get('Set-Cookie');
  let strVal;
  if (cookie) {
    strVal = cookie[0];
  }
  expect(strVal).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
