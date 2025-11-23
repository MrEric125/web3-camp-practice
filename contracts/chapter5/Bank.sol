// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "hardhat/console.sol";

contract BankDonation{
    // 捐赠者记录
    mapping (address=>uint256) private deposits;

    // 捐赠者地址列表
    // address[] public donorAddresses;
    // 前三名
    address[3] private  top3;
    uint256 private  constant totalRank=3;
    address public  admin ;
    
    // 初始化管理员是谁
    constructor(){
        admin=msg.sender;
    }

    // 事件：捐赠记录
    event DonationAdded(address indexed donor, uint256 amount);
    event RankingUpdated();

    // 添加捐赠
    function addDeposit() external payable {
        require(msg.value>0, "must send some ether");
        deposits[msg.sender]+=msg.value;
        _updateRanking(msg.sender);
        emit DonationAdded(msg.sender, msg.value);
    }
    
    function _updateRanking(address toUpdateAddr) private    {
        address[] memory tmpAddrs=new address[](top3.length+1);
        bool containNewAddr=false;
        for (uint256 i = 0; i < top3.length; i++) {
            if(top3[i]==toUpdateAddr){
                containNewAddr=true;
            }
            tmpAddrs[i]=top3[i];
        }
        if(!containNewAddr){
            tmpAddrs[top3.length]=toUpdateAddr;
        }else{
            tmpAddrs[top3.length]=address(0);
        }
        for (uint256 i = 0; i < tmpAddrs.length; i++) {
            for (uint256 j = 0; j < tmpAddrs.length; j++) {
                if(j+1<tmpAddrs.length && deposits[tmpAddrs[j]]<deposits[tmpAddrs[j+1]]){
                    address tmp=tmpAddrs[j];
                    tmpAddrs[j]=tmpAddrs[j+1];
                    tmpAddrs[j+1]=tmp;
                }
            }
        }
        for (uint256 i = 0; i < totalRank; i++) {
            top3[i]=tmpAddrs[i];
        }
        // 冒泡排序
        emit RankingUpdated();
        // 前三位就是top3
    }

    // 获取排名
    function getRank() public  view returns (address[] memory){
        address[] memory tmpAddrs=new address[](top3.length);
        for (uint256 i = 0; i < top3.length; i++) {
            tmpAddrs[i]=top3[i];
        }
        return tmpAddrs;
    }

    //  提币接口,提币多少金额到管理员账户
    function withdraw() public payable {
        require(msg.sender==admin,"only admin cn with draw");
        // 账户总共多少钱
        uint256 balance=address(this).balance;
        require(balance>0,"no balance");
        (bool success,)=admin.call{value:balance}("");
        require(success, "Withdrawal failed");
    }

}

