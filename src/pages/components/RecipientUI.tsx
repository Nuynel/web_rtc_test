type Props = {
  sdpLocalDescription: string
  sdpRemoteDescription: string
  
  getUserMedia: () => Promise<void>
  attachMediaToPeerConnection: () => void
  copySDPOffer: () => Promise<void>
  attachRemoteSDPOffer: () => Promise<void>
  createSDPAnswer: () => Promise<void>
}

const RecipientUi = (
  {
    sdpLocalDescription,
    sdpRemoteDescription,
    
    getUserMedia,
    attachMediaToPeerConnection,
    copySDPOffer,
    attachRemoteSDPOffer,
    createSDPAnswer,
  }: Props
) => (
  <div className='flex flex-col gap-4'>
    <button
      onClick={attachRemoteSDPOffer}
    >1) Attach Remote SDP Offer</button>
    
    <button
      onClick={getUserMedia}
      disabled={!sdpRemoteDescription}
      className='disabled:opacity-50'
    >2) Capture local Media</button>
    
    <button
      onClick={attachMediaToPeerConnection}
      disabled={!sdpRemoteDescription}
      className='disabled:opacity-50'
    >3) Attach local media to SDP offer</button>
    
    <button
      onClick={createSDPAnswer}
      disabled={!sdpRemoteDescription}
      className='disabled:opacity-50'
    >4) Create SDP answer</button>
    
    <button
      onClick={copySDPOffer}
      disabled={!sdpLocalDescription}
      className='disabled:opacity-50'
    >5) Copy SDP answer</button>
  </div>
)

export default RecipientUi