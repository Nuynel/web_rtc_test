import type { RefObject } from "react"

type Props = {
  localVideoRef: RefObject<HTMLVideoElement>
  remoteVideoRef: RefObject<HTMLVideoElement>
  personalId: string | null,
  
  sdpRemoteDescription: string
  acceptCall: () => void
  isRecipientUi: boolean
}

const Video = ({ localVideoRef, remoteVideoRef, personalId, acceptCall, sdpRemoteDescription, isRecipientUi }: Props) => {
  const steps = [
    {
      number: 1,
      title: "Принять",
      // description: "Accept incoming connection offer",
      action: acceptCall,
      // icon: <UserCheck className="w-4 h-4" />,
      disabled: !sdpRemoteDescription,
    }
  ]
  
  
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="flex justify-between text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        {/*<Monitor className="w-5 h-5 text-green-600" />*/}
        Video Streams
        <span>ID: {personalId || "Not assigned"}</span>
      </div>
      
      <div className="space-y-6">
        {/* Local Video */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            {/*<Monitor className="w-4 h-4 text-green-600" />*/}
            <h3 className="font-semibold text-green-800">Local Video</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">YOU</span>
          </div>
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>
        
        {/* Remote Video */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            {/*<MonitorSpeaker className="w-4 h-4 text-blue-600" />*/}
            <h3 className="font-semibold text-blue-800">Remote Video</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">PEER</span>
          </div>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            {/* Placeholder when no remote video */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                {/*<MonitorSpeaker className="w-12 h-12 mx-auto mb-2 opacity-50" />*/}
                <p className="text-sm">Waiting for remote video...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isRecipientUi && steps.map((step) => (
        <button
          key={step.number}
          onClick={step.action}
          disabled={step.disabled}
          className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left mt-6 ${
            step.disabled
              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              : "border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 text-purple-800 hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-3">
            {/*<div*/}
            {/*  className={`flex items-center justify-center w-8 h-8 rounded-full ${*/}
            {/*    step.disabled ? "bg-gray-300" : "bg-purple-600"*/}
            {/*  }`}*/}
            {/*>*/}
            {/*  /!*<span className="text-white text-sm font-bold">{step.number}</span>*!/*/}
            {/*</div>*/}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {/*{step.icon}*/}
                <span className="font-medium">{step.title}</span>
              </div>
              {/*<p className="text-sm opacity-75">{step.description}</p>*/}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

export default Video
