import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@stubblyhubbly/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

it('returns a 404 err when attempting a purchase on an order that does not exist', async () => {
  const cookie = global.signup();
  if (cookie) {
    await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({
        token: '123',
        orderId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(404);
  } else {
    fail('Signup fails to generate cookie');
  }
});

it('returns a 401 err when attempting to purchase an order that doesnt belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  const cookie = global.signup();
  if (cookie) {
    await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({
        token: '123',
        orderId: order.id,
      })
      .expect(401);
  } else {
    fail('Signup fails to generate cookie');
  }
});

it('returns a 400 err when attempting a purchase on an order that is cancelled', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  const cookie = global.signup(userId);
  if (cookie) {
    await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({
        token: '123',
        orderId: order.id,
      })
      .expect(400);
  } else {
    fail('Signup fails to generate cookie');
  }
});

it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 1000000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();
  const cookie = global.signup(userId);
  if (cookie) {
    await request(app)
      .post('/api/payments')
      .set('Cookie', cookie)
      .send({
        token: 'tok_visa',
        orderId: order.id,
      })
      .expect(201);
    const charges = await stripe.charges.list({ limit: 50 });
    const charge = charges.data.find(c => c.amount === price * 100);
    expect(charge).toBeDefined();
    expect(charge!.currency).toEqual('usd');
    const payment = await Payment.findOne({
      stripeId: charge?.id,
      orderId: order.id,
    });
    expect(payment).not.toBeNull();
  } else {
    fail('Signup fails to generate cookie');
  }
});
