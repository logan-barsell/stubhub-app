import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('returns the ticket if the ticket is found', async () => {
  const cookie = global.signup();
  const title = 'Item';
  const price = 20;
  if (cookie) {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({ title, price })
      .expect(201);
    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send()
      .expect(200);
    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
  } else {
    fail('Signup did not provide a cookie');
  }
});
