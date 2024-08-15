import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@stubblyhubbly/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setUp = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 20,
  });
  await ticket.save();

  // create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'New Concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('finds, updated, and saves a ticket', async () => {
  // set up
  const { msg, data, ticket, listener } = await setUp();
  await listener.onMessage(data, msg);
  const updated = await Ticket.findById(ticket.id);
  expect(updated!.title).toEqual(data.title);
  expect(updated!.price).toEqual(data.price);
  expect(updated!.version).toEqual(data.version);
});

it('acks the msg', async () => {
  // set up
  const { msg, data, listener } = await setUp();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
  // set up
  const { msg, data, listener } = await setUp();
  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {
    return;
  }

  expect(msg.ack).not.toHaveBeenCalled();
});
