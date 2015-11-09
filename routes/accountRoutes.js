var Account = require('../app/models/account');
var bcrypt = require('bcrypt');

init = function(router) {
  ////////////////////////////////////////////
  //      /answer
  ///////////////////////////////////////////
  router.route('/account/register')

    //////////////////////////////////////////////////
    // POST req = {email: "", password: "", username: ""}
    .post(function(req, res) {
        //console.log(req.body);

        // input field validation
        if (!req.body.email) {
      	    res.json({error: "empty e-mail field"});
      	    return;
      	}
        var email = req.body.email
        if (!(email.indexOf("ust.hk")>-1) || !(email.indexOf("@")>-1)) {
            res.json({error: "please use school email"});
        }
        if (!req.body.username) {
      	    res.json({error: "empty username field"});
      	    return;
      	}
        if (!req.body.password || req.body.password.length<8) {
      	    res.json({error:"password too short"});
      	    return;
      	}

        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(req.body.password, salt);
        //console.log(hashedPassword);
        //console.log(bcrypt.compareSync("12345678", hashedPassword)); // true  // for password verification
        //bcrypt.compareSync('not_bacon', hash); // false

        Account.find(function(err, accounts){
          if (err) {
            console.log(err);
            res.send(err);
    		    return;
    	    }

          // validation routine
          // since mongodb doesn't support auto-increment integer id, we are gonna create it in a hacky way.
          var maxIntegerId=0; // largest id in the current account list
          for (var i=0; i<accounts.length; i++) {
            // check whether username and e-mail is unique
            if (req.body.username==accounts[i].username) {
              res.json({error:"non-unique username"});
              return;
            }
            if (req.body.email==accounts[i].email) {
              res.json({error:"non-unique e-mail"});
              return;
            }
            // find the maximum
            if (maxIntegerId < accounts[i].userId) {
              maxIntegerId = accounts[i].userId;
            }
          }
          ++maxIntegerId;

          //create a new account to save
          var account = new Account({
      	    userId: maxIntegerId,
            username: req.body.username,
      	    email: req.body.email,
      	    password: req.body.password,
            experience: 0,
            mark_deleted: false
          });

          // save account to DB
          account.save(function(err, savedAccount) {
            if (err) {
              console.log(err);
      		    res.send(err);
      		    return;
            }

            res.json({error: "", id: savedAccount.userId});
      	    console.log("Registered Account with id " + savedAccount.userId);
          });
        });


    })
    router.route('/account/session')
      .get(function(req, res) {
        /*Account.find(function(err, accounts){
          if (err) {
            console.log(err);
            res.send(err);
            return;
          }

          res.json(accounts);
        });*/
      });

    router.route('/account/all')
      // GET
      .get(function(req, res) {
        Account.find(function(err, accounts){
          if (err) {
            console.log(err);
            res.send(err);
    		    return;
    	    }

          res.json(accounts);
        });
      });
}

module.exports.init = init;
