import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

jest.mock('../../nats-wrapper');

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const cookie = global.signup();
  if (cookie) {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({});
    expect(response.status).not.toEqual(401);
  } else {
    fail('Signup did not provide a cookie');
  }
});

it('it returns an error if an invalid title is provided', async () => {
  const cookie = global.signup();
  if (cookie) {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: '',
        price: 10,
      })
      .expect(400);
    await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        price: 10,
      })
      .expect(400);
  } else {
    fail('Signup did not provide a cookie');
  }
});

it('it returns an error if an invalid price is provided', async () => {
  const cookie = global.signup();
  if (cookie) {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'Item',
        price: -10,
      })
      .expect(400);
    await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'Item',
      })
      .expect(400);
  } else {
    fail('Signup did not provide a cookie');
  }
});

it('creates a ticket with valid inputs', async () => {
  // make sure there are no tickets
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  // create a new ticket
  const title = 'Item';
  const price = 20;
  const cookie = global.signup();
  if (cookie) {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title,
        price,
      })
      .expect(201);
    tickets = await Ticket.find({});
    // validate results
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(price);
  } else {
    fail('Signup did not provide a cookie');
  }
});

it('publishes an event', async () => {
  // create a new ticket
  const title = 'Item';
  const price = 20;
  const cookie = global.signup();
  if (cookie) {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title,
        price,
      })
      .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
  } else {
    fail('Signup did not provide a cookie');
  }
});
