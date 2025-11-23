// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBank {

    // 新增捐赠接口
    function addDeposit() external payable;

    // 获取前三名捐赠者
    function getTop3() external view returns(address[] memory,uint[] memory);


    // 提币操作
    function withdraw() external payable;

    
}