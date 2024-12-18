import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'default';

export const encryptToken = (token: string): string => {
	const iv = CryptoJS.lib.WordArray.random(16);
	const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
	const encrypted = CryptoJS.AES.encrypt(token, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});

	return `ENC-${iv.toString(CryptoJS.enc.Hex)}:${encrypted.ciphertext.toString(CryptoJS.enc.Base64)}`;
};

export const decryptToken = (encryptedToken: string): string => {
	if (!encryptedToken.startsWith('ENC-')) {
		throw new Error('Token is not encrypted or has an invalid format.');
	}

	const tokenWithoutMarker = encryptedToken.slice(4);
	const [ivHex, ciphertextBase64] = tokenWithoutMarker.split(':');
	if (!ivHex || !ciphertextBase64) {
		throw new Error('Invalid token format. Expected IV:Ciphertext.');
	}

	const iv = CryptoJS.enc.Hex.parse(ivHex);
	const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
	const ciphertext = CryptoJS.enc.Base64.parse(ciphertextBase64);

	const decrypted = CryptoJS.AES.decrypt(CryptoJS.lib.CipherParams.create({ ciphertext: ciphertext }), key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});

	const decryptedToken = decrypted.toString(CryptoJS.enc.Utf8);

	if (!decryptedToken) {
		throw new Error('Decryption failed. Ensure the secret key and token are correct.');
	}

	return decryptedToken;
};
