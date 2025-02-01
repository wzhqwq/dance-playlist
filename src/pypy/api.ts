import { pypyGroupMap } from "../group"

const baseUrl = 'https://jd.pypy.moe/api/'
const songListUrl = baseUrl + 'v2/songs'

export const getSongSrc = (id: number) => baseUrl + `v1/videos/${id}.mp4`


export interface PyPySong {
  id: number,
  group: string,
  volume: number,
  name: string,
  flip: boolean,
  start: number,
  end: number,
  skipRandom: boolean,
  originalUrl: string[],
  keywords: string[],
}

type PyPySongRaw = Omit<PyPySong, 'group' | 'keywords'> & { group: number }

export interface SongListResponse {
  songs: PyPySongRaw[]
  groups: string[]
  updatedAt: number
}

function keywordsFromName(name: string) {
  const wordsInBrackets = name.match(/\[([^\]]+)\]/g) || []
  const nameWithoutBrackets = name.replace(/\[([^\]]+)\]/g, '')
  const wordsSplitByMinus = nameWithoutBrackets.split(' - ')
  return [
    ...wordsInBrackets.map(word => word.slice(1, -1)),
    ...wordsSplitByMinus,
  ].map(word => word.trim())
}

export async function getSongs() {
  const response = await fetch(songListUrl)
  const data = await response.json() as SongListResponse
  const groups = data.groups.map(group => pypyGroupMap[group] || group)
  return {
    songs: data.songs.map(song => ({
      ...song,
      group: groups[song.group],
      keywords: keywordsFromName(song.name),
    } as PyPySong)),
    updatedAt: data.updatedAt,
  }
}
