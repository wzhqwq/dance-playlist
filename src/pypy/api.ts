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
  return {
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
}

export function usePyPySongs() {
  return useQuery({
    queryKey: ["songs"],
    queryFn: getSongs,
    gcTime: Infinity,
    staleTime: Infinity,
  })
}

export async function fetchPyPySongs() {
  const songs = queryClient.getQueryData<SongList>(["songs"])
  if (!songs) {
    return queryClient.fetchQuery<SongList>({
      queryKey: ["songs"],
      queryFn: getSongs,
      gcTime: Infinity,
      staleTime: Infinity,
    })
  }
  return songs
}
