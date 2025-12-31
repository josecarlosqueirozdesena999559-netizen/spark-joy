import CryptoJS from 'crypto-js';

// Encrypt data using AES with user's password
export const encryptData = (data: string, password: string): string => {
  return CryptoJS.AES.encrypt(data, password).toString();
};

// Decrypt data using AES with user's password
export const decryptData = (encryptedData: string, password: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return decrypted;
  } catch {
    return null;
  }
};

// Encrypt a file (ArrayBuffer) and return base64 string
export const encryptFile = async (file: File, password: string): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as unknown as number[]);
  const encrypted = CryptoJS.AES.encrypt(wordArray, password);
  return encrypted.toString();
};

// Decrypt base64 encrypted file back to Blob
export const decryptFile = (encryptedData: string, password: string, mimeType: string): Blob | null => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, password);
    const typedArray = convertWordArrayToUint8Array(decrypted);
    // Create a new ArrayBuffer from the Uint8Array to avoid SharedArrayBuffer issues
    const buffer = new ArrayBuffer(typedArray.length);
    const view = new Uint8Array(buffer);
    view.set(typedArray);
    return new Blob([buffer], { type: mimeType });
  } catch {
    return null;
  }
};

// Helper to convert WordArray to Uint8Array
const convertWordArrayToUint8Array = (wordArray: CryptoJS.lib.WordArray): Uint8Array => {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const u8 = new Uint8Array(sigBytes);
  
  for (let i = 0; i < sigBytes; i++) {
    const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    u8[i] = byte;
  }
  
  return u8;
};

// Generate a hash for password verification (stored locally)
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

// Verify password against stored hash
export const verifyPassword = (password: string, hash: string): boolean => {
  return CryptoJS.SHA256(password).toString() === hash;
};
