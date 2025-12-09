// src/utils/walletUtils.ts
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { getAddress, Hex, bytesToHex } from 'viem';
// import * as Crypto from 'crypto-browserify';

import * as bip39 from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import { wordlist } from '@scure/bip39/wordlists/english';

// 定义我们自己的账户接口
export interface CustomAccount {
  address: `0x${string}`;
  privateKey: string;
  publicKey: string;
}

// 生成新账户
export const generateAccount = (): CustomAccount => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  
  return {
    address: account.address,
    privateKey,
    publicKey: account.address
  };
};

// 生成助记词
export const generateMnemonic = (strength: 128 | 160 | 192 | 224 | 256 = 128): string => {
  return bip39.generateMnemonic(wordlist, strength);
};

// 从助记词获取种子
export const mnemonicToSeed = (mnemonic: string): Uint8Array => {
  return bip39.mnemonicToSeedSync(mnemonic);
};

// 导入私钥
export const importPrivateKey = (privateKey: string): CustomAccount => {
  const account = privateKeyToAccount(privateKey as Hex);
  return {
    address: account.address,
    privateKey,
    publicKey: account.address
  };
};

// 导入助记词 - 修复版本
export const importMnemonic = (mnemonic: string, index: number = 0): CustomAccount => {
  try {
    // 验证助记词
    if (!bip39.validateMnemonic(mnemonic, wordlist)) {
      throw new Error('Invalid mnemonic phrase');
    }
    
    // 获取种子
    const seed = mnemonicToSeed(mnemonic);
    
    // 创建 HDKey
    const hdKey = HDKey.fromMasterSeed(seed);
    
    // BIP44 路径: m/44'/60'/0'/0/{index}
    const derivationPath = `m/44'/60'/0'/0/${index}`;
    const childKey = hdKey.derive(derivationPath);
    
    if (!childKey.privateKey) {
      throw new Error('Failed to derive private key from mnemonic');
    }
    
    // 将私钥转换为十六进制
    const privateKey = bytesToHex(childKey.privateKey);
    
    // 从私钥创建账户
    const account = privateKeyToAccount(privateKey as Hex);
    
    return {
      address: account.address,
      privateKey,
      publicKey: account.address
    };
  } catch (error) {
    console.error('Error importing mnemonic:', error);
    throw new Error(`Failed to import from mnemonic: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// 加密私钥
export const encryptPrivateKey = (privateKey: string, password: string): string => {
  try {
    return CryptoJS.AES.encrypt(privateKey, password).toString();
  } catch (error) {
    console.error('Error encrypting private key:', error);
    throw new Error('Failed to encrypt private key');
  }
};

// 解密私钥
export const decryptPrivateKey = (encryptedPrivateKey: string, password: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Decryption failed or wrong password');
    }
    
    // 验证私钥格式
    if (!isValidPrivateKey(decrypted)) {
      throw new Error('Decrypted content is not a valid private key');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting private key:', error);
    throw new Error('Failed to decrypt private key. Wrong password?');
  }
};

// 验证地址格式
export const isValidAddress = (address: string): boolean => {
  try {
    getAddress(address);
    return true;
  } catch {
    return false;
  }
};

// 验证私钥格式
export const isValidPrivateKey = (privateKey: string): boolean => {
  // 检查 0x 前缀和 64 个十六进制字符
  const regex = /^0x[0-9a-fA-F]{64}$/;
  return regex.test(privateKey);
};

// 验证助记词
export const isValidMnemonic = (mnemonic: string): boolean => {
  try {
    return bip39.validateMnemonic(mnemonic, wordlist);
  } catch {
    return false;
  }
};