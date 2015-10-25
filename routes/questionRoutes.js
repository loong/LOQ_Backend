// refer to Question model (schema)
var Question = require('../app/models/question');

function questionExists(req, res, err, question) {
  if (!question) {
    res.json({
      error: "Answer with id "
      + req.params.question_id
      + " does not exists"
    });
    return false;
  }
  if (err) {
    console.log("Error in Get /answer/:id \n" + err);
    return false;
  }

  return true;

}

init = function(router){

////////////////////////////////////////////
//      /question
///////////////////////////////////////////
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
    .delete(function(req, res) {
      /// @todo check if user is logged in and owns the question or is admin
      if (!req.body.id){
        res.json({error:"non-existant id"});
        return;
      }
      Question.remove({_id: req.body.id}, function(err, question) {
        if (err) {
          res.send(err);
          return;
        }

        res.json({ error: "" });
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

////////////////////////////////////////////
//      /question/[question_id]
///////////////////////////////////////////
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
    });



////////////////////////////////////////////
//      /question/room/[room_id]
///////////////////////////////////////////
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
}

module.exports.init = init;
