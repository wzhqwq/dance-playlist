import {
  FaCircleMinus,
  FaCopy,
  FaFloppyDisk,
  FaMinus,
  FaPen,
  FaPlay,
  FaPlus,
  FaRegStar,
  FaStar,
  FaYoutube,
} from "react-icons/fa6"
import { PiMicrophoneStageFill } from "react-icons/pi"
import { groupColorMap, groupShortMap } from "../group"
import { useMemo, useState } from "react"
import { useAtom, useSetAtom } from "jotai"
import { playingVideoSrcAtom, songClipAtom } from "../atoms"
import { EditLocalSong } from "./EditLocalSong"
import { Song } from "../song"
import { LocalSong, SongOrder } from "./types"

import "./LocalSongEntry.css"

export interface LocalSongEntryProps {
  song?: LocalSong
  order?: SongOrder
  onDelete?: () => void
  onChange: (song: LocalSong) => void
}

export function LocalSongEntry(props: LocalSongEntryProps) {
  const { order, onDelete, onChange } = props
  const song = props.song ?? order?.song
  const setPlayingSrc = useSetAtom(playingVideoSrcAtom)

  const [showEdit, setShowEdit] = useState(false)

  if (!song) return null

  return (
    <div className="song-entry">
      <div className={`group-stride ${groupColorMap[song.group]}`}></div>
      <div className="local-song-info">
        {order && (
          <div className="local-song-order">
            <span>{order.startTime.toLocaleTimeString()}</span>
            <span>由 {order.username} 点歌</span>
          </div>
        )}
        <span>{groupShortMap[song.group] && `[${groupShortMap[song.group]}]`}</span>
        {song.isNonLocal ? (
          <span>{song.title}</span>
        ) : (
          <>
            <span>
              {song.title}
              <FaCopy
                onClick={() => {
                  navigator.clipboard.writeText(`[${song.bpm}] ${song.title}`)
                }}
              />
            </span>
            <div className="local-song-detail">
              <PiMicrophoneStageFill />
              {song.artist}
              <label>BPM</label>
              {song.bpm}
              <label>熟练度</label>
              <div className="rate-star">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>{i < song.proficiency ? <FaStar /> : <FaRegStar />}</span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="local-song-action">
        {song.isNonLocal ? (
          <button
            className="icon-btn delete-btn"
            onClick={e => {
              e.stopPropagation()
              setShowEdit(true)
            }}
          >
            <FaFloppyDisk />
          </button>
        ) : (
          <button
            className="icon-btn"
            onClick={e => {
              e.stopPropagation()
              setShowEdit(true)
            }}
          >
            <FaPen />
          </button>
        )}
        {song.videoUrl && (
          <button className="icon-btn" onClick={() => setPlayingSrc(song.videoUrl)}>
            <FaPlay />
          </button>
        )}
        {song.youtubeUrl && (
          <a className="icon-btn" href={song.youtubeUrl} target="_blank" rel="noreferrer">
            <FaYoutube />
          </a>
        )}
      </div>
      {onDelete ? (
        <button
          className="icon-btn delete-btn"
          onClick={e => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <FaCircleMinus />
        </button>
      ) : (
        <AddToClip song={song} />
      )}
      {showEdit && (
        <EditLocalSong
          song={song}
          onChange={newSong => {
            onChange(newSong)
            setShowEdit(false)
          }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}

interface AddToClipProps {
  song: LocalSong
}

function AddToClip({ song }: AddToClipProps) {
  const [songs, setSongs] = useAtom(songClipAtom)
  const pushSong = () => {
    const newSong: Song = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      group: song.group,
      bpm: song.bpm,
      timeline: {
        titleFontSize: 20,
        artistFontSize: 16,
      },
      startTimestamp: 0,
      endTimestamp: 0,
    }
    setSongs([...songs, newSong])
  }

  const inClip = useMemo(() => songs.some(s => s.id === song.id), [songs, song.id])

  return (
    <button
      onClick={() => {
        if (inClip) {
          setSongs(songs.filter(s => s.id !== song.id))
        } else {
          pushSong()
        }
      }}
    >
      {inClip ? <FaMinus /> : <FaPlus />}
    </button>
  )
}
