'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const swagger_jsdoc_1 = __importDefault(require('swagger-jsdoc'));
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'secureChat',
      version: '1.0.0',
      description: 'A secure chat application',
    },
    servers: [
      {
        url: `http://localhost:8000`,
      },
    ],
  },
  apis: ['src/routes/auth.ts'],
};
const swaggerSpecs = (0, swagger_jsdoc_1.default)(swaggerOptions);
exports.default = swaggerSpecs;
