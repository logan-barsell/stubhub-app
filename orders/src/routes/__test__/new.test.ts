import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the ticket does not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signup();
  if (cookie) {
    await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ ticketId })
      .expect(404);
  } else {
    fail('Signup did not provide a cookie');
  }
});

it('returns an error if the ticket is already reserved', async () => {
  const cookie = global.signup();
  if (cookie) {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'Concert',
      price: 20,
    });
    await ticket.save();
    const order = Order.build({
      ticket,
      userId: 'myUserId123',
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });
    await order.save();
    await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ ticketId: ticket.id })
      .expect(400);
  } else {
    fail('Signup did not provide a cookie');
  }
});

it('reserves a ticket', async () => {
  const cookie = global.signup();
  if (cookie) {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'Concert',
      price: 20,
    });
    await ticket.save();
    await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ ticketId: ticket.id })
      .expect(201);
  } else {
    fail('Signup did not provide a cookie');
  }
});

it('emits an order created event', async () => {
  const cookie = global.signup();
  if (cookie) {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'Concert',
      price: 20,
    });
    await ticket.save();
    await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ ticketId: ticket.id })
      .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
  } else {
    fail('Signup did not provide a cookie');
  }
});
