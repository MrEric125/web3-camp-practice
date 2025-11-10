package main

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"time"
)

/*
*
实践 POW， 编写程序（编程语言不限）用自己的昵称 + nonce，不断修改nonce 进行 sha256 Hash 运算：

直到满足 4 个 0 开头的哈希值，打印出花费的时间、Hash 的内容及Hash值。
再次运算直到满足 5 个 0 开头的哈希值，打印出花费的时间、Hash 的内容及Hash值。
提交程序你的 Github 链接

先生成一个公私钥对
用私钥对符合 POW 4 个 0 开头的哈希值的 “昵称 + nonce” 进行私钥签名
用公钥验证
*/
func main() {

	str := "jooooohn.louis@gmail.com"

	cost, hash, nonce, content := mine(str, 5)

	fmt.Println("cost:", cost, "hash:", hash, "nonce:", nonce, "content:", content)

	privateKey, publicKey, err := generateRSAKeyPair()
	if err != nil {
		fmt.Println("生成公私钥对错误", err)
		return
	}
	sourceData := []byte(hash)
	signData, err := sign(privateKey, sourceData)

	if err != nil {
		fmt.Println("签名报错", err)
		return
	}
	verified, err := verify(publicKey, sourceData, signData)

	if err != nil {
		fmt.Println("验证报错", err)
		return
	}
	fmt.Println("验证结果", verified)

	modifyHash := strings.ReplaceAll(hash, "050", "060")

	verified, err = verify(publicKey, []byte(modifyHash), signData)

	//if err != nil {
	//	fmt.Println("数据修改后验证报错", err)
	//	return
	//}
	fmt.Println("数据修改后验证结果", verified)

}

/*
*
 */
// 计算那个满足要求的nance
// @prefix
// @targetZero

// mine
//
//	@Description:
//	@param prefix 前缀
//	@param targetZero 总共有多少个0
//	@return cost 耗时
//	@return hash hash值
//	@return nonceVal 计算的nonce值
//	@return content 实际计算的内容
func mine(prefix string, targetZero int) (cost time.Duration, hash string, nonceVal int, content string) {

	fmt.Println("开始挖矿，寻找满足", targetZero, "个前导0的哈希值")

	target := strings.Repeat("0", targetZero)

	nonce := 0

	startTime := time.Now()

	for {
		content := prefix + strconv.Itoa(nonce)

		hash := sha256.Sum256([]byte(content))

		hashResult := hex.EncodeToString(hash[:])
		endTime := time.Now()

		if strings.HasPrefix(hashResult, target) {
			timeSpent := endTime.Sub(startTime)
			return timeSpent, hashResult, nonce, content
		}
		nonce++
		if nonce%10000 == 0 {
			fmt.Println("已经尝试了", nonce, "个nonce值")

		}
	}
}

/*
生成公私钥对
*/
func generateRSAKeyPair() (privateKey *rsa.PrivateKey, publicKey *rsa.PublicKey, err error) {
	privatekey, err := rsa.GenerateKey(rand.Reader, 2048)

	if err != nil {
		return nil, nil, err

	}
	publickey := &privatekey.PublicKey
	return privatekey, publickey, nil
}

/*
*
签名操作
*/
func sign(privateKey *rsa.PrivateKey, data []byte) ([]byte, error) {
	hashed := sha256.Sum256(data)

	sign, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, hashed[:])

	if err != nil {
		return nil, err
	}
	return sign, nil
}

/*
*
验证验签是否
*/
func verify(publicKey *rsa.PublicKey, sourceData []byte, sign []byte) (bool, error) {
	hashed := sha256.Sum256(sourceData)
	err := rsa.VerifyPKCS1v15(publicKey, crypto.SHA256, hashed[:], sign)
	if err != nil {
		return false, err
	}
	return true, nil

}
