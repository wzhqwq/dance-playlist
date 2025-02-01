import { useAtom } from "jotai"
import { FaXmark } from "react-icons/fa6"
import { playingVideoSrcAtom } from "../atoms"

import "./VideoModal.css"

export function VideoModal() {
  const [src, setSrc] = useAtom(playingVideoSrcAtom)
  return (
    src && (
      <div className="video-modal">
        <button className="icon-btn video-modal-close" onClick={() => setSrc(null)}>
          <FaXmark />
        </button>
        <video src={src} controls autoPlay></video>
      </div>
    )
  )
}

