import { Publisher, TicketUpdatedEvent, Subjects } from '@stubblyhubbly/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
