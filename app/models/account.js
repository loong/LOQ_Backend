var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var AccountSchema = new Schema({
	userId: Number,
	username : String,
	email : String,
	password : String,
	experience : Number,
	mark_deleted : Boolean
});


// exports this model and make sit available to server.js
// note that when making a model of Question, mongodb makes collection questions
// automatically plural
module.exports = mongoose.model('Account', AccountSchema)
