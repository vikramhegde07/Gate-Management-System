import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function FindFile(url: string | null) {
  if (!url) return;
  return import.meta.env.VITE_FILE_URL + url;
}