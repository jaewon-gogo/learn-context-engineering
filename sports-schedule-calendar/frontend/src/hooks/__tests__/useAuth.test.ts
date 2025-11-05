/**
 * Level 1: useAuth 훅 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// API 모킹
vi.mock('@/lib/api', () => ({
  apiGet: vi.fn(),
}));

describe('useAuth', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('초기 상태는 로그인되지 않은 상태여야 함', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('저장된 토큰이 있으면 사용자 정보를 로드해야 함', async () => {
    const mockUser = {
      user_id: 1,
      google_user_id: 'google_123',
      email: 'test@example.com',
      name: 'Test User',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    localStorageMock.setItem('token', 'test-token');
    localStorageMock.setItem('user', JSON.stringify(mockUser));

    const { apiGet } = await import('@/lib/api');
    vi.mocked(apiGet).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('login 함수로 사용자 정보를 저장할 수 있어야 함', () => {
    const mockUser = {
      user_id: 1,
      google_user_id: 'google_123',
      email: 'test@example.com',
      name: 'Test User',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login(mockUser, 'test-token');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorageMock.getItem('token')).toBe('test-token');
    expect(localStorageMock.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('logout 함수로 사용자 정보를 제거할 수 있어야 함', () => {
    const mockUser = {
      user_id: 1,
      google_user_id: 'google_123',
      email: 'test@example.com',
      name: 'Test User',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login(mockUser, 'test-token');
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorageMock.getItem('token')).toBeNull();
    expect(localStorageMock.getItem('user')).toBeNull();
  });
});

