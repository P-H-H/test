import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 * This utility ensures that Tailwind CSS classes are properly merged and deduplicated
 * 
 * @param {...any} inputs - Class names to combine
 * @returns {string} - Combined class names
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4' (px-2 is overridden by px-4)
 * cn('bg-red-500', isActive && 'bg-blue-500') // Returns 'bg-blue-500' if isActive is true
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}