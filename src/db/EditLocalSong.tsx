import {
  FaCopy,
  FaGoogle,
  FaMagnifyingGlass,
  FaRegStar,
  FaStar,
  FaXmark,
  FaYoutube,
} from "react-icons/fa6"
import { groupColorMap } from "../group"
import { LocalSong, saveSong, updateSong } from "./song"
import { useEffect, useMemo } from "react"
import { Control, useController, useForm, useWatch } from "react-hook-form"
import cx from "classnames"

import "./EditLocalSong.css"

export interface EditLocalSongProps {
  song: LocalSong
  onChange: (song: LocalSong) => void
  onClose: () => void
}

type LocalSongForm = Omit<LocalSong, "id" | "isNonLocal" | "practiceCount">

export function EditLocalSong({ song, onChange, onClose }: EditLocalSongProps) {
  const { register, handleSubmit, setValue, control } = useForm({
    defaultValues: {
      title: song.title,
      artist: song.artist,
      group: song.group,
      bpm: song.bpm,
      videoUrl: song.videoUrl,
      youtubeUrl: song.youtubeUrl,
      proficiency: song.proficiency,
    } as LocalSongForm,
  })

  useEffect(() => {
    setValue("title", song.isNonLocal ? "" : song.title)
    setValue("artist", song.artist)
    setValue("group", song.group)
    setValue("bpm", song.bpm)
    setValue("videoUrl", song.videoUrl)
    setValue("youtubeUrl", song.youtubeUrl)
    setValue("proficiency", song.proficiency)
  }, [song])

  const onSubmit = (data: LocalSongForm) => {
    const newSong = {
      ...data,
      id: song.id,
      practiceCount: song.practiceCount,
      bpm: parseInt(data.bpm as unknown as string),
    }
    if (song.isNonLocal) {
      saveSong(newSong)
    } else {
      updateSong(newSong)
    }
    onChange(newSong)
  }

  const suggestedTitle = useMemo(() => {
    // remove tags
    return song.title
      .replace(/\[.*?\]|【.*?】/g, "")
      .trim()
      .split(/ [|-] |｜/)
  }, [song.title])

  return (
    <div className="edit-song-modal">
      <button className="icon-btn edit-modal-close" onClick={onClose}>
        <FaXmark />
      </button>
      <div className="modal-header">{song.isNonLocal ? "添加至本地歌曲" : "编辑歌曲"}</div>
      {song.isNonLocal && (
        <div className="wrap-label">
          <label>提取后标题</label>
          {suggestedTitle.map((title, i) => (
            <div className="suggested-title" key={i}>
              {title}
              <button className="icon-btn" onClick={() => navigator.clipboard.writeText(title)}>
                <FaCopy />
              </button>
              <a
                className="icon-btn"
                href={`https://www.google.com/search?q=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noreferrer"
              >
                <FaGoogle />
              </a>
              <a
                className="icon-btn"
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noreferrer"
              >
                <FaYoutube />
              </a>
              <a
                className="icon-btn"
                href={`https://www.baidu.com/s?wd=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noreferrer"
              >
                百度
              </a>
            </div>
          ))}
        </div>
      )}
      <form className="local-song-form" onSubmit={handleSubmit(onSubmit)}>
        <WrapLabel label="标题" long>
          <input type="text" placeholder="Title" {...register("title", { required: true })} />
        </WrapLabel>
        <WrapLabel label="艺术家" long>
          <input type="text" placeholder="Artist" {...register("artist", { required: true })} />
        </WrapLabel>
        <WrapLabel label="编组">
          <select {...register("group", { required: true })}>
            {Object.keys(groupColorMap).map(group => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </WrapLabel>
        <WrapLabel label="BPM">
          <input type="number" placeholder="BPM" {...register("bpm")} />
          <TuneBatSearch control={control} />
        </WrapLabel>
        <WrapLabel label="熟练度">
          <RateStar name="proficiency" control={control} />
        </WrapLabel>
        <WrapLabel label="视频下载链接" long>
          <input type="text" placeholder="Video Download URL" {...register("videoUrl")} />
        </WrapLabel>
        <WrapLabel label="Youtube链接" long>
          <input type="text" placeholder="Youtube URL" {...register("youtubeUrl")} />
        </WrapLabel>
        <button type="submit">保存</button>
      </form>
    </div>
  )
}

interface RateStarProps {
  name: keyof LocalSongForm
  control: Control<LocalSongForm>
}

function RateStar({ name, control }: RateStarProps) {
  const {
    field: { value, onChange },
  } = useController({ name, control })
  return (
    <div className="rate-star">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} onClick={() => onChange(i + 1)}>
          {i < (value as number) ? <FaStar /> : <FaRegStar />}
        </span>
      ))}
    </div>
  )
}

function TuneBatSearch({ control }: { control: Control<LocalSongForm> }) {
  const title = useWatch({ control, name: "title" })
  const artist = useWatch({ control, name: "artist" })

  return (
    title.length > 0 && (
      <a
        className="icon-btn"
        href={`https://tunebat.com/Search?q=${encodeURIComponent(title + " " + artist)}`}
        target="_blank"
        rel="noreferrer"
      >
        <FaMagnifyingGlass />
      </a>
    )
  )
}

interface WrapLabelProps {
  label: string
  children: React.ReactNode
  long?: boolean
}

function WrapLabel({ label, children, long = false }: WrapLabelProps) {
  return (
    <div
      className={cx("wrap-label", {
        "local-song-field-long": long,
      })}
    >
      <label>{label}</label>
      <div className="wrap-label-field">{children}</div>
    </div>
  )
}
