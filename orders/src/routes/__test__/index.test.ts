import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();
  return ticket;
};

it('fetches orders for a particular user', async () => {
  // create three tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();
  // create 1 order as User #1
  const userOne = global.signup();
  if (userOne) {
    await request(app)
      .post('/api/orders')
      .set('Cookie', userOne)
      .send({ ticketId: ticketOne.id })
      .expect(201);
  } else {
    fail('Signup did not provide a cookie');
  }
  // create 2 orders as User #2
  const userTwo = global.signup();
  let orderOne;
  let orderTwo;
  if (userTwo) {
    const { body: _orderOne } = await request(app)
      .post('/api/orders')
      .set('Cookie', userTwo)
      .send({ ticketId: ticketTwo.id })
      .expect(201);
    orderOne = _orderOne;
    const { body: _orderTwo } = await request(app)
      .post('/api/orders')
      .set('Cookie', userTwo)
      .send({ ticketId: ticketThree.id })
      .expect(201);
    orderTwo = _orderTwo;
  } else {
    fail('Signup did not provide a cookie');
  }
  // make request to get orders for User #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);
  // make sure we only got the orders for User #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
