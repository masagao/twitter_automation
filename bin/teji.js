#! /usr/bin/env node

const twitter = require ('twitter')
const log4js = require('log4js')
const twitterApi = require ('./twitterApi.js')

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

log4js.configure({
  appenders: {
    out: {type: 'console'},
    task: {type: 'dateFile', filename: './logs/mute.log', pattern: '-yyyy-MM-dd'}
  },
  categories: {
    default: {appenders: [ 'out' ], level: 'all'},
    task: {appenders: [ 'task' ], level: 'all'}
  }
})

let outLogger = log4js.getLogger ('out')
let taskLogger = log4js.getLogger ('task')

async function twitterMute () {

  const userId = '939897944362311681'
  const friendsCount = 25
  const tweetsCount = 20
  const favoritedlimit = 2

  try{
    const friends = await twitterApi.getFriendsIds (client, userId, friendsCount)
    const targetIds = friends.ids

    for (var i = 0; i < targetIds.length; i++) {
    try {
      const friendships = await twitterApi.getRelationship (client, userId, targetIds[i])
      outLogger.debug (i, friendships.relationship.target.following, friendships.relationship.source.muting, targetIds[i])
      taskLogger.debug (i, friendships.relationship.target.following, friendships.relationship.source.muting, targetIds[i])

      if (friendships.relationship.target.following !== true && friendships.relationship.source.muting !== true) {
        const friendsTweets = await twitterApi.getFriendstimeline(client, targetIds[i], tweetsCount)
        let favoritedCount = 0

        for (var j = 0; j < friendsTweets.length; j++) {
          if (friendsTweets[j].favorited !== true && favoritedCount < favoritedlimit) {
            const Favoriting = await twitterApi.postFavoriting(client, friendsTweets[j].id_str)
            await twitterApi.sleep (1000)
            outLogger.debug (j, 'favoriting', friendsTweets[j].id_str)
            taskLogger.debug (j, 'favoriting', friendsTweets[j].id_str)
            favoritedCount++
          }
        }
        await twitterApi.sleep (1000)
        const Muting = await twitterApi.postMute (client, targetIds[i])
        outLogger.debug (i, 'muting', targetIds[i])
        taskLogger.debug (i, 'muting', targetIds[i])
      }
    } catch (err) {
      outLogger.warn (err)
      taskLogger.warn (err)
    }
      await twitterApi.sleep (2000)
    }
  } catch (err) {
    outLogger.warn (err)
    taskLogger.warn (err)
  }
}

twitterMute ()