// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
        require(msg.sender == admin, "Only admin can withdraw");
        uint balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = admin.call{value: balance}("");
        require(success, "Withdrawal failed");
    }



}

