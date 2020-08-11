
module.exports =  class Conference {
	constructor(Secret) {
		this.Secret = Secret;
		this.Partecipants = [ ];
	}

	AddPartecipant(ws) {
		ws.PartecipantId = this.Partecipants.length;
		this.Partecipants[ws.UriName] = ws;

		this.RouteMsg({ CMD: 'ENTER', UriName: ws.UriName },ws);
	}

	RemovePartecipant(ws) {
		delete this.Partecipants[ws.UriName];
		this.RouteMsg({CMD:'EXIT', UriName: ws.UriName });
	}

	RouteMsg(msg, wsSender) {
		var obj = this.Partecipants;
		Object.keys(obj).forEach(function(UriName) {
			var ws = obj[UriName];
			if (ws == null)
				return;
			if (wsSender!=null && wsSender.UriName == UriName)
				return;
			
			ws.send(JSON.stringify(msg));
		  });
	}

	SendMsg(msg, ToUriName) {		
			var ws = this.Partecipants[ToUriName];
			if (ws == null)
				return;

			ws.send(JSON.stringify(msg));
	}
}
