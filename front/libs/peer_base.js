import { WebRTC } from "./webrtc";

export class PeerBase {
	
	constructor(PeerUriName, LocalStream) {
		this.UriName = PeerUriName;
		this.LocalStream = LocalStream;
		this.PeerConnection = new WebRTC.PeerConnection(
			this.LocalStream,
			null,
			(param) => this.OnConnectionSuccess(param),
			(param) => this.OnConnectionError(param),
			(param) => this.OnIceCandidate(this.UriName,param),
			(param) =>  this.OnGotRemoteStream(param)
		);	
	}

	CreateOffer(Constraints) {
		return this.PeerConnection.CreateOffer(Constraints);
	}

	CreateAnswer(RemoteSDP) {
		return this.PeerConnection.CreateAnswer(RemoteSDP);
	}

	SetAnswer(RemoteSDP) {
		return this.PeerConnection.SetAnswer(RemoteSDP);
	}

	AddIceCandidate(Candidate) {
		return this.PeerConnection.SetIceCandidate(Candidate);
	}	

	Release() {
		delete this.PeerConnection;
	}

	RunBitrateCalculator() {
		var obj = this;
		var lastBytes = 0;
		var lastTimestamp = 1;
		var fnStats = function(){
			if (obj.PeerConnection == null)
				return setTimeout(fnStats,1000);

			obj.PeerConnection.GetStats()
				.done(function(res){
					res.forEach(report => {
						let bytes;
						let packets;
						if (report.type === 'outbound-rtp') {
							if (!report.isRemote) {
								const now = report.timestamp;
								bytes = report.bytesSent;
								packets = report.packetsSent;
								const BitRateKbps = (8 * (bytes - lastBytes) / (now - lastTimestamp)) / 1024;
								lastBytes = bytes;
								lastTimestamp = now;
								OnBitRateUpdate(BitRateKbps);
							}
						}						
					});

					setTimeout(fnStats,1000);
				})
		};
		setTimeout(fnStats,1000);		
	}

	//:: Event Handlers to be overloaded
	OnConnectionSuccess (RemoteStream) {
		this.RunBitrateCalculator();

	}

	OnConnectionError(Err) {
		console.log("OnConnectionError");
	}

	OnIceCandidate(ToUriName,Candidate) { 
		console.log("OnIceCandidate");
	}
	
	OnRemoteStreamGot(RemoteStream) {
		console.log("OnRemoteStreamGot");
	}	

	OnBitRateUpdate(BitRateKbps) {

	}

	OnGotRemoteStream (RemoteStream) {
		console.log("OnIceCandidate");
	}
}