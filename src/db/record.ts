import { nanoid } from "nanoid"
import { LocalSong } from "./song"
import dbManager from "./indexedDb"
import { useQuery } from "@tanstack/react-query"
import { queryClient } from "../queryClient"

export interface SongOrder {
  song: LocalSong
  username: string
  startTime: Date
}
export type SongOrderRaw = Omit<SongOrder, "song"> & { song: string }

export interface DanceRecord {
  id: string
  danceTime: Date
  orders: SongOrder[]
}
export type DanceRecordRaw = Omit<DanceRecord, "orders"> & { orders: SongOrderRaw[] }

export async function record(danceTime: Date, orders: SongOrder[]) {
  if (orders.length === 0 || orders.some(order => order.song.isNonLocal)) {
    return
  }
  // save using indexedDB
  const rawOrders = orders.map(order => ({
    ...order,
    song: order.song.id,
  }))
  const record: DanceRecordRaw = {
    id: nanoid(),
    danceTime,
    orders: rawOrders,
  }
  orders.forEach(({ song }) => {
    dbManager.update("songs", {
      ...song,
      practiceCount: song.practiceCount + 1,
    })
  })

  await dbManager.add("records", record)

  queryClient.invalidateQueries({ queryKey: ["records"] })
}

export async function getRecords() {
  return await dbManager.getAll<DanceRecordRaw>("records")
}

export function useRecords() {
  return useQuery({
    queryKey: ["records"],
    queryFn: getRecords,
  })
}

export async function getRecord(id: string) {
  const rawRecord = await dbManager.findById<DanceRecordRaw>("records", id)
  if (!rawRecord) {
    return null
  }

  const orders = await Promise.all(
    rawRecord.orders.map(async rawOrder => {
      const song = await dbManager.findById<LocalSong>("songs", rawOrder.song)
      return { ...rawOrder, song } as SongOrder
    })
  )

  return { ...rawRecord, orders } as DanceRecord
}

export function useRecord(id: string, enabled = true) {
  return useQuery({
    queryKey: ["record", id],
    queryFn: () => getRecord(id),
    enabled,
  })
}
