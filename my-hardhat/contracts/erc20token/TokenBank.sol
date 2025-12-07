// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";


// 导入IERC20接口，用于与BERC20代币交互
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract TokenBank{


    // 代币合约地址，必须指定，避免双花
    IERC20 public token;

    // 存入的记录
    mapping (address=>uint256) deposits;




    modifier amountRequire(uint256 _value){
         require(_value > 0, "TokenBank: deposit amount must be greater than zero");
         _;
        
    }

    // modifier addressRequire(address tokenAddr){
    //     require(tokenAddr !=address(0), "TokenBank: deposit amount must be greater than zero");
    //     _;
    // }

    // 存入 BaseERC20.transferFrom(user, tokenBank, amount)
    function deposit(uint256 _value) public payable amountRequire(_value) {
        require(token.balanceOf(msg.sender)>=_value,"TokenBank: insufficient token balance");

        // 从msg.sender 地址转移到银行
        bool success=token.transferFrom(msg.sender,address(this),_value);

        require(success,"TokenBank: transferFrom failed");

        deposits[msg.sender]+=_value;

    }


    // 提取之前的token  BaseERC20.transfer(user, amount)
    function withdraw(uint256 _value) public payable amountRequire(_value){

        uint256 existValue=deposits[msg.sender];

        require(existValue>0,"TokenBank: insufficient deposit balance");

        bool success = token.transfer(msg.sender, _value);

        require(success,"TokenBank: transfer failed");

        deposits[msg.sender]-=_value;

    }
}