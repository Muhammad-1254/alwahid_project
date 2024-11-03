


// TODO: when there is an production build handle this functionality especially in chat section
// because react native and expo doest not support nodejs native libraries.
// follow this link https://dev.to/hyetigran/unable-to-resolve-module-crypto-1gek


// const generateKeyPair = () => {
//   const { publicKey, privateKey } = generateKeyPairSync('rsa', {
//     modulusLength: 2048,
//   });
//   return { publicKey, privateKey };
// };

// const encryptMessage = (message:string, publicKey:any) => {
//   const encrypted = publicEncrypt(publicKey, Buffer.from(message));
//   return encrypted.toString('base64');
// };

// const decryptMessage = (encryptedMessage:string, privateKey:any) => {
//   const decrypted = privateDecrypt(privateKey, Buffer.from(encryptedMessage, 'base64'));
//   return decrypted.toString();
// };

// export { generateKeyPair, encryptMessage, decryptMessage };


// // Example usage
// const { publicKey, privateKey } = generateKeyPair();
// const encrypted = encryptMessage('Hello World', publicKey);
// const decrypted = decryptMessage(encrypted, privateKey);

// console.log('Encrypted:', encrypted);
// console.log('Decrypted:', decrypted);


// for use basic functionality to sync your app
const generateKeyPair =async (userId:string) => {
  
  return { publicKey: userId, privateKey: userId };
  }
const encryptMessage = async(message:string, publicKey:any) => {
  return message;
}

const decryptedMessage = async(encryptedMessage:string, privateKey:any) => {
  return encryptedMessage;
}

export { generateKeyPair, encryptMessage, decryptedMessage };