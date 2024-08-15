import {
  Listener,
  NotFoundError,
  OrderCancelledEvent,
  Subjects,
} from '@stubblyhubbly/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const { id, ticket } = data;
    // find the ticket the order is reserving
    const foundTicket = await Ticket.findById(ticket.id);
    // if does not exist, throw err
    if (!foundTicket) {
      throw new NotFoundError();
    }
    // mark ticket as unreserved by setting orderId prop to null
    foundTicket.set({ orderId: undefined });
    // save updated ticket
    await foundTicket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: foundTicket.id,
      title: foundTicket.title,
      price: foundTicket.price,
      userId: foundTicket.userId,
      orderId: foundTicket.orderId,
      version: foundTicket.version,
    });
    // ack the message
    msg.ack();
  }
}
