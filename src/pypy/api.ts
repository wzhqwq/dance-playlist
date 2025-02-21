import { useQuery } from "@tanstack/react-query"
import { pypyGroupMap } from "../group"
import { queryClient } from "../queryClient"

const baseUrl = "https://jd.pypy.moe/api/"
const songListUrl = baseUrl + "v2/songs"

export const getSongSrc = (id: number) => baseUrl + `v1/videos/${id}.mp4`

export interface PyPySong {
  id: number
  group: string
  volume: number
  name: string
  flip: boolean
  start: number
  end: number
  skipRandom: boolean
  originalUrl: string[]
  keywords: string[]
}

type PyPySongRaw = Omit<PyPySong, "group" | "keywords"> & { group: number }

interface SongListResponse {
  songs: PyPySongRaw[]
  groups: string[]
  updatedAt: number
}

export interface SongList {
  songs: PyPySong[]
  updatedAt: number
}

function keywordsFromName(name: string) {
  const wordsInBrackets = name.match(/\[([^\]]+)\]/g) || []
  const nameWithoutBrackets = name.replace(/\[([^\]]+)\]/g, "")
  const wordsSplitByMinus = nameWithoutBrackets.split(" - ")
  return [...wordsInBrackets.map(word => word.slice(1, -1)), ...wordsSplitByMinus].map(word =>
    word.trim()
  )
}

export async function getSongs() {
  const response = await fetch(songListUrl)
  const data = (await response.json()) as SongListResponse
  const groups = data.groups.map(group => pypyGroupMap[group] || group)
  const result = {
    songs: data.songs.map(song => {
      let group = groups[song.group]
      if (group == "其他") {
        if (song.name.includes("Lisa Rhee")) {
          group = "Lisa Rhee"
        }
        if (song.name.includes("블룸엘") || song.name.includes("BloomAile")) {
          group = "Bloom Aile"
        }
      }
      return {
        ...song,
        group,
        keywords: keywordsFromName(song.name),
      } as PyPySong
    }),
    updatedAt: data.updatedAt,
  } as SongList
  localStorage.setItem("pypySongs", JSON.stringify(result))
  localStorage.setItem("pypySongsUpdatedAt", Date.now().toString())
  return result
}

export function usePyPySongs() {
  return useQuery({
    queryKey: ["songs"],
    queryFn: getSongs,
    gcTime: Infinity,
    staleTime: 3600 * 1000,
    initialData: () => {
      const pypySongsStr = localStorage.getItem("pypySongs")
      if (!pypySongsStr) {
        return undefined
      }
      return JSON.parse(pypySongsStr) as SongList
    },
    initialDataUpdatedAt: () => {
      const pypySongsStr = localStorage.getItem("pypySongsUpdatedAt")
      if (!pypySongsStr) {
        return undefined
      }
      return parseInt(pypySongsStr)
    }
  })
}

export async function fetchPyPySongs() {
  const songs = queryClient.getQueryData<SongList>(["songs"])
  if (!songs) {
    return queryClient.fetchQuery<SongList>({
      queryKey: ["songs"],
      queryFn: getSongs,
      gcTime: Infinity,
      staleTime: 3600 * 1000,
    })
  }
  return songs
}
