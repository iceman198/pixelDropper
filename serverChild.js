/**
	author: Sean Dutton @seantdutton
**/

var express = require('express');
var app = express();
var logger = require('./logger');

var picFile = 'unicorn.json';
var dropperFile = 'dropper.json';

var port = 8080;

var pictime = 500;

// this lets me take an argument that is passed when the script is started
//     example: $node serverChild.js 8081 << 8081 will be the port used in this case
process.argv.forEach(function (val, index, array) {
  //console.log(index + ': ' + val);
  //port = val;
});

app.get('/picpixel', function(req, res) {
	res.send('SUCCESS');
	
	var fs = require('fs');
	var obj = JSON.parse(fs.readFileSync(picFile, 'utf8'));
	for (i = 0; i < obj.length; i++) { 
		var pixel = obj[i].ledNum;
		var color = obj[i].r + ':' + obj[i].g + ':' + obj[i].b;
		passThroughPixel(pixel, color, (i*pictime));
	}
});

app.get('/picdropper', function(req, res) {
	res.send('SUCCESS');
	
	var fs = require('fs');
	var obj = JSON.parse(fs.readFileSync(dropperFile, 'utf8'));
	for (i = 0; i < obj.length; i++) { 
		var strip = obj[i].stripNum;
		var color = obj[i].r + ':' + obj[i].g + ':' + obj[i].b;
		passThroughDropper(strip, color, (i*pictime));
	}
});

function passThroughDropper(strip, color, time) {
	setTimeout(function() {
		var pulse = require('./pulse');
		pulse.sendPulse(strip, color);
		logger.log('debug', 'serverChild.js', 'passThroughDropper() ~ dropping color ' + color + ' on strip ' + strip);
	}, time);
}

function passThroughPixel(pixel, color, time) {
	setTimeout(function() {
		var pulse = require('./pulse');
		pulse.setPixel(pixel, color);
		logger.log('debug', 'serverChild.js', 'passThroughPixel() ~ setting pixel ' + pixel + ' to color ' + color);
	}, time);
}

app.get('/pixel/:pixelNum/:color', function(req, res) {
	var pulse = require('./pulse');
	var pixel = req.params.pixelNum;
	var color = req.params.color;

	logger.log('debug', 'serverChild.js', 'I see an pixel # of: ' + pixel + ' and color: ' + color);
	var statusStr = {
			status: "SUCCESS",
			pixel: pixel, 
			color: color
		};
	res.send(JSON.stringify(statusStr));
	pulse.setPixel(pixel, color);
});

app.get('/dropper/:strip/:color', function(req, res) {
	var pulse = require('./pulse');
	
	var strip = req.params.strip;
	var color = req.params.color;
	
	logger.log('debug', 'serverChild.js', 'I see an strip # of: ' + strip + ' and color: ' + color);
	var statusStr = {
			status: "SUCCESS",
			strip: strip, 
			color: color
		};
	res.send(JSON.stringify(statusStr));
	
	pulse.sendPulse(strip, color);
});

app.get('/service/:cmd', function(req, res) {
	var cmd = req.params.cmd;
	if (cmd == 'resetcounts') {
		var pulse = require('./pulse');
		pulse.resetcounts();
		res.end('SUCCESS');
		logger.log('info', 'serverChild.js', 'counts reset');
	} else if (cmd.indexOf('updatecounts') != -1) {
		var pulse = require('./pulse');
		var temp = cmd.replace('updatecounts,', '');
		var arr = temp.split(',');
		
		if (arr.length == 3) {
			pulse.updatecounts(arr[0], arr[1], arr[2]);
			res.end('SUCCESS');
			logger.log('info', 'serverChild.js', 'counts updated: ' + arr);
		} else {
			res.end('ERROR: array length of ' + arr.length + ' is incorrect (' + arr + ') ' + '(' + cmd + ') ' + '(' + temp + ')');
		}
	} else if (cmd == 'reset') {
		var pulse = require('./pulse');
		pulse.cleanSlate();
		pulse.cleanSlate();
		pulse.clearArrays();
		res.end('SUCCESS');
	} else if (cmd == 'reboot') {
		console.log('reboot issued');
		var exec  = require("child_process").exec ;
		exec ('reboot', function(error, stdout, stderr) {
			// nothing for now
		});
	} else if (cmd == 'shutdown') {
		console.log('shutdown issued');
		var exec  = require("child_process").exec ;
		exec ('shutdown now', function(error, stdout, stderr) {
			
		});
	} else {
		res.end('Command ' + cmd + ' not recognized');
	}
});

var server = app.listen(port, function() {
	var pulse2 = require('./pulse');
	logger.log('info', 'serverChild.js', 'listening on http://localhost:' + port);
	
	pulse2.cleanSlate();
	pulse2.cleanSlate(); // have to do it a second time for some reason so it doesn't sparkle..
	pulse2.startup();
});

function sleep(milliseconds) {
	var tempTime = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - tempTime) > milliseconds){
			break;
		}
	}
}

