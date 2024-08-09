import { Publisher, TicketCreatedEvent, Subjects } from '@stubblyhubbly/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
