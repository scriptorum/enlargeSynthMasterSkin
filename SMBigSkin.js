#!/usr/bin/env node
//
// SMBigSkin 
// Copyright (C) 2017 Eric W. Lund
//
// See github page for instructions and license.
// https://github.com/scriptorum/SMBigSkin
//

////// CONFIGURATION //////
// const sourceName = "Default Skin Orange"; // Name of folder containing skin you want to enlarge, new folder will be created with the magnification in the name
const sourceName = "sT-Tranquil Blue"; // Name of folder containing skin you want to enlarge, new folder will be created with the magnification in the name
const magnification = 1.5; // 1 = 100%, 1.5 = 150%, 2.0 = 200%
const fontAdjust = -0.10 ; // This value is added to the magnification before being applied to text labels; raise or lower to adjust relative text enlargement
const skinsFolder = "/Library/Application Support/KV331 Audio/SynthMaster/Resources/Skins"; // Location of SM skins folder
////// CONFIGURATION //////

const debug = false; // Prints out some useless information while processing
const keyScaleGraphHeight = 128; // Amount of unscalableheight in a key scaler view

const fs = require("fs-extra");
const run = require("child_process").execSync;
const gm = require("gm");
const uuid = require("uuid");

const targetName = sourceName + " " + magnification * 100 + "%"; 
const sourceFolder = skinsFolder + "/" + sourceName;
const targetFolder = skinsFolder + "/" + targetName;
const interfaceName = "interface.xml";
const sourceXml = sourceFolder + "/" + interfaceName;
const targetXml = targetFolder + "/" + interfaceName;

console.log("Ensuring source xml exists");
if(!fs.existsSync(sourceXml))
	throw Error("Cannot locate " + sourceFolder);

console.log("Ensuring target folder exists");
fs.ensureDirSync(targetFolder);

// I'm not using an XML parser because some of the skins have malformed XML which croaks major froggage
console.log("Processing XML");
var xml = fs.readFileSync(sourceXml, "UTF8");

var topRegEx = new RegExp(/(top\s*=\s*")([^"]+)(?=")/gmi);
var bottomRegEx = new RegExp(/(bottom\s*=\s*")([^"]+)(?=")/gmi);
var leftRegEx = new RegExp(/(left\s*=\s*")([^"]+)(?=")/gmi);
var rightRegEx = new RegExp(/(right\s*=\s*")([^"]+)(?=")/gmi);
var fontSizeRegEx = new RegExp(/(fontSize\s*=\s*")([^"]+)(?=")/gmi);
var keysRegEx = new RegExp(/((?:whiteKeysHeight|whiteKeysWidth|blackKeysHeight|blackKeysWidth)\s*=\s*")([^"]+)(?=")/gmi);
var miscRegEx = new RegExp(/((?:radius|arrowWidth|buttonWidth|waveformSize|rowHeight|AxisWidth|Spacing)\s*=\s*")([^"]+)(?=")/gmi);

// Process each XML statement from < to >
// This is not fast code. It doesn't have to be. So chill.
xml = xml.replace(/<(\S+)\s+([^>]+)\s*>/gm, function(all, tag, attributes)
{
	// If InterfaceDefinition, set targetName and uuid and stop
	if(tag == "InterfaceDefinition")
	{
		attributes = attributes.replace(/name\s*=\s*"[^"]+"/mi, 'name="' + targetName + '"');
		attributes = attributes.replace(/id\s*=\s*"[^"]+"/mi, 'id="' + uuid.v4() + '"');
	}

	else
	{
		if(debug)
			console.log("FOUND tag:" + tag + " attr:" + attributes);

		// Magnify font size
		attributes = attributes.replace(fontSizeRegEx, function(all, left, value)
		{
			return left + Math.floor(value * (magnification + fontAdjust));

		});
		// Magnify key scaler items
		attributes = attributes.replace(keysRegEx, function(all, left, value)
		{
			return left + (value * magnification);
		});

		// Magnify top and bottom
		attributes = replacePairedAttr(attributes, topRegEx, bottomRegEx, tag == "CKeyScalerView" ? keyScaleGraphHeight : 0)

		// Magnify left and right
		attributes = replacePairedAttr(attributes, leftRegEx, rightRegEx, 0);

		// Magnify a bunch of other miscellanious fields
		attributes = attributes.replace(miscRegEx, function(all, left, value)
		{
			return left + Math.round(value * magnification);
		});
	}

	if(debug)
		console.log("NEW ATTR:" + attributes);

	return "<" + tag + " " + attributes + ">";
});

// Save XML
fs.writeFileSync(targetXml, xml, {encoding:"UTF8"});

// Enlarge IMAGES
// Find all image tags in XML
// Use them to identify all images and determine if they are a spritesheet
console.log("Resizing images");
var waitingFor = 0;
xml = xml.replace(/<Image\s+[^>]+>/gmi, function (tag)
{
	var imageName = tag.match(/name\s*=\s*"([^"]+)"/)[1];
	var count = tag.match(/numberOfImages\s*=\s*"([^"]+)"/i)[1];

	if(imageName == null)
		return;

	// Load image
	var imagePath = (sourceFolder + "/" + imageName);//.replace(/ /g, "\\ ");
	var image = gm(imagePath);

	waitingFor++;
	image.size({bufferStream: true}, function(err, value)
	{
		if(err)
		{
			logError(err);
			complete();
			return;
		}

		// Normal file: enlarge image by flat percent increase
		if(count == null || count == 1)
		{
			var width =  Math.ceil(value.width * magnification);
			var height = Math.ceil(value.height * magnification);
			if(debug)
				console.log(" - Enlarging image " + imageName + " to " + width + "x" + height);
			image.resize(width, height, "!");
		}

		// Multi-image file: enlarge image by determining new integer height per cell and multiplying by number of cells
		else
		{
			var oldCellHeight = value.height / count;
			var newCellHeight = Math.ceil( oldCellHeight * magnification);
			var height = Math.ceil(newCellHeight * count);
			var width = Math.ceil(value.width * magnification);

			if(debug)
				console.log(" - Enlarging spritesheet " + imageName + " with " + count + " images to " + width + "x" + height +
					 " (cel height grows from " + oldCellHeight + " to " + newCellHeight + ")");

			image.resize(width, height, "!");
		}

		image.write(targetFolder + "/" + imageName, function(err) { if(err) logError(err); complete(); });
	});	
});

// If hate this, but I hate even more organizing everything into an array and using a third party library to manage callback hell
if(waitingFor > 0)
	console.log("Waiting for processes to finish");

function complete()
{
	if(--waitingFor <= 0)
		console.log("COMPLETE!\nNew skin created:" + targetFolder);
	else if(!debug) 
		process.stdout.write(".");
}

function logError(msg)
{
	console.log("###################### ERROR ######################");
	console.log(msg);
}

// This replaces pairs of top/bottom or left/right attributes in a string.
// The second attribute (bottom/right) is calculated independently, so it's guaranteed to match the image/sprite dimensions.
// Expect regex to have two captures: all (everything to the left of the value) and value (the value between quotes).
// The end quote should be matched but not replaced by using a negative lookahead assertion.
// If an unscaledAmount is supplied (!=0), this amount is excepted from the magnification. Notably, 
// KeyScalers are fixed with a 128 pixel high graph that doesn't seem to be scalable from the XML, so
// this prevents the viewport from clipping or showing a black box.
// 
function replacePairedAttr(attributes, firstRegEx, secondRegEx, unscaledAmount)
{
	// If contains first, magnify and round value, then adjust bottom by the rounded old difference
	if(attributes.match(firstRegEx))
	{
		var oldFirst = 0;
		var newFirst = 0;
		attributes = attributes.replace(firstRegEx, function(all, left, value)
		{
			oldFirst = parseInt(value);
			newFirst = Math.floor(oldFirst * magnification);
			return left + newFirst;
		});
		attributes = attributes.replace(secondRegEx, function(all, left, oldSecond)
		{				
			var oldSize = oldSecond - oldFirst;
			if(unscaledAmount == 0)
				return left + (Math.ceil(oldSize * magnification + newFirst));

			var scaledAmount = oldSize - unscaledAmount;
			return left + (Math.ceil(unscaledAmount + scaledAmount * magnification + newFirst));
		});
	}

	// If contains unpaired second, magnify and round value -- don't expect to see this, but just in case
	else attributes = attributes.replace(secondRegEx, function(all, left, alue)
	{
		return left + Math.floor(value * magnification);
	});

	return attributes;
}