package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"time"
)

type Block struct {
	//上一个区块
	PreviousHash string
	// 当前出快时间
	Timestamp int
	// 当前区块所属者
	Index int
	// 数据
	Data []byte

	Hash string

	//随机nonce
	Nonce int
}

type BlockChain []Block

/*
*
计算区块值
*/
func (block *Block) calculateHash() string {
	record := strconv.Itoa(block.Index) +
		strconv.Itoa(block.Timestamp) +
		hex.EncodeToString(block.Data) +
		block.PreviousHash +
		strconv.Itoa(block.Nonce)

	hash := sha256.Sum256([]byte(record))

	return hex.EncodeToString(hash[:])
}

// proofOfWork
//
//	@Description: 通过工作量证明，计算hash值
//	@param block
//	@param dif
//	@return *Block
func proofOfWork(block *Block, dif int) *Block {
	nonce := 0

	target := strings.Repeat("0", dif)

	for {
		block.Nonce = nonce
		hashStr := block.calculateHash()
		if strings.HasPrefix(hashStr, target) {
			block.Hash = hashStr
			return block
		}
		if nonce%10000 == 0 {
			fmt.Println("已经尝试了", nonce, "个nonce值;计算的hash值:", hashStr)

		}
		nonce++
	}
}

// NewBlock
//
//	@Description: 生成新区块
//	@param oldBlock
//	@param data
//	@return *Block
func NewBlock(oldBlock Block, data []byte) *Block {
	newBlock := &Block{
		Timestamp:    time.Now().Nanosecond(),
		Index:        oldBlock.Index + 1,
		Data:         data,
		PreviousHash: oldBlock.Hash,
	}
	return proofOfWork(newBlock, 4)
}

// validateBlock
//
//	@Description: 验证新区块是否合法
//	@param old
//	@param newBlock
//	@param dif
//	@return bool
func validateBlock(old Block, newBlock Block, dif int) bool {
	if newBlock.Index != old.Index+1 {
		return false
	}
	if newBlock.PreviousHash != old.Hash {
		return false
	}
	if !strings.HasPrefix(newBlock.Hash, strings.Repeat("0", dif)) {
		return false

	}

	return true

}

func main() {

	//生成创世区块
	genesis := &Block{
		PreviousHash: "",
		Timestamp:    time.Now().Nanosecond(),
		Index:        0,
		Data:         []byte("genesis block"),
		Nonce:        0,
	}
	firstBlock := proofOfWork(genesis, 4)

	fmt.Println("nonce:", firstBlock.Nonce, "; hash:", firstBlock.Hash)

	blockChain := BlockChain{*firstBlock}

	for i := 0; i < 5; i++ {
		data := []byte("第" + strconv.Itoa(i+1) + "个block")

		newBlock := NewBlock(blockChain[len(blockChain)-1], data)

		valid := validateBlock(blockChain[len(blockChain)-1], *newBlock, 4)
		if !valid {
			fmt.Println("当前区块验证失败")
			return
		}

		blockChain = append(blockChain, *newBlock)
	}
	for _, block := range blockChain {
		fmt.Printf("Index: %d\n", block.Index)
		fmt.Printf("Previous Hash: %s\n", block.PreviousHash)
		fmt.Printf("Hash: %s\n", block.Hash)
		fmt.Printf("Data: %s\n", block.Data)
		fmt.Printf("Nonce: %d\n", block.Nonce)
		fmt.Println("------------------------")
	}

}
