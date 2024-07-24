import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { Password } from '../services/passwords';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    // validate email
    body('email').isEmail().withMessage('Email must be valid.'),
    // validate password
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  // express validation
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // return err for no existing user
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials.');
    }
    // check if password matches the user
    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials.');
    }
    // generate  JWT
    const userJWT = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );
    //store on session
    req.session = {
      jwt: userJWT,
    };

    res.status(201).send(existingUser);
  }
);

export { router as signinRouter };
