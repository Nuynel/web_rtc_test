import {useEffect, useState} from "react";
import useWebRTC from "#root/src/pages/hooks/useWebRTC";
import Video from "#root/src/pages/components/ui/Video";
import RecipientUi from "#root/src/pages/components/RecipientUI";
import CallersUI from "#root/src/pages/components/CallersUI";
import SessionDescription from "#root/src/pages/components/ui/SessionDescription";
import useWebSocket from "#root/src/pages/hooks/useWebSocket";

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
  
  const {sendWSMessage, isOpen, personalId, sdpIncomingMessage} = useWebSocket('wss://vududu.com:443/signaling')
  // const {sendWSMessage, isOpen, personalId, sdpIncomingMessage} = useWebSocket('wss://localhost:8000/signaling')
  
  const [isRecipientDevice, setIsRecipientDevice] = useState(false);
  const [targetId, setTargetId] = useState<string>('');
  
  const sendSdpMessage = () => {
    sendWSMessage({
      id: targetId,
      type: sdpLocalDescriptionType as RTCSdpType,
      description: sdpLocalDescription,
    })
  }
  
  useEffect(() => {
    if (sdpIncomingMessage) {
      const {description, type, id} = sdpIncomingMessage
      if (description) {
        setTargetId(id)
        setSdpRemoteDescription(description)
        setSdpRemoteDescriptionType(type as RTCSdpType)
      }
    }
  }, [sdpIncomingMessage])
  
  return (
    <div className='flex w-screen h-screen justify-around gap-8'>
      <div className='flex flex-col gap-4'>
        
        <div>
          Is WebSocket Open: {isOpen ? 'open' : 'close'}; Personal ID: {personalId}
        </div>
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
        
        <div>
          <input
            value={targetId}
            onChange={e => setTargetId(e.target.value)}
            readOnly={isRecipientDevice}
            aria-label='targetId'
          />
          <label aria-label='targetId'>Target ID</label>
        </div>
        
        <div className='flex flex-col gap-4'>
          {isRecipientDevice ? (
            <RecipientUi
              sdpLocalDescription={sdpLocalDescription}
              sdpRemoteDescription={sdpRemoteDescription}
              getUserMedia={getUserMedia}
              attachMediaToPeerConnection={attachMediaToPeerConnection}
              sendSDPOffer={sendSdpMessage}
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
              sendSDPOffer={sendSdpMessage}
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