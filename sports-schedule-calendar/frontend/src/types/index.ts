/**
 * Frontend 타입 정의
 * 공유 타입을 재export하고 Frontend 전용 타입 추가
 */

export * from '@shared/types';

// 컴포넌트 Props 타입
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form 상태 타입
export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isLoading: boolean;
}

