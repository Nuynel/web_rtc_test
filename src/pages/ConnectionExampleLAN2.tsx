import React, { useEffect, useRef, useState } from "react";

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
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [sdp, setSdp] = useState("");
  const [remoteSdp, setRemoteSdp] = useState("");
  const [isCaller, setIsCaller] = useState(false);
  const [startVideo, setStartVideo] = useState(false);
  const [startAudio, setStartAudio] = useState(false);
  
  // RTCPeerConnection settings
  const [isTrickleICE, setIsTrickleICE] = useState(false);
  
  useEffect(() => {
    console.log(123)
    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;
    
    navigator.mediaDevices.getUserMedia({ video: startVideo, audio: startAudio }).then(stream => {
      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    });
    
    peerConnection.ontrack = event => {
      const [remoteStream] = event.streams;
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
    };
    
    peerConnection.onicecandidate = event => {
      console.log(1, event.candidate, event.candidate?.candidate)
      
      if (event.candidate === null) {
        setSdp(JSON.stringify(peerConnection.localDescription));
      }
    };
  }, [startVideo, startAudio]);
  
  
  const makeOffer = async () => {
    if (!peerConnectionRef.current) return;
    setIsCaller(true);
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
  };
  
  const makeAnswer = async () => {
    if (!peerConnectionRef.current || !remoteSdp) return;
    const offerDesc = new RTCSessionDescription(JSON.parse(remoteSdp));
    await peerConnectionRef.current.setRemoteDescription(offerDesc);
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
  };
  
  const acceptAnswer = async () => {
    if (!peerConnectionRef.current || !remoteSdp) return;
    const answerDesc = new RTCSessionDescription(JSON.parse(remoteSdp));
    await peerConnectionRef.current.setRemoteDescription(answerDesc);
  };
  
  return (
    <div className="p-4 space-y-4 text-sm max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold">Manual WebRTC (Video + Audio)</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Local</h3>
          <video
            ref={localVideo}
            autoPlay
            playsInline
            muted
            className="rounded w-full border"
          />
          <div>
            <button
              onClick={() => setStartVideo(!startVideo)}
            >
              {startVideo ? 'Stop' : 'Start'} video
            </button>
            <button
              onClick={() => setStartAudio(!startAudio)}
            >
              {startAudio ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>
        <div>
          <h3 className="font-medium">Remote</h3>
          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            className="rounded w-full border"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Your SDP</h3>
        <textarea
          value={sdp}
          readOnly
          className="w-full h-40 p-2 border rounded font-mono text-xs"
        />
        {!isCaller && (
          <button
            onClick={makeAnswer}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Create Answer
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Paste remote SDP</h3>
        <textarea
          value={remoteSdp}
          onChange={e => setRemoteSdp(e.target.value)}
          className="w-full h-40 p-2 border rounded font-mono text-xs"
        />
        <div className="flex gap-2">
          <button onClick={makeOffer} className="px-4 py-2 bg-green-500 text-white rounded">Create Offer</button>
          <button onClick={acceptAnswer} className="px-4 py-2 bg-indigo-500 text-white rounded">Accept Answer</button>
        </div>
      </div>
    </div>
  );
}


export default ManualWebRTC