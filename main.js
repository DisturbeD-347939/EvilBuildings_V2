//Scripts
var download = require('./scripts/downloadURL');
var auth = require('./scripts/authenticate');
var twitter = require('./scripts/twitter');
var reddit = require('./scripts/reddit')

//File management
var fs = require('fs');

//Get config file variables
var keyPath = 'keys.json';
var configData = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
var twitterDailyRate, redditDailyRate;

//APIs
var t, r;

function setup()
{
    if(!fs.existsSync('./posts'))
    {
        fs.mkdirSync('./posts');
    }
    
}

setImmediate(function()
{
    setup();

    //Transform daily rate into milliseconds
    twitterDailyRate = (24/configData["twitter"][0]["daily_rate"]) * 60 * 60 * 1000;

    //Authenticate APIs
    auth.run(keyPath, function(data)
    {
        r = data[0];
        t = data[1];
        console.log("Authenticated APIs");

        getRedditPosts(r);

        //Check if it's been long enough to post new tweet!
        twitter.getLatest(t, twitterDailyRate, function(post)
        {
            if(post)
            {
                fs.readdirSync('./posts', (err, files) => 
                {
                    if(files.length > 0)
                    {
                        twitter.post();
                    }
                })
            }
        })
    });
});

function getRedditPosts(r)
{
    console.log("Getting reddit posts...");
    var counter = 0;
    fs.readdir('./posts/', (err, files) => 
    {
        counter = files.length;
    });
    reddit.collect(r, configData["reddit"][0]["subreddit"], 5, function(redditPosts)
    {
        for(var i = 0; i < redditPosts.length; i++)
        {
            var path = './posts/' + counter + "/pic." + checkFormat(redditPosts[i].url);
            fs.mkdir('./posts/' + counter, function(err, data){});
            download.get(redditPosts[i].url, path, function(){});
            counter++;

            if(i + 1 >= redditPosts.length)
            {
                console.log("Got reddit posts!");
            }
        }
    });
}

function checkFormat(url)
{
    var format = "";
    var found = false;
    url = url.split("").reverse().join("");

    for(var i = 0; i < url.length; i++)
    {
        if(!found)
        {
            if(url[i] != ".")
            {
                format += url[i];
            }
            else
            {
                found = true;
            }
        }
    }

    format = format.split("").reverse().join("");

    if(format[0] == ['c'] && format[1] == ['o'] && format[2] == ['m'])
    {
        format = format.slice(0,3);
    }

    return format;
}