import { useEffect, useState } from "react"
import { SongBlock } from "./SongBlock"
import cx from "classnames"
import { useAtomValue } from "jotai"
import { animationTypeAtom, songClipAtom } from "../atoms"

import "./Stage.css"

export function Stage() {
  const songs = useAtomValue(songClipAtom)
  const animationType = useAtomValue(animationTypeAtom)

  const [songShown, setSongShown] = useState(-1)

  useEffect(() => {
    if (animationType == 3) {
      let running = true
      const showAndHide = (index: number) => {
        if (index >= songs.length || !running) return
        const wait = index > 0 ? songs[index].startTimestamp - songs[index - 1].endTimestamp : 0
        setSongShown(index)
        setTimeout(() => {
          setSongShown(-1)
          setTimeout(() => {
            showAndHide(index + 1)
          }, 500)
        }, 2000 + wait * 1000)
      }
      setTimeout(() => {
        showAndHide(0)
      }, 1000)
      return () => {
        running = false
      }
    }
  }, [animationType])

  return (
    <div
      className={cx("songs-stage", {
        "animation-showup": animationType === 1,
        "animation-hide": animationType === 2,
        "animation-each light": animationType === 3,
      })}
    >
      {songs.map((song, index) => (
        <SongBlock
          song={song}
          key={song.id}
          timeline={animationType != 3}
          show={index === songShown}
          wait={index > 0 ? song.startTimestamp - songs[index - 1].endTimestamp : 0}
        />
      ))}
    </div>
  )
}
