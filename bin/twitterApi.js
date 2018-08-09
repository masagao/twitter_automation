module.exports = {

  sleep (timer) {
    return new Promise ((resolve, reject) => {
      setTimeout (() => {
        resolve ()
      }, timer)
    })
  },

  getUtimeline (client, influencerId, tweetCount) {
    return new Promise ((resolve, reject) => {
      client.get ('statuses/user_timeline', {user_id: influencerId, count: tweetCount, include_rts: false, exclude_replies: true}, (error, tweets, response) => {
        if (error) {
          reject (error)
        } else {
          resolve (tweets)
        }
      })
    })
  },

  getRelationship (client, userId, targetId) {
    return new Promise ((resolve, reject) => {
      client.get ('friendships/show', {source_id: userId, target_id : targetId}, function (error, friendships, response) {
        if (error) {
          reject (error)
        } else {
          resolve (friendships)
        }
      })
    })
  },

  getHtimeline (client, tweetsCount) {
    return new Promise ((resolve, reject) => {
      client.get ('statuses/home_timeline', {count: tweetsCount, include_rts: false, exclude_replies: true, stringify_ids: true}, function (error, tweets, response) {
        if (error) {
          reject (error)
        } else {
          resolve (tweets)
        }
      })
    })
  },

  getLookup (client, tweetsID) {
    return new Promise ((resolve, reject) => {
      client.get ('statuses/lookup', {id: tweetsID}, function (error, favTweets, response) {
        if (error) {
          reject (error)
        } else {
          resolve (favTweets)
        }
      })
    })
  },

  getFriendsIds (client, userId, friendsCount) {
    return new Promise ((resolve, reject) => {
      client.get ('friends/ids', {user_id : userId, count: friendsCount, stringify_ids: true}, function(error, friends, response) {
        if (error) {
          reject (error)
        } else {
          resolve (friends)
        }
      })
    })
  },

  getFriendstimeline (client, targetId, tweetsCount) {
    return new Promise ((resolve, reject) => {
      client.get ('statuses/user_timeline', {user_id: targetId, count: tweetsCount, include_rts: false, exclude_replies: true}, function(error, friendsTweets, response) {
        if (error) {
          reject (error)
        } else {
          resolve (friendsTweets)
        }
      })
    })
  },

  getFollowersList (client, followersCount) {
    return new Promise ((resolve, reject) => {
      client.get ('followers/list', {count: followersCount}, (error, followersList, response) => {
        if (error) {
            reject (error)
        } else {
          resolve (followersList)
        }
      })
    })
  },

  postFavoriting (client, favTweets) {
    return new Promise ((resolve, reject) => {
      client.post ('favorites/create', {id: favTweets}, function(error, favoriting, response) {
        if (error) {
          reject (error)
        } else {
          resolve (favoriting)
        }
      })
    })
  },

  postMute (client, targetId) {
    return new Promise ((resolve, reject) => {
      client.post ('mutes/users/create', {"user_id": targetId}, function(error, Muting, response) {
        if (error) {
          reject (error)
        } else {
          resolve (Muting)
        }
      })
    })
  },

  postFollowing (client, userId) {
    return new Promise ((resolve, reject) => {
      client.post ('friendships/create', {user_id: userId, follow: true}, (error, following, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(following)
        }
      })
    })
  },

  postUnfollowing (client, userId) {
    return new Promise ((resolve, reject) => {
      client.post ('friendships/destroy', {user_id: userId}, (error, unfollowing, response) => {
        if (error) {
          reject (error)
        } else {
          resolve (unfollowing)
        }
      })
    })
  },
}