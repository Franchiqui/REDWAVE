export const APP_NAME = 'RedAudio' as const;
export const STORAGE_KEY = 'redaudio_state_v1' as const;

export const FILE_CONFIG = {
  maxSize: 50 * 1024 * 1024,
  maxCount: 500,
  types: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/webm', 'audio/x-m4a'] as const,
} as const;

export type AudioMimeType = (typeof FILE_CONFIG.types)[number];
export const ACCEPT_ATTR = FILE_CONFIG.types.join(',');
export const AUDIO_REGEX = /\.(mp3|wav|ogg|flac|aac|webm|m4a)$/i;
export const SANITIZE_REGEX = /[^a-zA-Z0-9\u00C0-\u017F\s._-]/g;

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  src: string;
  cover?: string;
  size: number;
  mimeType: string;
}

export interface AppState {
  isPlaying: boolean;
  currentTrack: AudioTrack | null;
  currentIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  playbackRate: number;
  playlist: readonly AudioTrack[];
}

export const DEFAULT_APP_STATE: AppState = {
  isPlaying: false,
  currentTrack: null,
  currentIndex: -1,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  muted: false,
  shuffle: false,
  repeat: 'none',
  playbackRate: 1,
  playlist: [],
} as const;

export const VISUALIZER = {
  fftSize: 2048,
  smoothing: 0.82,
  barCount: 64,
  minDecibels: -90,
  maxDecibels: -10,
  colorFrom: '#dc2626',
  colorTo: '#7f1d1d',
  capColor: '#ff0000',
} as const;

export const THEME = {
  bg: '#000000',
  surface: '#0a0a0a',
  elevated: '#141414',
  border: '#262626',
  primary: '#dc2626',
  primaryHover: '#b91c1c',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  danger: '#ef4444',
  success: '#22c55e',
} as const;

export const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1700049775359-6f53cd16114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1758876202040-cae084bafdb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1762341107847-d4d75c6da8c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1766021736538-3208f2ad05f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1770777843445-2a1621b1201d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1777357916048-d89a46b71169?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
] as const;

export const UI = {
  seekStep: 5,
  volumeStep: 0.05,
  debounceMs: 100,
} as const;