import { useMemo, useState } from "react"
import { getSongs } from "./api"
import { useQuery } from "@tanstack/react-query"
import { PyPySongEntry } from "./Song"
import Fuse from "fuse.js"

import "./Search.css"

export function PyPySearch() {
  const { data, isLoading } = useQuery({
    queryKey: ["songs"],
    queryFn: getSongs,
  })

  const [searchKey, setSearchKey] = useState("")

  const fuse = useMemo(() => {
    if (!data) return null
    return new Fuse(data.songs, {
      keys: ["keywords"],
      isCaseSensitive: false,
    })
  }, [data])

  const songs = useMemo(() => {
    if (!data) return []
    if (searchKey.length > 0) {
      if (/^\d+$/.test(searchKey)) {
        const id = parseInt(searchKey)
        const song = data.songs.find(song => song.id === id)
        if (song) return [song]
      }
      if (!fuse) return []
      return fuse.search(searchKey, {
        limit: 10,
      }).map(result => result.item)
    }
    return []
  }, [data, searchKey, fuse])

  return isLoading ? (
    "Loading..."
  ) : (
    <div className="pypy-search">
      <input type="text" value={searchKey} placeholder="Title, Artist or pypy-id" onChange={e => setSearchKey(e.target.value)} />
      <div className="pypy-songs">
        {songs.map(song => (
          <PyPySongEntry song={song} key={song.id} />
        ))}
      </div>
    </div>
  )
}
