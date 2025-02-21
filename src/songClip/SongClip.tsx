import { useState } from "react"
import { SongEntry } from "./SongEntry"
import { EditSong } from "./EditSong"
import { nanoid } from "nanoid"
import { Song } from "../song"
import { useAtom } from "jotai"
import { animationModeAtom, animationTypeAtom, songClipAtom } from "../atoms"

import "./SongClip.css"

export function SongClip() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [songs, setSongs] = useAtom(songClipAtom)
  const [animationType, setAnimationType] = useAtom(animationTypeAtom)
  const [animationMode, setAnimationMode] = useAtom(animationModeAtom)

  const pushSong = () => {
    const newSong: Song = {
      id: nanoid(),
      title: "",
      artist: "",
      group: "其他",
      bpm: 0,
      timeline: {
        titleFontSize: 20,
        artistFontSize: 16,
      },
      startTimestamp: 0,
      endTimestamp: 0,
    }
    setSongs([...songs, newSong])
  }

  const handlePaste = (text: string) => {
    // format: bpm title - artist
    const lines = text.split("\n")
    const newSongs = lines
      .map(line => {
        const matches = line.match(/(\d+) (.+) - (.+)/)
        if (matches) {
          const bpm = parseInt(matches[1])
          const title = matches[2]
          const artist = matches[3]
          return {
            id: nanoid(),
            title,
            artist,
            group: "",
            bpm,
            timeline: {
              titleFontSize: 20,
              artistFontSize: 14,
            },
            startTimestamp: 0,
            endTimestamp: 0,
          }
        }
        return null
      })
      .filter(Boolean) as Song[]
    setSongs(songs => [...songs, ...newSongs])
  }

  return (
    <div
      className="song-list"
      onPaste={e => {
        const text = e.clipboardData.getData("text")
        if (/^\d+ /.test(text)) {
          e.preventDefault()
          handlePaste(text)
        }
      }}
    >
      <div className="songs-header">
        <select
          value={animationType}
          onChange={e => setAnimationType(e.target.value as "none" | "show-hide" | "show-each")}
        >
          <option value="none">无动画</option>
          <option value="show-hide">展示总览</option>
          <option value="show-each">逐个报幕</option>
        </select>
        {animationType !== "none" && (
          <>
            <button onClick={() => setAnimationMode("preview")}>
              {animationMode == "preview" ? "Preview Playing" : "Preview"}
            </button>
            <button onClick={() => setAnimationMode("record")}>
              {animationMode == "record" ? "Recording" : "Record"}
            </button>
          </>
        )}
      </div>

      {selectedSong && (
        <EditSong
          song={selectedSong}
          onChange={song => {
            const newSongs = songs.map(s => (s.id === song.id ? song : s))
            let lastEnd = 0
            newSongs.forEach(s => {
              const duration = s.endTimestamp - s.startTimestamp
              s.startTimestamp = lastEnd
              s.endTimestamp = lastEnd + duration
              lastEnd = s.endTimestamp
            })
            setSongs(newSongs)
            setSelectedSong(song)
          }}
        />
      )}
      <div className="songs">
        {songs.map(song => (
          <SongEntry
            song={song}
            key={song.id}
            onClick={() => {
              setSelectedSong(song)
            }}
            selected={!!selectedSong && selectedSong.id === song.id}
            onDelete={() => {
              setSongs(songs.filter(s => s.id !== song.id))
              if (selectedSong?.id === song.id) {
                setSelectedSong(null)
              }
            }}
          />
        ))}
        <button onClick={pushSong}>Add Song</button>
      </div>
    </div>
  )
}
