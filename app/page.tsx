'use client';

import Footer from '@/components/layout/footer';
import { useState, useEffect, useRef, useCallback, useMemo, Component } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Upload, Music, Heart, Repeat, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Track {
  id: string;
  file: File;
  url: string;
  name: string;
  artist: string;
  duration: number;
  cover: string;
}

const COVERS = [
  'https://images.unsplash.com/photo-1700049775359-6f53cd16114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1758876202040-cae084bafdb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1762341107847-d4d75c6da8c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1766021736538-3208f2ad05f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1770777843445-2a1621b1201d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
  'https://images.unsplash.com/photo-1777357916048-d89a46b71169?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080&w=450&h=300&fit=crop',
];

const TESTIMONIALS = [
  { name: 'Ana L.', role: 'DJ', text: 'El visualizador y la carga local hacen de esta la mejor app de audio.', image: COVERS[0] },
  { name: 'Marco R.', role: 'Productor', text: 'Interfaz oscura minimalista y sin distracciones. Perfecta para focus.', image: COVERS[1] },
  { name: 'Sofi T.', role: 'Audiófila', text: 'Responsive y rápida. El tema negro y rojo es exactamente lo que buscaba.', image: COVERS[2] },
];

const GALLERY = COVERS.map((src, i) => ({ id: i, src, title: `Colección ${i + 1}` }));

function formatTime(s: number) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false } as { hasError: boolean };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(error, info);
  }
  render() {
    if ((this.state as { hasError: boolean }).hasError) {
      return (
        <div className="min-h-screen bg-black text-red-600 flex items-center justify-center p-4">
          <p>Error crítico. Recarga la aplicación.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function useAudioAnalyser(audioRef: React.RefObject<HTMLAudioElement | null>) {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const init = useCallback(() => {
    if (!audioRef.current || ctxRef.current) return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch {
      // silently fail if web audio unsupported
    }
  }, [audioRef]);

  const resume = useCallback(() => {
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume();
    }
  }, []);

  useEffect(() => {
    return () => {
      ctxRef.current?.close();
    };
  }, []);

  return { analyser: analyserRef.current, init, resume };
}

function AudioVisualizer({ analyser, isPlaying }: { analyser: AnalyserNode | null; isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      ctx.clearRect(0, 0, w, h);
      const barWidth = (w / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * h * 0.8;
        ctx.fillStyle = `rgba(220,38,38,${0.4 + (dataArray[i] / 255) * 0.6})`;
        ctx.fillRect(x, h - barHeight, Math.max(barWidth, 2), barHeight);
        x += barWidth + 2;
      }
    };

    if (isPlaying) {
      draw();
    } else {
      cancelAnimationFrame(animRef.current);
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, Math.floor(rect.width), Math.floor(rect.height));
    }

    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, analyser]);

  return <canvas ref={canvasRef} className="w-full h-full rounded-lg block" />;
}

function PlayerApp() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'library' | 'community'>('player');
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);

  const { analyser, init, resume } = useAudioAnalyser(audioRef);

  const currentTrack = useMemo(() => tracks[currentIndex], [tracks, currentIndex]);

  useEffect(() => {
    if (currentIndex >= tracks.length) {
      setCurrentIndex(Math.max(0, tracks.length - 1));
    }
  }, [tracks.length, currentIndex]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    } else {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
      resume();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, resume]);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setIsLoading(true);
      setError(null);
      try {
        const arr = Array.from(files).filter((f) => f.type.startsWith('audio/'));
        const newTracks: Track[] = [];
        const newUrls: string[] = [];

        for (let i = 0; i < arr.length; i++) {
          const file = arr[i];
          const url = URL.createObjectURL(file);
          newUrls.push(url);
          urlsRef.current.push(url);
          newTracks.push({
            id: genId(),
            file,
            url,
            name: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'Archivo local',
            duration: 0,
            cover: COVERS[(tracks.length + i) % COVERS.length],
          });
        }

        await Promise.all(
          newTracks.map(
            (t) =>
              new Promise<void>((resolve) => {
                const a = new Audio(t.url);
                a.addEventListener('loadedmetadata', () => {
                  t.duration = a.duration;
                  resolve();
                });
                a.addEventListener('error', () => resolve());
              })
          )
        );

        setTracks((prev) => [...prev, ...newTracks]);
      } catch {
        setError('Error al procesar archivos');
      } finally {
        setIsLoading(false);
      }
    },
    [tracks.length]
  );

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const togglePlay = useCallback(() => {
    init();
    setIsPlaying((p) => !p);
  }, [init]);

  const skip = useCallback(
    (dir: number) => {
      if (tracks.length === 0) return;
      setCurrentIndex((prev) => {
        let next = prev + dir;
        if (next < 0) next = tracks.length - 1;
        if (next >= tracks.length) next = 0;
        return next;
      });
      setIsPlaying(true);
    },
    [tracks.length]
  );

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }, []);

  const handleEnded = useCallback(() => {
    skip(1);
  }, [skip]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  }, []);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) audioRef.current.volume = val;
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const next = !isMuted;
    setIsMuted(next);
    audioRef.current.volume = next ? 0 : volume || 1;
  }, [isMuted, volume]);

  const removeTrack = useCallback(
    (id: string) => {
      setTracks((prev) => {
        const target = prev.find((t) => t.id === id);
        if (target) {
          URL.revokeObjectURL(target.url);
          urlsRef.current = urlsRef.current.filter((u) => u !== target.url);
        }
        return prev.filter((t) => t.id !== id);
      });
    },
    []
  );

  useEffect(() => {
    return () => {
      urlsRef.current.forEach(URL.revokeObjectURL);
      urlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activeTab === 'player') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, activeTab]);

  return (
    <div className="min-h-screen bg-black text-red-500 selection:bg-red-900 selection:text-white pb-24">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        crossOrigin="anonymous"
      />

      <header className="fixed top-0 inset-x-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-red-900/30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6 text-red-600" />
            <h1 className="text-lg font-bold tracking-wider text-white">
              RED<span className="text-red-600">WAVE</span>
            </h1>
          </div>
          <nav className="flex gap-1">
            {(['player', 'library', 'community'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  activeTab === tab
                    ? 'bg-red-600 text-white'
                    : 'text-red-400/80 hover:text-white hover:bg-red-900/40'
                )}
              >
                {tab === 'player' ? 'Reproductor' : tab === 'library' ? 'Biblioteca' : 'Comunidad'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-20 pb-6">
        <AnimatePresence mode="wait">
          {activeTab === 'player' && (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <section className="bg-neutral-950 border border-red-900/20 rounded-2xl p-4 h-64 md:h-80 relative overflow-hidden shadow-2xl shadow-red-900/10">
                {currentTrack ? (
                  <AudioVisualizer analyser={analyser} isPlaying={isPlaying} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-red-900 gap-3">
                    <Music className="w-12 h-12 opacity-30" />
                    <p className="text-sm opacity-50">Carga archivos para comenzar</p>
                  </div>
                )}
                {currentTrack && (
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
                    <div>
                      <p className="text-white font-bold text-lg drop-shadow-md">{currentTrack.name}</p>
                      <p className="text-red-400 text-sm drop-shadow-md">{currentTrack.artist}</p>
                    </div>
                    <div className="text-white/80 text-xs font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                )}
              </section>

              <section className="bg-neutral-950 border border-red-900/20 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => skip(-1)}
                    className="p-2 rounded-full hover:bg-red-900/30 text-red-400 hover:text-white transition"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-900/40 transition active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>
                  <button
                    onClick={() => skip(1)}
                    className="p-2 rounded-full hover:bg-red-900/30 text-red-400 hover:text-white transition"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-red-900/30 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-xs text-red-400/60 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button onClick={toggleMute} className="text-red-400 hover:text-white">
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolume}
                    className="w-24 h-1.5 bg-red-900/30 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
              </section>

              <section
                className={cn(
                  'border-2 border-dashed rounded-2xl p-6 text-center transition-colors',
                  dragActive ? 'border-red-500 bg-red-900/20' : 'border-red-900/30 bg-neutral-950 hover:border-red-800'
                )}
                onDragEnter={onDrag}
                onDragOver={onDrag}
                onDragLeave={onDrag}
                onDrop={onDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
                <Upload className="w-8 h-8 mx-auto text-red-600 mb-2" />
                <p className="text-sm text-red-300 font-medium">Arrastra archivos de audio aquí</p>
                <p className="text-xs text-red-500/60 mt-1">o</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 px-4 py-2 rounded-lg bg-red-900/40 hover:bg-red-800/50 text-red-200 text-sm font-medium border border-red-800/30 transition"
                >
                  Seleccionar desde dispositivo
                </button>
                {isLoading && <p className="mt-2 text-xs text-red-400 animate-pulse">Cargando...</p>}
                {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
              </section>

              {tracks.length > 0 && (
                <section className="bg-neutral-950 border border-red-900/20 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-red-900/20 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Playlist</h3>
                    <span className="text-xs text-red-500/60">{tracks.length} tracks</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-red-900/10">
                    {tracks.map((track, idx) => (
                      <div
                        key={track.id}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setIsPlaying(true);
                        }}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 cursor-pointer transition group',
                          idx === currentIndex ? 'bg-red-900/20' : 'hover:bg-red-900/10'
                        )}
                      >
                        <Image
                          unoptimized
                          src={track.cover}
                          alt={track.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover bg-red-950"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm font-medium truncate',
                              idx === currentIndex ? 'text-red-400' : 'text-white group-hover:text-red-300'
                            )}
                          >
                            {track.name}
                          </p>
                          <p className="text-xs text-red-500/50 truncate">
                            {track.artist} • {formatTime(track.duration)}
                          </p>
                        </div>
                        {idx === currentIndex && isPlaying && (
                          <div className="flex gap-0.5 items-end h-3">
                            {[0.1, 0.2, 0.3].map((d, i) => (
                              <motion.div
                                key={i}
                                className="w-0.5 bg-red-500 rounded-full"
                                animate={{ height: [4, 12, 6] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: d }}
                              />
                            ))}
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTrack(track.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-400 transition p-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {GALLERY.map((item) => (
                <div
                  key={item.id}
                  className="bg-neutral-950 border border-red-900/20 rounded-xl overflow-hidden group hover:border-red-800 transition"
                >
                  <div className="relative aspect-video">
                    <Image
                      unoptimized
                      src={item.src}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition" />
                  </div>
                  <div className="p-3">
                    <h4 className="text-white font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-red-500/60 mt-1">Colección local</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-neutral-950 border border-red-900/20 rounded-xl p-5 flex gap-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      unoptimized
                      src={t.image}
                      alt={t.name}
                      fill
                      className="object-cover rounded-full border border-red-900/30"
                    />
                  </div>
                  <div>
                    <p className="text-red-200/90 text-sm leading-relaxed">"{t.text}"</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-white text-sm font-bold">{t.name}</span>
                      <span className="text-xs text-red-600 bg-red-900/20 px-1.5 py-0.5 rounded">{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
//ffffff

export default function Page() {
  return (
    <ErrorBoundary>
      <PlayerApp />
    </ErrorBoundary>
  );
}