var WebSocketClient = require('websocket').client;

var deviceId = process.env.deviceId || 'BJFk6E0su';
var deviceKey = process.env.deviceKey || '1ebd71c9085fab99cd8738011bc6f03cf90bbb1dc43baecbd44e3ec6b4f79d4b';
var server = '15.164.164.148'
var client = new WebSocketClient();
client.on('connectFailed', function(error) {
  console.log('Connect Error: ' + error.toString());
});


var db = require( '../connect' ) ; // 取得資料庫
var Schema = db.Schema ;

var linket = new Schema( { // 資料庫資料內容
  Name : String,
  value : String,
  userID :{type: Schema.Types.ObjectId, ref: 'useraccount' }
})

var data = db.model( 'Linket_Data', linket ) ;


client.on('connect', function(connection) {
  console.log('WebSocket client connected');
  connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function() {
      console.log('echo-protocol Connection Closed');
  });
  connection.on('message', function(message) {
    obj=JSON.stringify(message);
    test = JSON.parse( obj ) ;
    value = JSON.parse( test.utf8Data ) ;
    var newdata = new data( { Name: value.datachannelId, value : value.values.value } ) ;
    newdata.save() ;
  });
});

client.connect('ws://' + server + ':8000/deviceId/' + deviceId + '/deviceKey/' + deviceKey + '/viewer' );


module.exports = {
  data ,
  client
}