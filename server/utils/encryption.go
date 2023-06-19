package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
)

func Encrypt(message string, secretKey string) (string, error) {
	aes, err := aes.NewCipher([]byte(secretKey))
	if err != nil {
		panic(err)
	}

	gcm, err := cipher.NewGCM(aes)
	if err != nil {
		panic(err)
	}


	nonce := make([]byte, gcm.NonceSize())
	_, err = rand.Read(nonce)
	if err != nil {
		panic(err)
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(message), nil)

	return string(ciphertext),nil
}

func Decrypt(encryptedMessage string, secretKey string) (string, error) {
	aes, err := aes.NewCipher([]byte(secretKey))
	if err != nil {
		panic(err)
	}

	gcm, err := cipher.NewGCM(aes)
	if err != nil {
		panic(err)
	}

	
	nonceSize := gcm.NonceSize()
	nonce, encryptedMessage := encryptedMessage[:nonceSize], encryptedMessage[nonceSize:]

	plaintext, err := gcm.Open(nil, []byte(nonce), []byte(encryptedMessage), nil)
	if err != nil {
		panic(err)
	}

	return string(plaintext),nil
}