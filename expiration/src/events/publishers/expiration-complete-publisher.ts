import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@stubblyhubbly/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
