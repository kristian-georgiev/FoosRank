const mongoose = require('mongoose');

// set up mongoDB connection
// Example URI ---> mongodb://aaron:badpassword123@ds237707.mlab.com:37707/catbookdb';
const mongoURL = "mongodb://admin:qwerty123@ds227199.mlab.com:27199/foosrank"; // config variable (in .env)
const options = {
	useNewUrlParser: true
};
mongoose.connect(mongoURL, options);
mongoose.Promise = global.Promise;
const db = mongoose.connection;

// db error handling
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;