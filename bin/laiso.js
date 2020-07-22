#! /usr/bin/env node

const twitter    = require('twitter')
const log4js     = require('log4js')
const twitterApi = require('./twitterApi.js')

const HEROKU_CONFIG_KEY          = process.env.tw_consumer_key
const HEROKU_CONFIG_SECRET       = process.env.tw_consumer_secret
const HEROKU_CONFIG_TOKEN_KEY    = process.env.tw_access_token_key
const HEROKU_CONFIG_TOKEN_SECRET = process.env.tw_access_token_secret

var client = new twitter({
  consumer_key       : HEROKU_CONFIG_KEY,
  consumer_secret    : HEROKU_CONFIG_SECRET,
  access_token_key   : HEROKU_CONFIG_TOKEN_KEY,
  access_token_secret: HEROKU_CONFIG_TOKEN_SECRET
});

log4js.configure({
  appenders: {
    out: { type: 'console' },
    task: { type: 'dateFile', filename: '../logs/twitter.log', pattern: '-yyyy-MM-dd' }
  },
  categories: {
    default: { appenders: ['out'], level: 'all' },
    task: { appenders: ['task'], level: 'all' }
  }
})

let outLogger = log4js.getLogger('out')
let taskLogger = log4js.getLogger('task')

async function twitterFback() {

  try {
    const followersCount = 1
    const followersList = await twitterApi.getFollowersList(client, followersCount)

    for(let key in followersList['users']) {
      const target = followersList['users'][key]

      if(target['following'] === false && target['follow_request_sent'] === false) {
        await twitterApi.postFollowing(client, target['id_str'])
        outLogger.debug('success', target['id'])
        taskLogger.debug('success', target['id'])
      }
    }
  } catch(err) {
    outLogger.warn(err)
    taskLogger.warn(err)
  }

}

twitterFback()
