import cx from "classnames"
import { useEffect, useState } from "react"
import { Song } from "../song"

import "./SongBlock.css"
import { groupColorMap } from "../group"

const timeStampToTime = (timestamp: number) => {
  return `${timestamp / 60 < 10 ? "0" : ""}${Math.floor(timestamp / 60)}:${
    timestamp % 60 < 10 ? "0" : ""
  }${timestamp % 60}`
}

export interface SongBlockProps {
  song: Song
  timeline?: boolean
  show?: boolean
  wait?: number
}

export function SongBlock({ song, timeline, show = true, wait = 0 }: SongBlockProps) {
  const length = song.endTimestamp - song.startTimestamp
  const [countdownText, setCountdownText] = useState("")

  useEffect(() => {
    if (!timeline && wait && show) {
      let running = true
      const fn = async () => {
        for (let i = wait; i >= 0; i--) {
          if (!running) return
          setCountdownText(`${i}`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        setCountdownText("")
      }
      fn()
      return () => {
        running = false
      }
    }
  }, [timeline, wait, show])

  return (
    <div
      className={cx("song-block", {
        "enable-container": timeline,
        show,
      })}
      style={
        timeline
          ? { width: `${length * 1.2}px`, animationDelay: `${song.startTimestamp}ms` }
          : undefined
      }
    >
      <div className="song-info">
        <span
          className={"song-title"}
          style={{
            fontSize: `${timeline ? song.timeline.titleFontSize : 20}px`,
          }}
        >
          {song.title}
          {countdownText && <div className="countdown">{countdownText}</div>}
        </span>
        <span
          className="song-artist"
          style={{
            fontSize: `${timeline ? song.timeline.artistFontSize : 16}px`,
          }}
        >
          {song.artist}
        </span>
      </div>
      {timeline && <div className="song-timestamp">{timeStampToTime(song.startTimestamp)}</div>}
      <div className={`group-tag ${groupColorMap[song.group]}` + (timeline ? "" : " larger")}>
        {song.group}
      </div>
    </div>
  )
}
