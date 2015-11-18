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
//      /answerLikes
///////////////////////////////////////////
  router.route('/answerLikeRoutes')

    //////////////////////////////////////////////////
    // POST req = {id: "", user: ""}
    .post(function(req, res) {
      if (!req.body.id){
        res.json({error:"non-existant id"});
        return;
      }
      
 
      // find question object from DB that contains answers._id
      Question.findOne({"answers._id": req.body.id}, function(err, question){
        if (!questionExists(req, res, err, question))
          return;

          // validate post.body and perform few autofix
          if (!req.body.user) {
              res.json({error:"Like come from no user"});
              return
          }
          
          //users can not like something twice
          for (var i=0; i<question.answers.length; i++) {
            if (req.body.id==question.answers[i]._id) {
             for (var n=0; n<question.answers[i].likes.length; n++) {
               if (req.body.user===question.answer[i].likes[n]) {
                  res.json({error:"Already like"});
                  return ;
               }
             }
             question.answer[i].likes.push(req.body.user);
            }
          }
              
        
          // save the updated question object back into DB
          question.save(function(err, savedQuestion) {
            if (err) {
		console.log(err);
		res.send({"error": err});
		return;
	    }
          });

      });
    })

    //////////////////////////////////////////////////
    // DELETE req = {id = "" , user:""}
    .delete(function(req, res) {
      if (!req.body.user){
        res.json({error:"non-existant user"});
        return;
      }
      
      if (!req.body.id){
        res.json({error:"non-existant id"});
        return;
      }

      // find question object from DB that contains answers.follow_ups._id
      Question.findOne({"answers._id": req.body.id}, function(err, question){
        if (!questionExists(req, res, err, question))
          return;

        for (var i=0; i<question.answers.length; i++) {
            if (req.body.id==question.answers[i]._id) {
               for (var j=0; i<question.answers[i].likes.length; i++) {
                 if (req.body.user===question.answers[i].likes[j]) {
                    question.answers[i].likes.splice(j, 1); // remove from array
                    break;
                }
              }
            }
        }

        // save the updated question back into DB
        question.save(function(err, savedQuestion) {
            if (err) {
		console.log(err);
		res.send({"error": err});
	    }
        });
      });

    });
}

module.exports.init = init;
