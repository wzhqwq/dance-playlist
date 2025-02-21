import "./App.css"
import { PyPySearch } from "./pypy/Search"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./queryClient"
import { VideoModal } from "./pypy/VIdeoModal"
import { Stage } from "./stage/Stage"
import { useState } from "react"
import { SongClip } from "./songClip/SongClip"
import { FaClockRotateLeft, FaFilm, FaMagnifyingGlass } from "react-icons/fa6"
import { DanceHistory } from "./db/DanceHistory"
import "./dayjs"

function App() {
  const [tab, setTab] = useState(0)
  return (
    <QueryClientProvider client={queryClient}>
      <Stage />
      <div className="tab-content">
        {tab === 0 && <SongClip />}
        {tab === 1 && <PyPySearch />}
        {tab === 2 && <DanceHistory />}
      </div>
      <div className="tab-bar">
        <button className={tab === 0 ? "active" : ""} onClick={() => setTab(0)}>
          <FaFilm />
        </button>
        <button className={tab === 1 ? "active" : ""} onClick={() => setTab(1)}>
          <FaMagnifyingGlass />
          <span className="badge">PYPY</span>
        </button>
        <button className={tab === 2 ? "active" : ""} onClick={() => setTab(2)}>
          <FaClockRotateLeft />
        </button>
      </div>
      <VideoModal />
    </QueryClientProvider>
  )
}

export default App
