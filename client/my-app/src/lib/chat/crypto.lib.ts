import { generateKeyPairSync, privateDecrypt, publicEncrypt } from 'crypto';
const generateKeyPair = () => {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  return { publicKey, privateKey };
};

const encryptMessage = (message:string, publicKey:any) => {
  const encrypted = publicEncrypt(publicKey, Buffer.from(message));
  return encrypted.toString('base64');
};

const decryptMessage = (encryptedMessage:string, privateKey:any) => {
  const decrypted = privateDecrypt(privateKey, Buffer.from(encryptedMessage, 'base64'));
  return decrypted.toString();
};

// Example usage
const { publicKey, privateKey } = generateKeyPair();
const encrypted = encryptMessage('Hello World', publicKey);
const decrypted = decryptMessage(encrypted, privateKey);

console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);
