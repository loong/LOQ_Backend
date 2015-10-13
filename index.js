//////////////////////////////////////////////////////////////////////
///
/// @brief Backend system for interactive in-class 'forum'
///
/// @author Hong Joon Choi
/// @author Long Hoang <long@mindworker.de>
///
//////////////////////////////////////////////////////////////////////

var express     =   require("express");
var multer      =   require('multer');
var app         =   express();

//////////////////////////////////////////////////////////////////////
/// Image upload
//////////////////////////////////////////////////////////////////////
var upload      =   multer({ dest: './public/uploads/'});

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


//////////////////////////////////////////////////////////////////////
/// General Stuff
//////////////////////////////////////////////////////////////////////

app.get('/',function(req, res){
      res.end("Hello World");
});

// Static fileserver serving files in /public folder
app.use(express.static(__dirname + '/public'))

app.listen((process.env.PORT || 5000), function(){
    console.log("Working on port 5000");
});
