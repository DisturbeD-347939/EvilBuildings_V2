//Require scripts
var auth = require('./scripts/authenticate.js');

//File management
var fs = require('fs');

//Get config file variables
var keyPath = 'keys.json';
var configData = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

setImmediate(function()
{
    

    auth.run(keyPath, function()
    {
        console.log("Authenticated APIs");
    });
});

function getPost()
{

}

function createPost()
{
    
}