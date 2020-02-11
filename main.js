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

setImmediate(function()
{
    //Transform daily rate into milliseconds
    twitterDailyRate = (24/configData["twitter"][0]["daily_rate"]) * 60 * 60 * 1000;

    //Authenticate APIs
    auth.run(keyPath, function(data)
    {
        r = data[0];
        t = data[1];
        console.log("Authenticated APIs");

        //Check if it's been long enough to post new tweet!
        twitter.getLatest(t, twitterDailyRate, function(data)
        {
            console.log(data);
        })
    });
});

function getPost()
{

}

function createPost()
{

}