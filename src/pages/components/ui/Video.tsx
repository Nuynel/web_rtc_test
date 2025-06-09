import {RefObject} from "react";

type Props = {
  localVideoRef: RefObject<HTMLVideoElement>,
  remoteVideoRef: RefObject<HTMLVideoElement>,
}

const Video = ({localVideoRef, remoteVideoRef}: Props) => {
  
  return (
    <div>
      <div>
        <h3 className="font-medium">Local video</h3>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="rounded w-full border"
        />
      </div>
      <div>
        <h3 className="font-medium">Remote video</h3>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="rounded w-full border"
        />
      </div>
    </div>
  )
}

export default Video