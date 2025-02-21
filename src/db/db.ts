import Dexie, { type EntityTable } from "dexie"
import { DanceRecordRaw, LocalSong } from "./types"

const dbName = "vrc-dance-diary"
const dbVersion = 2

const db = new Dexie(dbName) as Dexie & {
  songs: EntityTable<LocalSong, "id">
  records: EntityTable<DanceRecordRaw, "id">
}
db.version(dbVersion).stores({
  songs: "&id, title, artist, bpm, practiceCount, proficiency",
  records: "&id, danceTime",
})

export default db
