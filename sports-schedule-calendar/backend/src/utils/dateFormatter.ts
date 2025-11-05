/**
 * Level 1: 날짜/시간 형식 변환 유틸리티
 */

/**
 * 날짜 문자열을 Date 객체로 변환
 * @param dateStr YYYY-MM-DD 형식의 날짜 문자열
 * @returns Date 객체
 */
export function parseDate(dateStr: string): Date {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`유효하지 않은 날짜 형식: ${dateStr}`);
  }
  return date;
}

/**
 * Date 객체를 YYYY-MM-DD 형식 문자열로 변환
 * @param date Date 객체
 * @returns YYYY-MM-DD 형식 문자열
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 시간 문자열을 Date 객체로 변환 (오늘 날짜 기준)
 * @param timeStr HH:MM 형식의 시간 문자열
 * @returns Date 객체
 */
export function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`유효하지 않은 시간 형식: ${timeStr}`);
  }
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Date 객체를 HH:MM 형식 문자열로 변환
 * @param date Date 객체
 * @returns HH:MM 형식 문자열
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 날짜와 시간을 결합하여 Date 객체 생성
 * @param dateStr YYYY-MM-DD 형식의 날짜 문자열
 * @param timeStr HH:MM 형식의 시간 문자열 (선택)
 * @returns Date 객체
 */
export function combineDateTime(dateStr: string, timeStr?: string): Date {
  const date = parseDate(dateStr);
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
}

/**
 * ISO 8601 형식으로 변환
 * @param date Date 객체
 * @returns ISO 8601 형식 문자열
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns YYYY-MM-DD 형식 문자열
 */
export function getToday(): string {
  return formatDate(new Date());
}

/**
 * 특정 날짜로부터 N일 후 날짜 반환
 * @param dateStr 기준 날짜 (YYYY-MM-DD)
 * @param days 추가할 일수
 * @returns YYYY-MM-DD 형식 문자열
 */
export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

