import {ReactNode, useEffect, useState} from "react";
import useWebRTC from "#root/src/pages/hooks/useWebRTC";
import Video from "#root/src/pages/components/ui/Video";
import RecipientUi from "#root/src/pages/components/RecipientUI";
import CallersUI from "#root/src/pages/components/CallersUI";
import SessionDescription from "#root/src/pages/components/ui/SessionDescription";
import useWebSocket from "#root/src/pages/hooks/useWebSocket";
import ControlPanel from "#root/src/pages/components/ui/ControlPanel";

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
    setSdpLocalDescription,
    
    pcTrackState,
    pcSignalingState,
    iceConnectionState,
    
    startVideo,
    startAudio,
    setStartVideo,
    setStartAudio,
    
    statistics,
    getStatistics,
    
    getUserMedia,
    attachMediaToPeerConnection,
    createDataChannel,
    createSDPOffer,
    attachRemoteSDPOffer,
    createSDPAnswer,
    
    isRecipientDevice,
    setIsRecipientDevice,
    cancelCall,
    restartWebRTC
  } = useWebRTC()
  
  const {sendWSMessage, isOpen, personalId, sdpIncomingMessage, setSdpIncomingMessage, ids, isRejected, setIsRejected } = useWebSocket('wss://vududu.com:443/signaling')
  // const { sendWSMessage, isOpen, personalId, sdpIncomingMessage, setSdpIncomingMessage, ids, isRejected, setIsRejected } = useWebSocket("ws://localhost:56565/signaling")
  
  const [targetId, setTargetId] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [nickname, setNickname] = useState("")
  
  const sendSdpMessage = () => {
    sendWSMessage({
      id: targetId,
      type: sdpLocalDescriptionType as RTCSdpType,
      description: sdpLocalDescription,
    })
  }
  
  const startCall = async () => {
    try {
      await getUserMedia()
      attachMediaToPeerConnection()
      createDataChannel()
      await createSDPOffer()
    } catch (e) {
      console.error(e)
    }
  }
  
  const acceptCall = async () => {
    try {
      await attachRemoteSDPOffer()
      await getUserMedia()
      attachMediaToPeerConnection()
      await createSDPAnswer()
      setIsInitialized(true)
    } catch (e) {
      console.error(e)
    }
  }
  
  const rejectCall = async () => {
    try {
      setSdpIncomingMessage(null)
      setTargetId('')
      setSdpRemoteDescription('')
      setSdpRemoteDescriptionType('offer')
      sendWSMessage({
        id: targetId,
        type: 'reject',
      })
    } catch (e) {
      console.error(e)
    }
  }
  
  useEffect(() => {
    if (!isRecipientDevice && targetId) startCall()
  }, [targetId])
  
  useEffect(() => {
    if (restartWebRTC) {
      setTargetId('')
      setIsInitialized(false)
    }
  }, [restartWebRTC])
  
  useEffect(() => {
    if (isRejected && targetId) {
      cancelCall()
      setIsRejected(false)
      setTargetId('')
      setIsInitialized(false)
    }
  }, [isRejected])
  
  useEffect(() => {
    if (sdpIncomingMessage) {
      const { description, type, id } = sdpIncomingMessage
      if (description) {
        setTargetId(id)
        setSdpRemoteDescription(description)
        setSdpRemoteDescriptionType(type as RTCSdpType)
      }
    }
  }, [sdpIncomingMessage])
  
  useEffect(() => {
    sendSdpMessage()
  }, [sdpLocalDescription]);
  
  useEffect(() => {
    if (!isRecipientDevice) attachRemoteSDPOffer().catch(e => console.error(e))
    if (isInitialized) acceptCall().catch(e => console.error(e))
  }, [sdpRemoteDescription]);
  
  const updateNickname = () => {
    sendWSMessage({
      id: '',
      type: 'update_nickname',
      description: nickname,
    })
  }
  
  const Background = (props: {children: ReactNode}) => (
    <div className='h-screen w-screen fixed bg-gray-600 bg-opacity-40 flex justify-center items-center top-0 left-0'>
      {props.children}
    </div>
  )
  
  const CallAlert = () => (
    <div className='bg-white rounded-2xl w-1/3 z-20 p-4'>
      Вызов от: <span className='text-gray-400'>{targetId}</span>
      <div className='flex items-center justify-center gap-4 mt-4'>
        <button
          className="w-1/2 text-white font-medium py-3 px-4 bg-green-500 hover:bg-green-400 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          onClick={acceptCall}
        >
          Принять
        </button>
        <button
          className="w-1/2 text-white font-medium py-3 px-4 bg-red-500 hover:bg-red-400 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          onClick={rejectCall}
        >
          Отклонить
        </button>
      </div>
    </div>
  )
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">WebRTC Connection Demo</h1>
          <p className="text-gray-600">Real-time peer-to-peer communication</p>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div className="xl:col-span-1">
            <div className="bg-gray-100 rounded-2xl shadow-xl border border-gray-200 p-6 mb-6 flex gap-6 items-center flex-wrap max-w-[100vw]">
              Nickname:
              <input
                className="bg-white rounded-lg shadow-xl border border-gray-100 flex-grow p-2"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <button
                className="text-white font-medium py-2 px-4 bg-green-500 hover:bg-green-400 rounded-lg transition-all duration-200 flex items-center justify-center"
                onClick={updateNickname}
              >Update nickname</button>
            </div>
            <Video
              localVideoRef={localVideoRef}
              remoteVideoRef={remoteVideoRef}
              personalId={personalId}
              sdpRemoteDescription={sdpRemoteDescription}
              acceptCall={acceptCall}
              isRecipientUi={isRecipientDevice}
            />
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              Connection Settings
            </h2>
            <ControlPanel
              isOpen={isOpen}
              ids={ids}
              setTargetId={setTargetId}
              setIsRecipientDevice={() => setIsRecipientDevice(false)}
            />
          </div>
        </div>
        
        {isRecipientDevice && sdpIncomingMessage && targetId && !isInitialized && (
          <Background>
            <CallAlert/>
          </Background>
        )}
        
      </div>
    </div>
  )
}


export default ManualWebRTC