//////////////////////////////////////////////////////////////////////
///
/// @brief Backend system for interactive in-class 'forum'
///
/// @author Amogh Sarda
/// @author Hong Joon Choi
/// @author Long Hoang <long@mindworker.de>
/// @author Matthieu Devaux
///
//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
/// Global vars and constants

var express = require('express');
var app = express();
var session = require('client-sessions');

var port = process.env.PORT || 8080;
var mongodbUri = process.env.MONGOLAB_URI || "mongodb://heroku_ms37k84v:qc3nsje0ljjuq2vbjtugnkj6fh@ds041150.mongolab.com:41150/heroku_ms37k84v";

var conn;

//////////////////////////////////////////////////////////////////////
/// Initialise and connect to Mongolab Database

var uriUtil = require('mongodb-uri');
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var mongooseUri = uriUtil.formatMongoose(mongodbUri);

console.log("Connect to " + mongodbUri);
mongoose.connect(mongooseUri);
conn = mongoose.connection;

conn.on('error', function(err) {
    console.log("Mongoose Connection Error: " + err);
    throw err;
});

conn.on('connected', function() {
    console.log("Successfully connected to Mongolab");

    // @todo start all the database stuff asynchronously
});

// refer to Question model (schema)
var Question = require('./app/models/question');

//////////////////////////////////////////////////////////////////////
/// @todo clean up code below

//need body parser for POST requests (req parser)
var bodyParser = require('body-parser');

// use url encoded parsing. may need to change this.
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// establish the routes
var router = express.Router();

//middleware for any pre-processing of requests (sanitising?)
router.use(function(req, res, next) {
    console.log("Processing REST API request");
    next();
});

router.get('/', function(req, res) {
    res.json({ message: 'Welcome to the API'});
});

// Add headers
// http://stackoverflow.com/questions/18310394/no-access-control-allow-origin-node-apache-port-issue
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow from everywhere

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Pass to next layer of middleware
    next();
});


// Add session middleware
app.use(session({
  cookieName: 'session',
  secret: 'a',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

////////////////////////////////////////////
//      GET, POST and DELETE answers
///////////////////////////////////////////
var questionRoutes = require("./routes/questionRoutes.js");
questionRoutes.init(router);

////////////////////////////////////////////
//      POST and DELETE answers
///////////////////////////////////////////
var answerRoutes = require("./routes/answerRoutes.js");
answerRoutes.init(router);

////////////////////////////////////////////
//      POST and DELETE follow_ups
///////////////////////////////////////////
var followupRoutes = require("./routes/followupRoutes.js");
followupRoutes.init(router);

////////////////////////////////////////////
//      POST and DELETE likes
///////////////////////////////////////////
var likeRoutes = require("./routes/likesRoutes.js");
likeRoutes.init(router);

////////////////////////////////////////////
//      POST and DELETE answerLikes
///////////////////////////////////////////
var likeRoutes = require("./routes/answerLikeRoutes.js");
likeRoutes.init(router);

////////////////////////////////////////////
//      POST and DELETE follow_upsLikes
///////////////////////////////////////////
var likeRoutes = require("./routes/followupLikeRoutes.js");
likeRoutes.init(router);

///////////////////////////////////////////
//      Account system
///////////////////////////////////////////
var accountRoutes = require("./routes/accountRoutes.js");
accountRoutes.init(router);

// root to /api/v1
app.use('/api/v1', router);

app.listen(port);
console.log("Okay starting node server");


//////////////////////////////////////////////////////////////////////
/// Image upload
//////////////////////////////////////////////////////////////////////
var cloudinary  =   require('cloudinary')
var multer      =   require('multer');

var upload      =   multer({ dest: './public/uploads/'});

cloudinary.config({
  cloud_name: 'hrkljqeas',
  api_key: '786599874844472',
  api_secret: 'm0rVQidbQ55FIRNB9DYHnuzF9-U'
});

// Static fileserver serving files in /public folder
app.use(express.static(__dirname + '/public'))

app.use(multer({ dest: './public/uploads/',
    rename: function (fieldname, filename) {
        return filename+Date.now();               // Ensures uniqueness
    },
    /// @todo check if filetype is actually an image
    //  https://github.com/mscdex/mmmagic
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...');
    },
    onFileUploadComplete: function (file, req) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)

    // Use dependency injection to pass on this variable
    req.filepath = file.path.replace("public/", "");
    }
}));

app.post('/api/uploadphoto', function(req, res){
    upload(req, res, function(err) {
        if(err) {
            return res.json({error: "uploadphoto has an error:\n"+err});
        }

	var filename = "./public/" + req.filepath;
	cloudinary.uploader.upload(filename, function(result) {
	    if (result.error) {
		return res.json({error: "Something went wrong with cloudinary upload"});
	    }

            res.json({Filepath: result.url});
	});
    });
});
