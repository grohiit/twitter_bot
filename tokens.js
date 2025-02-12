export function getTokenAddress(tweet) {
  const solanaAddressRegex = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g

  return tweet.match(solanaAddressRegex) || []
}
