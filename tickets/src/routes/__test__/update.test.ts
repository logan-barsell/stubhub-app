import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signup();
  if (cookie) {
    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', cookie)
      .send({
        title: 'Item',
        price: 20,
      })
      .expect(404);
  } else {
    fail('Signup did not provide a cookie');
  }
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'Item',
      price: 20,
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  let cookie = global.signup();
  if (cookie) {
    const response = await request(app)
      .post(`/api/tickets`)
      .set('Cookie', cookie)
      .send({
        title: 'Item',
        price: 20,
      });
    cookie = global.signup();
    if (cookie) {
      await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
          title: 'Updated Item',
          price: 5,
        })
        .expect(401);
    }
  } else {
    fail('Signup did not provide a cookie');
  }
});

it('returns a 400 if the user provided an invalid title or price', async () => {
  let cookie = global.signup();
  if (cookie) {
    const response = await request(app)
      .post(`/api/tickets`)
      .set('Cookie', cookie)
      .send({
        title: 'Item',
        price: 20,
      });
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: '',
        price: 10,
      })
      .expect(400);
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'Item 3',
        price: -10,
      })
      .expect(400);
  } else {
    fail('Signup did not provide a cookie');
  }
});

it('updates the ticket provided valid inputs', async () => {
  let cookie = global.signup();
  if (cookie) {
    const response = await request(app)
      .post(`/api/tickets`)
      .set('Cookie', cookie)
      .send({
        title: 'Item',
        price: 20,
      });
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'Updated Item',
        price: 10,
      })
      .expect(200);

    const ticketRes = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send();
    expect(ticketRes.body.title).toEqual('Updated Item');
    expect(ticketRes.body.price).toEqual(10);
  } else {
    fail('Signup did not provide a cookie');
  }
});
