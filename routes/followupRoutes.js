// refer to Question model (schema)
var Question = require('../app/models/question');

// error detection routine. (mainly to reduce redundent code)
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
//      /followup
///////////////////////////////////////////
  router.route('/followup')

    //////////////////////////////////////////////////
    // POST req = {id:"", text:"", imageURL:""}
    .post(function(req, res) {
      if (!req.body.id){
        res.json({error:"non-existant answer id"});
        return;
      }

      // checks if user is logged in
      if (!req.session.userId) {
        res.json({error:"please login to post question"});
        return;
      }

    res.json({
      error: " merde "
      + req.body.id
      + " does not exists"
    });
      // find question object from DB that contains answers._id
      Question.findOne({"answers._id": req.body.id}, function(err, question){
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
          var followupToPush = {"text": req.body.text, "imageURL": postImgURL}
          var updatedAnswerIndex = -1;

          // decide which answer array to place followup under.
          for (var i=0; i<question.answers.length; i++) {
            if (req.body.id==question.answers[i]._id) {
              updatedAnswerIndex = i;
              question.answers[i].follow_ups.push(followupToPush);;
              break;
            }
          }

          // save the updated question object back into DB
          question.save(function(err, updatedQuestion) {
            if (err)
            {
              console.log(err);
              res.send({error: err});
            }
            else {
              res.send({error: "", id: updatedQuestion.answers[updatedAnswerIndex].follow_ups[updatedQuestion.answers[updatedAnswerIndex].follow_ups.length-1]._id});
            }
        		return;
          });

      });
    })

    //////////////////////////////////////////////////
    // DELETE req = {id:""}
    .delete(function(req, res) {
      /// @todo check if user is logged in and owns the question or is admin
      if (!req.body.id){
        res.json({error:"non-existant followup id"});
        return;
      }
      if (!req.session.type || req.session.type!=="admin") {
        res.json({error:"only admin can delete"});
        return;
      }

      // find question object from DB that contains answers.follow_ups._id
      Question.findOne({"answers.follow_ups._id": req.body.id}, function(err, question){
        if (!questionExists(req, res, err, question))
          return;

        // traverse through all answers and all follow_ups, to find the target element.
        for (var i=0; i<question.answers.length; i++) {
          for (var j=0; j<question.answers[i].follow_ups.length; j++) {
            if (req.body.id==question.answers[i].follow_ups[j]._id) {
              //console.log("splice "+question.answers[i].follow_ups[j]);
              question.answers[i].follow_ups.splice(j, 1); // remove from array
              break;
            }
          }
        }

        // save the updated question back into DB
        question.save(function(err, savedQuestion) {
          if (err)
          {
            console.log(err);
            res.send({error: err});
          }
          else {
            res.send({error: ""});
          }
          return;
        });
      });

    });
}

module.exports.init = init;
