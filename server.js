const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const server = require('http').createServer(app);
const io = require('socket.io')(server);
let players = [];

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
	res.render('index.html');
});

io.sockets.on('connection', socket => {
	socket.emit('serverRequestPosition');
	socket.emit('serverSendingId', socket.id);
	socket.on('clientRequestArray', function(){
		socket.emit('serverSendingArray', players);
	});


	socket.on('clientSendingPosition', player => {
		var a = 0;
		for(old_player of players){
			if(old_player.id == player.id && old_player.id!=undefined){
				a++;
				players[players.indexOf(old_player)] = player;
			}
		}
		if(a==0){
			players.push(player);
		}
		socket.broadcast.emit('serverSendingPlayers', players);
		socket.emit('serverSendingPlayers', players);
	});

	socket.on('disconnect', function(){
		for(player of players){
			if(player.id == socket.id){
				players.splice(players.indexOf(player), 1);
			}
		}
		socket.broadcast.emit('serverSendingPlayers', players);
	});

});



server.listen(port, function(){
	console.log('Server is running on port '+port)
});