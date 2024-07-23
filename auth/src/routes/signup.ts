// Sign-in Router
import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    // validate email
    body('email').isEmail().withMessage('Email must be valid.'),
    // validate password
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters.'),
  ],
  async (req: Request, res: Response) => {
    // error handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    // check for existing users with that email
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email is taken.');
    }
    // build new user and save to DB
    const user = User.build({ email, password });
    await user.save();

    res.status(201).send(user);
  }
);

export { router as signupRouter };
