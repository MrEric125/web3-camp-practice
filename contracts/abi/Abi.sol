// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

contract ABIEncoder {
    function encodeUint(uint256 value) public pure returns (bytes memory) {
        //
        return abi.encode(value);
    }

    function encodeMultiple(uint num,string memory text) public pure returns (bytes memory) {
        //
        return abi.encode(num,text);
    }
}

contract ABIDecoder {
    /**
     * @dev Decodes a uint256 value from the given data.
     */
    function decodeUint(bytes memory data) public pure returns (uint) {
        return abi.decode(data, (uint));

    }
    /**
     * @dev Decodes multiple values from the given data.
     */
    function decodeMultiple( bytes memory data) public pure returns (uint, string memory) {
        return abi.decode(data, (uint, string));
    }
}


contract FunctionSelector {
    uint256 private storedValue;

    function getValue() public view returns (uint) {
        return storedValue;
    }

    function setValue(uint value) public {
        storedValue = value;
    }

    /**
     * @dev Returns the function selector for the getValue function.
     */
    function getFunctionSelector1() public pure returns (bytes4) {
        return bytes4(keccak256("getValue()"));
    }

    /**
     * @dev Returns the function selector for the setValue function.
     */
    function getFunctionSelector2() public pure returns (bytes4) {
        return bytes4(keccak256("setValue(uint256)"));
    }
}


contract DataStorage {
    string private data;

    function setData(string memory newData) public {
        data = newData;
    }

    function getData() public view returns (string memory) {
        return data;
    }
}

contract DataConsumer {
    address private dataStorageAddress;

    constructor(address _dataStorageAddress) {
        dataStorageAddress = _dataStorageAddress;
    }
    /**
     * @dev Gets the data from the DataStorage contract using the ABI encoding.
     */
    function getDataByABI() public returns (string memory) {
        bytes memory payload = abi.encodeWithSignature("getData()");

        (bool success, bytes memory data) = dataStorageAddress.call(payload);
        require(success, "call function failed");
        return abi.decode(data, (string));
    }

    /**
     * @dev Sets the data in the DataStorage contract using the ABI encoding.
     */
    function setDataByABI1(string calldata newData) public returns (bool) {
        bytes memory payload = abi.encodeWithSignature("setData(string)", newData);
        (bool success, ) = dataStorageAddress.call(payload);
        return success;
    }
    /**
     * @dev Sets the data in the DataStorage contract using the ABI encoding.
     */
    function setDataByABI2(string calldata newData) public returns (bool) {
        bytes memory payload = abi.encodeWithSelector(bytes4(keccak256("setData(string)")), newData);
        (bool success, ) = dataStorageAddress.call(payload);
        return success;
    }

    /**
     * @dev Sets the data in the DataStorage contract using the ABI encoding.
     */
    function setDataByABI3(string calldata newData) public returns (bool) {
        // playload
        bytes memory playload = abi.encodeCall(DataStorage.setData, (newData));
        (bool success, ) = dataStorageAddress.call(playload);
        return success;
    }
}


