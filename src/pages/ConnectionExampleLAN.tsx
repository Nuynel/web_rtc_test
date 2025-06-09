import { useState } from "react";
import useWebRTC from "#root/src/pages/hooks/useWebRTC";
import Video from "#root/src/pages/components/ui/Video";
import RecipientUi from "#root/src/pages/components/RecipientUI";
import CallersUI from "#root/src/pages/components/CallersUI";
import SessionDescription from "#root/src/pages/components/ui/SessionDescription";

// https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity

const ManualWebRTC = () => {
  const {
    localVideoRef,
    remoteVideoRef,
    
    sdpLocalDescription,
    sdpLocalDescriptionType,
    sdpRemoteDescription,
    sdpRemoteDescriptionType,
    
    setSdpRemoteDescription,
    setSdpRemoteDescriptionType,
    
    pcTrackState,
    pcSignalingState,
    
    startVideo,
    startAudio,
    setStartVideo,
    setStartAudio,
    
    getUserMedia,
    attachMediaToPeerConnection,
    createDataChannel,
    createSDPOffer,
    attachRemoteSDPOffer,
    createSDPAnswer,
    copySDPOffer,
    sendMessage
  } = useWebRTC()
  
  const [isRecipientDevice, setIsRecipientDevice] = useState(false);
  
  return (
    <div className='flex w-screen h-screen justify-around gap-8'>
      <div className='flex flex-col gap-4'>
        <div>
          <input
            checked={startAudio}
            type='checkbox'
            onChange={() => setStartAudio(!startAudio)}
            aria-label='audio'
          />
          <label aria-label='audio'>Use audio</label>
        </div>
        
        <div>
          <input
            checked={startVideo}
            type='checkbox'
            onChange={() => setStartVideo(!startVideo)}
            aria-label='video'
          />
          <label aria-label='video'>Use video</label>
        </div>
        
        <div>
          <input
            checked={isRecipientDevice}
            type='checkbox'
            onChange={() => setIsRecipientDevice(!isRecipientDevice)}
            aria-label='recipient'
          />
          <label aria-label='recipient'>I'm recipient</label>
        </div>
        
        <div className='flex flex-col gap-4'>
          {isRecipientDevice ? (
            <RecipientUi
              sdpLocalDescription={sdpLocalDescription}
              sdpRemoteDescription={sdpRemoteDescription}
              getUserMedia={getUserMedia}
              attachMediaToPeerConnection={attachMediaToPeerConnection}
              copySDPOffer={copySDPOffer}
              attachRemoteSDPOffer={attachRemoteSDPOffer}
              createSDPAnswer={createSDPAnswer}
            />
          ) : (
            <CallersUI
              sdpLocalDescription={sdpLocalDescription}
              sdpRemoteDescription={sdpRemoteDescription}
              sdpRemoteDescriptionType={sdpRemoteDescriptionType}
              getUserMedia={getUserMedia}
              attachMediaToPeerConnection={attachMediaToPeerConnection}
              createDataChannel={createDataChannel}
              createSDPOffer={createSDPOffer}
              copySDPOffer={copySDPOffer}
              attachRemoteSDPOffer={attachRemoteSDPOffer}
              sendMessage={sendMessage}
            />
          )}
        </div>
      </div>
      
      <SessionDescription
        pcTrackState={pcTrackState}
        pcSignalingState={pcSignalingState}
        sdpLocalDescription={sdpLocalDescription}
        sdpLocalDescriptionType={sdpLocalDescriptionType}
        sdpRemoteDescription={sdpRemoteDescription}
        sdpRemoteDescriptionType={sdpRemoteDescriptionType}
        setSdpRemoteDescription={(description) => setSdpRemoteDescription(description)}
        setSdpRemoteDescriptionType={(type) => setSdpRemoteDescriptionType(type)}
      />
      
      <Video localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} />
    </div>
  );
}


export default ManualWebRTC