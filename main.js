//Require scripts
var auth = require('./scripts/authenticate.js');
var twitter = require('./scripts/twitter.js');

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

function getPost()
{

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