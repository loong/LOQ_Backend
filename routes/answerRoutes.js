// refer to Question model (schema)
var Question = require('../app/models/question');

function questionExists(req, res, err, question) {
  if (!question) {
    res.json({
      error: "Question with id "
      + req.params.question_id
      + " does not exists"
    });
    return false;
  }
  if (err) {
    console.log("Error in Get /question/:id \n" + err);
    return false;
  }

  return true;

}

init = function(router) {
  router.route('/answer')
    .post(function(req, res) {
        if (!req.body.id){
          res.json({error:"non-existant id"});
          return;
        }
        Question.findById(req.body.id,  function(err, question) {

          // find question by ID, and validate the result.
          if (!questionExists(req, res, err, question))
            return;

          // validate post.body and perform few autofix
          if (!req.body.text) {
        	    res.json({error:"Question has no text!"});
        	    return
        	}
        	var postImgURL = req.body.imageURL;
        	if (!postImgURL) {
        	    postImgURL = "";
        	}
          var answerToPush = {text: req.body.text, imageURL: postImgURL};

          // push answerToPush into answers array
          Question.findByIdAndUpdate(req.body.id, { $push: { answers: answerToPush }}, {safe:true, upsert:true, new: true},function (err, updatedQuestion) {
            if (err) {
              console.log(err);
		          res.send(err);
		          return;
	          }
            res.json({error: "", id: updatedQuestion.answers[updatedQuestion.answers.length-1]._id});
            console.log("Added Answer with id " + updatedQuestion.answers[updatedQuestion.answers.length-1]._id);
          });
            //res.json(question);
        });
    })
    .delete(function(req, res) {    // in this DELETE, req.params.question_id is the TARGET ID OF ANSWER element
	/// @todo check if user is logged in and owns the question or is admin
      if (!req.body.id){
        res.json({error:"non-existant id"});
        return;
      }
      Question.findOne({"answers._id": req.body.id}, function(err, question){
        if (!questionExists(req, res, err, question))
          return;
        //console.log(question);
        console.log(req.body.id);
        for (var i=0; i<question.answers.length; i++) {
          console.log(question.answers[i]._id);
          if (req.body.id==question.answers[i]._id) {
            console.log("splice "+question.answers[i]);
            question.answers.splice(i, 1);
            break;
          }
        }
        //console.log(question);
        question.save(function(err, savedQuestion) {
          if (err)
            console.log(err);
      		res.send({"err": err});
      		return;
        });
        /*Question.findOneAndUpdate({_id: new ObjectId(question._id)}, { $pull: {answers: {_id: new ObjectId(req.params.question_id)}}}, {safe:true}, function (err, updatedQuestion) {
          if (err) {
            console.log(err);
            res.send(err);
            return;
          }
          console.log(updatedQuestion);
          res.json({error: ""});
          console.log("Deleted an item");
        });
            //res.json(question);*/
      });

    });
    /*Question.findOneAndUpdate({_id: new ObjectId(question._id)}, { $pull: {answers: {_id: new ObjectId(req.params.question_id)}}}, {safe:true}, function (err, updatedQuestion) {
      if (err) {
        console.log(err);
        res.send(err);
        return;
      }
      console.log(updatedQuestion);
      res.json({error: ""});
      console.log("Deleted an item");
    });
        //res.json(question);*/
/*
      Question.findById(req.params.question_id,  function(err, question) {

        // find question by ID, and validate the result.
        if (!questionExists(req, res, err, question))
          return;

        // validate post.body and perform few autofix
        if (!req.body.text) {
            res.json({error:"Question has no text!"});
            return
        }
        var postImgURL = req.body.imageURL;
        if (!postImgURL) {
            postImgURL = "";
        }
        var answerToPush = {text: req.body.text, imageURL: postImgURL};

        // push answerToPush into answers array
        Question.findByIdAndUpdate(req.params.question_id, { $push: { answers: answerToPush }}, {safe:true, upsert:true, new: true},function (err, updatedQuestion) {
          if (err) {
            console.log(err);
            res.send(err);
            return;
          }
          res.json({error: "", id: updatedQuestion.answers[updatedQuestion.answers.length-1]._id});
          console.log("Added Answer with id " + updatedQuestion.answers[updatedQuestion.answers.length-1]._id);
        });
          //res.json(question);
      });*/
}

module.exports.init = init;
