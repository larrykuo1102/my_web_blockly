var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/new_blockly';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true} );
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection

//Bind connection to error event (to get notification of connection errors)
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.connection.once( 'open', function() {
}) ;

module.exports = mongoose ;