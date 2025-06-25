// import { Activity, Wifi, FileText, ArrowRight } from "lucide-react"

type Props = {
  pcTrackState: boolean
  pcSignalingState: string | null
  iceConnectionState: string | null
  sdpLocalDescription: string
  sdpLocalDescriptionType: string
  sdpRemoteDescription: string
  sdpRemoteDescriptionType: RTCSdpType
}

const SessionDescription = ({
                              pcTrackState,
                              pcSignalingState,
                              iceConnectionState,
                              sdpLocalDescription,
                              sdpLocalDescriptionType,
                              sdpRemoteDescription,
                              sdpRemoteDescriptionType,
                            }: Props) => {
  const getSignalingStateColor = (state: string | null) => {
    switch (state) {
      case "stable":
        return "text-green-600 bg-green-100 border-green-200"
      case "have-local-offer":
        return "text-blue-600 bg-blue-100 border-blue-200"
      case "have-remote-offer":
        return "text-purple-600 bg-purple-100 border-purple-200"
      case "have-local-pranswer":
        return "text-yellow-600 bg-yellow-100 border-yellow-200"
      case "have-remote-pranswer":
        return "text-orange-600 bg-orange-100 border-orange-200"
      case "closed":
        return "text-red-600 bg-red-100 border-red-200"
      default:
        return "text-gray-600 bg-gray-100 border-gray-200"
    }
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        {/*<Activity className="w-5 h-5 text-orange-600" />*/}
        Connection Status
      </h2>
      
      <div className="space-y-4">
        {/* Track State */}
        <div
          className={`p-4 rounded-xl border-2 ${
            pcTrackState ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${pcTrackState ? "bg-green-500" : "bg-red-500"}`} />
            <span className="font-medium">Media Track {pcTrackState ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
        
        <div
          className={`p-4 rounded-xl border-2 ${
            iceConnectionState ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${iceConnectionState ? "bg-green-500" : "bg-red-500"}`} />
            <span className="font-medium">Media Track {iceConnectionState || 'unsetted'}</span>
          </div>
        </div>
        
        {/* Signaling State */}
        <div className={`p-4 rounded-xl border-2 ${getSignalingStateColor(pcSignalingState)}`}>
          <div className="flex items-center gap-2">
            {/*<Wifi className="w-4 h-4" />*/}
            <span className="font-medium">Signaling: {pcSignalingState || "Initializing"}</span>
          </div>
        </div>
        
        {/* SDP Descriptions */}
        <div className="grid grid-cols-1 gap-4">
          {/* Local SDP */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              {/*<FileText className="w-4 h-4 text-blue-600" />*/}
              <h4 className="font-semibold text-blue-800">Local SDP</h4>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  sdpLocalDescriptionType ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {sdpLocalDescriptionType || "Not Set"}
              </span>
            </div>
            <textarea
              value={sdpLocalDescription}
              readOnly
              placeholder="Local SDP will appear here..."
              className="w-full h-32 p-3 bg-white/70 border border-blue-200 rounded-lg font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Arrow */}
          <div className="flex justify-center">
            {/*<ArrowRight className="w-6 h-6 text-gray-400" />*/}
          </div>
          
          {/* Remote SDP */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              {/*<FileText className="w-4 h-4 text-purple-600" />*/}
              <h4 className="font-semibold text-purple-800">Remote SDP</h4>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  sdpRemoteDescriptionType ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {sdpRemoteDescriptionType || "Not Set"}
              </span>
            </div>
            <textarea
              value={sdpRemoteDescription}
              readOnly
              placeholder="Remote SDP will appear here..."
              className="w-full h-32 p-3 bg-white/70 border border-purple-200 rounded-lg font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionDescription
