import express from 'express';
import { body } from 'express-validator';

import { signIn, signUp } from '../controllers/auth';

export const authRoutes = express.Router();

/**
 * @swagger
 * /api/auth/sign-up:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request
 */
authRoutes.post(
  '/sign-up',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  signUp,
);

/**
 * @swagger
 * /api/auth/sign-in:
 *   post:
 *     summary: Authenticate a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *       400:
 *         description: Invalid request
 */
authRoutes.post(
  '/sign-in',
  [
    body('email').notEmpty().withMessage('Email is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  signIn,
);

export default authRoutes;
