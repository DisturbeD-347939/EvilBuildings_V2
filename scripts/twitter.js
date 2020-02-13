//File management
var fs = require('fs');
var fsE = require('fs-extra');
const csv = require('csv-parser');

module.exports =
{
    post: function(twitter, callback)
    {
        data = getPostData();
    },

    getLatest: function(twitter, timer, callback)
    {
        twitter.get('statuses/user_timeline', {screen_name: "evil_aesthetics", count: '1', include_rts: 'false'}, function(error, tweet)
        {
            //console.log(tweet);
            var createdAt = new Date(tweet[0]["created_at"]);
            if(Date.now() - timer > createdAt.getTime())
            {
                callback(1);
            }
            else
            {
                callback(0);
            }
        })
    }
}


function getPostData(callback)
{
    var fileCounter = 0;

    fs.readdir(__dirname + '/../posts/', (err, files) => 
    {
        fileCounter = files.length;

        var path = __dirname + '/../posts/' + (fileCounter - 1);
        var post = fs.readdirSync(path);

        var image = fs.readFileSync(path + "/" + post[0], { encoding: 'base64' });
        var title = fs.readFileSync(path + "/" + post[1], 'utf-8');

        callback([title,image]);
    });

    
    //
}