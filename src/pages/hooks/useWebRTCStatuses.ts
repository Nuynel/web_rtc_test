import {useState} from "react";

const useWebRTCStatuses = () => {
  const [pcTrackState, setPcTrackState] = useState<boolean>(false);
  const [pcSignalingState, setPcSignalingState] = useState<string | null>(null);
  const [iceConnectionState, setIceConnectionState] = useState<string | null>(null);
  
  const [startVideo, setStartVideo] = useState(true);
  const [startAudio, setStartAudio] = useState(true);
  
  function handleSignalingStateChange(this: RTCPeerConnection) {
    console.log('onsignalingstatechange event')
    setPcSignalingState(this.signalingState)
  }
  
  function handleICEConnectionStateChange(this: RTCPeerConnection) {
    console.log("ICE connection state:", this.iceConnectionState);
    setIceConnectionState(this.iceConnectionState)
  }
  
  return {
    pcTrackState,
    pcSignalingState,
    iceConnectionState,
    
    startVideo,
    startAudio,
    setStartVideo,
    setStartAudio,
    
    setPcTrackState,
    handleSignalingStateChange,
    handleICEConnectionStateChange
  }
}

export default useWebRTCStatuses;