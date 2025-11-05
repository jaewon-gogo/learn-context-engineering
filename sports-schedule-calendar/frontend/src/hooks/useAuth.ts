/**
 * Level 1: 인증 관련 커스텀 훅
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/utils';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

/**
 * 인증 상태 관리 훅
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드 시 저장된 사용자 정보 확인 및 검증
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = getLocalStorage('token');

      if (storedToken) {
        try {
          // Level 2: 실제 API 호출로 사용자 정보 검증
          const { apiGet } = await import('@/lib/api');
          const userData = await apiGet<User>('/api/v1/auth/me');
          setUser(userData);
          setLocalStorage('user', JSON.stringify(userData));
        } catch (error) {
          // 토큰이 유효하지 않으면 로컬 스토리지 정리
          console.error('사용자 정보 조회 실패:', error);
          removeLocalStorage('user');
          removeLocalStorage('token');
        }
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  /**
   * 로그인 처리
   */
  const login = useCallback((userData: User, token: string) => {
    setUser(userData);
    setLocalStorage('user', JSON.stringify(userData));
    setLocalStorage('token', token);
  }, []);

  /**
   * 로그아웃 처리
   */
  const logout = useCallback(() => {
    setUser(null);
    removeLocalStorage('user');
    removeLocalStorage('token');
  }, []);

  /**
   * 사용자 정보 업데이트
   */
  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    setLocalStorage('user', JSON.stringify(userData));
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };
}

