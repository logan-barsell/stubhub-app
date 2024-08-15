import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@stubblyhubbly/common';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('deletes/cancels the order', async () => {
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
    // make a request to delete the order
    const { body: deleted } = await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', cookie)
      .send()
      .expect(204);
    // attempt to fetch the order and the status should be updated to cancelled
    const { body: fetched } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', cookie)
      .send()
      .expect(200);
    expect(fetched.status).toEqual(OrderStatus.Cancelled);
  } else {
    fail('Signup did not provide a cookie');
  }
});

it('emits an order cancelled event', async () => {
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
    // make a request to delete the order
    const { body: deleted } = await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', cookie)
      .send()
      .expect(204);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
  } else {
    fail('Signup did not provide a cookie');
  }
});
