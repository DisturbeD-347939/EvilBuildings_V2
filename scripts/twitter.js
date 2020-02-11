module.exports =
{
    post: function(twitter, callback)
    {
        
    },

    getLatest: function(twitter, timer, callback)
    {
        twitter.get('statuses/user_timeline', {screen_name: "evil_aesthetics", count: '1', include_rts: 'false'}, function(error, tweet)
        {
            //console.log(tweet);
            var createdAt = new Date(tweet[0]["created_at"]);
            console.log(timer);
            console.log(createdAt.getTime());
            if(Date.now() - timer > createdAt.getTime())
            {
                console.log("It is");
            }
            else
            {
                console.log("It isn't");
            }
        })
    }
}