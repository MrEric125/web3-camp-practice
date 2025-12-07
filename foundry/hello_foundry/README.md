## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```


我们有时候需要用到主网的合约， 可以用anvil --fork-url http://eth.llamarpc.com(可更换地址)

### 钱包相关命令
```bash
 cast wallet -h # 查看所有的命令选项
> cast wallet new [DIR] <ACCOUNT_NAME> # Create a new random keypair
> cast wallet new-mnemonic  #  mnemonic phrase
> cast wallet address [PRIVATE_KEY]  # private key to an address
> cast wallet import -i -k <KEYSTORE_DIR> <ACCOUNT_NAME>
> cast wallet import --mnemonic "test test test test test test test test test test 
test junk” -k <KEYSTORE_DIR> <ACCOUNT_NAME>
```