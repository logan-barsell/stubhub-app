import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@stubblyhubbly/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
