import db from "./db"
import { LocalSong } from "./types"

export function findSong(id: string) {
  // in indexedDB
  return db.songs.get(id)
}

export function saveSong(song: LocalSong) {
  // save using indexedDB
  return db.songs.add(song)
}

export function updateSong(song: LocalSong) {
  // save using indexedDB
  return db.songs.update(song.id, song)
}

export function listSongs(
  sortBy: "id" | "title" | "artist" | "bpm" = "id",
  sortOrder: "asc" | "desc" = "asc",
  query: string
) {
  let collection = db.songs.orderBy(sortBy)
  if (sortOrder == "desc") collection = collection.reverse()
  collection = collection.filter(song => {
    return song.title.includes(query) || song.artist.includes(query)
  })
  return collection.toArray()
}
