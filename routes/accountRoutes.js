var Account = require('../app/models/account');
var bcrypt = require('bcrypt-nodejs');
var session = require('client-sessions');

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
            type: "user",       // TODO: implement admin later somehow
      	    email: req.body.email,
      	    password: hashedPassword,
            experience: 0,
            mark_deleted: false
          });

          // save account to DB
          account.save(function(err, savedAccount) {
            if (err) {
              console.log(err);
      		    res.json({error:err});
      		    return;
            }

            req.session.email = req.body.email;
            req.session.userId = savedAccount.userId;
            req.session.type = savedAccount.type;
            console.log("Set session email and ID: " + req.session.email + " " + req.session.userId);

            res.json({error:"", userId: req.session.userId});
      	    console.log("Registered Account with id " + savedAccount.userId);
          });

        });


    })

    // verifies login credentials and sets session for that account
    router.route('/account/login')
      .post(function(req, res) {
        // find account that matches email
        Account.find({email: req.body.email}, function (err, account) {
          if (err) {
            res.json({error:err});
            return;
          }
          if (account.length<1)
          {
            res.json({error:"invalid username"});
            return;
          }
          if (account.length>1)
          {
            console.log("wtf this is not supposed to happen");
          }
          // verify password
          if (!bcrypt.compareSync(req.body.password, account[0].password))
          {
            res.json({error:"invalid password", userId: ""});
            return;
          }

          req.session.email = req.body.email;
          req.session.userId = account[0].userId;
          req.session.type = account[0].type;
          console.log("Set session email and ID: " + req.session.email + " " + req.session.userId);

          res.json({error:"", session: req.session.userId});
        });


      });

    // destroy session
    router.route('/account/logout')
      .get(function(req, res) {
/*        req.session.destroy(function(error) {
          if (error !== null) {
            console.log("cannot destroy session: " + error);
            res.json({error:"cannot destroy session: "+error});
          } else {
            console.log("Session destroyed");
            res.json({error:""});
          }
        });
*/
        req.session.destroy();
        res.json({error:""});
      });

    // just for test, returns req.session
    router.route('/account/session')
      .get(function(req, res) {
        res.send(req.session);
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
