var db = require( './connect.js' ) ;
var Schema = db.Schema ;


var SomeScript = new Schema( {
    username : String,
    script : String,
    userID :{type: Schema.Types.ObjectId, ref: 'useraccount' }
})

var usercollection = db.model( 'usercollection', SomeScript ) ;

module.exports = usercollection ;