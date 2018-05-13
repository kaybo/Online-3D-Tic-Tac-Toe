var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://root:root@ds227199.mlab.com:27199/assignment4';
var flash = require('express-flash');
var session = require('express-session');
var http = require('http');
var socket = require('socket.io');
var db;
var tempuser = [];
//used for parsing body
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//using static files
app.use(express.static('public'));

//setting up mongodb(testing)
MongoClient.connect(url, function(err, client) {
  if (err){
    throw err;
  }else{
    console.log("Connected successfully to server MONGO DB!");
    console.log('checking Collections');
//also checking if collection is empty or not
//if empty, create the collections
    db = client.db('assignment4');//must use this in order for it to work
    db.createCollection('users', function(err,client){
      if(err){
        console.log(err);
      }else{
        console.log('creating users collection');
      }
    });

  }
  //client.close();
});

//using flash

app.use(flash());

//using sessions

app.use(session({
  name:"session",
  secret: "mysecretstuff",
  maxAge: 1000 * 60 * 60 * 12
}));

//navbar requests:

//navbar home request. Sends user back to homepage
app.get('/home',function(req,res){
  console.log('sending index.html(homepage)');
  res.sendFile(__dirname + '/public' + '/index.html');
});

//navbar login request, sends user to login Page
app.get('/login',function(req,res){
  console.log('sending login(homepage)');
  var feedback = req.flash('feedback');
  var login_head = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Login</title>
      <style>
      #titlebar{
        background-color: #009688;
        padding: 1em;
      }
      #title{
        color: white;
        font-family: Arial;
        text-align: left;
      }
      ul{
        list-style-type: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #333;
      }

      li{
        float: left;
      }

      li a{
        font-family: Arial;
        display: block;
        color: white;
        text-align: center;
        padding: 14px 16px;
        text-decoration: none;
      }

      li a:hover{
        background-color: #4DB6AC;
      }

      </style>
    </head>
    <body>
      <div id = 'titlebar'>
        <h1 id = 'title'>3D Tic Tac Toe</h1>
      </div>
      <div id = 'titlenavbar'>
        <ul>
          <li><a href = '/home'>Home</a></li>
          <li><a href = '/login'>Login</a></li>
          <li><a href = '/register'>Register</a></li>
          <li><a href = '/leaderboard'>Creativity</a></li>
        </ul>
      </div>
      <p>Please login using your username and password</p>
  `;
  var login_bottom = `
      <form method = 'POST' action = '/login'>
        <label>Username</label><br><input type = 'text' name = 'username' required>
        <br><label>Password</label><br><input type = 'password' name = 'password' required>
        <br><input type = 'submit' value = 'login'>
      </form>
    </body>
    </html>
  `;
  var login = login_head + `<p id = 'feedback'>`+feedback+`</p>` +login_bottom;

  res.send(login);
});

//navbar register request, sends user to embedded register page
app.get('/register',function(req,res){
  console.log('sending variable register(registerpage)');
  var feedback = req.flash('feedback');
  var register_head = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Register</title>
      <style>
      #titlebar{
        background-color: #009688;
        padding: 1em;
      }
      #title{
        color: white;
        font-family: Arial;
        text-align: left;
      }
      ul{
        list-style-type: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #333;
      }

      li{
        float: left;
      }

      li a{
        font-family: Arial;
        display: block;
        color: white;
        text-align: center;
        padding: 14px 16px;
        text-decoration: none;
      }

      li a:hover{
        background-color: #4DB6AC;
      }

      </style>
    </head>
    <body>
      <div id = 'titlebar'>
        <h1 id = 'title'>3D Tic Tac Toe</h1>
      </div>
      <div id = 'titlenavbar'>
        <ul>
          <li><a href = '/home'>Home</a></li>
          <li><a href = '/login'>Login</a></li>
          <li><a href = '/register'>Register</a></li>
          <li><a href = '/leaderboard'>Creativity</a></li>
        </ul>
      </div><p>Please fill in all the blanks</p>`;
      var register_form = `
      <form method = 'POST' action = '/register'>
        <label>First Name</label><br><input type = 'text' name = 'firstname'  required >
        <br><label>Last Name</label><br><input type ='text' name = 'lastname'  required>
        <br><label>Age</label><br><input type = 'text' name = 'age'  required>
        <br><label>Username</label><br><input type = 'text' name = 'username' required>
        <br><label>Password</label><br><input type ='password' name = 'password' required>
        <br><label>Email</label><br><input type = 'text' name = 'email' required>
        <br><input type = 'submit'value = 'Register'>
      </form>
    </body>
  </html>
  `;
  var register = register_head + `<p id = 'feedback'>`+feedback+`</p> ` + register_form;
  res.send(register);
});

//navbar leaderboard request, sends user to leaderboard Page

app.get('/leaderboard',function(req,res){
  console.log('sending leaderboard.html(leaderboard)');
  res.sendFile(__dirname + '/public' + '/leaderboard.html');
});

//post request:

//register post request to mongodb

app.post('/register',function(req,res){
  var flag = 0;
  var users = db.collection('users');
  var resUser = req.body.username;//checking if database has such username
  users.find({username : resUser}).toArray(function(err,result){
    if(err){
      res.send(err);
    }else{
      console.log(result);
      console.log(result.length);
      if(result.length == 0){
        users.insertOne(req.body,function(req,res){
          if(err){
            res.send(err);
          }else{
            console.log('inserting users to database');
            users.update({username : resUser}, {$set : {win : 0} }, {w:1} ,function(err){
              if(err){console.log(err);}else{
                users.update({username : resUser}, {$set : {loss : 0} }, {w:1},function(err){});
              }
            });
          }
        });
      }else{
        console.log('username already in database, user must use another username to register');
        flag = 1;
      }
      if(flag === 0){
        req.flash('feedback','Registeration successful! You can now login and play.');
      }else if(flag === 1){
        req.flash('feedback','Username has already been taken!');
      }
      res.redirect('/register');
    }
  });
});

//user login using sessions and mongodb

app.post('/login',function(req,res){
  var resUser = req.body.username;
  var resPass = req.body.password;
  var accountObj;
  var flag = 0;//0 indicating default/login successful
  var users = db.collection('users');
  users.find({username : resUser}).toArray(function(err,result){
    if(err){
      res.send(err);
    }else{
      if(result.length == 0){
        console.log('username doesnt not match with database');
        flag = 1;
      }else{
        if(result[0].password == resPass){
          console.log('password matches,login successful');
        }else{
          flag = 2;
          console.log('password does not match');
        }
      }
      if(flag === 0){
        req.session.user = result[0].username;
        console.log(req.session.user);
        res.redirect('/lobby');
      }else if(flag === 1){
        req.flash('feedback','Incorrect username');
        res.redirect('/login');
      }else if (flag === 2){
        req.flash('feedback','Incorrect password');
        res.redirect('/login');
      }
    }
  });
});
var playerCap = 0;//testing
app.post('/log',function(req,res){
  console.log('REQUESSSSSTTBODY '+req.body.wl +'   '+req.body.username);
  users = db.collection('users');
  var wl = req.body.wl;
  var resUser = req.body.username;
  users.find({username : resUser}).toArray(function(err,result){
    if(wl == 'win'){
      users.update({username : resUser},{ $inc: { win: 1 }});
    }else if(wl == 'lose'){
      users.update({username : resUser},{ $inc: { loss: 1 }});
    }
  });
  res.redirect('/lobby');
});
app.post('/playgame',function(req,res){//**********WORK IN PROGRESS***************
  if(playerCap < 2){
    var gamehead = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Register</title>
        <script src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.0/socket.io.dev.js"></script>
        <style>
        #titlebar{
          background-color: #009688;
          padding: 1em;
        }
        #title{
          color: white;
          font-family: Arial;
          text-align: left;
        }
        ul{
          list-style-type: none;
          margin: 0;
          padding: 0;
          overflow: hidden;
          background-color: #333;
        }

        li{
          float: left;
        }

        li a{
          font-family: Arial;
          display: block;
          color: white;
          text-align: center;
          padding: 14px 16px;
          text-decoration: none;
        }

        li a:hover{
          background-color: #4DB6AC;
        }
        .box{
          background-color: #4CAF50;
          padding: 10px 10px;
        }

        </style>
      </head>
      <body>
        <div id = 'titlebar'>
          <h1 id = 'title'>3D Tic Tac Toe</h1>
        </div>
        <div id = 'titlenavbar'>
          <ul>
            <li><a href = '/home'>Home</a></li>
            <li><a href = '/logout'>Logout</a></li>
            <li><a href = '/register'>Register</a></li>
            <li><a href = '/leaderboard'>Creativity</a></li>
          </ul>

    `;
    //layer,rows,cols
    var gamemiddle = `
    <form action = '/log' method = 'POST'>
      <br><input type= 'submit' id = 'quitgame' value = 'Quit Game'><br>
    </form>
    <div id = 'messageboard'></div>
    <div id = 'feedbackboard'></div>
    <p>Layer1</p>
    <table id = 'z1'>
      <tr>
        <td><button class = 'box' id = '000'></button></td>
        <td><button class = 'box' id = '001'></button></td>
        <td><button class = 'box' id = '002'></button></td>
      </tr>
      <tr>
        <td><button class = 'box' id = '010'></button></td>
        <td><button class = 'box' id = '011'></button></td>
        <td><button class = 'box' id = '012'></button></td>
      </tr>
      <tr>
        <td><button class = 'box' id = '020'></button></td>
        <td><button class = 'box' id = '021'></button></td>
        <td><button class = 'box' id = '022'></button></td>
      </tr>
    </table>
    <table id = 'z2'>
    <p>layer2</p>
      <tr>
        <td><button class = 'box' id = '100'></button></td>
        <td><button class = 'box' id = '101'></button></td>
        <td><button class = 'box' id = '102'></button></td>
      </tr>
      <tr>
        <td><button class = 'box' id = '110'></button></td>
        <td><button class = 'box' id = '111'></button></td>
        <td><button class = 'box' id = '112'></button></td>
      </tr>
      <tr>
        <td><button class = 'box' id = '120'></button></td>
        <td><button class = 'box' id = '121'></button></td>
        <td><button class = 'box' id = '122'></button></td>
      </tr>
    </table>
    <p>layer3</p>
    <table id = 'z3'>
      <tr>
        <td><button class = 'box' id = '200'></button></td>
        <td><button class = 'box' id = '201'></button></td>
        <td><button class = 'box' id = '202'></button></td>
      </tr>
      <tr>
        <td><button class = 'box' id = '210'></button></td>
        <td><button class = 'box' id = '211'></button></td>
        <td><button class = 'box' id = '212'></button></td>
      </tr>
      <tr>
        <td><button class = 'box' id = '220'></button></td>
        <td><button class = 'box' id = '221'></button></td>
        <td><button class = 'box' id = '222'></button></td>
      </tr>
    </table>
    `;
    var gamebottom = `
    <script src = "/public/game.js"></script>
      </body>
      </html>
    `;
    var game = gamehead + gamemiddle +gamebottom;
    res.send(game);
  }else{
    //redirect back to lobby Page
    req.flash('feedback','game is currently full, please try again later.');
    res.redirect('/lobby');//make sure to check if lobby has 'feedback'
  }
});

//login function for sessions

function loggedIn(req,res,next){
  if(req.session.user){//seeing if this session exist
    var sID = req.sessionID;
    console.log('session ID: '+ sID);
    next();
  }else{
    req.flash('feedback','You must be logged in to view this page!');
    res.redirect('/login');
  }
}

//game lobby request

app.get('/lobby',loggedIn,function(req,res){
  var feedback = req.flash('feedback');
  var lobby_head = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Register</title>
      <style>
      #titlebar{
        background-color: #009688;
        padding: 1em;
      }
      #title{
        color: white;
        font-family: Arial;
        text-align: left;
      }
      ul{
        list-style-type: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #333;
      }

      li{
        float: left;
      }

      li a{
        font-family: Arial;
        display: block;
        color: white;
        text-align: center;
        padding: 14px 16px;
        text-decoration: none;
      }

      li a:hover{
        background-color: #4DB6AC;
      }

      </style>
    </head>
    <body>
      <div id = 'titlebar'>
        <h1 id = 'title'>3D Tic Tac Toe</h1>
      </div>
      <div id = 'titlenavbar'>
        <ul>
          <li><a href = '/home'>Home</a></li>
          <li><a href = '/logout'>Logout</a></li>
          <li><a href = '/register'>Register</a></li>
          <li><a href = '/leaderboard'>Creativity</a></li>
        </ul>
  `;
  var lobby_bottom = `
  </body>
  </html>
  `;
  //WORK IN PROGRESS TESTING EVERYTHING BELOW THIS LINE FOR THE CALLBACK****************
  users = db.collection('users');
  users.find({username : req.session.user}).toArray(function(err,result){
    if(err){
      console.log(err);
    }else{
      var temp_username = result[0].username;
      console.log(result);
      tempuser = result[0].username;
      //embed html file in here after lobby_top
      //say welcome back result.username
      var lobby_middle = '<p>Welcome back ' + temp_username + '. You have '+result[0].win+' wins and '+result[0].loss+' losses.</p>';
      lobby_middle = lobby_middle + `
      <form method = 'POST' action = '/playgame'>
      <input type = 'submit' value = 'playgame'>
      </form>
      `
      lobby = lobby_head +'<p id = "feedback">' + feedback + '</p>' + lobby_middle + lobby_bottom;
      res.send(lobby);
    }
  });
  //todo: make a new collection on user status(win/lost)etc to send to the lobby
});

//log out requests

app.get('/logout',function(req,res){
  req.session.regenerate(function(err){
    req.flash('feedback','you have successfully logged out');
    res.redirect('/login');
  });
});

//serving files
app.get('/public/game.js',function(req,res){
  res.sendFile(__dirname + '/public' + '/game.js');
});

//running the server setting up socket
var server = http.createServer(app).listen(15232);
var io = socket(server);
console.log('server is now up running');

//socket connections **********WORK IN PROGRESS***************
var gamematrix = [//3D game matrix
  [
    [0,0,0],
    [0,0,0],
    [0,0,0]
  ],
  [
    [0,0,0],
    [0,0,0],
    [0,0,0]
  ],
  [
    [0,0,0],
    [0,0,0],
    [0,0,0]
  ]
];
var playerflag = 0;
//console.log('This is gamematrix: '+ gamematrix[temp0][0][temp2]);//layer level,rows,cols
var random = Math.floor(Math.random() * 2);
console.log('RANDOM NUMBER: '+random);

io.on('connection',function(socket){//distinguishes player 1 and player 2
  var totalturns = 0;
  var datetime;
  console.log('client made socket connection with id: ' + socket.id);
  playerCap++;
  socket.emit('player',{});
  console.log('playerCount: '+ playerCap);
  if(playerCap == 1){
    datetime = new Date();
    io.sockets.emit('gamestatus',{
      game : 0,
      first : random
    });
    if(playerflag == 0){
      socket.emit('localplayer',{
        player : 1,
        first : random
      });
    }else if (playerflag == 1){
      socket.emit('localplayer',{
        player : 2,
        first : random
      });
    }else if(playerflag == 2){
      socket.emit('localplayer',{
        player : 1,
        first : random
      });
    }
  }else if (playerCap == 2){
    datetime = new Date();
    io.sockets.emit('gamestatus',{
      game : 1,
      first : random
    });
    if(playerflag == 0 || playerflag == 2){
      socket.emit('localplayer',{
        player : 2,
        first : random
      });
    }else if(playerflag == 1){
      socket.emit('localplayer',{
        player : 1,
        first : random
      });
    }
  }

  socket.on('placeblock',function(data){//player placing block
    var temp0 = data.input[0];
    var temp1 = data.input[1];
    var temp2 = data.input[2];
    console.log('temp: ' +temp0 + temp1 + temp2);
    if(gamematrix[temp0][temp1][temp2] != 1 && gamematrix[temp0][temp1][temp2] != 2){
      totalturns++;
      if(data.player == 1){
        gamematrix[temp0][temp1][temp2] = 1;
        var sendback = data.input;
        io.sockets.emit('updateblock',{
            update : sendback,
            error : 0, //no error
            player : data.player
        });
      }else if(data.player == 2){
        gamematrix[temp0][temp1][temp2] = 2;
        var sendback = data.input;
        io.sockets.emit('updateblock',{
            update : sendback,
            error : 0, //no error
            player : data.player
        });
      }
      //trace gamematrix
      console.log('TRACING GAMEMATRIX ' + gamematrix);
      ////////////////////////////////////////////////////////////////////////////////////
      //WIN CONDITIONS
      if(gamematrix[0][0][0] == 1 && gamematrix[0][0][1] == 1 && gamematrix[0][0][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0
        });
      }else if(gamematrix[0][0][0] == 2 && gamematrix[0][0][1] == 2 && gamematrix[0][0][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0
        });
      }else if(gamematrix[0][1][0] == 1 && gamematrix[0][1][1] == 1 && gamematrix[0][1][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0, //IMPLEMENT THIS LATER
          date : datetime
        });
      }else if(gamematrix[0][1][0] == 2 && gamematrix[0][1][1] == 2 && gamematrix[0][1][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][2][0] == 1 && gamematrix[0][2][1] == 1 && gamematrix[0][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][2][0] == 2 && gamematrix[0][2][1] == 2 && gamematrix[0][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][0] == 1 && gamematrix[0][1][0] == 1 && gamematrix[0][2][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][0] == 2 && gamematrix[0][1][0] == 2 && gamematrix[0][2][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][1] == 1 && gamematrix[0][1][1] == 1 && gamematrix[0][2][1] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][1] == 2 && gamematrix[0][1][1] == 2 && gamematrix[0][2][1] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][2] == 1 && gamematrix[0][1][2] == 1 && gamematrix[0][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][2] == 2 && gamematrix[0][1][2] == 2 && gamematrix[0][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][0] == 1 && gamematrix[0][1][1] == 1 && gamematrix[0][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][0] == 2 && gamematrix[0][1][1] == 2 && gamematrix[0][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][2] == 1 && gamematrix[0][1][1] == 1 && gamematrix[0][2][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][2] == 2 && gamematrix[0][1][1] == 2 && gamematrix[0][2][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][0][0] == 1 && gamematrix[1][0][1] == 1 && gamematrix[1][0][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][0][0] == 2 && gamematrix[1][0][1] == 2 && gamematrix[1][0][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][1][0] == 1 && gamematrix[1][1][1] == 1 && gamematrix[1][1][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][1][0] == 2 && gamematrix[1][1][1] == 2 && gamematrix[1][1][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if (gamematrix[1][2][0] == 1 && gamematrix[1][2][1] == 1 && gamematrix[1][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][2][0] == 2 && gamematrix[1][2][1] == 2 && gamematrix[1][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][0][0] == 1 && gamematrix[1][1][0] == 1 && gamematrix[1][2][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][0][0] == 2 && gamematrix[1][1][0] == 2 && gamematrix[1][2][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][0][1] == 1 && gamematrix[1][1][1] == 1 && gamematrix[1][2][1] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][0][1] == 2 && gamematrix[1][1][1] == 2 && gamematrix[1][2][1] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][0][2] == 1 && gamematrix[1][1][2] == 1 && gamematrix[1][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][0][2] == 2 && gamematrix[1][1][2] == 2 && gamematrix[1][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][0][0] == 1 && gamematrix[1][1][1] == 1 && gamematrix[1][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][0][0] == 2 && gamematrix[1][1][1] == 2 && gamematrix[1][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][0][2] == 1 && gamematrix[1][1][1] == 1 && gamematrix[1][2][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[1][0][2] == 2 && gamematrix[1][1][1] == 2 && gamematrix[1][2][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][0][0] == 1 && gamematrix[2][0][1] == 1 && gamematrix[2][0][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][0][0] == 2 && gamematrix[2][0][1] == 2 && gamematrix[2][0][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][1][0] == 1 && gamematrix[2][1][1] == 1 && gamematrix[2][1][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][1][0] == 2 && gamematrix[2][1][1] == 2 && gamematrix[2][1][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][2][0] == 1 && gamematrix[2][2][1] == 1 && gamematrix[2][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][2][0] == 2 && gamematrix[2][2][1] == 2 && gamematrix[2][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][0][0] == 1 && gamematrix[2][1][0] == 1 && gamematrix[2][2][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][0][0] == 2 && gamematrix[2][1][0] == 2 && gamematrix[2][2][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][0][1] == 1 && gamematrix[2][1][1] == 1 && gamematrix[2][2][1] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][0][1] == 2 && gamematrix[2][1][1] == 2 && gamematrix[2][2][1] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][0][2] == 1 && gamematrix[2][1][2] == 1 && gamematrix[2][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][0][2] == 2 && gamematrix[2][1][2] == 2 && gamematrix[2][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][0][0] == 1 && gamematrix[2][1][1] == 1 && gamematrix[2][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][0][0] == 2 && gamematrix[2][1][1] == 2 && gamematrix[2][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][0][2] == 1 && gamematrix[2][1][1] == 1 && gamematrix[2][2][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][0][2] == 2 && gamematrix[2][1][1] == 2 && gamematrix[2][2][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][0][2] == 1 && gamematrix[1][0][2] == 1 && gamematrix[2][0][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][2] == 2 && gamematrix[1][0][2] == 2 && gamematrix[2][0][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][1][2] == 1 && gamematrix[1][1][2] == 1 && gamematrix[2][1][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][1][2] == 2 && gamematrix[1][1][2] == 2 && gamematrix[2][1][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][2][2] == 1 && gamematrix[1][2][2] == 1 && gamematrix[2][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][2][2] == 2 && gamematrix[1][2][2] == 2 && gamematrix[2][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][0][2] == 1 && gamematrix[1][1][2] == 1 && gamematrix[2][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][2] == 2 && gamematrix[1][1][2] == 2 && gamematrix[2][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][2][2] == 1 && gamematrix[1][1][2] == 1 && gamematrix[2][0][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][2][2] == 2 && gamematrix[1][1][2] == 2 && gamematrix[2][0][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][0][0] == 1 && gamematrix[0][1][0] == 1 && gamematrix[2][0][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][0] == 2 && gamematrix[0][1][0] == 2 && gamematrix[2][0][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][1][0] == 1 && gamematrix[1][1][0] == 1 && gamematrix[2][1][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][1][0] == 2 && gamematrix[1][1][0] == 2 && gamematrix[2][1][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][2][0] == 1 && gamematrix[1][2][0] == 1 && gamematrix[2][2][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][2][0] == 2 && gamematrix[1][2][0] == 2 && gamematrix[2][2][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][0][0] == 1 && gamematrix[1][1][0] == 1 && gamematrix[2][2][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][0] == 2 && gamematrix[1][1][0] == 2 && gamematrix[2][2][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][2][0] == 1 && gamematrix[1][1][0] == 1 && gamematrix[2][2][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][2][0] == 2 && gamematrix[1][1][0] == 2 && gamematrix[2][2][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][0][0] == 1 && gamematrix[1][0][0] == 1 && gamematrix[2][0][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][0] == 2 && gamematrix[1][0][0] == 2 && gamematrix[2][0][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][0][1] == 1 && gamematrix[1][0][1] == 1 && gamematrix[2][0][1] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][1] == 2 && gamematrix[1][0][1] == 2 && gamematrix[2][0][1] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][0][2] == 1 && gamematrix[1][0][2] == 1 && gamematrix[2][0][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][2] == 2 && gamematrix[1][0][2] == 2 && gamematrix[2][0][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][0][0] == 1 && gamematrix[1][0][1] == 1 && gamematrix[2][0][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][0] == 2 && gamematrix[1][0][1] == 2 && gamematrix[2][0][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][0][2] == 1 && gamematrix[1][0][1] == 1 && gamematrix[2][0][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][2] == 2 && gamematrix[1][0][1] == 2 && gamematrix[2][0][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][2][0] == 1 && gamematrix[1][2][0] == 1 && gamematrix[2][2][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][2][0] == 2 && gamematrix[1][2][0] == 2 && gamematrix[2][2][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][2][1] == 1 && gamematrix[1][2][1] == 1 && gamematrix[2][2][1] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][2][1] == 2 && gamematrix[1][2][1] == 2 && gamematrix[2][2][1] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][2][2] == 1 && gamematrix[1][2][2] == 1 && gamematrix[2][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][2][2] == 2 && gamematrix[1][2][2] == 2 && gamematrix[2][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][2][0] == 1 && gamematrix[1][2][1] == 1 && gamematrix[2][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][2][0] == 2 && gamematrix[1][2][1] == 2 && gamematrix[2][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][2][2] == 1 && gamematrix[1][2][1] == 1 && gamematrix[2][2][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][2][2] == 2 && gamematrix[1][2][1] == 2 && gamematrix[2][2][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][1][1] == 1 && gamematrix[1][1][1] == 1 && gamematrix[2][1][1] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][1][1] == 2 && gamematrix[1][1][1] == 2 && gamematrix[2][1][1] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][0][0] == 1 && gamematrix[1][1][1] == 1 && gamematrix[2][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][0] == 2 && gamematrix[1][1][1] == 2 && gamematrix[2][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[2][0][0] == 1 && gamematrix[1][1][1] == 1 && gamematrix[0][2][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[2][0][0] == 2 && gamematrix[1][1][1] == 2 && gamematrix[0][2][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][0][2] == 1 && gamematrix[1][1][1] == 1 && gamematrix[2][2][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][2] == 2 && gamematrix[1][1][1] == 2 && gamematrix[2][2][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][2][0] == 1 && gamematrix[1][1][1] == 1 && gamematrix[2][0][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][2][0] == 2 && gamematrix[1][1][1] == 2 && gamematrix[2][0][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][0][1] == 1 && gamematrix[1][1][1] == 1 && gamematrix[2][2][1] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][0][1] == 2 && gamematrix[1][1][1] == 2 && gamematrix[2][2][1] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][2][1] == 1 && gamematrix[1][1][1] == 1 && gamematrix[2][0][1] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][2][1] == 2 && gamematrix[1][1][1] == 2 && gamematrix[2][0][1] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][1][0] == 1 && gamematrix[1][1][1] == 1 && gamematrix[2][1][2] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][1][0] == 2 && gamematrix[1][1][1] == 2 && gamematrix[2][1][2] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }
      else if(gamematrix[0][1][2] == 1 && gamematrix[1][1][1] == 1 && gamematrix[2][1][0] == 1){
        io.sockets.emit('results',{
          playerwin : 1, //player 1 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }else if(gamematrix[0][1][2] == 2 && gamematrix[1][1][1] == 2 && gamematrix[2][1][0] == 2){
        io.sockets.emit('results',{
          playerwin : 2, //player 2 wins
          turns : 0 //IMPLEMENT THIS LATER
        });
      }

/////////////////////////////////////////////////////////////////////////////////////////////////////
    }else if(gamematrix[temp0][temp1][temp2] == 1 || gamematrix[temp0][temp1][temp2] == 2){
      socket.emit('updateblock',{
          update : sendback,
          error : 1, //no error
          player: data.player//******************IMPLEMENT TO FIX THE TURN BASE!
      });
    }
  });

  socket.on('disconnect',function(){//player quit game
    console.log('client is now disonnected from the server');
    playerCap--;
    console.log('playerCount: '+ playerCap);
    for(var i = 0 ; i < 3 ; i++){
      for(var j = 0 ; j < 3 ; j++){
        for(var k = 0 ; k < 3 ; k++){
          gamematrix[i][j][k] = 0;
        }
      }
    }
    console.log('game matrix after player quitting: '+gamematrix);
    io.sockets.emit('cleargame',{});
  });

  socket.on('player1DC',function(){
    playerflag = 1;
    console.log('PLAYERFLAG: '+playerflag);
  });

  socket.on('stats',function(){
    users = db.collection('users');

    socket.emit('results2',{
      date : datetime,
      turns : totalturns
    });
  });

  socket.on('player2DC',function(){
    playerflag = 2;
    console.log('PLAYERFLAG: '+playerflag);
  });


});
