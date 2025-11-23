// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./IBank.sol";


contract Bank  is IBank{
    /**
     * 捐赠者记录
     */
    mapping (address=>uint256) private deposits;

    /**
     * 前三名
     */
    address[3] private  top3;
    /**
     * 前三名数量
     */
    uint256 private  constant totalRank=3;
    /**
     * 管理员
     */
    address private   admin ;
    
    /**
     * 初始化管理员是谁
     */
    constructor(){
        admin=msg.sender;
    }

    /**
     * 事件：捐赠记录
     */
    event DonationAdded(address indexed donor, uint256 amount);
    event RankingUpdated();

    /**
     *  捐赠
     */
    function addDeposit() external payable {
        _handleDeposit();
    }

    /**
     * 处理捐赠
     */
    function _handleDeposit() internal {
        require(msg.value>0, "must send some ether");
        deposits[msg.sender]+=msg.value;
        _updateRanking(msg.sender);
        emit DonationAdded(msg.sender, msg.value);

    }

    /**
     * 更新排名
     */
    function _updateRanking(address toUpdateAddr) private    {
        address[] memory tmpAddrs=new address[](top3.length+1);
        bool containNewAddr=false;
        for (uint256 i = 0; i < top3.length; i++) {
            if(top3[i]==toUpdateAddr){
                containNewAddr=true;
            }
            tmpAddrs[i]=top3[i];
        }
        // 如果已经在前三名中，就在缓存数组中增加一个0，表示该地址已经存在
        if(!containNewAddr){
            tmpAddrs[top3.length]=toUpdateAddr;
        }else{
            tmpAddrs[top3.length]=address(0);
        }
        // 冒泡排序
        for (uint256 i = 0; i < tmpAddrs.length; i++) {
            for (uint256 j = 0; j < tmpAddrs.length; j++) {
                if(j+1<tmpAddrs.length && deposits[tmpAddrs[j]]<deposits[tmpAddrs[j+1]]){
                    address tmp=tmpAddrs[j];
                    tmpAddrs[j]=tmpAddrs[j+1];
                    tmpAddrs[j+1]=tmp;


                }
            }
        }
        // 前三位就是top3
        for (uint256 i = 0; i < totalRank; i++) {
            top3[i]=tmpAddrs[i];
        }

        emit RankingUpdated();

    }

    /**
     * 获取管理员
     */
    function getAdmin() public view returns (address){
        return admin;
    }

    /**
     * 获取排名
     */
    function getTop3() public  view returns (address[] memory,uint[] memory){
        address[] memory tmpAddrs=new address[](top3.length);
        uint[] memory money=new uint[](3);
        for (uint256 i = 0; i < top3.length; i++) {
            tmpAddrs[i]=top3[i];
            money[i]=deposits[top3[i]];

            console.log(unicode"=== 排名信息 ===");
            console.log(unicode"排名索引:", i);
            console.log(unicode"地址:", tmpAddrs[i]);
            console.log(unicode"存款金额:", deposits[tmpAddrs[i]]);
            console.log(unicode"==============");
        }
        return (tmpAddrs,money);
    }

    /**
     *  提币接口,提币多少金额到管理员账户
     */
    function withdraw() public payable {
        require(msg.sender==admin,"only admin cn with draw");
        // 账户总共多少钱
        uint256 balance=address(this).balance;
        require(balance>0,"no balance");
        (bool success,)=admin.call{value:balance}("");
        require(success, "Withdrawal failed");
    }

}

