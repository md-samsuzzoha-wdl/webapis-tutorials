class PeerService {
    public peer: RTCPeerConnection | null;

    constructor() {
        console.log("Calling PeerService");
        
        // Initialize the peer connection if it doesn't exist
        // This needs to run only once
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478"
                    ]
                }
            ]
        });
    }

    async getOffer(): Promise<RTCSessionDescriptionInit | undefined> {
        if (this.peer) {
            const offer: RTCSessionDescriptionInit = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }


    async getAnswer(offer: RTCSessionDescriptionInit){
        if(this.peer){
            await this.peer.setRemoteDescription(offer);
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(answer);
            return answer;
        }
    }


    async setLocalDescription(answer: RTCSessionDescriptionInit){
        if(this.peer){
            await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }
}

export default PeerService;
