var db = require( './connect.js' ) ;
var script = require( './db' ) ;

var Schema = db.Schema ;

var SomeScript = new Schema( {
    email: String,
    username : String,
    password : String 
}) ;

var userinform = db.model( 'useraccount', SomeScript ) ;
module.exports = userinform ;