import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledEvent } from '@stubblyhubbly/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setUp = async () => {
  // create instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);
  // create and save a ticket
  const ticket = Ticket.build({
    title: 'Concert',
    price: 25,
    userId: '123',
  });
  const orderId = new mongoose.Types.ObjectId().toHexString();
  ticket.set({ orderId });
  await ticket.save();

  // create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // create the msg w mock ack function
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg, orderId };
};

it('sets the orderId of the ticket to undefined', async () => {
  const { listener, ticket, data, msg } = await setUp();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(undefined);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setUp();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setUp();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(ticketUpdatedData.orderId).toEqual(undefined);
});
