// src/components/AccountManager.tsx
import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { isValidPrivateKey, isValidMnemonic } from '../utils/walletUtils';

const AccountManager: React.FC = () => {
  const {
    accounts,
    currentAccount,
    createNewAccount,
    importAccountByPrivateKey,
    switchAccount,
    exportPrivateKey
  } = useWallet();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState<'privateKey' | 'mnemonic'>('privateKey');
  const [accountName, setAccountName] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleCreateAccount = async () => {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      await createNewAccount(accountName || 'New Account', password);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    }
  };

  const handleImportAccount = async () => {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (importType === 'privateKey') {
        if (!isValidPrivateKey(privateKey)) {
          throw new Error('Invalid private key format');
        }
        await importAccountByPrivateKey(
          privateKey, 
          accountName || 'Imported Account', 
          password
        );
      } else {
        // 暂时不支持助记词导入
        throw new Error('Mnemonic import not yet implemented');
        // if (!isValidMnemonic(mnemonic)) {
        //   throw new Error('Invalid mnemonic phrase');
        // }
        // await importAccountByMnemonic(
        //   mnemonic,
        //   accountName || 'Imported Account',
        //   password
        // );
      }

      setShowImportModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import account');
    }
  };

  const handleExportPrivateKey = async (accountId: string) => {
    // try {
    //   const exportPassword = prompt('Enter your password to export private key:');
    //   if (!exportPassword) return;

    //   const pk = exportPrivateKey(accountId, exportPassword);
      
    //   // 显示私钥（在实际应用中应该更安全地处理）
    //   const shouldCopy = confirm(
    //     'Private key will be copied to clipboard. Make sure no one is watching.\n\n' +
    //     'Press OK to copy.'
    //   );
      
    //   if (shouldCopy) {
    //     await navigator.clipboard.writeText(pk);
    //     alert('Private key copied to clipboard');
    //   }
    // } catch (err) {
    //   alert('Failed to export private key');
    // }
  };

  const resetForm = () => {
    setAccountName('');
    setPrivateKey('');
    setMnemonic('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="account-manager">
      <div className="account-header">
        <h2>Accounts ({accounts.length})</h2>
        <div className="account-actions">
          <button onClick={() => setShowCreateModal(true)}>Create New</button>
          <button onClick={() => setShowImportModal(true)}>Import</button>
        </div>
      </div>

      <div className="accounts-list">
        {accounts.map(account => (
          <div 
            key={account.id} 
            className={`account-item ${currentAccount?.id === account.id ? 'active' : ''}`}
            onClick={() => switchAccount(account.id)}
          >
            <div className="account-info">
              <h3>{account.name}</h3>
              <p className="account-address">{account.address}</p>
              <p className="account-balance">{account.balance} ETH</p>
            </div>
            <div className="account-actions">
              {account.privateKey && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportPrivateKey(account.id);
                  }}
                >
                  Export
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 创建账户模态框 */}
      {showCreateModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create New Account</h3>
            <input
              type="text"
              placeholder="Account Name (Optional)"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <p className="error">{error}</p>}
            <div className="modal-actions">
              <button onClick={handleCreateAccount}>Create</button>
              <button onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 导入账户模态框 */}
      {showImportModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Import Account</h3>
            
            <div className="import-type-selector">
              <button
                className={importType === 'privateKey' ? 'active' : ''}
                onClick={() => setImportType('privateKey')}
              >
                Private Key
              </button>
              <button
                className={importType === 'mnemonic' ? 'active' : ''}
                onClick={() => setImportType('mnemonic')}
              >
                Mnemonic
              </button>
            </div>

            <input
              type="text"
              placeholder="Account Name (Optional)"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />

            {importType === 'privateKey' ? (
              <textarea
                placeholder="Enter Private Key (0x...)"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                rows={3}
              />
            ) : (
              <textarea
                placeholder="Enter Mnemonic Phrase"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                rows={3}
              />
            )}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="error">{error}</p>}
            
            <div className="modal-actions">
              <button onClick={handleImportAccount}>Import</button>
              <button onClick={() => {
                setShowImportModal(false);
                resetForm();
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManager;
