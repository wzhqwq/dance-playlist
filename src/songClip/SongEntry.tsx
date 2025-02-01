import { groupColorMap, groupShortMap } from "../group"
import cx from "classnames"

import "./SongEntry.css"
import { convertToTimestamp, Song } from "../song"
import { FaCircleMinus } from "react-icons/fa6"

export interface SongEntryProps {
  song: Song
  onDelete: () => void
  onClick: () => void
  selected?: boolean
}

export function SongEntry({ song, onDelete, onClick, selected }: SongEntryProps) {
  return (
    <div className={cx("song-entry", { active: selected })} onClick={onClick}>
      <div className={`group-stride ${groupColorMap[song.group]}`}></div>
      <div className="song-entry-info">
        {groupShortMap[song.group] && `[${groupShortMap[song.group]}]`}
        {song.title}
      </div>
      <div className="song-entry-duration">
        <span>{convertToTimestamp(song.startTimestamp)}</span>
        <span>{convertToTimestamp(song.endTimestamp)}</span>
      </div>
      <button
        className="icon-btn delete-btn"
        onClick={e => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <FaCircleMinus />
      </button>
    </div>
  )
}
