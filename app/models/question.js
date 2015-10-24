var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
	userId: Number,
	text: String,
	imageURL: String,
	time: {type: Date, default: Date.now},
	answers: [{
		id: Number,
		userId: Number,
		username: String,
		text: String,
		time: Date,
		imageURL: String,
		follow_ups: [{
			id: Number,
			userId: Number,
			username: String,
			text: String,
			time: Date,
			imageURL: String
		}]
	}]
});


// {
//     "id": 1,
//     "userId": 2,
//     "text": "Question 1 Sample",
//     "imageURL": "google.com",
//     "answers":[{
//         "username":"IwillSaveYou",
//         "id":2,
//         "text":"Dude ofcourse the answer is just this",
//         "imageURL":"google.com",
//         "follow_ups": [
//             {
//                 "username": "followUpDude",
//                 "text":"no way man"
//             },
//             { 
//                 "username": "followUpYourfollowUP",
//                 "text":"YES WAY!"
//             }
//         ]
//     }]
// }


// exports this model and make sit available to server.js
// note that when making a model of Question, mongodb makes collection questions
// automatically plural
module.exports = mongoose.model('Question', QuestionSchema)
