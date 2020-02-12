//File Management
var fs = require('fs');

module.exports =
{
    //Download and organize reddit posts from r/evilbuildings
    collect: function(r, subreddit, amount, callback)
    {
        r.getSubreddit(subreddit).getRising({"limit": amount}).then(posts => 
        {
            callback(posts);
        })
    }
}