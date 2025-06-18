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

const CallersUI = ({
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
                   }: Props) => {
  const steps = [
    {
      number: 1,
      title: "Capture Media",
      description: "Access camera and microphone",
      action: getUserMedia,
      // icon: <Phone className="w-4 h-4" />,
      disabled: false,
    },
    {
      number: 2,
      title: "Attach Media",
      description: "Connect media to peer connection",
      action: attachMediaToPeerConnection,
      // icon: <Headphones className="w-4 h-4" />,
      disabled: false,
    },
    {
      number: 3,
      title: "Create Channel",
      description: "Set up data communication channel",
      action: createDataChannel,
      // icon: <Radio className="w-4 h-4" />,
      disabled: false,
    },
    {
      number: 4,
      title: "Create Offer",
      description: "Generate SDP offer for connection",
      action: createSDPOffer,
      // icon: <FileText className="w-4 h-4" />,
      disabled: false,
    },
    {
      number: 5,
      title: "Send Offer",
      description: "Transmit offer to remote peer",
      action: sendSDPOffer,
      // icon: <Send className="w-4 h-4" />,
      disabled: !sdpLocalDescription,
    },
    {
      number: 6,
      title: "Attach Answer",
      description: "Process remote peer's response",
      action: attachRemoteSDPOffer,
      // icon: <Link className="w-4 h-4" />,
      disabled: !sdpRemoteDescription || sdpRemoteDescriptionType === "offer",
    },
    {
      number: 7,
      title: "Send Message",
      description: "Test data channel communication",
      action: sendMessage,
      // icon: <MessageSquare className="w-4 h-4" />,
      disabled: !sdpRemoteDescription || sdpRemoteDescriptionType === "offer",
    },
  ]
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {/*<Phone className="w-5 h-5 text-blue-600" />*/}
        Caller Steps
      </h3>
      <div className="space-y-3">
        {steps.map((step) => (
          <button
            key={step.number}
            onClick={step.action}
            disabled={step.disabled}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              step.disabled
                ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                : "border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 text-blue-800 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step.disabled ? "bg-gray-300" : "bg-blue-600"
                }`}
              >
                <span className="text-white text-sm font-bold">{step.number}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {/*{step.icon}*/}
                  <span className="font-medium">{step.title}</span>
                </div>
                <p className="text-sm opacity-75">{step.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CallersUI