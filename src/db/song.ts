import dbManager from "./indexedDb"

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

export function findSong(id: string) {
  // in indexedDB
  return dbManager.findById<LocalSong>('songs', id)
}

export function saveSong(song: LocalSong) {
  // save using indexedDB
  return dbManager.add('songs', song)
}

export function updateSong(song: LocalSong) {
  // save using indexedDB
  return dbManager.update('songs', song)
}