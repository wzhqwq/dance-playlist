import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { groupColorMap } from "../group"
import { convertToSeconds, Song } from "../song"
import { convertToTimestamp } from "../song"

import "./EditSong.css"

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
      <button type="submit">Save</button>
    </form>
  )
}
