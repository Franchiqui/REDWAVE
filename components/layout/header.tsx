'use client';

import React, { useRef, useCallback, type ChangeEvent } from 'react';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface HeaderProps {
  readonly onFilesSelected?: (files: FileList | null) => void;
  readonly className?: string;
}

const Header = React.memo(function Header({ onFilesSelected, className }: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerFileSelect = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFilesSelected?.(e.target.files);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onFilesSelected]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      role="banner"
      aria-label="Reproductor de audio"
      className={cn(
        'fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b px-4 backdrop-blur-md sm:h-20 sm:px-6 lg:px-8',
        'border-red-900/40 bg-black/80',
        className
      )}
    >
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-15">
        <Image
          src="https://images.unsplash.com/photo-1700049775359-6f53cd16114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080"
          alt=""
          fill
          priority
          className="object-cover"
          aria-hidden="true"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/70" />
      </div>

      <div className="flex items-center gap-3 min-w-0">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md ring-1 ring-red-600/50 sm:h-10 sm:w-10">
          <Image
            src="https://images.unsplash.com/photo-1758876202040-cae084bafdb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTkyODV8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODA1MTYzNDZ8&ixlib=rb-4.1.0&q=80&w=1080"
            alt="App logo"
            fill
            priority
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight text-red-500 sm:text-xl">
            RED PLAYER
          </h1>
          <p className="hidden text-[10px] font-medium uppercase tracking-wider text-red-300/60 sm:block">
            Reproductor App
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-4">
        <input
          ref={inputRef}
          id="audio-upload"
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Cargar lista de archivos de audio"
        />
        <button
          type="button"
          onClick={triggerFileSelect}
          aria-label="Cargar lista de archivos de audio"
          className={cn(
            'inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-black shadow-lg shadow-red-900/20',
            'transition-all hover:bg-red-500 hover:shadow-red-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
            'active:scale-95'
          )}
          aria-controls="audio-upload"
        >
          <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Cargar lista</span>
        </button>
      </div>
    </motion.header>
  );
});

export default Header;