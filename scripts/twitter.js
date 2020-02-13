//File management
var fs = require('fs');
var fsE = require('fs-extra');
const csv = require('csv-parser');

module.exports =
{
    post: function(twitter, tags, callback)
    {
        getPostData(function(data)
        {
            twitter.post('media/upload', {media: data[1]}, function(error, media, response) 
            {
                if (!error) 
                {
                    getDatasets(function(datasets)
                    {
                        checkLocation(datasets[0], datasets[1], data[0], function(locations)
                        {
                            //Prepare the tweet
                            var text = "";
    
                            if(locations != "")
                            {
                                text += locations + " ";
                            }

                            if(tags != "")
                            {
                                text += tags[0] + " " + tags[1] + " " + tags[2];
                            }

                            console.log(text);
    
                            var status = 
                            {
                                status: text,
                                media_ids: media.media_id_string,
                            }
    
                            //Post the tweet
                            twitter.post('statuses/update', status, function(error, tweet, response) 
                            {
                                if (error) 
                                {
                                    console.log(error);
                                }
                                else
                                {
                                    console.log("Posted!");
                                    fs.readdir('./posts', (err, posts) => 
                                    {
                                        fs.readdir('./used', (err, used) => 
                                        {
                                            var oldPath = './posts/' + (posts.length - 1);
                                            var newPath = './used/' + (used.length);

                                            fsE.move(oldPath, newPath, err => {
                                              if(err) return console.error(err);
                                              console.log('Moved folder to used!\n');
                                            });
                                        })
                                    })
                                }
                            });
                        })
                    })
                }
                else
                {
                    console.log(error);
                }
            })
        });
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

        var image = fs.readFileSync(path + "/" + post[1], { encoding: 'base64' });
        var title = fs.readFileSync(path + "/" + post[2], 'utf-8');

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