//Scripts
var download = require('./scripts/downloadURL');
var auth = require('./scripts/authenticate');
var twitter = require('./scripts/twitter');
var reddit = require('./scripts/reddit')
var ir = require('./scripts/imageRecognition');

//File management
var fs = require('fs');

//Console input
var stdin = process.openStdin();

//Get config file variables
var keyPath = 'keys.json';
var configData = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
var twitterDailyRate, redditDailyRate;

redditDailyRate = Math.ceil(configData["reddit"][0]["daily_rate"]/configData["twitter"][0]["daily_rate"]);
twitterDailyRate = (24/configData["twitter"][0]["daily_rate"]) * 60 * 60 * 1000;

//APIs
var t, r;

function setup()
{
    if(!fs.existsSync('./posts'))
    {
        fs.mkdirSync('./posts');
    }

    if(!fs.existsSync('./used'))
    {
        fs.mkdirSync('./used');
    }
}

setInterval(function()
{
    run();
}, twitterDailyRate + 25000);

setImmediate(function()
{
    run();
});

function run()
{
    setup();

    //Authenticate APIs
    auth.run(keyPath, function(data)
    {
        r = data[0];
        t = data[1];
        console.log("Authenticated APIs");

        getRedditPosts(r, function()
        {
            //Check if it's been long enough to post new tweet!
            twitter.getLatest(t, twitterDailyRate, function(post)
            {
                if(post)
                {
                    fs.readdir('./posts', (err, files) => 
                    {
                        if(files.length > 0)
                        {
                            setTimeout(function()
                            {
                                getTags(function(tags)
                                {
                                    twitter.post(t, tags, function()
                                    {
                                        console.log("Back");
                                    })
                                });
                            }, 4000);
                        }
                    })
                }
            })
        });
    });
}

function getRedditPosts(r, callback)
{
    console.log("Getting reddit posts...");
    var counter = 0;
    var titles = [];

    //Count & Get titles from posts
    fs.readdir('./posts/', (err, files) => 
    {
        counter = files.length;

        //Get the most recent posts titles to check for repetitions
        if(files.length > 0)
        {
            for(var i = 0; i < files.length; i++)
            {
                var title = fs.readFileSync('./posts/' + i + "/title.txt", 'utf-8', function(err, data){});
                titles.push(title);
            }
        }

    });

    fs.readdir('./used/', (err, files) => 
    {

        //Get the most recent posts titles to check for repetitions
        if(files.length > 0)
        {
            for(var i = 0; i < files.length; i++)
            {
                var title = fs.readFileSync('./used/' + i + "/title.txt", 'utf-8', function(err, data){});
                titles.push(title);
            }
        }

    });

    if(counter < 100)
    {
        reddit.collect(r, configData["reddit"][0]["subreddit"], redditDailyRate, function(redditPosts)
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

                    //Create a file with the format on it
                    fs.writeFile('./posts/' + counter + "/format.txt", checkFormat(redditPosts[i].url), function(err, data){});
    
                    //Download post
                    download.get(redditPosts[i].url, path, function(){});
                    counter++;
                }
    
                if(i + 1 >= redditPosts.length)
                {
                    console.log("Got reddit posts!");
                    callback();
                }
            }
        });
    }
}

function getTags(callback)
{
    fs.readdir('./posts/', (err, files) => 
    {
        if(files.length > 0)
        {
            for(var i = files.length - 1; i < files.length; i++)
            {
                var format = fs.readFileSync('./posts/' + i + "/format.txt", 'utf-8');
                var size = fs.statSync('./posts/' + i + '/pic.' + format);
                var sizeInMB = size["size"] / 1000000.0;
                if(sizeInMB < 10)
                {
                    ir.classify('./posts/' + i + "/pic." + format, function(data)
                    {
                        if(data != "err")
                        {
                            ir.getTags(data, function(data)
                            {
                                callback(data);
                            })
                        }
                        else
                        {
                            callback([" "]);
                        }
                    })
                }
                else
                {
                    callback([" "]);
                }
            }
        }
        else
        {
            console.log("Not enough posts");
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

stdin.addListener("data", function(d) 
{
    if(d.toString().trim() == "get post")
    {
        console.log("Getting posts");
        getRedditPosts(r, function(){});
    }
    else if(d.toString().trim() == "tweet post")
    {
        console.log("Tweeting post");
        getTags(function(tags)
        {
            fs.readdir('./posts/', (err, files) => 
            {
                if(files.length > 0)
                {
                    twitter.post(t, tags, function()
                    {
                        console.log("Back");
                    })
                }
                else
                {
                    console.log("Not enough posts");
                }
            })
        });
    }
});