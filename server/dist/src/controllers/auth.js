'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.signIn = exports.signUp = void 0;
const bcryptjs_1 = __importDefault(require('bcryptjs'));
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const prisma_1 = __importDefault(require('../../prisma/prisma'));
const jwtSecret = process.env.SECRET_KEY;
const signUp = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { name, email, password } = req.body;
      const existingUser = yield prisma_1.default.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
      const newUser = yield prisma_1.default.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });
      const token = jsonwebtoken_1.default.sign({ userId: newUser.userId }, jwtSecret, {
        expiresIn: '1h',
      });
      return res.status(201).json({ token });
    } catch (error) {
      console.error('Error during user registration:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
exports.signUp = signUp;
const signIn = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { email, password } = req.body;
      const user = yield prisma_1.default.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jsonwebtoken_1.default.sign({ userId: user.userId }, jwtSecret, {
        expiresIn: '1h',
      });
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error during user login:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
exports.signIn = signIn;
