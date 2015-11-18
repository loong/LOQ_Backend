var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var AccountSchema = new Schema({
	userId: Number,
	type: String,			// either user or admin
	username : String,
	email : String,
	password : String,
	experience : Number,
	jailed : Boolean,
	mark_deleted : Boolean
});

// exports this model and make sit available to server.js
// note that when making a model of Question, mongodb makes collection questions
// automatically plural
module.exports = mongoose.model('Account', AccountSchema)
module.exports.AddExp = function(uid, n) {
    module.exports.findOne({"userId": uid}, function(err, acc){
	if (err) {
	    console.log("Error in adding exp")
	    console.log(err);
	    return
	}

	if(!acc){
	    console.log("Error, userId probably invalid");
	    return;
	}

	acc.experience += n;
	acc.save(function(err, savedAcc) {
            if (err) {
		res.send({"error": "Cannot change Experience points", "account": savedAcc});
		return;
	    }

	    console.log("User " + acc.username + " new exp is " + acc.experience);
          });
    });
}
