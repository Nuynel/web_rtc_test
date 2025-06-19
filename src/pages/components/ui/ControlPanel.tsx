import {clsx} from "clsx";

type Props = {
  isOpen: boolean,
  personalId: string | null,
  startAudio: boolean,
  setStartAudio: () => void,
  startVideo: boolean,
  setStartVideo: () => void,
  isRecipientDevice: boolean,
  setIsRecipientDevice: () => void,
  targetId: string,
  setTargetId: (id: string) => void,
  getStatistics: () => void,
}

const ControlPanel = ({
  isOpen,
  personalId,
  startAudio,
  startVideo,
  setStartAudio,
  setStartVideo,
  isRecipientDevice,
  setIsRecipientDevice,
  targetId,
  setTargetId,
  getStatistics,
                      }: Props) => (
  <div>
    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <div className={clsx('w-5 h-5 rounded-full', isOpen ? ' bg-green-500' : 'bg-red-500')} />
        <span className="font-medium text-gray-700">WebSocket: {isOpen ? "Connected" : "Disconnected"}</span>
      </div>
      
    </div>
    
    {/* Media Controls */}
    <div className="space-y-4 mb-6">
      {/*<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">*/}
      {/*  <div className="flex items-center gap-2">*/}
      {/*    <label className="font-medium text-gray-700">Audio</label>*/}
      {/*  </div>*/}
      {/*  <button*/}
      {/*    onClick={setStartAudio}*/}
      {/*    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${*/}
      {/*      startAudio ? "bg-green-500" : "bg-gray-300"*/}
      {/*    }`}*/}
      {/*  >*/}
      {/*            <span*/}
      {/*              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${*/}
      {/*                startAudio ? "translate-x-6" : "translate-x-1"*/}
      {/*              }`}*/}
      {/*            />*/}
      {/*  </button>*/}
      {/*</div>*/}
      
      {/*<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">*/}
      {/*  <div className="flex items-center gap-2">*/}
      {/*    <label className="font-medium text-gray-700">Video</label>*/}
      {/*  </div>*/}
      {/*  <button*/}
      {/*    onClick={setStartVideo}*/}
      {/*    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${*/}
      {/*      startVideo ? "bg-green-500" : "bg-gray-300"*/}
      {/*    }`}*/}
      {/*  >*/}
      {/*            <span*/}
      {/*              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${*/}
      {/*                startVideo ? "translate-x-6" : "translate-x-1"*/}
      {/*              }`}*/}
      {/*            />*/}
      {/*  </button>*/}
      {/*</div>*/}
      
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <label className="font-medium text-gray-700">Device Role</label>
        <button
          onClick={setIsRecipientDevice}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isRecipientDevice ? "bg-purple-500" : "bg-blue-500"
          }`}
        >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isRecipientDevice ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
        </button>
      </div>
    </div>
    
    {/* Role Indicator */}
    <div
      className={`p-3 rounded-lg mb-4 ${
        isRecipientDevice ? "bg-purple-100 border border-purple-200" : "bg-blue-100 border border-blue-200"
      }`}
    >
      <div className="text-sm font-medium text-gray-700">
        Current Role:{" "}
        <span className={isRecipientDevice ? "text-purple-600" : "text-blue-600"}>
                  {isRecipientDevice ? "Recipient" : "Caller"}
                </span>
      </div>
    </div>
    
    {/* Target ID Input */}
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Target ID</label>
      <input
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
        readOnly={isRecipientDevice}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          isRecipientDevice ? "bg-gray-100 cursor-not-allowed" : "bg-white"
        }`}
        placeholder="Enter target device ID"
      />
    </div>
    
    {/* Statistics Button */}
    <button
      onClick={getStatistics}
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
    >
      {/*<BarChart3 className="w-4 h-4" />*/}
      Get Statistics
    </button>
  </div>
)

export default ControlPanel;