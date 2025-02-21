import { fetchPyPySongs } from "../pypy/api"
import { findSong } from "./song"
import { SongOrder } from "./types"

// 2025.02.09 16:15:28 Log        -  [VRCX] VideoPlay(PyPyDance) "http://jd.pypy.moe/api/v1/videos/4068.mp4",0,213,"4068 : [KPOP] NCT DREAM - When I’m With You (soney113)"
// $1: time, $2: roomName, $3: url, $4: startTime, $5: endTime, $6: title
const videoPlayRegex =
  /(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}).*VideoPlay\(([^)]+)\) "([^"]+)",([^,]+),([^,]+),"([^"]+)"\n/g

// http://jd.pypy.moe/api/v1/videos/4068.mp4
// /(\d+)\.mp4/
const pypyIdRegex = /\/(\d+)\.mp4/

const youtubeIdRegex = /v=([^&]+)/

// 4068 : [KPOP] NCT DREAM - When I’m With You (soney113)
// $1: title $2: username
const titleWithUsernameRegex = /(.+) \((.+)\)$/

export async function parseLog(log: string) {
  const result: SongOrder[] = []
  let match: RegExpExecArray | null
  while ((match = videoPlayRegex.exec(log))) {
    const time = match[1].replace(/\./g, "-")
    const url = match[3]
    let title = match[6]

    let username = ""
    const titleWithUsernameMatch = title.match(titleWithUsernameRegex)
    if (titleWithUsernameMatch) {
      title = titleWithUsernameMatch[1]
      username = titleWithUsernameMatch[2]
    }

    let song = await parsePyPy(title, url, result.at(-1)?.song.id ?? "")
    if (!song) {
      song = await parseYoutube(title, url, result.at(-1)?.song.id ?? "")
    }
    if (song) {
      result.push({
        song,
        username,
        startTime: new Date(time),
      })
    }
  }
  if (result.some(order => order.song.isNonLocal)) {
    const songList = await fetchPyPySongs()
    result.forEach(({ song }) => {
      if (song.id.startsWith("pypy") && song.group === "") {
        const pypyId = parseInt(song.id.slice(5))
        const pypySong = songList.songs.find(song => song.id === pypyId)
        if (pypySong) {
          song.group = pypySong.group
          song.youtubeUrl = pypySong.originalUrl[0]
        }
      }
    })
  }
  return result
}

async function parsePyPy(title: string, url: string, lastId: string) {
  const pypyIdMatch = url.match(pypyIdRegex)
  if (pypyIdMatch) {
    const pypyId = parseInt(pypyIdMatch[1])
    const id = "pypy-" + pypyId
    if (lastId === id) {
      return undefined
    }
    const localSong = await findSong(id)
    if (localSong) {
      return localSong
    } else {
      return {
        id,
        title: title.replace(/^\d+ : /, ""),
        artist: "",
        group: "",
        bpm: 0,
        practiceCount: 0,
        proficiency: 0,
        videoUrl: url,
        youtubeUrl: "",
        isNonLocal: true,
      }
    }
  }
  return undefined
}

async function parseYoutube(title: string, url: string, lastId: string) {
  const youtubeIdMatch = url.match(youtubeIdRegex)
  if (youtubeIdMatch) {
    const youtubeId = youtubeIdMatch[1]
    const id = "youtube-" + youtubeId
    if (lastId === id) {
      return undefined
    }
    const localSong = await findSong(id)
    if (localSong) {
      return localSong
    } else {
      return {
        id,
        title,
        artist: "",
        group: "",
        bpm: 0,
        practiceCount: 0,
        proficiency: 0,
        videoUrl: "",
        youtubeUrl: url,
        isNonLocal: true,
      }
    }
  }
  return undefined
}
