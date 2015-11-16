// refer to Question model (schema)
var Question = require('../app/models/question');
var Account = require('../app/models/account');

// helper function for getting questions: append exp and username to the given question
function findAccountAndAppend(accounts, question)  // could be questions, answers, or followups
{
  for (var i=0; i<accounts.length; ++i)
  {
    if (question.userId && question.userId===accounts[i].userId)
    {
      question.username = accounts[i].username;
      question.experience = accounts[i].experience;
      question.acctType = accounts[i].type;
      question.jailed = accounts[i].jailed;
    }
  }
}

init = function(router){

////////////////////////////////////////////
//      /question
///////////////////////////////////////////
  router.route('/question')

    // POST req = {userName="", room:"", text:"", imageURL:""}
    .post(function(req, res) {
      console.log("\t" + JSON.stringify(req.body));
      // checks if user is logged in
      // TODO: uncomment this part once front-end is ready
      if (!req.session.userId) {
        res.json({error:"please login to post question"});
        return;
      }
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

      //create a new question to save
      var question = new Question({
  	    text: req.body.text,
        userId: req.session.userId,   // TODO: uncomment this part when front-end is ready
  	    imageURL: imgURL,
  	    room: req.body.room.toLowerCase()
      });

      // save question to DB
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

    // TODO : delete should be secure
    // DELETE req = {id:""}
    .delete(function(req, res) {
      /// @todo check if user is logged in and owns the question or is admin
      if (!req.session.type || req.session.type!=="admin") {
        res.json({error:"only admin can delete"});
        return;
      }
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


    // GET
    .get(function(req, res) {

      Question.find(function(err, questions){
        if (err) {
          console.log(err);
          res.send(err);
  		    return;
  	    }
        Account.find(function(err, accounts){
          // loop through all questions, answer and follow_ups, and append appropriate username and experience on top of them
          // I know that this is super inefficient. T(n) = O(scary)
          for (var i=0; i<questions.length; ++i) {
            findAccountAndAppend(accounts, questions[i]);
            for (var j=0; j<questions[i].answers.length; j++) {
              findAccountAndAppend(accounts, questions[i].answers[j]);
              for (var k=0; k<questions[i].answers[j].follow_ups.length; k++) {
                findAccountAndAppend(accounts, questions[i].answers[j].follow_ups[k]);
              }
            }
          }

          res.json(questions);
          return;

        });


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
         Account.find(function(err, accounts){
           // loop through all questions, answer and follow_ups, and append appropriate username and experience on top of them
           // I know that this is super inefficient. T(n) = O(scary)
           for (var i=0; i<questions.length; ++i) {
             findAccountAndAppend(accounts, questions[i]);
             for (var j=0; j<questions[i].answers.length; j++) {
               findAccountAndAppend(accounts, questions[i].answers[j]);
               for (var k=0; k<questions[i].answers[j].follow_ups.length; k++) {
                 findAccountAndAppend(accounts, questions[i].answers[j].follow_ups[k]);
               }
             }
           }

           res.json(questions);
           return;

         });
       });
     });
}

module.exports.init = init;
