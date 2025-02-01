import { useSetAtom } from "jotai"
import { groupColorMap } from "../group"
import { getSongSrc, PyPySong } from "./api"

import "./Song.css"
import { playingVideoSrcAtom } from "../atoms"
import { FaPlay, FaYoutube } from "react-icons/fa6"

export interface PyPySongEntryProps {
  song: PyPySong
}

export function PyPySongEntry({ song }: PyPySongEntryProps) {
  const setPlayingSrc = useSetAtom(playingVideoSrcAtom)

  return (
    <div className="pypy-song-entry">
      <div className="pypy-song-info">
        <div className="pypy-song-id">#{song.id}</div>
        <div className={`pypy-song-group ${groupColorMap[song.group]}`}>{song.group}</div>
        <div className="pypy-song-name">{song.name}</div>
      </div>
      <div className="pypy-song-action">
        <button className="icon-btn" onClick={() => setPlayingSrc(getSongSrc(song.id))}>
          <FaPlay />
        </button>
        {song.originalUrl.length > 0 && (
          <a className="icon-btn" href={song.originalUrl[0]} target="_blank" rel="noreferrer">
            <FaYoutube />
          </a>
        )}
      </div>
    </div>
  )
}
