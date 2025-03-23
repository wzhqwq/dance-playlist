import { useMemo, useState } from "react"
import { LogDropZone } from "./LogDropZone"
import { record, useRecord, useRecords } from "./record"
import { LocalSongEntry } from "./LocalSongEntry"
import cx from "classnames"
import { FaAngleDown, FaAngleUp } from "react-icons/fa6"
import dayjs from "dayjs"
import { SongOrder, DanceRecordRaw, DanceRecordJson, SongOrderJson } from "./types"

import "./DanceHistory.css"
import db from "./db"

async function exportAll() {
  const songs = await db.songs.toArray()
  const records = await db.records.toArray()

  const a = document.createElement("a")
  const blob = new Blob([JSON.stringify({ songs, records })], { type: "application/json" })
  a.href = URL.createObjectURL(blob)
  a.download = "dance-history.json"
  a.click()
}

async function importAll(file: File) {
  const reader = new FileReader()
  reader.onload = async () => {
    const { songs, records } = JSON.parse(reader.result as string)
    records.forEach((record: DanceRecordJson) => {
      record.danceTime = new Date(record.danceTime)
      record.orders.forEach((order: SongOrderJson) => {
        order.startTime = new Date(order.startTime)
      })
    })

    await db.transaction("rw", ["songs", "records"], async () => {
      await db.songs.clear()
      await db.songs.bulkAdd(songs)
      await db.records.clear()
      await db.records.bulkAdd(records)
    })
  }
  reader.readAsText(file)
}

export function DanceHistory() {
  const { data: records } = useRecords()
  const [newSongOrders, setNewSongOrders] = useState<SongOrder[]>([])
  const [newDanceTime, setNewDanceTime] = useState<Date | null>(null)

  return (
    <div className="dance-history">
      <div className="history-header">
        <button onClick={exportAll}>导出</button>
        <button className="file-input-btn">
          导入
          <input
            type="file"
            accept=".json"
            onChange={e => {
              if (e.target.files && e.target.files.length > 0) {
                if (confirm("导入会覆盖现有数据，确定要继续吗？")) {
                  importAll(e.target.files[0])
                }
              }
            }}
          />
        </button>
      </div>
      <LogDropZone
        onDrop={(orders, date) => {
          setNewSongOrders(orders)
          setNewDanceTime(date)
        }}
      />
      {newSongOrders.length > 0 ? (
        <div className="new-record">
          <div className="new-record-header">
            <span>新舞蹈记录{dayjs(newDanceTime).format("YYYY-MM-DD HH:mm")}</span>
            <button
              onClick={() => {
                record(newDanceTime!, newSongOrders).then(() => {
                  setNewSongOrders([])
                  setNewDanceTime(null)
                })
              }}
              disabled={newSongOrders.some(o => o.song.isNonLocal)}
            >
              保存
            </button>
          </div>
          <SongsPanel orders={newSongOrders} onChange={setNewSongOrders} />
        </div>
      ) : (
        <div className="records">
          {records?.map(record => (
            <RecordAccordion key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  )
}

interface RecordAccordion {
  record: DanceRecordRaw
}

function RecordAccordion({ record }: RecordAccordion) {
  const [expanded, setExpanded] = useState(false)
  const { data: recordFull, refetch } = useRecord(record.id)

  return (
    <div className="record">
      <div className="record-header" onClick={() => setExpanded(!expanded)}>
        <span>舞蹈记录{dayjs(record.danceTime).format("YYYY-MM-DD HH:mm")}</span>
        {expanded ? <FaAngleDown /> : <FaAngleUp />}
      </div>
      {recordFull && expanded && (
        <SongsPanel
          orders={recordFull.orders}
          onChange={() => {
            refetch()
          }}
          hideDelete
        />
      )}
    </div>
  )
}

interface SongPanelProps {
  orders: SongOrder[]
  onChange: (orders: SongOrder[]) => void
  hideDelete?: boolean
}
function SongsPanel({ orders, onChange, hideDelete = false }: SongPanelProps) {
  const [sortBy, setSortBy] = useState<"time" | "group" | "bpm">("time")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const sortedOrders = useMemo(() => {
    const newOrders = [...orders]
    if (sortBy === "time") {
      newOrders.sort((a, b) =>
        sortOrder === "asc"
          ? a.startTime.getTime() - b.startTime.getTime()
          : b.startTime.getTime() - a.startTime.getTime()
      )
    }
    if (sortBy === "group") {
      newOrders.sort((a, b) =>
        sortOrder === "asc"
          ? a.song.group.localeCompare(b.song.group)
          : b.song.group.localeCompare(a.song.group)
      )
    }
    if (sortBy === "bpm") {
      newOrders.sort((a, b) =>
        sortOrder === "asc" ? a.song.bpm - b.song.bpm : b.song.bpm - a.song.bpm
      )
    }
    return newOrders
  }, [orders, sortBy, sortOrder])

  return (
    <div className="songs">
      <div className="songs-header">
        <button
          className={cx("sort-btn", { active: sortBy === "time" })}
          onClick={() => {
            if (sortBy === "time") {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc")
            } else {
              setSortBy("time")
              setSortOrder("asc")
            }
          }}
        >
          时间{sortBy === "time" && (sortOrder === "asc" ? "↓" : "↑")}
        </button>
        <button
          className={cx("sort-btn", { active: sortBy === "group" })}
          onClick={() => {
            if (sortBy === "group") {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc")
            } else {
              setSortBy("group")
              setSortOrder("asc")
            }
          }}
        >
          组别{sortBy === "group" && (sortOrder === "asc" ? "↓" : "↑")}
        </button>
        <button
          className={cx("sort-btn", { active: sortBy === "bpm" })}
          onClick={() => {
            if (sortBy === "bpm") {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc")
            } else {
              setSortBy("bpm")
              setSortOrder("asc")
            }
          }}
        >
          BPM{sortBy === "bpm" && (sortOrder === "asc" ? "↓" : "↑")}
        </button>
      </div>
      {sortedOrders.map(order => (
        <LocalSongEntry
          key={order.song.id + order.startTime.toISOString()}
          order={order}
          onDelete={
            hideDelete
              ? undefined
              : () => {
                  onChange(orders.filter(o => o !== order))
                }
          }
          onChange={newSong => {
            onChange(
              orders.map(o =>
                o.song.id == newSong.id
                  ? {
                      ...o,
                      song: newSong,
                    }
                  : o
              )
            )
          }}
        />
      ))}
    </div>
  )
}
