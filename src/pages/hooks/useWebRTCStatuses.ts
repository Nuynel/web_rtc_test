import {useState} from "react";

const useWebRTCStatuses = () => {
  const [pcTrackState, setPcTrackState] = useState<boolean>(false);
  const [pcSignalingState, setPcSignalingState] = useState<string | null>(null);
  
  const [startVideo, setStartVideo] = useState(true);
  const [startAudio, setStartAudio] = useState(true);
  
  function handleSignalingStateChange(this: RTCPeerConnection) {
    console.log('onsignalingstatechange event')
    setPcSignalingState(this.signalingState)
  }
  
  return {
    pcTrackState,
    pcSignalingState,
    
    startVideo,
    startAudio,
    setStartVideo,
    setStartAudio,
    
    setPcTrackState,
    handleSignalingStateChange
  }
}

export default useWebRTCStatuses;