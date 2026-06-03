import { z } from 'zod';

const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/flac',
  'audio/aac',
  'audio/mp4',
  'audio/x-m4a',
];

const isFile = (value: unknown): value is File =>
  typeof File !== 'undefined' && value instanceof File;

const isFileList = (value: unknown): value is FileList =>
  typeof FileList !== 'undefined' && value instanceof FileList && value.length > 0;

export const audioFileSchema = z.custom<File>(
  (value) => isFile(value) && value.size <= MAX_AUDIO_SIZE && ALLOWED_AUDIO_TYPES.includes(value.type),
  { message: 'Invalid audio file: max 50MB, supported formats: MP3, WAV, OGG, FLAC, AAC, M4A' }
);

export const fileListSchema = z.custom<FileList>(
  (value) => isFileList(value),
  { message: 'At least one valid file is required' }
).transform((list) => Array.from(list))
 .refine(
   (files) => files.every((f) => f.size <= MAX_AUDIO_SIZE),
   { message: 'Each file must be under 50MB' }
 )
 .refine(
   (files) => files.every((f) => ALLOWED_AUDIO_TYPES.includes(f.type)),
   { message: 'One or more files have an unsupported audio format' }
 );

export const trackSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).trim(),
  artist: z.string().min(1).max(200).trim(),
  album: z.string().max(200).trim().optional(),
  duration: z.number().nonnegative().finite().optional(),
  coverUrl: z.string().url().optional(),
  src: z.string().min(1).optional(),
});

export const playlistSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).trim(),
  tracks: z.array(trackSchema).min(1),
  coverUrl: z.string().url().optional(),
  createdAt: z.string().datetime().optional(),
});

export const playerSettingsSchema = z.object({
  volume: z.number().min(0).max(1).default(0.8),
  isMuted: z.boolean().default(false),
  isShuffle: z.boolean().default(false),
  repeatMode: z.enum(['none', 'one', 'all']).default('none'),
});

export const uploadFormSchema = z.object({
  files: fileListSchema,
  playlistName: z.string().min(1).max(100).trim().optional(),
});

export type Track = z.infer<typeof trackSchema>;
export type Playlist = z.infer<typeof playlistSchema>;
export type PlayerSettings = z.infer<typeof playerSettingsSchema>;
export type UploadFormValues = z.infer<typeof uploadFormSchema>;

export const sanitizeFileName = (name: string): string =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9.-]/g, '_');

export const safeParseUpload = (data: unknown) => uploadFormSchema.safeParse(data);
export const safeParseTrack = (data: unknown) => trackSchema.safeParse(data);
export const safeParsePlaylist = (data: unknown) => playlistSchema.safeParse(data);