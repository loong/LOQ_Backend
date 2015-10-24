//////////////////////////////////////////////////////////////////////
///
/// @brief Backend system for interactive in-class 'forum'
///
/// @author Amogh Sarda
/// @author Hong Joon Choi
/// @author Long Hoang <long@mindworker.de>
///
//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
/// Global vars and constants

var express = require('express');
var app = express();

var port = process.env.PORT || 8080;
var mongodbUri = process.env.MONGOLAB_URI || "mongodb://heroku_ms37k84v:qc3nsje0ljjuq2vbjtugnkj6fh@ds041150.mongolab.com:41150/heroku_ms37k84v";

var conn;

//////////////////////////////////////////////////////////////////////
/// Initialise and connect to Mongolab Database

var uriUtil = require('mongodb-uri');
var mongoose = require('mongoose');

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

// POST add question
// GET show all questions
router.route('/question')
    
    .post(function(req, res) {
	console.log("\t" + JSON.stringify(req.body));

	/// @todo check if user is logged in

	if (!req.body.text) {
	    res.json({error:"Question has no text!"});
	    return
	}

	if (!req.body.room) {
	    res.json({error:"Question has no room!"});
	    return
	}

	var imgURL = req.body.imageURL;
	if (!imgURL) {
	    imgURL = "";
	}

        var question = new Question({
	    text: req.body.text, 
	    imageURL: imgURL,
	    room: req.body.room.toLowerCase()
	});

        question.save(function(err, savedQuestion) {
            if (err) {
                console.log(err);
		res.send(err);
		return
	    }

            res.json({error: "", id: savedQuestion._id});
	    console.log("Added Question with id " + savedQuestion._id);
        });
    })

    .get(function(req, res) {
        Question.find(function(err, questions){
            if (err) {
		console.log(err);
                res.send(err);
		return;
	    }

            res.json(questions);
        });
    });


router.route('/question/:question_id')
    .get(function(req, res) {
        Question.findById(req.params.question_id,  function(err, question) {
            
	    if (err) {
		console.log("Error in Get /question/:id \n" + err);
	    }
	    
	    if (!question) {
		res.json({
		    error: "Question with id " 
			+ req.params.question_id 
			+ " does not exists"
		});
		return;
	    }
	    
            res.json(question);
        });
    })

    .delete(function(req, res) {
	/// @todo check if user is logged in and owns the question or is admin
        
	Question.remove({
            _id: req.params.question_id
        }, function(err, question) {
            if (err) {
                res.send(err);
		return;
	    }
	    
            res.json({ error: "" });
        });
    });

router.route('/questions/room/:room_id')
    .get(function(req, res) {
	Question.find({room: req.params.room_id}, function (err, questions) {
	    if (err) {
                res.send(err);
		return;
	    }
	    
            res.json(questions);
	});
    });
    

// root to /api/v1
app.use('/api/v1', router);

app.listen(port);
console.log("Okay starting node server");


//////////////////////////////////////////////////////////////////////
/// Image upload
//////////////////////////////////////////////////////////////////////
var multer      =   require('multer');
var upload      =   multer({ dest: './public/uploads/'});

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
            return res.json({Error: "uploadphoto has an error:\n"+err});
        }
        res.json({Filepath: req.filepath});
    });
});
