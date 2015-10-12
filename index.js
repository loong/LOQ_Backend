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
var upload      =   multer({ dest: './uploads/'});

app.use(multer({ dest: './uploads/',
    rename: function (fieldname, filename) {
        return filename+Date.now();               // Ensures uniqueness
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...');
    },
    onFileUploadComplete: function (file, req) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)

	// Use dependency injection to pass on this variable
	req.filepath = file.path;
    }
}));

/// @todo return JSON object with filepath
app.post('/api/uploadphoto', function(req, res){
    upload(req, res, function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded\n"+req.filepath);
    });
});


//////////////////////////////////////////////////////////////////////
/// General Stuff
//////////////////////////////////////////////////////////////////////

app.get('/',function(req,res){
      res.end("Hello World");
});

// Static fileserver serving files in /public folder
app.use(express.static(__dirname + '/public'))

app.listen((process.env.PORT || 5000), function(){
    console.log("Working on port 3000");
});
