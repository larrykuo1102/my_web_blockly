var express = require('express');
var app = express();
var path = require( 'path' ) ;
var router = express.Router() ;
var engine = require( 'ejs' ) ;



// 登入驗證 加密 cookie
var passport = require('passport'); 
var LocalStrategy = require('passport-local').Strategy
var session = require('express-session');
var bcrypt = require('bcryptjs');
var flash = require( 'connect-flash');
//

var fs = require( 'fs' ) ;
var db = require( './db/db.js') ; // 程式碼的資料型態
var useraccount = require( './db/user.js' ) ; // user的資料scheme

const linketdata = require( './db/websocket/ws').data ;


// javascript 多工處理 能夠背景執行
const {Worker, isMainThread, parentPort, workerData} = require('worker_threads');
const WorkerPool = require('./workerpool');
const { use } = require('passport');
//////////////



app.use(express.static(path.join( __dirname + '/../../' ) ) ); // 加入blockl最上層路徑
app.use(express.static('public'));
app.set('public', path.join(__dirname, 'public'));
app.use(express.static('view'));
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs'); // 使用ejs這個模板

// passport express
app.use(session({ 
  secret: 'MyKey',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  useraccount.findById(id, function (err, user) {
    done(err, user);
  });
});

// 登入機制
passport.use('login', new LocalStrategy({
    passReqToCallback: true
  },
  function (req, username, password, done) {
    useraccount.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err)
      }

      if (!user) {
        return done(null, false, console.log('User not found !!!!'))
      }

      
      var isValidPassword = function (user, password) {
        return bcrypt.compareSync(password, user.password)
      }

      if (!isValidPassword(user, password)) {
       
        return done(null, false, console.log('password fault !!!!'))
      }

      console.log( "登入成功" ) ;
      // console.log( req.session.passport + "test" ) ;
      return done(null, user)
    })
  }
));
////////
// 註冊機制
passport.use('signup', new LocalStrategy({
  passReqToCallback: true
}, function (req, username, password, done) {
  var findOrCreateUser = function () {
    useraccount.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }

      if (user) {
        return done(null, false, req.flash('info', 'User already exists'));
      } else {
        var newUser = new useraccount();
        newUser.username = username;
        newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
        newUser.email = req.params.email;

        newUser.save(function (err, user) {
          if (err) {
            throw err;
          }
          else
            console.log( "註冊成功") ;

          return done(null, user);
        });
      }
    });
  };

  
  process.nextTick(findOrCreateUser)
}));
//////
// get輸入的資料 並用passport驗證 登入
app.get('/user/login', function (req, res, next) {
  passport.authenticate('login', function (err, user, info) {
    if (err) {
      console.log( 'login have error' ) ;
    }

    if (!user) {
      return res.redirect('/')
      // handle youself
    }

    req.login(user, function (err) {
      if (err) {
        return next(err)
      }
      console.log( 'Sign in successfully' ) ;
      // req.flash('info', 'Sign in successfully')
      return res.redirect('/home')
    })

  })(req, res, next)
})
/////////////

//get輸入的資料 並用passport驗證 註冊
app.get('/user/register', passport.authenticate('signup', {
  successRedirect: '/',
  failureRedirect: '/register',
  failureFlash: true
}));


///////////////
function authenticated (req, res, next) { // 如果沒有登入 就跳回登入頁面
  if (req.isAuthenticated()) {
    return next() ;
  }
  return res.redirect('/')
} 

app.get("/home", authenticated, function(req, res, next) { // index.html 主要blockly頁面
  res.sendFile(__dirname + '/index.html', function(err) {
      if (err) res.sendStatus(404);
  });
});

app.get("/", function(req, res) { // 登入頁面
  res.sendFile(__dirname + '/public/login.html', function(err) {
      if (err) res.sendStatus(404);
  }) ;
});

app.get("/register", function(req, res) { // 註冊頁面
  res.sendFile(__dirname + '/public/register.html', function(err) {
      if (err) res.sendStatus(404);
  }) ;
});
 
app.get( '/usercode', function(req,res) { // 各個user的所有程式碼
  db.find( { username : req.user.username }, function( err, context ) {
    if ( err )
        return console.log(err) ;  
    allcode = context ;
    res.render('usercode', {
      title: req.user.username,
      sayhi: context
    })
  }) ;
  
}) ; 


app.listen(3030, function() {
  console.log('Example app listening on port 3000!');
} ) ;


app.get( '/linket7697', function(req,res) { // 各個user的所有程式碼
  linketdata.findOne( {Name : "Temperature" }, function( err, temperature ) {
    linketdata.findOne( {Name : "Humidity" }, function( err, humidity ) {
      linketdata.findOne( {Name : "Light" }, function( err, light ) {
        linketdata.findOne( {Name : "Dryness" }, function( err, dryness ) {
  
          res.render('linket7697', {
            temperature : temperature ,
            humidity :humidity,
            light : light ,
            dryness : dryness 
           })
        } ).sort({_id:-1})
      } ).sort({_id:-1})
    } ).sort({_id:-1})
  } ).sort({_id:-1})

  
}) ; 

if (isMainThread) {
  console.log('在主執行緒中');

  app.post('/' ,function(req, res) {
    req.on('data',function(data){ // data裡面有傳過來的資料
      obj=JSON.parse(data);
      console.log( "code " + obj.script + " code" ) ;

      console.log( "object.id : " + req.user._id ) ;
 
      function storedata() { // 儲存前端送過來的指令 到資料庫裡面
        return new Promise( ( resolve, reject ) => {
          var newdata = new db( { username : req.user.username, script : obj.script, userID : req.user._id } ) ;
          newdata.save( function( err, adminusers ) {
            if ( err )
                return console.log(err) ;
            console.log( "code save sucess!!" ) ;
            resolve( 'save success' ) ; // 一定要打resolve
          }) ;
        })
      }

      function performdata() { // 多執行續 執行這個user裡面有的指令
         return new Promise( (resolve, reject ) => {
          db.find( { username : req.user.username }, function( err, context ) { // 到資料庫裡面抓取 這個使用者的資料庫
            if ( err )
                return console.log(err) ;  
            allcode = context ;
            var test = db.find( { username : req.user.username } ).countDocuments(function(err, count){
                    console.log("Number of docs: ", count );
                    try {
                      const pool = new WorkerPool( count, allcode ) ;
                    }
                    catch(err) {
                      
                    }
             } ); 
          }) ;
          resolve( 'perform success' ) ; // 一定要打resolve
        })
      }

      async function store_perform() { // 非同步執行
        await storedata() ;
        await performdata() ;
      }
       
      store_perform() ;
      res.send('数据已接收')
    }) ;
  });
} 
else {
  console.log('在工作執行緒中');
  console.log(isMainThread);  // 列印 'false'。
}


app.use(express.static(path.join( __dirname  ) ) );