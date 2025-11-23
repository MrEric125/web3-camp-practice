编写一个 Bank 合约，实现功能：

可以通过 Metamask 等钱包直接给 Bank 合约地址存款
在 Bank 合约记录每个地址的存款金额
编写 withdraw() 方法，仅管理员可以通过该方法提取资金。
用数组记录存款金额的前 3 名用户
请提交完成项目代码或 github 仓库地址。

#### 解析：
1. 存款功能：合约需要一个 payable 的函数来接收存款，并使用映射（mapping）记录每个地址的存款金额。
2. 提款功能：合约需要一个 withdraw() 方法，只有管理员地址可以调用该方法来提取资金。可以使用修饰符（modifier）来限制访问权限。
3. 记录前 3 名存款用户：可以使用一个数组来存储，并在每次存款后更新该数组以保持前 3 名用户的记录。
#### 数据结构
管理员地址： address public admin;
存款记录： mapping(address => uint256) public balances;
前 3 名用户： address[3] public topDepositors;
接收的总金额： uint256 public totalDeposits;
