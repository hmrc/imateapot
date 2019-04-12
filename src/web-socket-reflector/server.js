console.log("Server started");
var Msg = '';
var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server
    , wss = new WebSocketServer({port: 8010});
    wss.on('connection', function(ws, req) {
        var clientIp = req.connection.remoteAddress.replace(/^.*:/, '');
        console.log('connection established from: %s', clientIp);
        ws.on('message', function(message) {
          console.log('Received from client (%s): %s', clientIp, message);
          WebSocketServer.broadcast(message);
    });
 });

WebSocketServer.broadcast = function broadcast(data) {
 wss.clients.forEach(function each(client) {
   if (client.readyState === WebSocket.OPEN) {
     client.send(data);
   }
 });
};
