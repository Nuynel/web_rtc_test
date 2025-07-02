import {clsx} from "clsx";

type Props = {
  isOpen: boolean,
  ids: {id: string, nickname: string}[],
  setTargetId: (id: string) => void,
  setIsRecipientDevice: () => void,
}

const Peer = ({id, nickname, startCall}: {id: string, nickname: string, startCall: () => void}) => (
  <div
    className='p-3 rounded-lg mb-4 bg-blue-100 border border-blue-200'
  >
    <div className="font-medium items-center flex justify-between text-lg">
      <span className=''>Peer ID: {' '+id}</span>
      <span className=''>Peer Nickname: {' '+nickname}</span>
      <button
        className="w-1/2 text-white font-medium py-3 px-4 bg-green-500 hover:bg-green-400 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        onClick={startCall}
      >
        Call
      </button>
    </div>
  </div>
)

const ControlPanel = ({
  isOpen,
  ids,
  setTargetId,
  setIsRecipientDevice
}: Props) => {
  
  const handleStartCall = (id: string) => {
    setTargetId(id)
    setIsRecipientDevice()
  }
  
  return (
    <div>
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className={clsx('w-5 h-5 rounded-full', isOpen ? ' bg-green-500' : 'bg-red-500')} />
          <span className="font-medium text-gray-700">WebSocket: {isOpen ? "Connected" : "Disconnected"}</span>
        </div>
      
      </div>
      {!ids.length && 'No available peers'}
      {ids.map(({id, nickname}) => (
        <Peer id={id} nickname={nickname} key={id} startCall={() => handleStartCall(id)}/>
      ))}
      
    </div>
  )
}

export default ControlPanel;