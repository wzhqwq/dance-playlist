import { nanoid } from "nanoid"
import db from "./db"
import { useQuery } from "@tanstack/react-query"
import { queryClient } from "../queryClient"
import { DanceRecord, DanceRecordRaw, SongOrder } from "./types"

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
  await db.transaction("rw", ["songs", "records"], async () => {
    for (const { song } of orders) {
      await db.songs.update(song.id, {
        practiceCount: song.practiceCount + 1,
      })
    }
    await db.records.add(record)
  })

  queryClient.invalidateQueries({ queryKey: ["records"] })
}

export async function getRecords() {
  return await db.records.toArray()
}

export function useRecords() {
  return useQuery({
    queryKey: ["records"],
    queryFn: getRecords,
  })
}

export async function getRecord(id: string) {
  const rawRecord = await db.records.get(id)
  if (!rawRecord) {
    return null
  }

  const orders = await Promise.all(
    rawRecord.orders.map(async rawOrder => {
      const song = await db.songs.get(rawOrder.song)
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
