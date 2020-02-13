//File management
const fs = require('fs');

//IBM Visual Recognition module
const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');

//Ignored words
var ignored = ["building", "Gray", "black", "gray", "colour", "color", "white", "business"];

function auth(callback)
{
    //Get files
    var credentials = fs.readFileSync('./keys.json', 'utf-8');
    var parsedCredentials = JSON.parse(credentials);

    //Authentication into the Personality Insight API
    var visualRecognition = new VisualRecognitionV3
    ({
        version: parsedCredentials.ibm[2].version,
        iam_apikey: parsedCredentials.ibm[2].iam_apikey,
        url: parsedCredentials.ibm[2].url,
    });
    callback(visualRecognition);
}



module.exports =
{
    classify: function(path, callback)
    {
        auth(function(visualRecognition)
        {
            var params = 
            {
                image_file: fs.createReadStream(path)
            }
    
            visualRecognition.classify(params, function(err, res)
            {
                if(err)
                {
                    console.log("Error");
                    callback("err");
                }
                else 
                {
                    var data = JSON.stringify(res, null, 2);
                    data = JSON.parse(data);
                    callback(data);
                }
            });
        });
    },

    getTags: function(data, callback)
    {
        var tags = [];
        var finalTags = [];
        for(var i = 0; i < data.images[0].classifiers[0].classes.length; i++)
        {
            if(!ignored.contains(data.images[0].classifiers[0].classes[i].class))
            {
                tags.push("#" + data.images[0].classifiers[0].classes[i].class);
            }
        }
        for(var i = 0; i < tags.length; i++)
        {
            tags[i] = tags[i].split(/(?:,| )+/); 
            for(var j = 0; j < tags[i].length; j++)
            {
                if(tags[i][j].charAt(0) == "#")
                {
                    finalTags.push(tags[i][j]);
                }
            }
        }
        callback(finalTags);
    }
}

Array.prototype.contains = function(element){
    return this.indexOf(element) > -1;
};