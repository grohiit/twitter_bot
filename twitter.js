import axios from 'axios'

export async function getTweets(username) {
  const options = {
    method: 'GET',
    url: 'https://twttrapi.p.rapidapi.com/user-tweets',
    params: {
      username,
    },
    headers: {
      'x-rapidapi-key': 'aaf26f3c02mshd49aaa579c2a8fbp1f63aajsn36232d6acabf',
      'x-rapidapi-host': 'twttrapi.p.rapidapi.com',
    },
  }

  try {
    const response = await axios.request(options)
    return response.data.data.user_result.result.timeline_response.timeline.instructions
      .filter(
        (v) =>
          v.__typename === 'TimelineAddEntries' ||
          v.__typename === 'TimelinePinEntry'
      )
      .map((v) => v.entry || v.entries)
      .flat()
      .map((v) => ({
        tweet: v.content.content?.tweetResult.result.legacy?.full_text || '',
        createdAt: v.content.content?.tweetResult.result.legacy?.created_at,
      }))
      .filter((v) => v.tweet)

    //  array entry||entries
  } catch (error) {
    console.error(error)
  }
}
