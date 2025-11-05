/**
 * Level 1: Google 로그인 버튼 컴포넌트
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

interface GoogleLoginButtonProps {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  className?: string;
  // Level 2: OAuth는 리디렉션으로 처리되므로 onSuccess는 실제로 호출되지 않음
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  className,
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Google OAuth 로그인 시작
   */
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Level 2: 실제 Google OAuth 로그인 시작
      // 백엔드 API로 리디렉션하여 Google OAuth 플로우 시작
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      window.location.href = `${apiUrl}/api/v1/auth/google`;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('로그인 실패');
      onError?.(err);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className={className}
      variant="default"
      size="lg"
    >
      {isLoading ? (
        <>
          <span className="mr-2">로딩 중...</span>
        </>
      ) : (
        <>
          <svg
            className="mr-2 h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google로 로그인
        </>
      )}
    </Button>
  );
}

