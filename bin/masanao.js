#! /usr/bin/env node

const twitter = require ('twitter')
const log4js = require('log4js')
const twitterApi = require ('./twitterApi.js')

const HEROKU_CONFIG_KEY = process.env.tw_consumer_key
const HEROKU_CONFIG_SECRET = process.env.tw_consumer_secret
const HEROKU_CONFIG_TOKEN_KEY = process.env.tw_access_token_key
const HEROKU_CONFIG_TOKEN_SECRET = process.env.tw_access_token_secret

let client = new twitter({
  consumer_key:        HEROKU_CONFIG_KEY,
  consumer_secret:     HEROKU_CONFIG_SECRET,
  access_token_key:    HEROKU_CONFIG_TOKEN_KEY,
  access_token_secret: HEROKU_CONFIG_TOKEN_SECRET
});

log4js.configure({
  appenders: {
    out: {type: 'console'},
    task: {type: 'dateFile', filename: './logs/fav.log', pattern: '-yyyy-MM-dd'}
  },
  categories: {
    default: {appenders: [ 'out' ], level: 'all'},
    task: {appenders: [ 'task' ], level: 'all'}
  }
})

let outLogger = log4js.getLogger ('out')
let taskLogger = log4js.getLogger ('task')

async function twitterFav () {

  const tweetsCount = 50
  const favouritesCount = 1
  const myId = '939897944362311681'

  try{
    const tweets = await twitterApi.getHtimeline (client, tweetsCount)
    let arr = []

    for (let i = 0; i < tweets.length; i++) {
      if (tweets[i].favorited !== true && tweets[i].user.id_str !== myId) {
        arr.push (tweets[i].id_str)
      }
    }

    let favCheck = arr.join (',')
    const favTweets = await twitterApi.getLookup (client, favCheck)

    for ( var i = 0; i < favTweets.length; i++) {
      if (favTweets[i].favorite_count >= favouritesCount) {
        const favoriting = await twitterApi.postFavoriting (client, favTweets[i].id_str)
      }
    }
  } catch (err) {
    outLogger.warn (err)
    taskLogger.warn (err)
  }
}

twitterFav ()