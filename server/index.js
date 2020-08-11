const WebSocket = require('ws');
const fs = require('fs');
var url = require('url');

const Conference = require('./conference.js');

const wss = new WebSocket.Server({ port: 31000 });

var vConferences = [];

// Fare store su redis o similare
// fare exit su mancato refresh a timeout e piuttosto che close
// fare cache temporanea dei messaggi in caso ws no ci sia
// gestire la comunicazione di occupato

wss.on('connection', (ws, req) => {
	var Secret = req.headers["sec-websocket-protocol"];
	var url_parts = url.parse(req.url, true);

	var UriName = url_parts.query["UriName"];

	if (UriName == null)
	{
		ws.close();
		return;
	}

	ws.Secret = Secret;
	ws.UriName = UriName;

	if (vConferences[Secret] == null)
		vConferences[Secret] = new Conference(Secret);

	vConferences[Secret].AddPartecipant(ws);	

	ws.on('message', (sMsg) => {    
		if (sMsg == 'PING') {
			ws.send('PONG');
			return;
		}

		if (sMsg == 'IVAN') {
			
			return;
		}		

		var oMsg = JSON.parse(sMsg);
		switch(oMsg.CMD)
		{
			case 'ENTER':
				if (vConferences[ws.Secret] != null)
					vConferences[ws.Secret].SendMsg(oMsg,oMsg.ToUriName);
				break;
			case 'EXIT':
				if (vConferences[ws.Secret] != null)
					vConferences[ws.Secret].SendMsg(oMsg,oMsg.ToUriName);
				break;
			case 'OFFER':
				if (vConferences[ws.Secret] != null)
					vConferences[ws.Secret].SendMsg(oMsg,oMsg.ToUriName);
				break;
			case 'ANSWER':
				if (vConferences[ws.Secret] != null)
					vConferences[ws.Secret].SendMsg(oMsg,oMsg.ToUriName);
				break;
			case 'ICE':
				if (vConferences[ws.Secret] != null)
					vConferences[ws.Secret].SendMsg(oMsg,oMsg.ToUriName);
				break;
			default:
				ws.close();
				break;
		}
	});
	
	ws.on('close', (e) => {
		if (vConferences[ws.Secret] != null) {
			vConferences[ws.Secret].RemovePartecipant(ws);
		}
	});

});

process.on('uncaughtException', function (error) {
	console.error(error);
});

