import type { RefObject } from "react"

type Props = {
  localVideoRef: RefObject<HTMLVideoElement>
  remoteVideoRef: RefObject<HTMLVideoElement>
  personalId: string | null,
  
  sdpRemoteDescription: string
}

const Video = ({ localVideoRef, remoteVideoRef, personalId, sdpRemoteDescription }: Props) => {
  
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
          <div className="bg-black rounded-lg overflow-hidden aspect-video">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>
        
        {/* Remote Video */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            {/*<MonitorSpeaker className="w-4 h-4 text-blue-600" />*/}
            <h3 className="font-semibold text-blue-800">Remote Video</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">PEER</span>
          </div>
          <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            {/* Placeholder when no remote video */}
            {!sdpRemoteDescription && (<div className="inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                {/*<MonitorSpeaker className="w-12 h-12 mx-auto mb-2 opacity-50" />*/}
                <p className="text-sm">Waiting for remote video...</p>
              </div>
            </div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Video
