/**
 * Level 1: 메인 페이지 (로그인 페이지)
 */

'use client';

import { GoogleLoginButton } from '@/components/features/GoogleLoginButton';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, isAuthenticated, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // 로그인 성공은 OAuth 콜백 페이지에서 처리
  // 이 함수는 더 이상 사용되지 않음

  if (isAuthenticated) {
    return null; // 리디렉션 중
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            스포츠팀 경기일정 캘린더
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            좋아하는 팀의 경기일정을 확인하고<br />
            Google 캘린더에 동기화하세요
          </p>
        </div>
        <div className="mt-8">
          <GoogleLoginButton
            onSuccess={handleLoginSuccess}
            onError={(error) => {
              console.error('로그인 실패:', error);
              alert('로그인에 실패했습니다. 다시 시도해주세요.');
            }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

