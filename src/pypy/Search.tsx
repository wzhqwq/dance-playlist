import { useMemo, useState } from "react"
import { usePyPySongs } from "./api"
import { PyPySongEntry } from "./Song"
import Fuse from "fuse.js"

import "./Search.css"
import dayjs from "dayjs"
import { FaRotateRight } from "react-icons/fa6"

export function PyPySearch() {
  const { data, isFetching, dataUpdatedAt, refetch } = usePyPySongs()
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
      return fuse
        .search(searchKey, {
          limit: 10,
        })
        .map(result => result.item)
    }
    return []
  }, [data, searchKey, fuse])

  return (
    <div className="pypy-search">
      <div className="pypy-db-info">
        <div>{dataUpdatedAt ? `最近下载 ${dayjs(dataUpdatedAt).fromNow()}` : "无本地数据"}</div>
        {data && <div>{`PyPyDance歌单版本 ${dayjs(data.updatedAt).format("YY-MM-DD HH:mm")}`}</div>}
        {isFetching ? (
          <div className="db-info-right">加载中</div>
        ) : (
          <button className="icon-btn db-info-right" onClick={() => refetch()}>
            <FaRotateRight />
          </button>
        )}
      </div>
      {data && (
        <>
          <input
            type="text"
            value={searchKey}
            placeholder="标题或PyPyDance ID"
            onChange={e => setSearchKey(e.target.value)}
          />
          <div className="pypy-songs">
            {songs.map(song => (
              <PyPySongEntry song={song} key={song.id} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
