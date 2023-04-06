import { ethers } from 'ethers'

export async function createSalt(signer: ethers.Signer) {
  let blockNumber = await signer.provider?.getBlockNumber()

  if (!blockNumber) {
    blockNumber = Math.floor(Math.random() * 100000000)
  }

  const timestamp = Math.floor(Date.now() / 1000)

  const hash = ethers.utils.keccak256(
    ethers.utils.concat([
      ethers.BigNumber.from(timestamp).toHexString(),
      ethers.BigNumber.from(blockNumber).toHexString(),
      ethers.utils.hexlify(ethers.utils.randomBytes(12)),
    ])
  )

  const splice = ethers.utils.hexDataSlice(hash, 0, 12)

  return ethers.utils.hexZeroPad(splice, 32)
}
