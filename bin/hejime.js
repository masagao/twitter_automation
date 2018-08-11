#! /usr/bin/env node

const request = require ('request')
const twitter = require ('twitter')
const log4js = require('log4js')
const twitterApi = require ('./twitterApi.js')

const asyncFunc = (targetTweet) => {
  return new Promise ((resolve, reject) => {
    request (`https://twitter.com/i/activity/favorited_popup?id=${ targetTweet }`, (err, response, body) => {
      resolve (body)
    })
  })
}

log4js.configure({
  appenders: {
    out: {type: 'console'},
    task: {type: 'dateFile', filename: './logs/beg.log', pattern: '-yyyy-MM-dd'}
  },
  categories: {
    default: {appenders: [ 'out' ], level: 'all'},
    task: {appenders: [ 'task' ], level: 'all'}
  }
})

let outLogger = log4js.getLogger ('out')
let taskLogger = log4js.getLogger ('task')


async function twitterBeg () {

  const HEROKU_CONFIG_KEY = process.env.tw_consumer_key;
  const HEROKU_CONFIG_SECRET = process.env.tw_consumer_secret;
  const HEROKU_CONFIG_TOKEN_KEY = process.env.tw_access_token_key;
  const HEROKU_CONFIG_TOKEN_SECRET = process.env.tw_access_token_secret;

  var client = new twitter({
    consumer_key:        HEROKU_CONFIG_KEY,
    consumer_secret:     HEROKU_CONFIG_SECRET,
    access_token_key:    HEROKU_CONFIG_TOKEN_KEY,
    access_token_secret: HEROKU_CONFIG_TOKEN_SECRET
  });

  const myId = '939897944362311681'
  const influencerId = '885163185707261952'
  tweetCount = '1'

  try {
    const tweets = await twitterApi.getUtimeline (client, influencerId, tweetCount)
    const arr = []

    for (let i = 0; i < tweets.length; i++) {
      arr.push({
        id: tweets[i].id_str,
        favorite_count: tweets[i].favorite_count
      })
    }

    arr.sort ((a, b) => {
      const countA = a.favorite_count
      const countB = b.favorite_count
      if (countA > countB) {
        return -1
      } else if (countA < countB) {
        return 1
      }
      return 0
    })

    const targetTweet = arr[0].id
    outLogger.debug (targetTweet)
    taskLogger.debug (targetTweet)
    const body = await asyncFunc (targetTweet)
    const json = JSON.parse (body)
    const content = json.htmlUsers
    const regex = /data-user-id=\"(\d+)\"/g
    let set = new Set ()
    while ((m = regex.exec(content)) !== null) {
      set.add(m[1])
    }
    const userIds = Array.from (set)

    for (var i = 0; i < userIds.length; i++) {
      try {
        const friendships = await twitterApi.getRelationship (client, myId, userIds[i])
        if (friendships.relationship.source.following !== true && friendships.relationship.source.muting !== true) {
          const following = await twitterApi.postFollowing (client, userIds[i])
          outLogger.debug ('success', i, userIds[i])
          taskLogger.debug ('success', i, userIds[i])
        }
      } catch (err) {
        outLogger.warn (err)
        taskLogger.warn (err)
      }
      await twitterApi.sleep (5000)
    }
  } catch (err) {
    outLogger.warn (err)
    taskLogger.warn (err)
  }
}

twitterBeg ()