# **EvilBuildings**
Created by Ricardo Graça.

---
## **Description**
EvilBuildings is a **Twitter bot** that posts images of evil looking buildings. To get this data, EvilBuildings checks for the hottest posts on **r/Evilbuildings (Reddit)** and saves them locally (for example, every 4 hours). 

After doing so, it runs the images through **IBM Image Recognition** to get words similar to what's in the picture. The bot then uses those words and **creates hashtags** which will be posted with the Twitter post in order to hopefully earn some more views! Not only does it get hashtags but it also recognises the names of cities or countries in the reddit post and **posts the locations** too.

This was a **personal** project developed just to **learn** a bit more about **API's**!
EvilBuildings is **finished**!

---
## **Installation**
To install the project just make a **copy** of the repository in your computer and be sure to have [NodeJS installed](https://nodejs.org/en/download/) too!

When all of that is done, navigate to the folder using a command line and run the command **`npm install`**
Now to run it, head into your repository copy folder using the NodeJS terminal and run the command **`node app.js`**

---
## **Development Map**
These are the steps I took in order to develop this project:
1. Learn about the Twitter API.
2. Learn about the Reddit API.
3. Create posts using the Twitter API.
4. Retrieve posts using the Reddit API.
5. Run Reddit posts through IBM Image Recognition API to create hashtags.
6. Detect countries/cities names and add them to the title.
7. Post to Twitter.
