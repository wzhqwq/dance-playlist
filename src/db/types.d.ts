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

export interface DanceRecord {
  id: string
  danceTime: Date
  orders: SongOrder[]
}
export type DanceRecordRaw = Omit<DanceRecord, "orders"> & { orders: SongOrderRaw[] }


