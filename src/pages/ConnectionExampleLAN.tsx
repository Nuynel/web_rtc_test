import React, { useEffect, useRef, useState } from "react";

// https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity

// Обмен SDP происходит через сервер сигналинга, с которым оба пира при запуске устанавливают соединение по WebSocket
// Инициирующий соединение Peer_1 начинает настройку соединения через new RTCPeerConnection
// Peer_1 формирует SDP offer
// Peer_1 отправляет SDP offer через сервер сигналинга (trickle ICE - ON)
// Peer_1 начинает сбор ICE candidates
// Peer_2 получает SDP offer
// Peer_2 начинает настройку соединения через new RTCPeerConnection
// Peer_2 формирует SDP answer
// Peer_2 отправляет SDP answer через сервер сигналинга
// Peer_2 начинает сбор ICE candidates
// Оба пира через trickle ICE продолжают обмен ICE кандидатами, формируют пары и запускают проверки
// Инициировавший соединение пир определяет рабочую пару из прошедших проверку пар, устанавливается p2p соединение

const ManualWebRTC = () => {
  const localMediaRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteMediaRef = useRef<HTMLVideoElement | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  
  const [isDeviceRecipient, setIsDeviceRecipient] = useState(false);
  
  const [startVideo, setStartVideo] = useState(true);
  const [startAudio, setStartAudio] = useState(true);
  
  const [pcTrackState, setPcTrackState] = useState<boolean>(false);
  
  const [sdpLocalDescription, setSdpLocalDescription] = useState(''); // aka sdpAnswer
  const [sdpLocalDescriptionType, setSdpLocalDescriptionType] = useState(''); // aka sdpAnswerType
  const [sdpRemoteDescription, setSdpRemoteDescription] = useState('');
  const [sdpRemoteDescriptionType, setSdpRemoteDescriptionType] = useState<RTCSdpType>('offer');
  
  const [pcSignalingState, setPcSignalingState] = useState<string | null>(null);
  const handleSignalingStateChange = () => {
    console.log('onsignalingstatechange event')
    if (peerConnectionRef.current) setPcSignalingState(peerConnectionRef.current.signalingState)
  }
  
  function handleLocalCandidatesGathering (this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) {
    console.log('ICE Candidate >>> ', ev.candidate?.candidate)
    if (ev.candidate === null) {
      setSdpLocalDescription(peerConnectionRef.current?.localDescription?.sdp || '')
      setSdpLocalDescriptionType(peerConnectionRef.current?.localDescription?.type || '')
    }
  }
  
  // 0. The caller creates RTCPeerConnection
  useEffect(() => {
    const peerConnection = new RTCPeerConnection({ iceServers: [] });
    peerConnectionRef.current = peerConnection;
    console.log('RTCPeerConnection instance was created in useEffect');
    
    //////// peerConnectionRef.current.ontrack = handleTrackChange
    peerConnectionRef.current.onsignalingstatechange = handleSignalingStateChange
    peerConnectionRef.current.onicecandidate = handleLocalCandidatesGathering;
    peerConnectionRef.current.ontrack = (event) => {
      console.log('📡 ontrack, получен поток:', event.streams[0]);
      if (remoteMediaRef.current) {
        remoteMediaRef.current.srcObject = event.streams[0];
      }
    };
    
    peerConnectionRef.current.ondatachannel = (event) => {
      const dc = event.channel;
      console.log("📡 Получен dataChannel:", dc.label);
      dc.onopen = () => console.log("✅ Открыт dataChannel на стороне реципиента");
      dc.onmessage = (e) => console.log("📩 Сообщение:", e.data);
    };
  }, [])
  
  // 1. The caller captures local Media via MediaDevices.getUserMedia
  const getUserMedia = async () => {
    if (!localMediaRef.current) return console.error("LocalMedia ref is null")
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: startVideo, audio: startAudio })
      localMediaRef.current.srcObject = localStream; // local stream attached to video tag
      localStreamRef.current = localStream;
    } catch (e) {
      return console.error('Error while capturing local media stream >>> ', e)
    }
    console.log('LocalMediaStream successfully captured');
  }
  
  // 2. The caller calls RTCPeerConnection.addTrack() (Since addStream is deprecating)
  const attachMediaToPeerConnection = () => {
    if (!peerConnectionRef.current) return console.error('RTCPeerConnection is not created');
    if (!localStreamRef.current) return console.error('LocalMediaStream is not captured');
    localStreamRef.current.getTracks().forEach(track => localStreamRef.current && peerConnectionRef.current?.addTrack(track, localStreamRef.current));
    setPcTrackState(true)
    console.log('LocalMediaStream successfully attached to RTCPeerConnection');
  }
  
  // Х)
  const createDataChannel = () => {
    if (!peerConnectionRef.current) return console.error('RTCPeerConnection is not created');
    dataChannelRef.current = peerConnectionRef.current.createDataChannel('myChannel')
    console.log('RTCDataChannel instance was created in useEffect');
    
    dataChannelRef.current.onmessage = (event) => {
      console.log(`received: ${event.data}`);
    };
    
    dataChannelRef.current.onopen = () => {
      console.log("datachannel open");
    };
    
    dataChannelRef.current.onclose = () => {
      console.log("datachannel close");
    };
  }
  
  // 3. The caller calls RTCPeerConnection.createOffer() to create an offer.
  // 4. The caller calls RTCPeerConnection.setLocalDescription() to set that offer as the local description
  //    (that is, the description of the local end of the connection).
  const createSDPOffer = async () => {
    if (!peerConnectionRef.current) return console.error('RTCPeerConnection is not created');
    try {
      const offer = await peerConnectionRef.current.createOffer()
      await peerConnectionRef.current.setLocalDescription(offer)
    } catch (e) {
      return console.error('Error while creating SDP Offer >>> ', e)
    }
    console.log('RTCPeerConnection Offer successfully created and added to RTCPeerConnection');
  }
  
  // 7. The recipient receives the offer and calls RTCPeerConnection.setRemoteDescription() to record it as
  //      the remote description (the description of the other end of the connection).
  const attachRemoteSDPOffer = async () => {
    if (!peerConnectionRef.current) return console.error('RTCPeerConnection is not created');
    try {
      await peerConnectionRef.current.setRemoteDescription({sdp: sdpRemoteDescription, type: sdpRemoteDescriptionType})
    } catch (e) {
      return console.error('Error while attaching Remote SDP offer >>> ', e);
    }
    console.log('Remote SDP Offer successfully attached')
  }
  
  // 9. The recipient then creates an answer by calling RTCPeerConnection.createAnswer().
  // 10. The recipient calls RTCPeerConnection.setLocalDescription(), passing in the created answer, to set the answer
  //     as its local description. The recipient now knows the configuration of both ends of the connection.
  const createSDPAnswer = async () => {
    if (!peerConnectionRef.current) return console.error('RTCPeerConnection is not created');
    try {
      const answer = await peerConnectionRef.current.createAnswer()
      await peerConnectionRef.current.setLocalDescription(answer)
    } catch (e) {
      return console.error('Error while creating SDP Answer >>> ', e)
    }
    console.log('RTCPeerConnection Answer successfully created and added to RTCPeerConnection');
  }
  
  const copySDPOffer = async () => {
    await navigator.clipboard.writeText(sdpLocalDescription)
    console.log('Message attached to clipboard')
  }
  
  const sendMessage = () => {
    console.log('Tying to send message... ')
    dataChannelRef.current?.send('lol')
  }
  
  return (
    <div className='flex w-screen h-screen justify-around gap-8'>
      <div className='flex flex-col gap-4'>
        <div>
          <input
            checked={startAudio}
            type='checkbox'
            onChange={() => setStartAudio(!startAudio)}
            aria-label='audio'
          />
          <label aria-label='audio'>Use audio</label>
        </div>
        
        <div>
          <input
            checked={startVideo}
            type='checkbox'
            onChange={() => setStartVideo(!startVideo)}
            aria-label='video'
          />
          <label aria-label='video'>Use video</label>
        </div>
        
        <div>
          <input
            checked={isDeviceRecipient}
            type='checkbox'
            onChange={() => setIsDeviceRecipient(!isDeviceRecipient)}
            aria-label='recipient'
          />
          <label aria-label='recipient'>I'm recipient</label>
        </div>
        
        {isDeviceRecipient && (
          <button
            onClick={attachRemoteSDPOffer}
          >0) Attach Remote SDP Offer</button>
        )}
        
        <button
          onClick={getUserMedia}
          disabled={isDeviceRecipient && !sdpRemoteDescription}
          className='disabled:opacity-50'
        >1) Capture local Media</button>
        
        <button
          onClick={attachMediaToPeerConnection}
          disabled={isDeviceRecipient && !sdpRemoteDescription}
          className='disabled:opacity-50'
        >2) Attach local media to SDP offer</button>
        
        {!isDeviceRecipient && (
          <button
            onClick={createDataChannel}
            disabled={isDeviceRecipient && !sdpRemoteDescription}
            className='disabled:opacity-50'
          >X) Create Data Channel</button>
        )}
        
        {!isDeviceRecipient && (
          <button
            onClick={createSDPOffer}
            disabled={isDeviceRecipient && !sdpRemoteDescription}
            className='disabled:opacity-50'
          >3) Create SDP offer</button>
        )}
        
        {!isDeviceRecipient && (
          <button
            onClick={copySDPOffer}
            disabled={!sdpLocalDescription}
            className='disabled:opacity-50'
          >4) Copy SDP offer</button>
        )}
        
        {!isDeviceRecipient && (
          <button
            onClick={attachRemoteSDPOffer}
            disabled={!sdpRemoteDescription || sdpRemoteDescriptionType === 'offer'}
            className='disabled:opacity-50'
          >5) Attach SDP Answer</button>
        )}
        
        {!isDeviceRecipient && (
          <button
            onClick={sendMessage}
            disabled={!sdpRemoteDescription || sdpRemoteDescriptionType === 'offer'}
            className='disabled:opacity-50'
          >6) Send message</button>
        )}
        
        {isDeviceRecipient && (
          <button
            onClick={createSDPAnswer}
            disabled={isDeviceRecipient && !sdpRemoteDescription}
            className='disabled:opacity-50'
          >3) Create SDP answer</button>
        )}
        
        {isDeviceRecipient && (
          <button
            onClick={copySDPOffer}
            disabled={!sdpLocalDescription}
            className='disabled:opacity-50'
          >4) Copy SDP answer</button>
        )}
        
      </div>
      
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
          <div>
            <input
              type="checkbox"
              checked={sdpRemoteDescriptionType === 'answer'}
              onChange={e => setSdpRemoteDescriptionType('answer')}
            />Answer
          </div>
          
          <div>
            <input
              type="checkbox"
              checked={sdpRemoteDescriptionType === 'offer'}
              onChange={e => setSdpRemoteDescriptionType('offer')}
            />Offer
          </div>
          
          <div>
            <input
              type="checkbox"
              checked={sdpRemoteDescriptionType === 'pranswer'}
              onChange={e => setSdpRemoteDescriptionType('pranswer')}
            />Pranswer
          </div>
          
          <div>
            <input
              type="checkbox"
              checked={sdpRemoteDescriptionType === 'rollback'}
              onChange={e => setSdpRemoteDescriptionType('rollback')}
            />Rollback
          </div>
        
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
      
      <div>
        <div>
          <h3 className="font-medium">Local video</h3>
          <video
            ref={localMediaRef}
            autoPlay
            playsInline
            muted
            className="rounded w-full border"
          />
        </div>
        <div>
          <h3 className="font-medium">Remote video</h3>
          <video
            ref={remoteMediaRef}
            autoPlay
            playsInline
            className="rounded w-full border"
          />
        </div>
      </div>
    </div>
  );
}


export default ManualWebRTC