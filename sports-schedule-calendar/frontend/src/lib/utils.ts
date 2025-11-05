/**
 * Level 1: 유틸리티 함수
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 클래스 이름 병합 (Tailwind CSS용)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * API URL 생성
 */
export function getApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 시간 포맷팅 (HH:MM)
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 날짜 문자열 파싱
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * 로컬 스토리지에 저장
 */
export function setLocalStorage(key: string, value: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

/**
 * 로컬 스토리지에서 가져오기
 */
export function getLocalStorage(key: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
}

/**
 * 로컬 스토리지에서 삭제
 */
export function removeLocalStorage(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
}

