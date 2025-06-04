import React, { useEffect } from "react";
import {set} from "react-hook-form";

const CONSTRAINTS = {
    video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
    },
    audio: true,
};

const MainPage = () => {

    const setupDevice = () => {
        console.log('setupDevice invoked');
        navigator.mediaDevices.getUserMedia(CONSTRAINTS)
            .then((stream) => {
                // render local stream on DOM
                const localPlayer = document.getElementById('localPlayer');
                if (!(localPlayer instanceof HTMLVideoElement)) throw new Error('Local stream is not supported');
                localPlayer.srcObject = stream;
                localPlayer.onloadedmetadata = () => {
                    localPlayer.play();
                };
            })
            .catch( (error) => {
                console.error('getUserMedia error:', error);
            });
    };

    useEffect(() => {
        setupDevice()
    }, []);

    return (
        <div>
            <video
                id='localPlayer'
                autoPlay
                className='min-w-10 min-h-10'
            />
        </div>
    )
}

export default MainPage


const servers;
const pcConstraints = {
    'optional': [
        {'DtlsSrtpKeyAgreement': true},
    ],
};

// When user clicks call button, we will create the p2p connection with RTCPeerConnection
const callOnClick = () => {
    console.log('callOnClick invoked');
    if (localStream.getVideoTracks().length > 0) {
        console.log(`Using video device: ${localStream.getVideoTracks()[0].label}`);
    }
    if (localStream.getAudioTracks().length > 0) {
        console.log(`Using audio device: ${localStream.getAudioTracks()[0].label}`);
    }
    localPeerConnection = new RTCPeerConnection(servers, pcConstraints);
    localPeerConnection.onicecandidate = gotLocalIceCandidateOffer;
    localPeerConnection.onaddstream = gotRemoteStream;
    localPeerConnection.addStream(localStream);
    localPeerConnection.createOffer().then(gotLocalDescription);
};
// async function to handle offer sdp
const gotLocalDescription = (offer) => {
    console.log('gotLocalDescription invoked:', offer);
    localPeerConnection.setLocalDescription(offer);
};
// async function to handle received remote stream
const gotRemoteStream = (event) => {
    console.log('gotRemoteStream invoked');
    const remotePlayer = document.getElementById('peerPlayer');
    remotePlayer.srcObject = event.stream;
};
// async function to handle ice candidates
const gotLocalIceCandidateOffer = (event) => {
    console.log('gotLocalIceCandidateOffer invoked', event.candidate, localPeerConnection.localDescription);
    // when gathering candidate finished, send complete sdp
    if (!event.candidate) {
        const offer = localPeerConnection.localDescription;
        // send offer sdp to signaling server via websocket
        sendWsMessage('send_offer', {
            channelName,
            userId,
            sdp: offer,
        });
    }
};

/////////////////////////////////////////////////

import {useRef, useState, useEffect} from 'react';

const URL_WEB_SOCKET = process.env.NEXT_PUBLIC_WEB_SOCKET;
let localStream;
let localPeerConnection;
let sendChannel;
let receiveChannel;

const servers = {'iceServers': []};
const pcConstraints = {
    'optional': [
        {'DtlsSrtpKeyAgreement': true},
    ],
};

const App = () => {
    const [startButtonDisabled, setStartButtonDisabled] = useState(true);
    const [joinButtonDisabled, setJoinButtonDisabled] = useState(true);
    const [callButtonDisabled, setCallButtonDisabled] = useState(true);
    const [hangupButtonDisabled, setHangupButtonDisabled] = useState(true);
    const [sendButtonDisabled, setSendButtonDisabled] = useState(true);
    const [sendMessage, setSendMessage] = useState('');
    const [receiveMessage, setReceiveMessage] = useState('');
    const [channelName, setChannelName] = useState('');
    const [userId, setUserId] = useState(Math.floor(Math.random() * 1000000));
    const [renderLocalStream, setRenderLocalStream]= useState(false);
    const ws = useRef(null);

    useEffect(() => {
        const wsClient = new WebSocket(URL_WEB_SOCKET);
        ws.current = wsClient;

        wsClient.onopen = () => {
            log.debug('ws opened');
            setStartButtonDisabled(false)
        };

        wsClient.onclose = () => log.debug('ws closed');

        return () => {
            wsClient.close();
        };
    }, []);

    useEffect(() => {
        ws.current.onmessage = (message) => {
            log.debug('ws message received', message.data);
            const parsedMessage = JSON.parse(message.data);
            switch (parsedMessage.type) {
                case 'joined': {
                    const body = parsedMessage.body;
                    log.debug('users in this channel', body);
                    break;
                }
                case 'offer_sdp_received': {
                    const offer = parsedMessage.body;
                    onAnswer(offer);
                    break;
                }
                case 'answer_sdp_received': {
                    gotRemoteDescription(parsedMessage.body);
                    break;
                }
                case 'quit': {
                    break;
                }
                default:
                    break;
            }
        };
    }, [channelName, userId]);

    const sendWsMessage = (type, body) => {
        log.debug('sendWsMessage invoked', type, body);
        ws.current.send(JSON.stringify({
            type,
            body,
        }));
    };

    const start = () => {
        log.debug('start invoked');

        setStartButtonDisabled(true);
        setJoinButtonDisabled(false);

        navigator.getUserMedia({audio: true, video: true}, (stream) => {
            log.debug('getUserMedia invoked', stream);
            // render local stream on DOM
            if (renderLocalStream) {
                const localPlayer = document.getElementById('localPlayer');
                localPlayer.srcObject = stream;
            }
            localStream = stream;
        }, (error) => {
            log.error('getUserMedia error:', error);
        });
    };

    const join = () => {
        log.debug('join invoked');

        if (!channelName) {
            log.error('channelName is empty');
            alert('channelName is empty');
            return;
        }

        if (!userId) {
            log.error('userId is empty');
            alert('userId is empty');
            return;
        }

        setJoinButtonDisabled(true);
        setCallButtonDisabled(false);

        sendWsMessage('join', {
            channelName,
            userId,
        });
    };

    const callOnClick = () => {
        log.debug('callOnClick invoked');

        setCallButtonDisabled(true);
        setHangupButtonDisabled(false);

        if (localStream.getVideoTracks().length > 0) {
            log.debug(`Using video device: ${localStream.getVideoTracks()[0].label}`);
        }
        if (localStream.getAudioTracks().length > 0) {
            log.debug(`Using audio device: ${localStream.getAudioTracks()[0].label}`);
        }

        log.debug('new RTCPeerConnection for local');
        localPeerConnection = new RTCPeerConnection(servers, pcConstraints);
        log.debug('setup gotLocalIceCandidateOffer');
        localPeerConnection.onicecandidate = gotLocalIceCandidateOffer;

        log.debug('setup gotRemoteStream');
        localPeerConnection.onaddstream = gotRemoteStream;

        // create data channel before exchange sdp
        createDataChannel();

        log.debug('localPeerConnection.addStream invoked');
        localPeerConnection.addStream(localStream);
        log.debug('localPeerConnection.createOffer invoked');
        localPeerConnection.createOffer().then(gotLocalDescription);
    };

    const hangupOnClick = () => {
        log.debug('hangupOnClick invoked');
        closeDataChannel();
        localPeerConnection.close();
        localPeerConnection = null;
        setHangupButtonDisabled(true);
        setCallButtonDisabled(false);
    };

    // const sendOnClick = () => {
    //     log.debug('sendOnClick invoked', sendMessage);
    //     sendChannel.send(sendMessage);
    //     setSendMessage('');
    // };

    const onAnswer = (offer) => {
        log.debug('onAnswer invoked');
        setCallButtonDisabled(true);
        setHangupButtonDisabled(false);

        if (localStream.getVideoTracks().length > 0) {
            log.debug(`Using video device: ${localStream.getVideoTracks()[0].label}`);
        }
        if (localStream.getAudioTracks().length > 0) {
            log.debug(`Using audio device: ${localStream.getAudioTracks()[0].label}`);
        }

        log.debug('new RTCPeerConnection for local');
        localPeerConnection = new RTCPeerConnection(servers, pcConstraints);
        log.debug('setup gotLocalIceCandidateAnswer');
        localPeerConnection.onicecandidate = gotLocalIceCandidateAnswer;

        log.debug('setup gotRemoteStream');
        localPeerConnection.onaddstream = gotRemoteStream;

        createDataChannel();

        log.debug('localPeerConnection.addStream invoked');
        localPeerConnection.addStream(localStream);

        localPeerConnection.setRemoteDescription(offer);
        localPeerConnection.createAnswer().then(gotAnswerDescription);
    };

    const createDataChannel = () => {
        try {
            log.debug('localPeerConnection.createDataChannel invoked');
            sendChannel = localPeerConnection.createDataChannel('sendDataChannel', {reliable: true});
        } catch (error) {
            log.error('localPeerConnection.createDataChannel failed', error);
        }

        log.debug('setup handleSendChannelStateChange');
        sendChannel.onopen = handleSendChannelStateChange;
        sendChannel.onClose = handleSendChannelStateChange;

        log.debug('setup localPeerConnection.ondatachannel');
        localPeerConnection.ondatachannel = gotReceiveChannel;
    };

    const closeDataChannel = () => {
        log.debug('closeDataChannel invoked');
        sendChannel && sendChannel.close();
        receiveChannel && receiveChannel.close();
        setSendButtonDisabled(true);
    };

    const gotLocalDescription = (offer) => {
        log.debug('gotLocalDescription invoked:', offer);
        localPeerConnection.setLocalDescription(offer);
    };

    const gotAnswerDescription = (answer) => {
        log.debug('gotAnswerDescription invoked:', answer);
        localPeerConnection.setLocalDescription(answer);
    };

    const gotRemoteDescription = (answer) => {
        log.debug('gotRemoteDescription invoked:', answer);
        localPeerConnection.setRemoteDescription(answer);
    };

    const gotRemoteStream = (event) => {
        log.debug('gotRemoteStream invoked');
        const remotePlayer = document.getElementById('peerPlayer');
        remotePlayer.srcObject = event.stream;
    };

    const gotLocalIceCandidateOffer = (event) => {
        log.debug('gotLocalIceCandidateOffer invoked', event.candidate, localPeerConnection.localDescription);

        if (!channelName) {
            log.error('channelName is empty');
            alert('channelName is empty');
            return;
        }

        if (!userId) {
            log.error('userId is empty');
            alert('userId is empty');
            return;
        }

        // gathering candidate finished, send complete sdp
        if (!event.candidate) {
            const offer = localPeerConnection.localDescription;
            sendWsMessage('send_offer', {
                channelName,
                userId,
                sdp: offer,
            });
        }
    };

    const gotLocalIceCandidateAnswer = (event) => {
        log.debug('gotLocalIceCandidateAnswer invoked', event.candidate, localPeerConnection.localDescription);

        if (!channelName) {
            log.error('channelName is empty');
            alert('channelName is empty');
            return;
        }

        if (!userId) {
            log.error('userId is empty');
            alert('userId is empty');
            return;
        }

        // gathering candidate finished, send complete sdp
        if (!event.candidate) {
            const answer = localPeerConnection.localDescription;
            sendWsMessage('send_answer', {
                channelName,
                userId,
                sdp: answer,
            });
        }
    };

    const gotReceiveChannel = (event) => {
        log.debug('gotReceiveChannel invoked');
        receiveChannel = event.channel;
        receiveChannel.onmessage = handleMessage;
        receiveChannel.onopen = handleReceiveChannelStateChange;
        receiveChannel.onclose = handleReceiveChannelStateChange;
    };

    const handleMessage = (event) => {
        log.debug('handleMessage invoked', event.data);
        setReceiveMessage(event.data);
        setSendMessage('');
    };

    const handleSendChannelStateChange = () => {
        const readyState = sendChannel.readyState;
        log.debug('handleSendChannelStateChange invoked', readyState);
        if (readyState === 'open') {
            setSendButtonDisabled(false);
        } else {
            setSendButtonDisabled(true);
        }
    };

    const handleReceiveChannelStateChange = () => {
        const readyState = receiveChannel.readyState;
        log.debug('handleReceiveChannelStateChange invoked', readyState);
    };

    const renderHelper = () => {
        return (
            <div className=''>
                <input
                    placeholder="User ID"
                    style={{width: 240, marginTop: 16}}
                    value={userId}
                    onChange={(event) => {
                        setUserId(event.target.value);
                    }}
                />
                <input
                    placeholder="Channel Name"
                    style={{width: 240, marginTop: 16}}
                    value={channelName}
                    onChange={(event) => {
                        setChannelName(event.target.value);
                    }}
                />
                <button
                    onClick={start}
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                    disabled={startButtonDisabled}
                >
                    Start
                </button>
                <button
                    onClick={join}
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                    disabled={joinButtonDisabled}
                >
                    Join
                </button>
                <button
                    onClick={callOnClick}
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                    disabled={callButtonDisabled}
                >
                    Call
                </button>
                <button
                    danger
                    onClick={hangupOnClick}
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                    disabled={hangupButtonDisabled}
                >
                    Hangup
                </button>
            </div>
        );
    };

    const renderTextarea = () => {
        return (
            <div className=''>
                <textarea
                    onChange={(e) => {
                        setSendMessage(e.target.value);
                    }}
                    style={{width: 240, marginTop: 16}}
                    value={sendMessage}
                    placeholder='Send message'
                />
                <textarea
                    style={{width: 240, marginTop: 16}}
                    value={receiveMessage}
                    placeholder='Receive message'
                    disabled
                />
                <button
                    onClick={sendOnClick}
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                    disabled={sendButtonDisabled}
                >
                    Send Message
                </button>
            </div>
        );
    };

    return (
        <div className=''>
            <div className=''>
                <div>WebRTC</div>
                <p>This is a simple demo app shows how to build a WebRTC app with a signaling server from scratch.</p>
                <div className='' style={{justifyContent: 'space-evenly', width: '50%'}}>
                    {renderHelper()}
                    {renderTextarea()}
                </div>
                <div
                    className=''
                    id="playerContainer"
                >
                    <video
                        id='localPlayer'
                        autoPlay
                        className='w-1/3 h-full'
                    />
                    <video
                        id='remotePlayer'
                        autoPlay
                        className='w-1/3 h-full'
                    />
                </div>
            </div>
        </div>
    );
}