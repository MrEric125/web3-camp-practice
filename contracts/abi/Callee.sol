// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Callee {

    uint256 value;

    function getValue() public view returns (uint256) {
        return value;
    }

    function setValue(uint256 value_) public payable {
        require(msg.value > 0);
        value = value_;
    }
    function getData() public pure returns (uint256) {
        return 42;
    }
}

contract Caller {
    function callGetData(address callee) public view returns (uint256 data) {
        // call by staticcall
        (bool success, bytes memory returnData) = callee.staticcall(
            abi.encodeWithSignature("getData()")
        );
        require(success, "staticcall failed");
        data = abi.decode(returnData, (uint256));
        return data;
    }

    function sendEther(address to, uint256 _value) public returns (bool) {
        // 使用 call 发送 ether
        (bool success, ) = to.call{value: _value}("");
        require(success,"sendEther failed");

        return success;
    }

    function callSetValue(address callee, uint256 _value) public returns (bool) {
        // call setValue()
        (bool success, ) = callee.call{value: 1 ether}(
            abi.encodeWithSignature("setValue(uint256)", _value)
        );
        require(success, "call function failed");
        return success;
    }

    uint256 public value;

    function delegateSetValue(address callee, uint256 _newValue) public {
        // delegatecall setValue()
        // (bool success, ) = callee.delegatecall(abi.encodeWithSignature("setValue(uint256)", _newValue));
        // require(success, "delegate call failed");
        (bool success, ) = callee.delegatecall(
            abi.encodeWithSelector(Callee.setValue.selector, _newValue)
        );
        require(success, "delegate call failed");


        
    }
        

    receive() external payable {}
}
