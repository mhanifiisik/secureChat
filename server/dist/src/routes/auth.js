'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require('express'));
const express_validator_1 = require('express-validator');
const auth_1 = require('../controllers/auth');
exports.authRoutes = express_1.default.Router();
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
exports.authRoutes.post(
  '/sign-up',
  [
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email'),
    (0, express_validator_1.body)('email').notEmpty().withMessage('Email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
  ],
  auth_1.signUp,
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
exports.authRoutes.post(
  '/sign-in',
  [
    (0, express_validator_1.body)('email').notEmpty().withMessage('Email is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
  ],
  auth_1.signIn,
);
exports.default = exports.authRoutes;
