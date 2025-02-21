export const convertToSeconds = (timestamp: string) => {
  const [minutes, seconds] = timestamp.split(/[:.]/).map(str => parseInt(str))
  return minutes * 60 + seconds
}
export const convertToTimestamp = (seconds: number) => {
  return `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? "0" : ""}${seconds % 60}`
}

export interface TimelineConfig {
  titleFontSize: number
  artistFontSize: number
}

export interface Song {
  id: string
  title: string
  artist: string
  group: string
  bpm: number
  timeline: TimelineConfig
  startTimestamp: number
  endTimestamp: number
}

