import { Publisher, OrderCreatedEvent, Subjects } from '@stubblyhubbly/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
