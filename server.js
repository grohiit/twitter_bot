import express from 'express'

const app = express()
const port = 3000

// Middleware to parse JSON
app.use(express.json())

// Basic route
import { getTweets } from './twitter.js'
import { getTokenAddress } from './tokens.js'
import { swap } from './raydium.js'

app.get('/', async (req, res) => {
  // swap('6NcdiK8B5KK2DzKvzvCfqi8EHaEqu48fyEzC8Mm9pump', 0.0001)

  res.send({ success: true, tweetsWithTokens })
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

setInterval(async () => {
  console.log('Running script')
}, 1000 * 2)

async function getTweetsAndSwap(username) {
  const tweets = await getTweets(username)
  for (const tweet of tweets) {
    const tokenAddress = getTokenAddress(tweet.tweet)
    if (tokenAddress.length > 0) {
      tweet.tokenAddress = tokenAddress[0]
    }
  }

  const tweetsWithTokens = tweets.filter((v) => v.tokenAddress)
  //TODO check if the tweet was created in the last 2 minutes

  if (tweetsWithTokens.length > 0) {
    const tokenAddress = tweetsWithTokens[0].tokenAddress
    await swap(tokenAddress, 0.00001)
  }
}
