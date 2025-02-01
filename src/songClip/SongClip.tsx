import { useState } from "react"
import { SongEntry } from "./SongEntry"
import { EditSong } from "./EditSong"
import { nanoid } from "nanoid"
import { Song } from "../song"
import { useAtom } from "jotai"
import { animationTypeAtom, songClipAtom } from "../atoms"

import "./SongClip.css"

export function SongClip() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [songs, setSongs] = useAtom(songClipAtom)
  const [animationType, setAnimationType] = useAtom(animationTypeAtom)

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
    setSongs(newSongs)
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
      <select value={animationType} onChange={e => setAnimationType(parseInt(e.target.value))}>
        <option value={0}>No Animation</option>
        <option value={1}>Show Up</option>
        <option value={2}>Hide</option>
        <option value={3}>Each</option>
      </select>
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
