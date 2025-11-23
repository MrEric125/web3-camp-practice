// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Bank.sol";


/**
 * @title BigBank
 * @dev 继承Bank合约
 */
abstract contract BigBank is Bank {


    // 要求金额的校验,使用modifier 校验
    modifier requireAmount(){
        require(msg.value > 0.001 ether, "Deposit amount must be greater than 0.001 ether");
        _;

    }

    /**
    * 重写捐献的方法
     */
    function addDeposit() external payable override requireAmount{
        _handleDeposit();

    }


    /**
     * 转移管理员
     */
    function changeAdmin(address target) external {
        require(msg.sender==admin,"only bank onwer can change admin");
        require(target!=address(0),"target must not zero address");
        admin=target;
    }

    // receive() external payable override requireAmount{
    // }

}