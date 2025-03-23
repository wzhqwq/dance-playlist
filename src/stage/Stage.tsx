import { useEffect, useRef, useState } from "react"
import { SongBlock } from "./SongBlock"
import cx from "classnames"
import { useAtom, useAtomValue } from "jotai"
import { animationModeAtom, animationTypeAtom, songClipAtom } from "../atoms"

import "./Stage.css"

export function Stage() {
  const songs = useAtomValue(songClipAtom)
  const animationType = useAtomValue(animationTypeAtom)
  const [animationMode, setAnimationMode] = useAtom(animationModeAtom)

  const [songShown, setSongShown] = useState(-1)
  const [animationClass, setAnimationClass] = useState("")

  const recorderRef = useRef<MediaRecorder | null>(null)
  const [sceneSize, setSceneSize] = useState<[number, number]>([0, 0])

  useEffect(() => {
    setTimeout(() => {
      if (animationType === "show-each") {
        setSceneSize(getShowEachRect())
      } else if (animationType === "show-hide") {
        setSceneSize(getShowAndHideRect())
      } else {
        setSceneSize([0, 0])
      }
    }, 0)
  }, [animationType])

  const beforePlaying =
    animationMode === "record"
      ? async () => {
          // record the current tab using MediaStream Recording API
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              frameRate: 30,
            },
            audio: false,
            // @ts-expect-error outdated type definition
            preferCurrentTab: true,
          })
          const [track] = stream.getTracks()
          // Associate captureTarget with a new RestrictionTarget
          const captureTarget = document.querySelector(".songs-stage")
          // @ts-expect-error outdated type definition
          const restrictionTarget = await RestrictionTarget.fromElement(captureTarget)
          // Start restricting the self-capture video track using the RestrictionTarget.
          // @ts-expect-error outdated type definition
          await track.restrictTo(restrictionTarget);

          const recorder = new MediaRecorder(stream, {
            mimeType: 'video/mp4; codecs="avc1.42E01E"',
            videoBitsPerSecond: 2_500_000,
          })
          const chunks: Blob[] = []
          recorder.ondataavailable = e => {
            chunks.push(e.data)
          }
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/mp4" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = animationType === "show-each" ? "报幕.mp4" : "总览.mp4"
            a.click()
            URL.revokeObjectURL(url)
          }
          recorder.start()
          recorderRef.current = recorder
        }
      : async () => {}
  const afterPlaying = () => {
    if (recorderRef.current) {
      recorderRef.current.stop()
      recorderRef.current = null
    }
    setAnimationMode("")
    setAnimationClass("")
  }

  useEffect(() => {
    if (animationMode == "") return
    if (animationType == "show-each") {
      setAnimationClass("animation-each light")
      let running = true
      const showAndHide = (index: number) => {
        if (index >= songs.length || !running) {
          afterPlaying()
          return
        }
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
        beforePlaying().then(() => {
          showAndHide(0)
        })
      }, 1000)
      return () => {
        running = false
      }
    }
    if (animationType == "show-hide") {
      beforePlaying().then(() => {
        setAnimationClass("animation-showup")
        setTimeout(() => {
          setAnimationClass("animation-hide")
          setTimeout(afterPlaying, 500)
        }, (songs.at(-1)?.startTimestamp ?? 0) + 2000)
      })
    }
  }, [animationMode])

  return (
    <div
      className={cx("songs-stage", animationClass)}
      style={{
        maxWidth: sceneSize[0] || undefined,
        height: sceneSize[1] || undefined,
      }}
    >
      {songs.map((song, index) => (
        <SongBlock
          song={song}
          key={song.id}
          timeline={animationType != "show-each"}
          show={index === songShown}
          wait={index > 0 ? song.startTimestamp - songs[index - 1].endTimestamp : 0}
        />
      ))}
    </div>
  )
}

function getShowAndHideRect() {
  const rects = Array.from(document.getElementsByClassName("song-block")).map((el: Element) =>
    (el as HTMLElement).getBoundingClientRect()
  )
  const maxSize = rects.reduce(
    (acc, rect) => [Math.max(acc[0], rect.right), Math.max(acc[1], rect.bottom)],
    [0, 0]
  ) as [number, number]
  console.log(rects)
  return [maxSize[0] - rects[0].left, maxSize[1] - rects[0].top + 40] as [number, number]
}
function getShowEachRect() {
  const rects = Array.from(document.getElementsByClassName("song-block")).map((el: Element) =>
    (el as HTMLElement).getBoundingClientRect()
  )
  const maxSize = rects.reduce(
    (acc, rect) => [Math.max(acc[0], rect.width), Math.max(acc[1], rect.height)],
    [0, 0]
  ) as [number, number]
  console.log(rects)
  return [maxSize[0], maxSize[1]] as [number, number]
}
