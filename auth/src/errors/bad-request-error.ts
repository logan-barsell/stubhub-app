import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
  statusCode = 400;
  constructor(public err: string) {
    super(err);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.err }];
  }
}
