import {
  Subjects,
  Publisher,
  PaymentCreatedEvent,
} from '@stubblyhubbly/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
