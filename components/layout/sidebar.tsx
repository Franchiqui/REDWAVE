'use client';

import React, { useCallback, useRef } from 'react';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Home, Disc, ListMusic, Upload, Settings, X, Music } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SectionId = 'home' | 'library' | 'playlists' | 'settings';

interface SidebarProps {
  readonly activeSection?: SectionId;
  readonly onSectionChange?: (section: SectionId) => void;
  readonly onFilesSelect?: (files: FileList) => void;
  readonly onTrackSelect?: (trackId: string) => void;
  readonly isMobileOpen?: boolean;
  readonly onMobileClose?: () => void;
}

const NAV_ITEMS = [
  { id: 'home' as const, label: 'Inicio', icon: Home },
  { id: 'library' as const, label: 'Biblioteca', icon: Disc },
  { id: 'playlists' as const, label: 'Listas', icon: ListMusic },
] as const;

const DEMO_TRACKS = [
  { id: '1', title: 'Midnight Pulse', artist: 'Neon Drift', cover: 'https://images.unsplash.com/photo-1700049775359-6f53cd16114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=450&h=300&fit=crop' },
  { id: '2', title: 'Crimson Echo', artist: 'Red Horizon', cover: 'https://images.unsplash.com/photo-1758876202040-cae084bafdb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=450&h=300&fit=crop' },
  { id: '3', title: 'Dark Matter', artist: 'Void Walker', cover: 'https://images.unsplash.com/photo-1762341107847-d4d75c6da8c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=450&h=300&fit=crop' },
  { id: '4', title: 'Velvet Rain', artist: 'Noir Soul', cover: 'https://images.unsplash.com/photo-1766021736538-3208f2ad05f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=450&h=300&fit=crop' },
  { id: '5', title: 'Obsidian', artist: 'Black Label', cover: 'https://images.unsplash.com/photo-1770777843445-2a1621b1201d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=450&h=300&fit=crop' },
  { id: '6', title: 'Scarlet Sky', artist: 'Crimson Tide', cover: 'https://images.unsplash.com/photo-1777357916048-d89a46b71169?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=450&h=300&fit=crop' },
] as const;

function Sidebar({
  activeSection = 'home',
  onSectionChange,
  onFilesSelect,
  onTrackSelect,
  isMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFilesSelect?.(files);
        e.target.value = '';
      }
    },
    [onFilesSelect]
  );

  const handleSectionClick = useCallback(
    (section: SectionId) => {
      onSectionChange?.(section);
    },
    [onSectionChange]
  );

  return (
    <>
      {isMobileOpen && onMobileClose && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-black transition-transform duration-300 ease-in-out md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="navigation"
        aria-label="Panel principal"
      >
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-red-600">
              <Music className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">RED AUDIO</span>
          </div>
          {isMobileOpen && onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-600 md:hidden"
              aria-label="Cerrar menú"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="px-4 pb-2">
          <button
            type="button"
            onClick={handleUploadClick}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/20 transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Cargar archivos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Seleccionar archivos de audio"
          />
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionClick(item.id)}
                aria-pressed={isActive}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-600',
                  isActive
                    ? 'bg-red-600/10 text-red-500'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}

          <div className="mt-6">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Recientes
            </h3>
            <div className="mt-2 space-y-1">
              {DEMO_TRACKS.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => onTrackSelect?.(track.id)}
                  className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  aria-label={`Reproducir ${track.title} de ${track.artist}`}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-gray-800">
                    <Image
                      src={track.cover}
                      alt={`Portada de ${track.title}`}
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-200 group-hover:text-white">
                      {track.title}
                    </p>
                    <p className="truncate text-xs text-gray-500">{track.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-gray-900 p-4">
          <button
            type="button"
            onClick={() => handleSectionClick('settings')}
            aria-pressed={activeSection === 'settings'}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-600',
              activeSection === 'settings'
                ? 'bg-red-600/10 text-red-500'
                : 'text-gray-400 hover:bg-gray-900 hover:text-white'
            )}
          >
            <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
            Configuración
          </button>
        </div>
      </aside>
    </>
  );
}

export default React.memo(Sidebar);
