import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";

type PeerVideo = {
  peerId: string;
  stream: MediaStream;
};

const MeetingRoom = () => {

  const { code } = useParams();

  const localVideo = useRef<HTMLVideoElement | null>(null);

  const [peers, setPeers] = useState<PeerVideo[]>([]);

  const peerInstance = useRef<Peer | null>(null);

  useEffect(() => {

  startMeeting();

  return () => {
    peerInstance.current?.destroy();
  };

}, []);

  const startMeeting = async () => {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    if (localVideo.current) {
      localVideo.current.srcObject = stream;
    }

    const peer = new Peer();

    peerInstance.current = peer;

    peer.on("open", id => {

      const room = new BroadcastChannel(`room-${code}`);

      room.postMessage({ type: "join", peerId: id });

      room.onmessage = async (event) => {

        const { type, peerId } = event.data;

        if (type === "join" && peerId !== id) {

          const call = peer.call(peerId, stream);

          call.on("stream", remoteStream => {

            setPeers(prev => [
              ...prev,
              { peerId, stream: remoteStream }
            ]);

          });

        }

      };

    });

    peer.on("call", call => {

  call.answer(stream);

  call.on("stream", remoteStream => {

    setPeers(prev => {

      if (prev.find(p => p.peerId === call.peer)) return prev;

      return [
        ...prev,
        { peerId: call.peer, stream: remoteStream }
      ];

    });

  });

});

  };

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-white">

      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-gray-800">

        <h1 className="font-semibold text-lg">
          Face<span className="text-cyan-400">Meet</span>
        </h1>

        <div className="flex items-center gap-3 text-sm">

          <span className="text-green-400">● Live</span>

          <span className="bg-[#18191c] px-3 py-1 rounded-md border border-gray-700">
            {code}
          </span>

        </div>

      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6 overflow-auto">

        <div
          className="grid gap-4 w-full"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))"
          }}
        >

          {/* Local Video */}
          <div className="relative bg-[#0f172a] rounded-xl border border-gray-700 overflow-hidden aspect-video">

            <video
              ref={localVideo}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />

            <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 text-xs rounded">
              You
            </span>

          </div>

          {/* Remote Participants */}
          {peers.map((peer, index) => (
            <RemoteVideo key={index} stream={peer.stream} />
          ))}

        </div>

      </div>

      {/* Controls */}
      <div className="border-t border-gray-800 py-6 flex justify-center">

        <div className="flex gap-6">

          <button className="w-12 h-12 bg-[#1e293b] rounded-full flex items-center justify-center">
            🎤
          </button>

          <button className="w-12 h-12 bg-[#1e293b] rounded-full flex items-center justify-center">
            📹
          </button>

          <button className="w-12 h-12 bg-[#1e293b] rounded-full flex items-center justify-center">
            🖥
          </button>

          <button className="w-12 h-12 bg-[#1e293b] rounded-full flex items-center justify-center">
            ✋
          </button>

          <button className="w-12 h-12 bg-[#1e293b] rounded-full flex items-center justify-center">
            💬
          </button>

          <button
            onClick={() => window.location.href = "/dashboard"}
            className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center"
          >
            📞
          </button>

        </div>

      </div>

    </div>
  );

};

const RemoteVideo = ({ stream }: { stream: MediaStream }) => {

  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {

    if (ref.current) {
      ref.current.srcObject = stream;
    }

  }, [stream]);

  return (
    <div className="relative bg-[#0f172a] rounded-xl border border-gray-700 overflow-hidden aspect-video">

      <video
        ref={ref}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 text-xs rounded">
        Participant
      </span>

    </div>
  );

};

export default MeetingRoom;