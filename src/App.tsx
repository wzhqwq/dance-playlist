import "./App.css"
import { PyPySearch } from "./pypy/Search"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./queryClient"
import { VideoModal } from "./pypy/VIdeoModal"
import { Stage } from "./stage/Stage"
import { useState } from "react"
import { SongClip } from "./songClip/SongClip"
import { FaFilm, FaMagnifyingGlass } from "react-icons/fa6"

function App() {
  const [tab, setTab] = useState(0)
  return (
    <QueryClientProvider client={queryClient}>
      <Stage />
      <div className="tab-content">
        {tab === 0 && <SongClip />}
        {tab === 1 && <PyPySearch />}
      </div>
      <div className="tab-bar">
        <button className={tab === 0 ? "active" : ""} onClick={() => setTab(0)}>
          <FaFilm />
        </button>
        <button className={tab === 1 ? "active" : ""} onClick={() => setTab(1)}>
          <FaMagnifyingGlass />
        </button>
      </div>
      <VideoModal />
    </QueryClientProvider>
  )
}

export default App
