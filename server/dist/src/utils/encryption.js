'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_js_1 = __importDefault(require('crypto-js'));
const encrypt = (message, secretKey) => {
  const encryptedMessage = crypto_js_1.default.AES.encrypt(message, secretKey).toString();
  return encryptedMessage;
};
exports.encrypt = encrypt;
const decrypt = (message, secretKey) => {
  const decryptedBytes = crypto_js_1.default.AES.decrypt(message, secretKey);
  const decryptedMessage = decryptedBytes.toString(crypto_js_1.default.enc.Utf8);
  return decryptedMessage;
};
exports.decrypt = decrypt;
