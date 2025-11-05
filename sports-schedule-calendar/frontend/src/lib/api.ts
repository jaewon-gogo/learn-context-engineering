/**
 * Level 2: API 호출 유틸리티 (실제 API 연동)
 */

import { getApiUrl } from './utils';
import type { ApiResponse } from '@shared/types';

/**
 * API 요청 기본 설정
 */
const defaultHeaders = {
  'Content-Type': 'application/json',
};

/**
 * 인증 토큰을 헤더에 추가
 */
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    ...defaultHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * API 에러 처리
 */
async function handleApiError(response: Response): Promise<never> {
  let errorMessage = `API 요청 실패: ${response.statusText}`;
  
  try {
    const errorData = await response.json();
    errorMessage = errorData.error?.message || errorMessage;
  } catch {
    // JSON 파싱 실패 시 기본 메시지 사용
  }

  throw new Error(errorMessage);
}

/**
 * GET 요청
 */
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data: ApiResponse<T> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'API 요청 실패');
  }

  return data.data;
}

/**
 * POST 요청
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data: ApiResponse<T> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'API 요청 실패');
  }

  return data.data;
}

/**
 * PUT 요청
 */
export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data: ApiResponse<T> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'API 요청 실패');
  }

  return data.data;
}

/**
 * DELETE 요청
 */
export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data: ApiResponse<T> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'API 요청 실패');
  }

  return data.data;
}

