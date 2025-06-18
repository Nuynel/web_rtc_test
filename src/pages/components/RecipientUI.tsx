type Props = {
  // sdpLocalDescription: string
  sdpRemoteDescription: string
  //
  // getUserMedia: () => Promise<void>
  // attachMediaToPeerConnection: () => void
  // sendSDPOffer: () => void
  // attachRemoteSDPOffer: () => Promise<void>
  // createSDPAnswer: () => Promise<void>
  
  acceptCall: () => void
}

const RecipientUi = ({
                       // sdpLocalDescription,
                       sdpRemoteDescription,
                       
                       // getUserMedia,
                       // attachMediaToPeerConnection,
                       // sendSDPOffer,
                       // attachRemoteSDPOffer,
                       // createSDPAnswer,
                       
                       acceptCall
                     }: Props) => {
  const steps = [
    {
      number: 1,
      title: "Принять",
      // description: "Accept incoming connection offer",
      action: acceptCall,
      // icon: <UserCheck className="w-4 h-4" />,
      disabled: !sdpRemoteDescription,
    },
    // {
    //   number: 1,
    //   title: "Receive Offer",
    //   description: "Accept incoming connection offer",
    //   action: attachRemoteSDPOffer,
    //   // icon: <UserCheck className="w-4 h-4" />,
    //   disabled: false,
    // },
    // {
    //   number: 2,
    //   title: "Capture Media",
    //   description: "Access camera and microphone",
    //   action: getUserMedia,
    //   // icon: <Phone className="w-4 h-4" />,
    //   disabled: !sdpRemoteDescription,
    // },
    // {
    //   number: 3,
    //   title: "Attach Media",
    //   description: "Connect media to peer connection",
    //   action: attachMediaToPeerConnection,
    //   // icon: <Headphones className="w-4 h-4" />,
    //   disabled: !sdpRemoteDescription,
    // },
    // {
    //   number: 4,
    //   title: "Create Answer",
    //   description: "Generate SDP answer response",
    //   action: createSDPAnswer,
    //   // icon: <FileText className="w-4 h-4" />,
    //   disabled: !sdpRemoteDescription,
    // },
    // {
    //   number: 5,
    //   title: "Send Answer",
    //   description: "Transmit answer to remote peer",
    //   action: sendSDPOffer,
    //   // icon: <Send className="w-4 h-4" />,
    //   disabled: !sdpLocalDescription,
    // },
  ]
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {/*<UserCheck className="w-5 h-5 text-purple-600" />*/}
        Recipient Steps
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
    </div>
  )
}

export default RecipientUi