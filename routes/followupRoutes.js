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

init = function(router){
  router.route('/followup')
    .post(function(req, res) {
      if (!req.body.id){
        res.json({error:"non-existant id"});
        return;
      }
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

          //var newQuestion = new Question(question);
          // decide which question to place followup under.
          //var questionIndex = -1;
          for (var i=0; i<question.answers.length; i++) {
            if (req.body.id==question.answers[i]._id) {
              //questionIndex=i;
              console.log("added followup")
              //if ()
              //  newQuestion.answers[i].follow_ups.push(followupToPush);//[newQuestion.answers[i].follow_ups.length]={text: req.body.text, imageURL: postImgURL};
              //else
              question.answers[i].follow_ups.push(followupToPush);;
              console.log(question.answers[i].follow_ups[question.answers[i].follow_ups.length-1]);
              //question.answers[i].follow_ups[0]["text"]=req.body.text;
              //question.answers[i].follow_ups[0].imageURL=postImgURL
              //console.log(question.answers[i].follow_ups[question.answers[i].follow_ups.length]);
              break;
            }
          }
          console.log(followupToPush);
          console.log(question);

          question.save(function(err, savedQuestion) {
            if (err)
              console.log(err);
        		res.send({"err": err});
        		return;
          });
          // push answerToPush into answers array
          /*Question.update({"answers.follow_ups._id": req.body.text}, { $push: { "answers.questionIndex.follow_ups": followupToPush }}, {safe:true, upsert:true, new: true},function (err, updatedQuestion) {
            if (err) {
              console.log(err);
              res.send(err);
              return;
            }
            res.json({error: "", id: updatedQuestion.answers[questionIndex].follow_ups[updatedQuestion.answers.follow_ups.length-1]._id});
            console.log("Added Answer with id " + updatedQuestion.answers[questionIndex].follow_ups[updatedQuestion.answers.follow_ups.length-1]._id);
          });*/

      });
    })
    .delete(function(req, res) {
      /// @todo check if user is logged in and owns the question or is admin
      if (!req.body.id){
        res.json({error:"non-existant id"});
        return;
      }
      Question.findOne({"answers.follow_ups._id": req.body.id}, function(err, question){
        if (!questionExists(req, res, err, question))
          return;
        //console.log(question);
        //console.log(req.body.id);
        for (var i=0; i<question.answers.length; i++) {
          for (var j=0; j<question.answers[i].follow_ups.length; j++) {
            if (req.body.id==question.answers[i].follow_ups[j]._id) {
              console.log("splice "+question.answers[i].follow_ups[j]);
              question.answers[i].follow_ups.splice(j, 1);
              break;
            }
          }
        }
        //console.log(question);
        question.save(function(err, savedQuestion) {
          if (err)
            console.log(err);
          res.send({"err": err});
          return;
        });
      });

    });
}

module.exports.init = init;
