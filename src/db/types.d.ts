export interface LocalSong {
  title: string
  group: string
  artist: string
  videoUrl: string
  youtubeUrl: string

  id: string

  bpm: number

  practiceCount: number
  proficiency: number

  isNonLocal?: boolean
}

export interface SongOrder {
  song: LocalSong
  username: string
  startTime: Date
}
export type SongOrderRaw = Omit<SongOrder, "song"> & { song: string }
export type SongOrderJson = Omit<SongOrderRaw, "startTime"> & { startTime: Date | string }

export interface DanceRecord {
  id: string
  danceTime: Date
  orders: SongOrder[]
}
export type DanceRecordRaw = Omit<DanceRecord, "orders"> & { orders: SongOrderRaw[] }
export type DanceRecordJson = Omit<DanceRecordRaw, "danceTime"> & { danceTime: Date | string }
