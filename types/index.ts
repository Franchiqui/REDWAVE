import type { ChangeEvent, DragEvent } from 'react'

export const COVERS = [
  'https://images.unsplash.com/photo-1700049775359-6f53cd16114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1758876202040-cae084bafdb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1762341107847-d4d75c6da8c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1766021736538-3208f2ad05f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1770777843445-2a1621b1201d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1777357916048-d89a46b71169?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
] as const

export type Cover = typeof COVERS[number]
export type TrackId = string

export interface Track {
  readonly id: TrackId
  readonly file: File
  readonly name: string
  readonly artist: string
  readonly duration: number
  readonly cover: Cover
  readonly objectUrl: string
}

export type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'error'
export type Repeat = 'none' | 'all' | 'one'

export interface PlayerState {
  readonly tracks: readonly Track[]
  readonly currentId: TrackId | null
  readonly status: Status
  readonly currentTime: number
  readonly duration: number
  readonly volume: number
  readonly muted: boolean
  readonly repeat: Repeat
  readonly shuffled: boolean
}

export interface PlayerActions {
  loadFiles: (files: FileList | null) => void
  removeTrack: (id: TrackId) => void
  clear: () => void
  play: () => void
  pause: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  toggleMute: () => void
  toggleRepeat: () => void
  toggleShuffle: () => void
  setTime: (time: number) => void
  setDuration: (duration: number) => void
  setStatus: (status: Status) => void
}

export type PlayerStore = PlayerState & PlayerActions

export interface VisConfig {
  readonly fftSize: 32 | 64 | 128 | 256 | 512 | 1024 | 2048
  readonly smoothing: number
  readonly bars: number
  readonly width: number
  readonly gap: number
  readonly color1: string
  readonly color2: string
}

export interface AudioEngine {
  readonly ctx: AudioContext | null
  readonly analyser: AnalyserNode | null
  readonly source: MediaElementAudioSourceNode | null
  readonly data: Uint8Array | null
}

export const PALETTE = {
  bg: '#000000',
  surface: '#0a0a0a',
  primary: '#dc2626',
  accent: '#ef4444',
  text: '#fafafa',
  muted: '#a1a1aa',
  border: '#27272a',
} as const

export type ColorKey = keyof typeof PALETTE

export type OnFileInput = (e: ChangeEvent<HTMLInputElement>) => void
export type OnDragOver = (e: DragEvent<HTMLDivElement>) => void
export type OnDrop = (e: DragEvent<HTMLDivElement>) => void