import {useEffect, useState} from "react";
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
    
    pcTrackState,
    pcSignalingState,
    
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
    sendMessage,
  } = useWebRTC()
  
  const {sendWSMessage, isOpen, personalId, sdpIncomingMessage} = useWebSocket('wss://vududu.com:443/signaling')
  // const { sendWSMessage, isOpen, personalId, sdpIncomingMessage } = useWebSocket("ws://localhost:8000/signaling")
  
  const [isRecipientDevice, setIsRecipientDevice] = useState(false)
  const [targetId, setTargetId] = useState('')
  
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
    } catch (e) {
      console.error(e)
    }
  }
  
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
  }, [sdpRemoteDescription]);
  
  const StatsBlock = () => {
    if (!statistics) return null
    return (
      <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {/*<BarChart3 className="w-5 h-5" />*/}
            Connection Statistics
          </h2>
        </div>
        <div className="p-6 max-h-96 overflow-y-auto">
          {Object.entries(statistics).map(([statsType, statsTypeData], id) => {
            const isComplex = ["inbound-rtp", "outbound-rtp", "remote-inbound-rtp", "remote-outbound-rtp"].includes(
              statsType,
            )
            
            return (
              <div key={"statsType" + id} className="mb-6">
                <div className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  {statsType}
                </div>
                <div className="flex gap-4 overflow-x-auto">
                  {statsTypeData.map((report, id) => {
                    if (isComplex) {
                      return (
                        <div key={`stats_${id}`} className="min-w-80">
                          <div className="text-sm font-medium text-gray-600 mb-2">Report {id}</div>
                          <textarea
                            className="w-full h-40 p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly
                            value={report as string}
                          />
                        </div>
                      )
                    }
                    const candidateData = Object.entries(report)
                    return (
                      <div key={`stats_${id}`} className="bg-gray-50 rounded-lg p-4 min-w-64">
                        <div className="text-sm font-medium text-gray-600 mb-2">Report {id}</div>
                        <div className="space-y-1">
                          {candidateData.map((candidate, id2) => (
                            <div key={`stats_${id}_${id2}`} className="text-xs text-gray-700">
                              <span className="font-medium">{candidate[0]}:</span> {candidate[1]}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">WebRTC Connection Demo</h1>
          <p className="text-gray-600">Real-time peer-to-peer communication</p>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Control Panel */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              {/*<Target className="w-5 h-5 text-blue-600" />*/}
              Connection Settings
            </h2>
            
            <ControlPanel
              isOpen={isOpen}
              personalId={personalId}
              startAudio={startAudio}
              setStartAudio={() => setStartAudio(!startAudio)}
              startVideo={startVideo}
              setStartVideo={() => setStartVideo(!startVideo)}
              isRecipientDevice={isRecipientDevice}
              setIsRecipientDevice={() => setIsRecipientDevice(!isRecipientDevice)}
              targetId={targetId}
              setTargetId={setTargetId}
              getStatistics={getStatistics}
            />
            
            {/* Connection Steps */}
            <div className="mt-6">
              {isRecipientDevice ? (
                <RecipientUi
                  acceptCall={acceptCall}
                  // sdpLocalDescription={sdpLocalDescription}
                  sdpRemoteDescription={sdpRemoteDescription}
                  // getUserMedia={getUserMedia}
                  // attachMediaToPeerConnection={attachMediaToPeerConnection}
                  // sendSDPOffer={sendSdpMessage}
                  // attachRemoteSDPOffer={attachRemoteSDPOffer}
                  // createSDPAnswer={createSDPAnswer}
                />
              ) : (
                <CallersUI
                  startCall={startCall}
                  // sdpLocalDescription={sdpLocalDescription}
                  // sdpRemoteDescription={sdpRemoteDescription}
                  // sdpRemoteDescriptionType={sdpRemoteDescriptionType}
                  // getUserMedia={getUserMedia}
                  // attachMediaToPeerConnection={attachMediaToPeerConnection}
                  // createDataChannel={createDataChannel}
                  // createSDPOffer={createSDPOffer}
                  // sendSDPOffer={sendSdpMessage}
                  // attachRemoteSDPOffer={attachRemoteSDPOffer}
                  // sendMessage={sendMessage}
                />
              )}
            </div>
          </div>
          
          {/* Video Section */}
          <div className="xl:col-span-1">
            <Video localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} />
          </div>
          
          {/* Session Description */}
          <div className="xl:col-span-1">
            <SessionDescription
              pcTrackState={pcTrackState}
              pcSignalingState={pcSignalingState}
              sdpLocalDescription={sdpLocalDescription}
              sdpLocalDescriptionType={sdpLocalDescriptionType}
              sdpRemoteDescription={sdpRemoteDescription}
              sdpRemoteDescriptionType={sdpRemoteDescriptionType}
            />
            {/* Statistics */}
            <StatsBlock />
          </div>
        </div>
        
      </div>
    </div>
  )
}


export default ManualWebRTC