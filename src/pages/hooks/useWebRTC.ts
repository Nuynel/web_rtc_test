import {useEffect, useRef, useState} from "react";
import useWebRTCStatuses from "#root/src/pages/hooks/useWebRTCStatuses";

const STATISTIC_TYPES = [
  'candidate-pair', 'certificate', 'codec', 'data-channel', 'local-candidate', 'media-source', 'peer-connection', 'remote-candidate', 'transport',
  'inbound-rtp', 'outbound-rtp', 'remote-inbound-rtp', 'remote-outbound-rtp'
] as const

const iceServers = [
  {
    urls: [
      "stun:vududu.com:3478", // обычный STUN
      "turn:vududu.com:3478?transport=udp", // TURN UDP
      "turn:vududu.com:5349?transport=tcp"  // TURN over TLS (если включите)
    ],
    username: "testuser",
    credential: "testpassword"
  }
];

const useWebRTC = () => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localMediaStreamRef = useRef<MediaStream | null>(null);
  
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  
  const [sdpLocalDescription, setSdpLocalDescription] = useState(''); // aka sdpAnswer
  const [sdpLocalDescriptionType, setSdpLocalDescriptionType] = useState(''); // aka sdpAnswerType
  const [sdpRemoteDescription, setSdpRemoteDescription] = useState('');
  const [sdpRemoteDescriptionType, setSdpRemoteDescriptionType] = useState<RTCSdpType>('offer');
  const [statistics, setStatistics] = useState<Record<string, (Record<string, string> | string)[]> | null>(null)
  
  const {
    pcTrackState,
    pcSignalingState,
    
    startVideo,
    startAudio,
    setStartVideo,
    setStartAudio,
    
    setPcTrackState,
    handleSignalingStateChange
  } = useWebRTCStatuses()
  
  function handleLocalCandidatesGathering (this: RTCPeerConnection, event: RTCPeerConnectionIceEvent) {
    console.log('ICE Candidate >>> ', event.candidate?.candidate)
    if (!peerConnectionRef.current?.localDescription) return console.log('Local description is not attached to peerConnection')
    const localDescription = peerConnectionRef.current?.localDescription
    if (event.candidate === null) {
      setSdpLocalDescription(localDescription.sdp)
      setSdpLocalDescriptionType(localDescription.type)
    }
  }
  
  function handleRemoteTrackAttaching (this: RTCPeerConnection, event: RTCTrackEvent) {
    console.log('📡 ontrack, получен поток:', event.streams[0]);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = event.streams[0];
    }
  }
  
  // 0. The caller creates RTCPeerConnection
  useEffect(() => {
    // const peerConnection = new RTCPeerConnection({ iceServers, iceTransportPolicy: 'relay' });
    const peerConnection = new RTCPeerConnection({ iceServers });
    
    peerConnectionRef.current = peerConnection;
    console.log('RTCPeerConnection instance was created in useEffect');
    
    peerConnectionRef.current.onsignalingstatechange = handleSignalingStateChange
    peerConnectionRef.current.onicecandidate = handleLocalCandidatesGathering;
    peerConnectionRef.current.ontrack = handleRemoteTrackAttaching;
    
    peerConnectionRef.current.ondatachannel = (event) => {
      const dc = event.channel;
      console.log("📡 Получен dataChannel:", dc.label);
      dc.onopen = () => console.log("✅ Открыт dataChannel на стороне реципиента");
      dc.onmessage = (e) => console.log("📩 Сообщение:", e.data);
    };
    
    return () => {
      peerConnectionRef.current?.close();
    }
  }, [])
  
  // 1. The caller captures local Media via MediaDevices.getUserMedia
  const getUserMedia = async () => {
    if (!localVideoRef.current) return console.error("LocalMedia ref is null")
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: startVideo, audio: startAudio })
      localVideoRef.current.srcObject = localStream; // local stream attached to video tag
      localMediaStreamRef.current = localStream;
    } catch (e) {
      return console.error('Error while capturing local media stream >>> ', e)
    }
    console.log('LocalMediaStream successfully captured');
  }
  
  // 2. The caller calls RTCPeerConnection.addTrack() (Since addStream is deprecating)
  const attachMediaToPeerConnection = () => {
    if (!peerConnectionRef.current) return console.error('RTCPeerConnection is not created');
    if (!localMediaStreamRef.current) return console.error('LocalMediaStream is not captured');
    localMediaStreamRef.current.getTracks().forEach(track => localMediaStreamRef.current && peerConnectionRef.current?.addTrack(track, localMediaStreamRef.current));
    setPcTrackState(true)
    console.log('LocalMediaStream successfully attached to RTCPeerConnection');
  }
  
  // 3. The caller creates RTCPeerConnection.createDataChannel()
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
  
  // 4. The caller calls RTCPeerConnection.createOffer() to create an offer.
  // 5. The caller calls RTCPeerConnection.setLocalDescription() to set that offer as the local description
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
  
  // 6. The recipient receives the offer and calls RTCPeerConnection.setRemoteDescription() to record it as
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
  
  // 7. The recipient then creates an answer by calling RTCPeerConnection.createAnswer().
  // 8. The recipient calls RTCPeerConnection.setLocalDescription(), passing in the created answer, to set the answer
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
  
  const sendMessage = () => {
    console.log('Tying to send message... ')
    dataChannelRef.current?.send('lol')
  }
  
  const getStatistics = async () => {
    try {
      if (!peerConnectionRef.current) return console.error('RTCPeerConnection is not created');
      const stats = await peerConnectionRef.current.getStats()
      const rtcStats: Record<string, Record<string, string>[]> = {}
      stats.forEach((report) => {
        const t: (Record<string, string> | string)[] | undefined  = rtcStats[report.type]
        const isComplex = ['inbound-rtp', 'outbound-rtp', 'remote-inbound-rtp', 'remote-outbound-rtp'].includes(report.type)
        const preparedReport = isComplex ? JSON.stringify(report) : report
        if (!t) {
          rtcStats[report.type] = [preparedReport]
        } else {
          rtcStats[report.type].push(preparedReport)
        }
      })
      setStatistics(rtcStats)
    } catch (e) {
      console.error('Error while getStatistics error >>> ', e);
    }
  }
  
  return {
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
    sendMessage
  }
}

export default useWebRTC;