//make connection
var socket =  io.connect('http://localhost:15232');

var quit = document.getElementById('quitgame');//gets quitgame button
var message = document.getElementById('messageboard');//gets messageboard
var feedback = document.getElementById('feedbackboard');//gets feedback error or success
var playernumber;
var random;
var turnflag;
//event listeners

var entry;//matrix entry upon entering a button on the tic tac toe board
for(var i = 0 ; i < 3 ; i ++){
  for(var j = 0 ; j < 3 ; j++){
    for(k = 0 ; k < 3 ; k ++){
      var matrix = '' + i + j + k ;
      console.log(matrix);
      document.getElementById(matrix).addEventListener('click',gamefunction);
    }
  }
}

quit.addEventListener('click',function(){//disconnects from socket
  if(playernumber == 1){
    socket.emit('player1DC',{});
  }else if (playernumber == 2){
    socket.emit('player2DC',{});
  }
  socket.emit('disconnect',{});
  socket.close();
});

socket.on('player',function(data){
  message.innerHTML += '<p>You have entered the game</p>';
});

socket.on('updateblock',function(data){//updates the matrix
  if(data.error == 0){
    console.log('DATA: ' + data.update);
    if(data.player == 1){
      document.getElementById(data.update).innerHTML = 'X';
      feedback.innerHTML = '';
    }else if (data.player == 2){
      document.getElementById(data.update).innerHTML = 'O';
      feedback.innerHTML = '';
    }
    turnflag = data.player;
    console.log('FLAG UPDATEBLOCK: '+ data.player);
    console.log('TURNFLAG:' +turnflag);
  }else if (data.error == 1){
    feedback.innerHTML = '<p>Invalid move, try another one </p>';
    if(turnflag == data.player && data.player == 1){
      turnflag = 2;
    }else if (turnflag == data.player && data.player == 2){
      turnflag = 1;
    }
  }
});
var gamestats = -1;
socket.on('gamestatus',function(data){
  gamestats = data.game;
  if(gamestats == 0){
    message.innerHTML += '<br><p>Waiting for another player.</p>';
  }else if(gamestats == 1){
    message.innerHTML = '<p>Game has started</p>';
    feedback.innerHTML = '';
    if((data.first + 1) == playernumber){
      feedback.innerHTML = '<p>You go first</p>';
      if(playernumber == 1){
        turnflag = 2;
      }else if(playernumber == 2){
        turnflag = 1;
      }
    }else if(data.first + 1 != playernumber){
      feedback.innerHTML = '<p>You go second</p>';
      if(playernumber == 1){
        turnflag = 1;
      }else if(playernumber == 2){
        turnflag = 2;
      }
    }
  }
});

socket.on('cleargame',function(){
  for(var i = 0 ; i < 3 ; i ++){
    for(var j = 0 ; j < 3 ; j++){
      for(k = 0 ; k < 3 ; k ++){
        var matrix = '' + i + j + k ;
        //console.log(matrix);
        document.getElementById(matrix).innerHTML = '';
      }
    }
  }
  message.innerHTML = '<p>Other player has left the game. Waiting for another player </p>';
  gamestats = -1;
});
socket.on('localplayer',function(data){
  playernumber = data.player;
  console.log('PLAYERNUMBER: '+ playernumber);
  if((data.first + 1) == playernumber){
    feedback.innerHTML = '<p>You go first</p>';
  }else if(data.first + 1 != playernumber){
    feedback.innerHTML = '<p>You go second</p>';
  }
});

socket.on('results',function(data){
  socket.emit('stats',{});
  if(data.playerwin == playernumber){
    message.innerHTML = '<p>You have won! Please press Quit Game to leave the game</p>';
    //message.innerHTML += '<br><p>Game Status. Time game started: ' +data.date+'</p>';
  }else if(data.playerwin != playernumber){
    message.innerHTML = '<p>You have lost! Please press Quit Game to leave the game<p>';
    //message.innerHTML += '<br><p>Game Status. Time game started: ' +data.date+'</p>';
  }
  gamestats = -1;
});

socket.on('results2',function(data){
  message.innerHTML += '<br><p>Game Status. Time game started: ' +data.date+'</p>' + '<br><p>Total Turns:' + data.turns +'</p>';
});

function gamefunction(e){//game function
    entry = this.id;
    console.log(entry);
    if(gamestats == 1){
      if(turnflag != playernumber){
        turnflag = playernumber;
        console.log('PLAYERNUMBER IN GAMEFUNCTION: ' + playernumber);
        socket.emit('placeblock',{
          input : entry,
          player : playernumber
        });
      }else{
        feedback.innerHTML = '<p>It is not your turn</p>';
      }
    }else{
      feedback.innerHTML = '<p>Game has not started, You cannot place any blocks!</p>';
    }
}
