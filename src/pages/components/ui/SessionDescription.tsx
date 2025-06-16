type Props = {
  pcTrackState: boolean
  pcSignalingState: string | null
  sdpLocalDescription: string
  sdpLocalDescriptionType: string
  sdpRemoteDescription: string
  sdpRemoteDescriptionType: RTCSdpType
  
  setSdpRemoteDescription: (type: string) => void
  setSdpRemoteDescriptionType: (type: RTCSdpType) => void
}

const SessionDescription = (
  {
    pcTrackState,
    pcSignalingState,
    sdpLocalDescription,
    sdpLocalDescriptionType,
    sdpRemoteDescription,
    sdpRemoteDescriptionType,
    
    setSdpRemoteDescription,
    setSdpRemoteDescriptionType,
  }: Props) => (
  <div className='flex flex-col max-w-2xl gap-4'>
    <div className={pcTrackState ? 'bg-green-200' : 'bg-red-200' }>
      Track is {!pcTrackState && 'not'} attached to RTCPeerConnection
    </div>
    <div>
      Signaling state: {pcSignalingState || 'NULL, YOU_SHOULD_HANDLE_INIT_STATE'}
    </div>
    <div>
      SDP Local Description type: {sdpLocalDescriptionType || 'UNSETTED'}
    </div>
    <div>
      SDP Local Description:
      <textarea
        value={sdpLocalDescription}
        readOnly
        className="w-full h-40 p-2 border rounded font-mono text-xs"
      />
    </div>
    <div className='flex flex-col'>
      SDP Remote Description Type:
      <select
        value={sdpRemoteDescriptionType}
        onChange={(e) => setSdpRemoteDescriptionType(e.target.value as RTCSdpType)}
      >
        <option value="offer">Offer</option>
        <option value="answer">Answer</option>
        <option value="pranswer">Pranswer</option>
        <option value="rollback">Rollback</option>
      </select>
    
    </div>
    <div>
      SDP Remote Description:
      <textarea
        value={sdpRemoteDescription}
        onChange={e => setSdpRemoteDescription(e.target.value)}
        className="w-full h-40 p-2 border rounded font-mono text-xs"
      />
    </div>
  </div>
)

export default SessionDescription;