import {
  Transaction,
  VersionedTransaction,
  sendAndConfirmTransaction,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { NATIVE_MINT } from '@solana/spl-token'
import axios from 'axios'
// import { connection, owner, fetchTokenAccountData } from '../config'
import { API_URLS } from '@raydium-io/raydium-sdk-v2'
import bs58 from 'bs58'
import dotenv from 'dotenv'
dotenv.config()

export async function swap(outputMint, amountInSOL) {
  const connection = new Connection('https://solana.drpc.org/')
  const blockHeight = await connection.getBlockHeight()
  console.log(`Connected to Solana at block ${blockHeight}`)

  const owner = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY))
  console.log(owner.publicKey.toBase58())

  console.log(`Swapping ${outputMint} for ${amountInSOL} SOL`)
  const amount = amountInSOL * LAMPORTS_PER_SOL
  const slippage = 10

  const { data: swapResponse } = await axios.get(
    `${
      API_URLS.SWAP_HOST
    }/compute/swap-base-in?inputMint=${NATIVE_MINT}&outputMint=${outputMint}&amount=${amount}&slippageBps=${
      slippage * 100
    }&txVersion=V0`
  )

  const { data: priorityFee } = await axios.get(
    `${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`
  )

  // console.log({
  //   computeUnitPriceMicroLamports: String(priorityFee.data.default.h),
  //   swapResponse,
  //   txVersion: 'V0',
  //   wallet: owner.publicKey.toBase58(),
  //   wrapSol: true,
  //   unwrapSol: true,
  //   inputAccount: NATIVE_MINT.toBase58(),
  //   outputAccount: outputMint,
  // })

  const { data: swapTransactions } = await axios.post(
    `${API_URLS.SWAP_HOST}/transaction/swap-base-in`,
    {
      computeUnitPriceMicroLamports: String(priorityFee.data.default.h),
      swapResponse,
      txVersion: 'V0',
      wallet: owner.publicKey.toBase58(),
      wrapSol: true,
      unwrapSol: true,
    }
  )

  const allTxBuf = swapTransactions.data.map((tx) =>
    Buffer.from(tx.transaction, 'base64')
  )
  const allTransactions = allTxBuf.map((txBuf) =>
    VersionedTransaction.deserialize(txBuf)
  )

  let idx = 0

  for (const tx of allTransactions) {
    idx++
    const transaction = tx
    transaction.sign([owner])
    const txId = await connection.sendTransaction(tx, { skipPreflight: true })
    console.log(txId)
    const { lastValidBlockHeight, blockhash } =
      await connection.getLatestBlockhash({
        commitment: 'finalized',
      })

    console.log(`${idx} transaction sending..., txId: ${txId}`)

    // await connection.confirmTransaction(
    //   {
    //     blockhash,
    //     lastValidBlockHeight,
    //     signature: txId,
    //   },
    //   'finalized'
    // )
    // console.log(`${idx} transaction confirmed`)
  }
}
