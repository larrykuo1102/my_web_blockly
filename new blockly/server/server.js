var express = require('express');
var app = express();
var path = require( 'path' ) ;
var router = express.Router() ;
var engine = require( 'ejs' ) ;

var db = require( '../demos/code/db/db') ;
var useraccount = require( '../demos/code/db/user' ) ;

app.use(express.static('view'));
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');


app.get( '/', function(req,res) { // 各個user的所有程式碼

    db.find( { }, function( err, context ) {
      if ( err )
          return console.log(err) ;  
      allcode = context ;

      useraccount.find( {}, function(err,user) {
        res.render('serverpage', {
            title: user ,
            sayhi: context
          })
      })
      
      
    }) ;
    
  }) ; 
  

  app.listen(5000, function() {
    console.log('Example app listening on port 3000!');
  } ) ;

  