var async = require("async");

var tinycolor = require('./tinycolor');
var logger = require('./logger.js');

var OPC = new require('./opc')
var client = new OPC('localhost', 7890);
//var client = new OPC('10.9.17.63', 7890);

var filledPixArr = [];

var stripStart = 0; // you could tweak this if you only have a specific FC chip hooked up
var strips = 31; // ~~ same as above ~~

var ledStart = 0;
var leds = 32;

var speedLow = 20;
var speedMax = 5;

var colorPulse = tinycolor({r: 117, g: 245, b:117});

exports.setPixel = function(pixelNum, color) {
	colorPulse = getColor(color);
	var red = colorPulse.toRgb().r;
	var green = colorPulse.toRgb().g;
	var blue = colorPulse.toRgb().b;
	
	client.setPixel(pixelNum, red, green, blue);
}

exports.clearArrays = function() {
	filledPixArr = [];
}

exports.sendPulse = function (stripNum, color) {	
	colorPulse = getColor(color);

	logger.log('debug', 'pulse.js', 'sendPulse() ~ stripNum: ' + stripNum + ' // color: ' + color);

	var speed = speedMax;
	
	var red = 0;
	var green = 0;
	var blue = 0;
	var curLed = ledStart;
	var led = ledStart;
	async.whilst(
		function () { return led < leds; }, // function will run while this is true
		function (callback) {
			// working here
			for (strip = stripStart; strip <= strips; strip++) {
				curLed = led+(strip*leds);
				//logger.log('debug', 'pulse.js', 'On strip: ' + strip + ' led:' + led + ' actualLED: ' + curLed + ' stripNum: ' + stripNum);
				
				if (strip == stripNum) {
					if (filledPixArr.indexOf(curLed) > -1) {
						filledPixArr.push(curLed-1);
						break;	
					}
					if (led == leds -1) {
						filledPixArr.push(curLed);
					}

					red = colorPulse.toRgb().r;
					green = colorPulse.toRgb().g;
					blue = colorPulse.toRgb().b;
					logger.log('debug', 'pulse.js', 'setting color on strip: ' + strip + ' led:' + led + ' actualLED: ' + curLed + ' stripNum: ' + stripNum + ' to color ' + red + ',' + green + ',' + blue);
					if (led > 0) {
						client.setPixel(curLed, red, green, blue);
						client.setPixel(curLed - 1, 0, 0, 0);
						//logger.log('debug', 'pulse.js', 'Just set led ' + curLed + ' on and led ' + (curLed - 1) + ' off');
					} else {
						client.setPixel(curLed, red, green, blue);
						//logger.log('debug', 'pulse.js', 'Just set led ' + curLed + ' on');
					}
				}
				red = 0;
				green = 0;
				blue = 0;
			}
			led++;
			setTimeout(function () {
				callback(null, null);
			}, speed);
			//logger.log('debug', 'pulse.js', 'Finally - strip: ' + strip + ' led:' + led + ' actualLED: ' + curLed + ' stripNum: ' + stripNum);
		},
		function (err, n) {
		}
	);
}

exports.startup = function () {
	async.whilst(
		function () { return true; }, // function will run while this is true
		function (callback) {
			client.writePixels();
			//logger.log('debug', 'pulse.js', 'Wrote pixels');
			setTimeout(function () {
				callback(null, null);
			}, 10);
		},
		function (err, n) {
			// 5 seconds have passed, n = 5
			//logger.log('info', 'pulse.js', count);
		}
	);
}

exports.cleanSlate = function() {
	for (led = ledStart; led < (strips+1)*leds; led++) {
		//console.log('Cleaning led: ' + led);
		client.setPixel(led, 0, 0, 0);
	}
	//console.log('Cleaning led: ' + led);
	client.setPixel(led, 0, 0, 0);
	client.writePixels();
}

exports.updatecounts = function(countDog, countCat, countOther) {
	rowCountDog = parseInt(countDog) / divisibleBy;
	rowCountCat = parseInt(countCat) / divisibleBy;
	rowCountOther = parseInt(countOther) / divisibleBy;
}

exports.getLeds = function() {
	return leds;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getColor(color) {
	if (color.indexOf(':') > -1) {
		var colorArr = color.split(':');
		return tinycolor({r: colorArr[0], g: colorArr[1], b: colorArr[2]});
	} else {
		return tinycolor('#' + color);
	}
}

function sleep(milliseconds) {
	var tempTime = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - tempTime) > milliseconds){
			break;
		}
	}
}
