
export function WS() {
	var This = this;

	This.wsImpl = (window.WebSocket || window.MozWebSocket);
	This.socket = null;

	This.CONNECTING = 0;	// The connection is not yet open.
	This.OPEN = 1;	// The connection is open and ready to communicate.
	This.CLOSING = 2;	// The connection is in the process of closing.
	This.CLOSED = 3;	// The connection is closed or couldn't be opened.

	This.Timeout = 10000;

	This.hOpenInterval = null;
	This.hCloseInterval = null;
	
	This.Open = function (ConnectionURL, SubProtocol, SuccessCallBack, ErrorCallBack) {

		if (SuccessCallBack == null)
			SuccessCallBack = function () { };

		if (ErrorCallBack == null)
			ErrorCallBack = function () { };

		try
		{
			if (SubProtocol != null)
				This.socket = new This.wsImpl(ConnectionURL, SubProtocol);
			else
				This.socket = new This.wsImpl(ConnectionURL);

			This.socket.onmessage = function (evt) { This.OnMessage(evt); };
			This.socket.onopen = function (evt) { This.OnOpen(evt); };
			This.socket.onclose = function (evt) { This.OnClose(evt); };
			This.socket.onerror = function (evt) { This.OnError(evt); };

			var PollInterval = 100;
			var nElapsedTime = 0;
			if (This.hOpenInterval != null)
				clearInterval(This.hOpenInterval);
			This.hOpenInterval = setInterval(function ()
			{
				nElapsedTime += PollInterval;
				if (This.socket.readyState === This.OPEN)
				{
					clearInterval(This.hOpenInterval);
					SuccessCallBack();
				}
				if (nElapsedTime > This.Timeout)
				{
					clearInterval(This.hOpenInterval);
					ErrorCallBack("SOCKET_TIMEOUT");
				}
			}, PollInterval);
		}
		catch(Exception)
		{
			ErrorCallBack(Exception);
		}
	};

	This.IsOpen = function ()
	{
		return (This.socket != null && (This.socket.readyState === This.OPEN || This.socket.readyState === This.CONNECTING));
	};

	This.Close = function (SuccessCallBack, ErrorCallBack) {

		if (SuccessCallBack == null)
			SuccessCallBack = function () { };

		if (ErrorCallBack == null)
			ErrorCallBack = function () { };

		try {
			if (This.socket == null)
				return SuccessCallBack();

			if (This.socket.readyState === This.OPEN || This.socket.readyState === This.CONNECTING)
				This.socket.close();

			var PollInterval = 100;
			var nElapsedTime = 0;
			if (This.hCloseInterval != null)
				clearInterval(This.hCloseInterval);
			This.hCloseInterval = setInterval(function ()
			{
				nElapsedTime += PollInterval;
				if (This.socket.readyState === This.CLOSED) {
					clearInterval(This.hCloseInterval);
					SuccessCallBack();
				}
				if (nElapsedTime > This.Timeout) {
					clearInterval(This.hCloseInterval);
					ErrorCallBack("SOCKET_TIMEOUT");
				}
			}, PollInterval);
		}
		catch (Exception) {
			ErrorCallBack(Exception);
		}
	};

	This.Send = function (data, ErrorCallBack) {

		if (ErrorCallBack == null)
			ErrorCallBack = function () { };

		if (This.socket == null) {
			ErrorCallBack("SOCKET_CLOSED");
			return false;
		}

		if (This.socket.readyState !== This.OPEN) {
			ErrorCallBack("SOCKET_CLOSED");
			return false;
		}

		try {			
			This.socket.send(data);
			return true;
		}
		catch (Exception) {
			ErrorCallBack(Exception);
		}
		return false;
	};

	This.OnMessage = function (evt)
	{
		var data = evt.data;
	};

	This.OnOpen = function (evt) { };

	This.OnClose = function (evt) { };

	This.OnError = function (evt) { };

}
