type Props = {
  sdpLocalDescription: string
  sdpRemoteDescription: string
  sdpRemoteDescriptionType: string
  
  getUserMedia: () => Promise<void>
  attachMediaToPeerConnection: () => void
  createDataChannel: () => void
  createSDPOffer: () => Promise<void>
  sendSDPOffer: () => void
  attachRemoteSDPOffer: () => Promise<void>
  sendMessage: () => void
}

const CallersUI = (
  {
    sdpLocalDescription,
    sdpRemoteDescription,
    sdpRemoteDescriptionType,
    
    getUserMedia,
    attachMediaToPeerConnection,
    createDataChannel,
    createSDPOffer,
    sendSDPOffer,
    attachRemoteSDPOffer,
    sendMessage,
  }: Props
) => (
  <div className='flex flex-col gap-4'>
    <button
      onClick={getUserMedia}
      className='disabled:opacity-50'
    >1) Capture local Media</button>
    
    <button
      onClick={attachMediaToPeerConnection}
      className='disabled:opacity-50'
    >2) Attach local media to SDP offer</button>
    
    <button
      onClick={createDataChannel}
      className='disabled:opacity-50'
    >3) Create Data Channel</button>
    
    <button
      onClick={createSDPOffer}
      className='disabled:opacity-50'
    >4) Create SDP offer</button>
    
    <button
      onClick={sendSDPOffer}
      disabled={!sdpLocalDescription}
      className='disabled:opacity-50'
    >5) Send SDP offer</button>
    
    <button
      onClick={attachRemoteSDPOffer}
      disabled={!sdpRemoteDescription || sdpRemoteDescriptionType === 'offer'}
      className='disabled:opacity-50'
    >6) Attach SDP Answer</button>
    
    <button
      onClick={sendMessage}
      disabled={!sdpRemoteDescription || sdpRemoteDescriptionType === 'offer'}
      className='disabled:opacity-50'
    >7) Send message</button>
  </div>
)

export default CallersUI