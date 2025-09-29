
// This file relies on the global CryptoJS object loaded from CDN in index.html

declare const CryptoJS: any;

export const encryptData = (data: object, secretKey: string): string => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, secretKey).toString();
};

export const decryptData = <T,>(encryptedData: string, secretKey: string): T | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedJson = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedJson) {
        throw new Error("Decryption resulted in empty string.");
    }
    return JSON.parse(decryptedJson) as T;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};
