import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('fetches the order', async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();
  // make a request to build an order with this ticket
  const cookie = global.signup();
  if (cookie) {
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ ticketId: ticket.id })
      .expect(201);
    // make a request to fetch the order
    const { body: fetched } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', cookie)
      .send()
      .expect(200);
    expect(fetched.id).toEqual(order.id);
  } else {
    fail('Signup did not provide a cookie');
  }
});
