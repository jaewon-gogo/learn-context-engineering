/**
 * Level 1: JWT 토큰 생성 및 검증 유틸리티
 */

import jwt from 'jsonwebtoken';
import type { User } from '@shared/types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  user_id: number;
  email: string;
  google_user_id: string;
  iat?: number;
  exp?: number;
}

/**
 * JWT 토큰을 생성합니다
 * @param user 사용자 정보
 * @returns JWT 토큰 문자열
 */
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    user_id: user.user_id,
    email: user.email,
    google_user_id: user.google_user_id,
  };

  const secret: jwt.Secret = JWT_SECRET;
  
  // StringValue 타입 호환을 위해 직접 전달
  return jwt.sign(payload, secret, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * JWT 토큰을 검증하고 페이로드를 반환합니다
 * @param token JWT 토큰 문자열
 * @returns 검증된 페이로드
 * @throws 토큰이 유효하지 않은 경우 에러
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const secret: jwt.Secret = JWT_SECRET;
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('토큰이 만료되었습니다');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('유효하지 않은 토큰입니다');
    }
    throw new Error(`토큰 검증 실패: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 토큰에서 사용자 ID를 추출합니다
 * @param token JWT 토큰 문자열
 * @returns 사용자 ID
 */
export function getUserIdFromToken(token: string): number {
  const payload = verifyToken(token);
  return payload.user_id;
}

/**
 * 토큰이 만료되었는지 확인합니다 (만료 전 갱신을 위해)
 * @param token JWT 토큰 문자열
 * @returns 만료까지 남은 시간 (초) 또는 null (이미 만료됨)
 */
export function getTokenExpirationTime(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload | null;
    if (!decoded || !decoded.exp) {
      return null;
    }
    const now = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - now;
    return remaining > 0 ? remaining : null;
  } catch {
    return null;
  }
}

