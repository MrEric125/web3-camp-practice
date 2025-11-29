// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./IBank.sol";

contract Admin{

    // 管理员
    address public owner;
    


    constructor(){
        owner = msg.sender;
    }

    // 转移bank账户的余额到admin 账户中
    function adminWithdraw(IBank bank) public payable{
        // 判断当前调用者
        require(msg.sender==owner,"only admin can draw");

        bank.withdraw();
    }

    /**
     * 管理员才能提现
     */
    function adminDeposit(IBank bank) public payable{
        require(msg.sender == owner, "Only admin can withdraw");
        uint balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        //call  作用：执行目标合约的函数，可以发送 ETH,,向目标地址发送以太币，并且可以不受 gas 限制，transfer 和 send 方法有 2300 gas 限制
        // delegatecall 执行目标合约的代码，但保持调用合约的上下文（包括存储和余额）
        // staticcall 与 call 类似，但禁止修改任何状态。
        // 关于call 的使用 见官方文档：https://learnblockchain.cn/docs/solidity/assembly.html?highlight=call#id-使用-call-委托调用-and-staticcall
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
    }



}

