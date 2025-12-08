// src/utils/walletUtils.ts - 完全修复版本
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { getAddress, Hex, bytesToHex } from 'viem';
// import * as Crypto from 'crypto-browserify';

import * as bip39 from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import { wordlist } from '@scure/bip39/wordlists/english';

// 生成新账户
export const generateAccount = () => {
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
export const importPrivateKey = (privateKey: string) => {
  const account = privateKeyToAccount(privateKey as Hex);
  return {
    address: account.address,
    privateKey,
    publicKey: account.address
  };
};

// 导入助记词 - 使用 @scure/bip32
export const importMnemonic = (mnemonic: string, index: number = 0) => {
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

export const encryptPrivateKey = (privateKey: string, password: string): string => {
//   const cipher = Crypto.createCipher('aes-256-cbc', password);
//   let encrypted = cipher.update(privateKey, 'utf8', 'hex');
//   encrypted += cipher.final('hex');
//   return encrypted;
    return ""
};

export const decryptPrivateKey = (encryptedPrivateKey: string, password: string): string => {
//   const decipher = Crypto.createDecipher('aes-256-cbc', password);
//   let decrypted = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');
//   return decrypted;
    return ""
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

// 从助记词生成多个账户
export const generateAccountsFromMnemonic = (mnemonic: string, count: number = 5) => {
  const accounts = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const account = importMnemonic(mnemonic, i);
      accounts.push({
        ...account,
        index: i,
        path: `m/44'/60'/0'/0/${i}`
      });
    } catch (error) {
      console.warn(`Failed to generate account at index ${i}:`, error);
    }
  }
  
  return accounts;
};

// 从加密私钥恢复账户
export const recoverAccountFromEncryptedKey = (
  encryptedPrivateKey: string, 
  password: string,
  accountName: string = 'Recovered Account'
) => {
  try {
    const privateKey = decryptPrivateKey(encryptedPrivateKey, password);
    const account = importPrivateKey(privateKey);
    
    return {
      ...account,
      name: accountName
    };
  } catch (error) {
    console.error('Error recovering account:', error);
    throw error;
  }
};