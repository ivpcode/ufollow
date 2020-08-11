import $ from  "jquery";
import { WS } from "../libs/ws";
import {PeerBase} from "../libs/peer_base";

import { LitElement, html } from 'lit-element';

class IVPRemoteVideoViewer extends LitElement {
    static get properties() {
        return {
        };
    }

    constructor() {
        super();
        this.wss = new WS();
        this.hPing = null;
        this.LocalStream = null;
        this.LocalUriName = null;

        this.Peers = [];

        this.ConnectionSuccessWatchDog = null;
    }

    render() {
        return html`
            <div class="video-wrapper pure-g">
                <video style="visibility:hidden"
                        autoplay
                        playsinline
                        webkit-playsinline
                        muted
                        
                ></video>
            </div>            
        `;
    }

    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback()

        setTimeout(()=>{
            this.Connect();
        },100);
    }

    disconnectedCallback() {
        if (this.wss !=null)
            this.wss.Close();
        this.wss = null;
        clearTimeout(this.ConnectionSuccessWatchDog);
        this.ConnectionSuccessWatchDog = null;
        clearTimeout(this.hPing);
        this.Peers = [];
        super.disconnectedCallback();
    }

    Connect() {
        clearTimeout(this.ConnectionSuccessWatchDog);
        this.ConnectionSuccessWatchDog = setTimeout(() => {
            this.wss.Close(()=> {
                this.Connect();
            });
        },15000)

        this.LocalUriName = "VIEWER";//_"+(new Date().getTime());

        this.wss = new WS();
        this.wss.OnClose = () => {
            clearTimeout(this.hPing);
        }

        this.wss.OnMessage = (evt) => {
            if (evt.data == "PONG")
                return;

            let oMsg = JSON.parse(evt.data);
            switch(oMsg.CMD)
            {
                case 'ENTER':
                    this.Peers[oMsg.UriName] = new Peer(oMsg.UriName,this.LocalStream,$(this).find("video"),()=> {this.OnConnectSuccess()});
                    this.Peers[oMsg.UriName].OnIceCandidate = (Peer,Candidate)  =>{
                        this.Send({"CMD": 'ICE', "UriName": this.LocalUriName, "ToUriName": Peer.UriName, "Candidate": Candidate});
                    };
                    this.Peers[oMsg.UriName].CreateOffer()
                        .done((RemoteSDP)=>{
                            this.Send({"CMD":"OFFER", "UriName":this.LocalUriName, "ToUriName": oMsg.UriName, "Offer": RemoteSDP});
                        });
                    break;
                case 'EXIT':
                    if (this.Peers[oMsg.UriName] != null)
                    {
                        this.Peers[oMsg.UriName].Release();
                        delete this.Peers[oMsg.UriName];
                    }
                    break;
                case 'OFFER':
                    this.Peers[oMsg.UriName] = new Peer(oMsg.UriName,this.LocalStream,$(this).find("video"), ()=> {this.OnConnectSuccess()});
                    this.Peers[oMsg.UriName].OnIceCandidate = (ToUriName,Candidate) => {
                        this.Send({"CMD": 'ICE', "UriName": this.LocalUriName, "ToUriName": ToUriName, "Candidate": Candidate});
                    };
                    this.Peers[oMsg.UriName].CreateAnswer(oMsg.Offer)
                        .done((Answer) =>{
                            this.Send({"CMD":"ANSWER", "UriName":this.LocalUriName, "ToUriName": oMsg.UriName, "Answer": Answer});
                        });
                    break;
                case 'ANSWER':
                    this.Peers[oMsg.UriName].SetAnswer(oMsg.Answer);
                    break;
                case 'ICE':
                    console.log("ICE from "+oMsg.UriName+" to "+oMsg.ToUriName+ " - I'm: "+this.LocalUriName);
                    if (oMsg.Candidate!=null && oMsg.Candidate!="")
                        this.Peers[oMsg.UriName].AddIceCandidate(oMsg.Candidate);
                    break;
            }
        }

        this.wss.Open("wss://www.solidshape.it/ws?UriName="+this.LocalUriName,"xx",
            () => {
                clearTimeout(this.hPing);
                let fnPing = () =>{
                    if (this.wss != null) {
                        this.wss.Send('PING');
                        this.hPing = setTimeout(fnPing,5000);
                    }
                };
                this.hPing = setTimeout(fnPing,5000);
            },
            () =>{
                clearTimeout(this.hPing);
            });
    }

    Send(oMsg) {
        this.wss.Send(JSON.stringify(oMsg));
    }

    OnConnectSuccess() {
        clearTimeout(this.ConnectionSuccessWatchDog);
        this.ConnectionSuccessWatchDog = null;
        let myEvent = new CustomEvent('ConnectionSuccess',{});
        this.dispatchEvent(myEvent);
    }
}

customElements.define('ivp-remote-video-viewer', IVPRemoteVideoViewer);




class Peer extends PeerBase {

    constructor(PeerUriName, LocalStream, jqVideo, OnConnectionCallBack){
        super(PeerUriName, LocalStream);
        this.RemoteVideoElement = jqVideo;
        this.RemoteVideoElement.css("visibility","hidden");
        this.vCanvas = [];
        this.OnConnectionCallBack = OnConnectionCallBack;
    }

    // Metordi overloadati
    Release() {
        if (this.RemoteVideoElement != null)
            this.RemoteVideoElement.attr("src","");
        super.Release();
    }

    OnConnectionSuccess (RemoteStream) {
        this.RemoteVideoElement[0].srcObject  = RemoteStream;
        this.RemoteVideoElement.on("loadedmetadata", ()=> {
            this.RemoteVideoElement[0].play();
            this.RemoteVideoElement.css("visibility","visible");
            console.log("this.OnConnectionCallBack();");
            this.OnConnectionCallBack();
        });

        super.OnConnectionSuccess(RemoteStream);

        $(this.PeerConnection.DataChannel).on("DataChannel_OnOpen",()=>{
            this.PeerConnection.DataChannel.SendMessage("hello");
        });
    }

}

