import express from 'express';
import { currentUser } from '../middlewares/currentUser';
import { requireAuth } from '../middlewares/require-auth';

const router = express.Router();

router.get('/api/users/currentUser', currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser });
});

export { router as currentUserRouter };
