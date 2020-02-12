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
    var titles = [];

    //Count & Get titles from posts
    fs.readdir('./posts/', (err, files) => 
    {
        counter = files.length;

        //Get the most recent posts titles to check for repetitions
        if(files.length - configData["twitter"][0]["daily_rate"] > 0)
        {
            for(var i = files.length - 1; i >= files.length - configData["reddit"][0]["daily_rate"]; i--)
            {
                var title = fs.readFileSync('./posts/' + i + "/title.txt", 'utf-8', function(err, data){});
                titles.push(title);
            }
        }

    });
    reddit.collect(r, configData["reddit"][0]["subreddit"], configData["reddit"][0]["daily_rate"], function(redditPosts)
    {
        for(var i = 0; i < redditPosts.length; i++)
        {
            //Check for repeated posts
            var repeated = false;
            for(var j = 0; j < titles.length; j++)
            {
                if(titles[j] == redditPosts[i].title)
                {
                    repeated = true;
                }
            }

            //If the post is new, create it
            if(!repeated)
            {
                var path = './posts/' + counter + "/pic." + checkFormat(redditPosts[i].url);

                //Create directory for the post
                fs.mkdir('./posts/' + counter, function(err, data){});

                //Create title.txt containing the title for the post
                fs.writeFile('./posts/' + counter + "/title.txt", redditPosts[i].title, function(err, data){});

                //Download post
                download.get(redditPosts[i].url, path, function(){});
                counter++;
            }

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