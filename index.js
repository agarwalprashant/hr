// "use strict";

var config = require('./config.js');
var express = require('express');
var flock = require('flockos');
var store = require('./store.js');
var chrono = require('chrono-node');
var Mustache = require('mustache');
var fs = require('fs');
var util = require('util');
var path = require('path');
const bodyParser = require('body-parser');
var jwt = require('jwt-decode');

// var userID;
var arr = [];

flock.appId = config.appId;
flock.appSecret = config.appSecret;

var app = express();

app.use(flock.events.tokenVerifier);
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/events',flock.events.listener);

app.listen(8080,function(){
	console.log("Listening on 8080");
});

var userID;

flock.events.on('app.install',function(event,callback){

// store.saveToken(event.userId,event.token);
callback();
userID = event.userId;
// console.log(userID);
flock.chat.sendMessage(config.botToken, {
        	to: event.userId,
        	attachments:[{"title":"relevant questions and answers","color": "red","description":"Here are the relevant questions","views":{"widget":{"src":"http:%2F%2Fwww.polls.com%2Fyour-poll-url","width": 200,"height": 200}}}]

    });
});





flock.events.on('client.slashCommand', function (event, callback) {
	var relevantQuestions = [];
    var queryWords = event.text.split(" ");
   
    for (var obj of arr) {
    	for (var keyword of obj.keywords) {
    		for (var word of queryWords) {
    			if (word === keyword && relevantQuestions.indexOf(obj) === -1) {
    				// console.log('on line 57');
    				relevantQuestions.push(obj);
    			}
    		}
    	}
    }
    // console.log('on line 64');
    // for (var obj of relevantQuestions) {
    // 	console.log(obj.answer);
    // }
    console.log(relevantQuestions);
    if(relevantQuestions.length != 0 ){

    	callback(null,{text:'your query is being processed'});
    	for(var obj of relevantQuestions){
    		flock.chat.sendMessage(config.botToken, {
        	to: event.userId,
        	attachments:[{"title":"relevant questions and answers",
    "color": "red","description":"Here are the relevant questions","views":{"widget":{"src":"http:%2F%2Fwww.polls.com%2Fyour-poll-url","width": 200,"height": 200}}}]
        
    });
    	}
    	
}
    else {
    	callback(null,{text:'type another queery' });
    }

    // callback(null, { text: 'Alarm added' });
    // console.log('parse result', r);
    // if (r) {
    //     var alarm = {
    //         userId: event.userId,
    //         time: r.date.getTime(),
    //         text: event.text.slice(r.end).trim()
    //     };
    //     console.log('adding alarm', alarm);
    //     addAlarm(alarm);
    //     callback(null, { text: 'Alarm added' });
    // } else {
    //     callback(null, { text: 'Alarm time not specified' });
    // }
});

var parseDate = function (text) {
    var r = chrono.parse(text);
    if (r && r.length > 0) {
        return {
            date: r[0].start.date(),
            start: r[0].index,
            end: r[0].index + r[0].text.length
        };
    } else {
        return null;
    }
};

var addAlarm = function (alarm) {
    store.addAlarm(alarm);
    scheduleAlarm(alarm);
};

var scheduleAlarm = function (alarm) {
    var delay = Math.max(0, alarm.time - new Date().getTime());
    setTimeout(function () {
        sendAlarm(alarm);
        store.removeAlarm(alarm);
    }, delay);
};

// schedule all alarms saved in db
store.allAlarms().forEach(scheduleAlarm);

var sendAlarm = function (alarm) {
    flock.chat.sendMessage(config.botToken, {
        to: alarm.userId,
        text: alarm.text,
        attachments:[{"title":"attachment title","downloads": [
        { "src": "http://iwg-gti.org/common_up/iwg-new/document_1481208108.pdf", "filename": "<Form 10>"}
    ],"description":"attachment description","color": "red","views":{"widget":{"src":"http://www.google.com","width": 400,"height": 400}}}]
    });
};

var listTemplate = fs.readFileSync('list.mustache.html', 'utf8');
app.get('/list', function (req, res) {
    var event = JSON.parse(req.query.flockEvent);
    // userID = req.query.flockEventToken;
    console.log(req.query.flockEventToken); 
    userID = jwt(req.query.flockEventToken).userId;

    // var alarms = store.userAlarms(event.userId).map(function (alarm) {
    //     return {
    //         text: alarm.text,
    //         timeString: new Date(alarm.time).toLocaleString()
    //     }
    // });
    res.set('Content-Type', 'text/html');
    // var body = "<h1>This is list of frequently asked questions</h1><h2>question 1: where can we fill form 10";
    // var body = Mustache.render(listTemplate, { alarms: alarms });

// res.send('');

res.sendFile(path.join(__dirname + '/general.html'));

});


 

app.get('/hr',function(req,res){
	res.sendFile(path.join(__dirname + '/hr.html'));
});

app.get('/others',function(req,res){
	res.sendFile(path.join(__dirname + '/others.html'));
});


app.get('/onNewHireGettingStarted', function(req, res){
	//show user something
	//send message to user
    console.log(req.query);
console.log(userID);
    flock.chat.sendMessage(config.botToken, {

            to: userID,
            text:"hi there"
    });
    res.send('hi');
});

app.get('/newHire',function(req,res){

	res.sendFile(path.join(__dirname + '/newHire.html'));
});

app.get('/oldEmp',function(req,res){
res.sendFile(path.join(__dirname + '/oldEmp.html'));

});

app.get('/addFAQ',function(req,res){
res.sendFile(path.join(__dirname + '/addFAQ.html'));

});

app.get('/browseFAQ',function(req,res){
res.sendFile(path.join(__dirname + '/browseFAQ.html'));

});


app.post('/formData',function(req,res){
console.log("Prashant agarwal");

var formData = {
	question:req.body.firstname,
	answer:req.body.lastname,
	keywords: req.body.keyword.split(",")

};

arr.push(formData);

//console.log(arr);

});

app.post('/hrInformation',function(req,res){
console.log("HR Information");



});

