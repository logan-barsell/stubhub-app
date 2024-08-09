import { Publisher } from './base-publisher';
import { TicketCreatedEvent } from './tickets-created-event';
import { Subjects } from './subjects';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
