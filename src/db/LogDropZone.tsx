import { useState } from "react"
import cx from "classnames"

import "./LogDropZone.css"
import { parseLog } from "./log"
import { SongOrder } from "./record"

export interface LogDropZoneProps {
  onDrop: (result: SongOrder[], date: Date) => void
}

export function LogDropZone({ onDrop }: LogDropZoneProps) {
  const [isOver, setIsOver] = useState(false)
  const [processing, setProcessing] = useState(false)

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(true)
  }

  const onDragLeave = () => {
    setIsOver(false)
  }

  const onDropHandler = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      // filename output_log_2025-02-09_16-05-54.txt
      const matches = file.name.match(/(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})/)
      if (!matches) return
      const date = new Date(`${matches[1]} ${matches[2].replace(/-/g, ':')} +0800`)
      const reader = new FileReader()
      setProcessing(true)
      reader.onload = async () => {
        const text = reader.result as string
        const songs = await parseLog(text)
        onDrop(songs, date)
        setProcessing(false)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div
      className={cx("log-drop-zone", {
        "drag-over": isOver,
      })}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDropHandler}
    >
      <span>Drop VRChat log file here</span>
      {processing && <span>Processing...</span>}
    </div>
  )
}
