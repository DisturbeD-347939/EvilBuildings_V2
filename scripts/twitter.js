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
}

//Get locations
function checkLocation(countriesList, citiesList, content, callback)
{
    content = content.replace(/[^\w\s]/gi, '')
    splitContent = content.split(" ");
    function loopData(splitContent, callback)
    {
        var data = "";

        function getCity(data, callback)
        {
            for(var i = 0; i < splitContent.length; i++)
            {
                for(var j = 0; j < citiesList.length; j++)
                {
                    var citiesLists = citiesList[j];
                    if(splitContent[i] == citiesList[j][0])
                    {
                        data += splitContent[i] + ", " + citiesList[j][1];
                    }
                }
            }
            if(i == splitContent.length)
            {
                callback(data);
            }
        }
        getCity(data, function(city)
        {
            data += city;
            callback(data);
        })
    }
    
    loopData(splitContent, function(data)
    {
        callback(data);
    });
}

function getDatasets(callback)
{
    //Variables
    var countries = [], cities = [];
    //Next callback
    fs.createReadStream('countries_data.csv').pipe(csv()).on('data', (row) => 
    {
        countries.push([row.Country, row.Name]);
    }).on('end', () => 
    {
        console.log("Countries replied with SUCCESS");
        fs.createReadStream('cities_data.csv').pipe(csv()).on('data', (row) => 
        {
            cities.push([row.name, row.country]);
        }).on('end', () => 
        {
            console.log("Cities replied with SUCCESS");
            callback([countries, cities]);
            return;
        });
    });
}

    //Move directory
function moveDir(oldPath, newPath, callback)
{
    fsE.move(oldPath, newPath, err =>
    {
        if(err)
        {
            console.log(err);
            callback();
        }
        else
        {
            console.log("Moved to used tweets folder");
            callback();
        }
    })
}