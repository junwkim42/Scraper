var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrape";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

app.get("/scrape", function(req, res) {

  axios.get("https://www.nytimes.com").then(function(response) {

    var $ = cheerio.load(response.data);

    $("div.eqveam61").each(function(i, element) {
      // Save an empty result object
  
      var result = {};

      result.title = $(this)
        .find("h2")
        .find("span")
        .text();
      result.summary = $(this)
        .find("a")
        .find("p")
        .text();
      result.link = $(this)
        .find("a")
        .attr("href");
      result.link = "https://www.nytimes.com" + result.link;
      //console.log("title: " + result.title + "    " + "summary: "+ result.summary + "link: " +  result.link);



      if(result.title !== "" && result.summary !== "" && result.link !== "" ){
        db.Article.find({title: result.title})
        .then(function(res){
          if (res.length < 1){
            db.Article.create(result)
            .then(function(dbArticle) {
              console.log(dbArticle);
            })
            .catch(function(err) {
              console.log(err);
          });
          }
        })
        .catch(function(err){
          console.log(err);
        });

      }
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  console.log(req.body);
  db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: req.body.comment }, { new: true })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
