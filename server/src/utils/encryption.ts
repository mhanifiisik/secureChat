import CryptoJS from 'crypto-js'

export const encrypt = (message: string, secretKey: string): string => {
  const encryptedMessage = CryptoJS.AES.encrypt(message, secretKey).toString()
  return encryptedMessage
}

export const decrypt = (message: string, secretKey: string): string => {
  const decryptedBytes = CryptoJS.AES.decrypt(message, secretKey)
  const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8)
  return decryptedMessage
}
