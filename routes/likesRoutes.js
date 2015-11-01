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
  router.route('/like')

    //////////////////////////////////////////////////
    // POST req = {id: "", user: ""}
    .post(function(req, res) {
      if (!req.body.id){
        res.json({error:"non-existant id"});
        return;
      }
 
      // find question object from DB that contains answers._id
      Question.findOne({"_id": req.body.id}, function(err, question){
        if (!questionExists(req, res, err, question))
          return;

          // validate post.body and perform few autofix
          if (!req.body.user) {
              res.json({error:"Like come from no user"});
              return
          }
          
          //users can not like something twice
          for (var i=0; i<question.likes.length; i++) {
            if (req.body.user===question.likes[i]) {
              res.json({error:"Already like"});
              return ;
            }
          }
              question.likes.push(req.body.user);
        
          // save the updated question object back into DB
          question.save(function(err, savedQuestion) {
            if (!err)
              console.log(err);
              res.send({"error": err+"    "+question.likes});
              return;
          });

      });
    })

    //////////////////////////////////////////////////
    // DELETE req = {question_id = "" , user:""}
    .delete(function(req, res) {
      if (!req.body.user){
        res.json({error:"non-existant user"});
        return;
      }

      // find question object from DB that contains answers.follow_ups._id
      Question.findOne({"question._id": req.body.question_id}, function(err, question){
        if (!questionExists(req, res, err, question))
          return;


        for (var i=0; i<question.likes.length; i++) {
          if (req.body.user===question.likes[i]) {
            question.likes.splice(i, 1); // remove from array
            break;
          }
        }

        // save the updated question back into DB
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
