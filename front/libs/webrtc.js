import $ from "jquery";

export { WebRTC };

var WebRTC =
{
	DefaultIceServers: [

		{ urls: 'stun:stun.l.google.com:19302' },
		{ urls: 'stun:5.189.146.17' },
		{ urls: 'stun:stun1.l.google.com:19302' },
		{ urls: 'stun:stun2.l.google.com:19302' },
		{ urls: 'stun:stun3.l.google.com:19302' },
		{ urls: 'stun:stun4.l.google.com:19302' },
		{ urls: 'stun:stun01.sipphone.com' },
		{ urls: 'stun:stun.ekiga.net' },
		{ urls: 'stun:stun.fwdnet.net' },
		{ urls: 'stun:stun.ideasip.com' },
		{ urls: 'stun:stun.iptel.org' },
		{ urls: 'stun:stun.rixtelecom.se' },
		{ urls: 'stun:stun.schlund.de' },
		{ urls: 'stun:stunserver.org' },
		{ urls: 'stun:stun.softjoys.com' },
		{ urls: 'stun:stun.voiparound.com' },
		{ urls: 'stun:stun.voipbuster.com' },
		{ urls: 'stun:stun.voipstunt.com' },
		{ urls: 'stun:stun.voxgratia.org' },
		{ urls: 'stun:stun.xten.com' },
		{ urls: 'stun:stun01.sipphone.com' },
		{ urls: 'stun:stun.fwdnet.net' },
		{ urls: 'stun:numb.viagenie.ca' },
		{ urls: 'stun:stun.stunprotocol.0rg' },
		{ urls: 'stun:stun.counterpath.com' },
		{ urls: 'stun:stun.services.mozilla.com' },
	],

	GetMediaDeviceErrorType:
	{
		ABORT: "DevicesAbortError",
		NOT_ALLOWED: "DevicesNotAllowedError",
		NOT_FOUND: "DevicesNotFoundError",
		NOT_READABLE: "DevicesNotReadableError",
		OVER_CONSTRAINED: "DevicesOverConstrainedError",
		SECURITY: "DevicesSecurityError",
		TYPE: "DevicesTypeError",
	},

	GetUserMedia: navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia,

	RTCPeerConnection: window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection,
	RTCSessionDescription: window.RTCSessionDescription || window.mozRTCSessionDescription,
	RTCIceCandidate: window.RTCIceCandidate || window.mozRTCIceCandidate,

	Info: function (Err) { console.info(Err); },
	Error: function (Err) { console.error(Err); },

	IsSupported: function () {
		if ((!!window.webkitRTCPeerConnection || !!window.mozRTCPeerConnection) == false)
			return false;

		return true;
	},

	StreamHasActiveVideoTrack: function (stream) {
		if (stream != null) {
			var vtks = stream.getVideoTracks();
			if (vtks != null && vtks.length > 0) // checking video presence
			{
				for (var i = 0; i < vtks.length; i++) {
					var media_source = vtks[i];
					if (media_source.kind == 'video' && media_source.readyState != "ended")
						return true;
				}
			}
		}

		return false;
	},

	// Tenta di accedere ai media dell'utente ed attivare lo stream video ed audio 
	// Ritorna un oggetto deferred con:
	//   - lo stream in caso done
	//   - l'errore ritornato da GetUserMedia in caso fail
	GetMediaDeviceStream: function (MustHaveVideoTrack) {
		var DefRet = new $.Deferred();

		WebRTC.Info('Testing User Media');
		var fnUserMediaOk = function (stream) {
			WebRTC.Info('Local stream obtained');

			if (MustHaveVideoTrack == true && WebRTC.StreamHasActiveVideoTrack(stream) != true) {
				WebRTC.Info('Local stream has not video track');
				return DefRet.reject();
			}

			DefRet.resolve(stream);
		};

		navigator.getUserMedia = navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia;

		WebRTC.Info('Requesting local stream');
		if (navigator.getUserMedia == null)
			DefRet.reject();

		navigator.getUserMedia({ audio: true, video: true }, fnUserMediaOk,
			function (e) {
				navigator.getUserMedia({ audio: false, video: true }, fnUserMediaOk,
					function (e) {
						navigator.getUserMedia({ audio: true, video: false }, fnUserMediaOk,
							function (e) {
								WebRTC.Info('Local stream request failed');
								DefRet.reject(e);
							});
					});
			});

		return DefRet;
	},

	GetMediaDeviceStream2: function (MustHaveVideoTrack, oConstraints) {
		var DefRet = new $.Deferred();

		WebRTC.Info('Testing User Media');
		var fnUserMediaOk = function (stream) {
			WebRTC.Info('Local stream obtained');

			if (MustHaveVideoTrack == true && WebRTC.StreamHasActiveVideoTrack(stream) != true) {
				WebRTC.Info('Local stream has not video track');
				return DefRet.reject();
			}

			DefRet.resolve(stream);
		};

		var fnUserMediaError = function (e) {
			WebRTC.Info('Local stream request failed');
			DefRet.reject(e);
		}

		WebRTC.Info('Requesting local stream');
		if (navigator.mediaDevices.getUserMedia == null)
			DefRet.reject();

		if (oConstraints != null) {
			navigator.mediaDevices.getUserMedia(oConstraints)
				.then(fnUserMediaOk)
				.catch(fnUserMediaError);
		}
		else {
			navigator.mediaDevices.getUserMedia({ audio: true, video: true })
				.then(fnUserMediaOk)
				.catch(function (e) {
					navigator.mediaDevices.getUserMedia({ audio: false, video: true })
						.then(fnUserMediaOk)
						.catch(function (e) {
							navigator.mediaDevices.getUserMedia({ audio: true, video: false })
								.then(fnUserMediaOk)
								.catch(fnUserMediaError);
						});
				});
		}

		return DefRet;
	},

	EnumerateDevices() {
		let DefRet = $.Deferred();

		navigator.mediaDevices.enumerateDevices()
			.then((vDevices)=> {
				DefRet.resolve(vDevices);
			})
			.catch((err)=>{
				DefRet.reject(err);
			});

		return DefRet;
	},

	StreamStop: function (stream) {
		if (stream != null && stream.getTracks) {
			stream.getTracks().forEach(function (track) {
				track.stop();
				stream.removeTrack(track);
			});
		}
	},

	DebugOutputStream: function (stream) {
		startTime = window.performance.now();
		var videoTracks;
		var audioTracks;
		if (stream != null) {
			videoTracks = stream.getVideoTracks();
			audioTracks = stream.getAudioTracks();
		}
		if (videoTracks != null && videoTracks.length > 0)
			WebRTC.Info("Local video track: " + videoTracks[0].id);
		if (audioTracks != null && audioTracks.length > 0)
			WebRTC.Info("Local audio track: " + audioTracks[0].id);
	},

	OnDeviceError: function (error) {
		var sDeviceErrorName = Types.ToString(error.name);

		switch (sDeviceErrorName) {
			case "DevicesAbortError":
				return WebRTC.GetMediaDeviceErrorType.ABORT;

			case "DevicesNotAllowedError":
				return WebRTC.GetMediaDeviceErrorType.NOT_ALLOWED;

			case "DevicesNotFoundError":
				return WebRTC.GetMediaDeviceErrorType.NOT_FOUND;

			case "DevicesNotReadableError":
				return WebRTC.GetMediaDeviceErrorType.NOT_READABLE;

			case "DevicesOverConstrainedError":
				return WebRTC.GetMediaDeviceErrorType.OVER_CONSTRAINED;

			case "DevicesSecurityError":
				return WebRTC.GetMediaDeviceErrorType.SECURITY;

			case "DevicesTypeError":
				return WebRTC.GetMediaDeviceErrorType.TYPE;

			default:
				return WebRTC.GetMediaDeviceErrorType.NOT_FOUND;
		}
	},

	DeviceKindType: {

		VIDEO_INPUT: "videoinput",
		AUDIO_INPUT: "audioinput",
		AUDIO_OUTPUT: "audiooutput"
	},

	IsWebcamAvailable: function () {
		var DefOp = new $.Deferred();

		if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices)
			return DefOp.reject();

		var bIsAvailable = false;

		navigator.mediaDevices.enumerateDevices()
			.then(function (vDevices) {
				vDevices.forEach(function (oDevice) {
					if (oDevice.kind == WebRTC.DeviceKindType.VIDEO_INPUT && bIsAvailable != true)
						bIsAvailable = true;
				});

				DefOp.resolve(bIsAvailable);
			})
			.catch(function (err) {
				console.log(err.name + ": " + err.message);
				DefOp.reject();
			});

		return DefOp;
	},

	PeerConnection: function (LocalStream, IceServers, ConnectionSuccessCallback, ConnectionFailCallback, _SubmitIceCandidate, RemoteStreamGotCallback) {
		var This = this;

		if (ConnectionSuccessCallback == null)
			ConnectionSuccessCallback = function () { };
		if (ConnectionFailCallback == null)
			ConnectionFailCallback = function () { };
		This.SubmitIceCandidate = _SubmitIceCandidate;
		if (This.SubmitIceCandidate == null)
			This.SubmitIceCandidate = function () { };
		This.RemoteStreamGotCallback = RemoteStreamGotCallback;
		if (This.RemoteStreamGotCallback == null)
			This.RemoteStreamGotCallback = function () { };
		if (IceServers == null)
			IceServers = WebRTC.DefaultIceServers;

		This.RTCConfiguration = {
			iceServers: IceServers,
		};

		This.IceCandidates = [];

		This.Connected = false;

		This.RTCPeerConnection = new WebRTC.RTCPeerConnection(This.RTCConfiguration);
		if (LocalStream != null)
			LocalStream.getTracks().forEach(track => This.RTCPeerConnection.addTrack(track, LocalStream));

		This.RemoteStream = null;

		This.RemoteSDP = null;

		This.DataChannel = null;

		This.RTCPeerConnection.oniceconnectionstatechange = function (event) {
			//This.RTCPeerConnection.addEventListener("iceconnectionstatechange", function (event) {
			var pc = This.RTCPeerConnection;
			if (pc != null)
				console.log(pc.iceConnectionState);
			else
				return;

			if (pc.iceConnectionState == 'disconnected') {
				// TODO: IVAN - Capire se va, un disconnected può sempre riprenderesi e tornare connected This.OnPeerHangUpCallback(false);
			}

			if (pc.iceConnectionState == 'failed') {
				ConnectionFailCallback();
			}

			//TK-START: IVAN - 20181025_08 
			//**** ATTENZIONE QUESTO PERMETTE DI VELOCIZZARE LA CONNESSIONE (A) - FA IL PARI CON IL PUNTO (B) PIU SOTTO 
			if (This.Connected == false && (pc.iceConnectionState == 'connected' || pc.iceConnectionState == 'completed')) {
				//WebRTC.Info("onIceStateChange: pc.iceConnectionState == '" + pc.iceConnectionState + "'");
				This.Connected = true;
				ConnectionSuccessCallback(This.RemoteStream);
			}
			//TK-END: IVAN - 20181025_08 

		};

		This.RTCPeerConnection.onaddstream = function (evt) {
			//This.RTCPeerConnection.addEventListener("track", function (evt) {
			WebRTC.Info("PeerConnection.onaddstream - Remote Stream obtained");
			var stream = evt.stream;

			This.RemoteStream = evt.stream;
			This.RemoteStreamGotCallback(This.RemoteStream);
		};

		This.RTCPeerConnection.onremovestream = function (ev) {
			WebRTC.Info("PeerConnection.onremovestream");
		};

		This.RTCPeerConnection.onicecandidate = function (evt) {
			//This.RTCPeerConnection.addEventListener("icecandidate", function (evt) {
			//TK-START: IVAN - 20181025_08 
			//**** ATTENZIONE QUESTO PERMETTE DI VELOCIZZARE LA CONNESSIONE (B) - FA IL PARI CON IL PUNTO (A) PIU SOPRA 
			var cand = evt.candidate;
			 if (evt.candidate == null)
			 	cand = '';

			This.SubmitIceCandidate(cand);
			//TK-END: IVAN - 20181025_08 
		};

		This.CreateDataChannel = function () {
			return This.RTCPeerConnection.createDataChannel("data", { reliable: true });
		};

		This.CreateOffer = function (MediaConstraints) {
			WebRTC.Info("PeerConnection.CreateOffer");
			var def = new $.Deferred();

			if (MediaConstraints == null)
				MediaConstraints = { offerToReceiveAudio: true, offerToReceiveVideo: true, voiceActivityDetection: true };


			WebRTC.Info("  PeerConnection.CreateDataChannel");
			try {
				This.DataChannel.Init(This.CreateDataChannel());
			}
			catch (error) {
				WebRTC.Error("  PeerConnection.DataChannel not supported");
				def.reject(error);
			}

			This.RTCPeerConnection.createOffer(MediaConstraints)
				.then(function (_Offer) {
					return This.RTCPeerConnection.setLocalDescription(_Offer);
				})
				.then(function () {
					def.resolve(This.RTCPeerConnection.localDescription);
				})
				.catch(function (evt) {
					def.reject(evt);
				});

			return def;
		};

		This.CreateAnswer = function (RemoteSDP) {
			WebRTC.Info("PeerConnection.CreateAnswer");
			var def = new $.Deferred();

			This.RTCPeerConnection.ondatachannel = function (e) {
				This.DataChannel.Init(e.channel);
			};

			This.RTCPeerConnection.setRemoteDescription(RemoteSDP)
				.then(()=> {

					This.RemoteSDP = RemoteSDP;
					for (var i = 0; i < This.IceCandidates.length; i++)
						This.AddIceCandidate(This.IceCandidates[i]);

					This.RTCPeerConnection.createAnswer
					(
						function (_Answer) {
							This.RTCPeerConnection.setLocalDescription(_Answer,
								function () { def.resolve(_Answer); },
								function () { def.reject(evt); }
							);
						},
						function () { def.reject(evt); }
					);
				})
				.catch((err) => {
					WebRTC.Error("This.RTCPeerConnection.setRemoteDescription failed: "+JSON.stringify(err));
					def.reject(err);
				})
			
			return def;
		};

		This.AddIceCandidate = function (IceCandidate) {
			This.RTCPeerConnection.addIceCandidate(IceCandidate,//new RTCIceCandidate(IceCandidate),
				function () {
					//WebRTC.Info("PeerConnection.AddIceCandidate added: " + JSON.stringify(IceCandidate));
				},
				function (err) {
					WebRTC.Error("PeerConnection.AddIceCandidate failed: " + err);
				}
			);
		}

		This.SetAnswer = function (RemoteAnswer) {
			var def = new $.Deferred();
			WebRTC.Info("PeerConnection.SetAnswer");

			This.RTCPeerConnection.setRemoteDescription(RemoteAnswer)
				.then(() => {
					WebRTC.Info("PeerConnection.setRemoteDescription succeded");
					This.RemoteSDP = RemoteAnswer;
					for (var i = 0; i < This.IceCandidates.length; i++)
						This.AddIceCandidate(This.IceCandidates[i]);

					def.resolve(This.RemoteSDP);
				})
				.catch((err)=> {
					Error("PeerConnection.setRemoteDescription failed: " + err);
					def.reject(err);
				});

			return def;
		};

		This.SetIceCandidate = function (IceCandidate) {
			if (This.RemoteSDP == null) {
				This.IceCandidates.push(IceCandidate);
			}
			else {
				This.AddIceCandidate(IceCandidate);
			}
		};

		This.IsConnected = function () {
			return (This.DataChannel.Handle != null && (This.DataChannel.Handle.readyState == 'open' || This.DataChannel.Handle.readyState == 'connecting'));
		}		

		This.Close = function () {
			This.DataChannel.Release();
			This.ConnectionSuccessCallback = function () { };
			This.ConnectionFailCallback = function () { };
			This.SubmitIceCandidate = function () { };
			try {

				if (This.RTCPeerConnection != null) {
					This.RTCPeerConnection.oniceconnectionstatechange = function () { }
					This.RTCPeerConnection.onicecandidate = function () { };
					if (This.RTCPeerConnection.signalingState != "closed")
						This.RTCPeerConnection.close();

					delete This.RTCPeerConnection;
				}
			}
			catch (Ex) {
				WebRTC.Error("WebRTC.PeerConnection.Close - Exception: " + Ex.message);
			}
			This.RTCPeerConnection = null;
			This.RemoteSDP = null;
			This.Connected = false;
			This.RemoteStream = null;

			console.log("PeerConnection.Close");
		}

		This.GetStats = function() {
			var def = new $.Deferred();

			var senders = This.RTCPeerConnection.getSenders();
			if (senders == null)
				return def.reject("senders == null");

			if (senders.length == 0)
				return def.reject("senders.length == 0");

			for(var i=0;i<senders.length;i++)
			{
				if (senders[i].track!=null && senders[i].track.kind == "video")
				{
					senders[i].getStats()
						.then((res)=> {
							def.resolve(res);
						})
						.catch((err)=> {
							def.reject(err);
						})
					break;
				}
			}

			return def;
		}
		// CallBack chiamato quando la connessione si interrompe
		This.OnPeerHangUpCallback = function (ClosedByRemoteSide) { };

		This.DataChannel =
			{
				Events:
				{
					ON_MESSAGE: "DataChannel_OnMessage",
					ON_OPEN: "DataChannel_OnOpen",
					ON_CLOSE: "DataChannel_OnClose",
					ON_ERROR: "DataChannel_OnError",
				},

				CLOSING_MESSAGE: "REMOTE_SIDE_CLOSING",

				Handle: null,

				Init: function (DataChannel) {
					This.DataChannel.Handle = DataChannel;
					if (This.DataChannel.Handle == null)
						return;

					This.DataChannel.Handle.onmessage = function (event) {
						//WebRTC.Info("DataChannel.onmessage");
						var Message = event.data;
						if (Message == This.DataChannel.CLOSING_MESSAGE)
							This.OnPeerHangUpCallback(true);
						else {
							$(This.DataChannel).trigger(This.DataChannel.Events.ON_MESSAGE, { "Message": Message });
							This.DataChannel.OnMessage(Message);
						}
					}
					This.DataChannel.Handle.onopen = function (event) {
						//WebRTC.Info("DataChannel.onopen");
						$(This.DataChannel).trigger(This.DataChannel.Events.ON_OPEN, { "evt": event });
					};
					This.DataChannel.Handle.onclose = function (event) {
						//WebRTC.Info("DataChannel.onclose");
						$(This.DataChannel).trigger(This.DataChannel.Events.ON_CLOSE, { "evt": event });
					};
					This.DataChannel.Handle.onerror = function (error) {
						//WebRTC.Info("DataChannel.onerror");
						$(This.DataChannel).trigger(This.DataChannel.Events.ON_ERROR, { "err": error });
					};
				},

				Release: function () {
					This.DataChannel.SendMessage(This.DataChannel.CLOSING_MESSAGE);
					This.DataChannel.Handle = null;
				},

				SendMessage: function (Data) {
					try {
						if (This.DataChannel.Handle != null && This.DataChannel.Handle.readyState == 'open')
							This.DataChannel.Handle.send(Data);
					}
					catch (Ex) {
						WebRTC.Error("DataChannel.SendMessage - Exception: " + Ex.message);
					}
				},

				OnMessage: function (Message) {

				},
			}

		return This;
	}
};
