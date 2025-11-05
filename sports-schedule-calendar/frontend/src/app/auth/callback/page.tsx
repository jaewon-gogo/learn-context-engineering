/**
 * Level 2: OAuth 콜백 페이지 (실제 API 연동)
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiGet } from '@/lib/api';
import type { User } from '@/types';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // 토큰을 로컬 스토리지에 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }

      // 사용자 정보 조회
      const fetchUser = async () => {
        try {
          // Level 2: 실제 API 호출로 사용자 정보 조회
          const userData = await apiGet<User>('/api/v1/auth/me');
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData));
          }

          login(userData, token);
          router.push('/dashboard');
        } catch (err) {
          console.error('사용자 정보 조회 실패:', err);
          setError('사용자 정보를 불러오는데 실패했습니다');
          
          // 에러 발생 시 로컬 스토리지 정리
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }

          setTimeout(() => {
            router.push('/?error=auth_failed');
          }, 2000);
        }
      };

      fetchUser();
    } else {
      // 토큰이 없으면 로그인 페이지로 리디렉션
      setError('인증 토큰이 없습니다');
      setTimeout(() => {
        router.push('/?error=no_token');
      }, 2000);
    }
  }, [searchParams, login, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <h1 className="text-xl font-semibold mb-2 text-red-600">오류 발생</h1>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500 mt-2">로그인 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold mb-2">로그인 처리 중...</h1>
            <p className="text-gray-600">잠시만 기다려주세요</p>
          </>
        )}
      </div>
    </div>
  );
}
