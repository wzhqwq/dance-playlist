import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { groupColorMap } from "../group"
import { convertToSeconds, Song } from "../song"
import { convertToTimestamp } from "../song"

import "./EditSong.css"
import { FaMinus, FaPlus } from "react-icons/fa6"

export function EditSong({ song, onChange }: { song: Song; onChange: (song: Song) => void }) {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      title: song.title,
      artist: song.artist,
      group: song.group,
      bpm: song.bpm,
      startTimestamp: convertToTimestamp(song.startTimestamp),
      endTimestamp: convertToTimestamp(song.endTimestamp),
    },
  })

  useEffect(() => {
    setValue("title", song.title)
    setValue("artist", song.artist)
    setValue("group", song.group)
    setValue("bpm", song.bpm)
    setValue("startTimestamp", convertToTimestamp(song.startTimestamp))
    setValue("endTimestamp", convertToTimestamp(song.endTimestamp))
  }, [song])

  const onSubmit = (data: any) => {
    onChange({
      ...song,
      ...data,
      startTimestamp: convertToSeconds(data.startTimestamp),
      endTimestamp: convertToSeconds(data.endTimestamp),
    })
  }

  return (
    <>
      <form className="song-form" onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="Title" {...register("title")} />
        <input type="text" placeholder="Artist" {...register("artist")} />
        <select {...register("group")}>
          {Object.keys(groupColorMap).map(group => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
        <div className="timestamp">
          <input type="text" placeholder="Start Timestamp" {...register("startTimestamp")} />
          <input type="text" placeholder="End Timestamp" {...register("endTimestamp")} />
        </div>
        <input type="number" placeholder="BPM" {...register("bpm")} />
        <button type="submit">Save</button>
      </form>
      <div className="timeline-config">
        <div className="font-size-config">
          <button
            className="icon-btn"
            onClick={() =>
              onChange({
                ...song,
                timeline: {
                  ...song.timeline,
                  titleFontSize: song.timeline.titleFontSize - 1,
                },
              })
            }
          >
            <FaMinus />
          </button>
          <span>标题{song.timeline.titleFontSize}px</span>
          <button
            className="icon-btn"
            onClick={() =>
              onChange({
                ...song,
                timeline: {
                  ...song.timeline,
                  titleFontSize: song.timeline.titleFontSize + 1,
                },
              })
            }
          >
            <FaPlus />
          </button>
        </div>
        <div className="font-size-config">
          <button
            className="icon-btn"
            onClick={() =>
              onChange({
                ...song,
                timeline: {
                  ...song.timeline,
                  artistFontSize: song.timeline.artistFontSize - 1,
                },
              })
            }
          >
            <FaMinus />
          </button>
          <span>艺术家{song.timeline.artistFontSize}px</span>
          <button
            className="icon-btn"
            onClick={() =>
              onChange({
                ...song,
                timeline: {
                  ...song.timeline,
                  artistFontSize: song.timeline.artistFontSize + 1,
                },
              })
            }
          >
            <FaPlus />
          </button>
        </div>
      </div>
    </>
  )
}
