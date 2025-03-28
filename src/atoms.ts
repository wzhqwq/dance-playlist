import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { Song } from "./song"

export const playingVideoSrcAtom = atom<string | null>()
export const songClipAtom = atomWithStorage<Song[]>("songClip", [])
export const animationTypeAtom = atom<"none" | "show-hide" | "show-each">("none")
export const animationModeAtom = atom<"preview" | "record" | "">("")
