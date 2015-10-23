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
/// Routing and middleware
//////////////////////////////////////////////////////////////////////

// setup express
var express = require('express');
var app = express();

//need body parser for POST requests (req parser)
var bodyParser = require('body-parser');

// setup mongo and connect
// db used is sample
var mongoose = require('mongoose');
var url = 'mongodb://root:hwaiting@ds041150.mongolab.com:41150/heroku_ms37k84v';
mongoose.connect(url, function(err) {
    console.log("test");
    if (err) throw err;
});

// refer to Question model (schema)
var Question = require('./app/models/question');

// use url encoded parsing. may need to change this.
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

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
        var question = new Question(req.body);
        console.log(JSON.stringify(req.body));
        //question.text = req.body.text;

        question.save(function(err) {
            if (err)
                res.send(err)

            res.json({ message: 'Added Question!'});

        });
    })

    .get(function(req, res) {
        Question.find(function(err, questions){
            if (err)
                res.send(err);
            res.json(questions);
        });
    });


// GET question by id
// DELETE question by id
router.route('/question/:question_id')
    .get(function(req, res) {
        Question.findById(req.params.question_id,  function(err, question) {
            if (err)
                res.send(err);
            res.json(question);
        });
    })

    .delete(function(req, res) {
        Question.remove({
            _id: req.params.question_id
        }, function(err, question) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

router.route('/answer/:question_id')
    .post(function(req, res) {

    })

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

