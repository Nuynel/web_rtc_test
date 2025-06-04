import React, { useEffect, useRef, useState } from "react";

const CONSTRAINTS = {
    video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
    },
    audio: true,
};

const copy = (txt: string) => navigator.clipboard.writeText(txt);
const pill = (ok: boolean) => ok ? "bg-green-500" : "bg-gray-400";

const parse = (cand: string) => {
    const parts = cand.split(" ");
    return {
        addr: parts[4] || "",
        port: parts[5] || "",
        type: parts[parts.indexOf("typ") + 1] || "unknown",
    };
};

type Cand = {
    id: string;              // internal key (stats.id when available, else random)
    candidate: string;       // full a=candidate:… string
    type: string;            // host / srflx / …
    state: string;           // new | succeeded | failed | …
    nominated: boolean;      // chosen pair?
    addr: string;            // parsed IP (for quick matching)
    port: string;            // parsed port
    local: boolean;          // true ⇒ ours, false ⇒ peer
};

const WebRtcAudio = () => {
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const [cands, setCands] = useState<Cand[]>([]);
    const [peerCand, setPeerCand] = useState("");
    const [audioEnabled, setAudioEnabled] = useState(true);

    useEffect(() => {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pcRef.current = pc;

        // 1. Get local audio
        navigator.mediaDevices.getUserMedia(CONSTRAINTS)
            .then(stream => {
                stream.getTracks().forEach(t => pc.addTrack(t, stream));
                // render local stream on DOM
                const localPlayer = document.getElementById('localPlayer');
                if (!(localPlayer instanceof HTMLVideoElement)) throw new Error('Local stream is not supported');
                localPlayer.srcObject = stream;
                localPlayer.onloadedmetadata = () => {
                    localPlayer.play();
                };
            })
            .catch((error) => {
                console.error('getUserMedia error:', error);
            });

        // 2. Gather ICE
        pc.addEventListener("icecandidate", RTC_PeerConnectionEvent => {
            console.log(123, RTC_PeerConnectionEvent.candidate)
            if (!RTC_PeerConnectionEvent.candidate) {
                console.log('No candidates')
                return; // gathering finished
            }
            const parsed = parse(RTC_PeerConnectionEvent.candidate.candidate);
            const entry: Cand = {
                id: RTC_PeerConnectionEvent.candidate.foundation || crypto.randomUUID(),
                candidate: RTC_PeerConnectionEvent.candidate.candidate,
                type: parsed.type,
                state: "new",
                nominated: false,
                addr: parsed.addr,
                port: parsed.port,
                local: true,
            };
            setCands(prev => [...prev, entry]);
        });

        pc.addEventListener("track", (e) => {
            const stream = e.streams[0] ?? new MediaStream([e.track]);
            const remotePlayer = document.getElementById('remotePlayer');
            if (!(remotePlayer instanceof HTMLVideoElement)) throw new Error('Remote stream is not available');
            remotePlayer.srcObject = stream;
            remotePlayer.onloadedmetadata = () => {
                remotePlayer.play();
            };
        });

        // 3. Poll stats once a second
        const t = setInterval(async () => {
            const stats = await pc.getStats();

            setCands(prev => {
                // clone to mutate
                const updated = prev.map(c => ({ ...c }));

                stats.forEach(report => {
                    if (report.type === "candidate-pair") {
                        const pair: any = report;
                        const { state, nominated, localCandidateId, remoteCandidateId } = pair;
                        // helper to update whichever list entry matches id or addr/port
                        const bump = (id: string, isLocal: boolean) => {
                            const candStats: any = stats.get(id);
                            if (!candStats) return;
                            const idx = updated.findIndex(e => (
                                (candStats.address && e.addr === candStats.address && e.port === String(candStats.port)) ||
                                e.id === id
                            ));
                            if (idx !== -1) {
                                updated[idx].state = state;
                                updated[idx].nominated = nominated;
                            }
                        };
                        bump(localCandidateId, true);
                        bump(remoteCandidateId, false);
                    }
                });
                return updated;
            });
        }, 1000);

        return () => clearInterval(t);
    }, []);

    const addPeerCandidate = async () => {
        if (!peerCand.trim() || !pcRef.current) return;
        try {
            const obj = new RTCIceCandidate({ candidate: peerCand, sdpMid: "audio", sdpMLineIndex: 0 });
            await pcRef.current.addIceCandidate(obj);
            const parsed = parse(peerCand);
            setCands(prev => [
                ...prev,
                {
                    id: obj.foundation || crypto.randomUUID(),
                    candidate: peerCand,
                    type: parsed.type,
                    state: "new",
                    nominated: false,
                    addr: parsed.addr,
                    port: parsed.port,
                    local: false,
                },
            ]);
            setPeerCand("");
        } catch (err) {
            console.error(err);
            alert("Failed to add candidate – is remote SDP set?");
        }
    };

    const toggleAudio = () => {
        if (!pcRef.current) return;
        pcRef.current.getSenders().forEach(s => {
            if (s.track?.kind === "audio") {
                s.track.enabled = !s.track.enabled;
                setAudioEnabled(s.track.enabled);
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 text-sm">
            <h1 className="text-2xl font-bold">WebRTC LAN – Audio‑only demo</h1>

            {/* Local candidates */}
            <section className="space-y-2">
                <h2 className="font-semibold">Ваши host‑кандидаты</h2>
                {cands.filter(c => c.local).length === 0 && (
                    <p className="italic text-gray-500">сбор… откройте доступ к микрофону</p>
                )}
                {cands.filter(c => c.local).map(c => (
                    <div key={c.id} className="flex flex-wrap items-center gap-2 bg-gray-100 rounded-lg p-2">
                        <code className="break-all grow text-xs">{c.candidate}</code>
                        <button onClick={() => copy(c.candidate)} className="px-2 py-1 text-white bg-blue-500 hover:bg-blue-600 rounded">copy</button>
                        <span className="px-1 rounded text-white text-xs bg-purple-500">{c.type}</span>
                        <span className={`px-1 rounded text-white text-xs ${pill(c.state === "succeeded")}`}>{c.state}</span>
                        {c.nominated && <span className="px-1 rounded text-white text-xs bg-green-700">selected</span>}
                    </div>
                ))}
            </section>

            {/* Peer candidate input */}
            <section className="space-y-2">
                <h2 className="font-semibold">Добавить host‑candidate пира</h2>
                <div className="flex gap-2">
                    <input
                        value={peerCand}
                        onChange={e => setPeerCand(e.target.value)}
                        placeholder="a=candidate:… typ host"
                        className="flex-grow border rounded p-2"
                    />
                    <button onClick={addPeerCandidate} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">add</button>
                </div>
                {cands.filter(c => !c.local).map(c => (
                    <div key={c.id} className="flex flex-wrap items-center gap-2 bg-gray-100 rounded-lg p-2 mt-1">
                        <code className="break-all grow text-xs">{c.candidate}</code>
                        <span className="px-1 rounded text-white text-xs bg-purple-500">{c.type}</span>
                        <span className={`px-1 rounded text-white text-xs ${pill(c.state === "succeeded")}`}>{c.state}</span>
                        {c.nominated && <span className="px-1 rounded text-white text-xs bg-green-700">selected</span>}
                    </div>
                ))}
            </section>

            {/* Video */}
            <section>
                <div className="flex gap-2 w-full h-24">
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
                <button onClick={toggleAudio} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow">
                    {audioEnabled ? "Mute" : "Unmute"}
                </button>
            </section>
        </div>
    );
}

export default WebRtcAudio