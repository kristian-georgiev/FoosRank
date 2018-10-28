// dependencies
const express = require('express');
// const connect = require('connect-ensure-login') // currently creates error since google oauth not set up yet

//models 
const Player = require('../models/player');

const router = express.Router();

//note: rn creates a new copy each time this is run
const testPlayer = new Player({
	'name': 'test',
	'googleid': 123545,
});
testPlayer.save();

module.exports = router;