import { CustomError } from './custom-error';

export class NotAuthorizedError extends CustomError {
  statusCode = 401;
  reason = 'Not authorized';
  constructor() {
    super('Not authorized.');
    // * extending a built in class *
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
  serializeErrors() {
    return [{ message: this.reason }];
  }
}
