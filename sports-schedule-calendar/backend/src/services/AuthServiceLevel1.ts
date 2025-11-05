/**
 * Level 1: 인증 서비스 (비즈니스 로직 단위)
 * Mock 기반 구현 - 실제 DB나 외부 API 호출 없이 순수 로직만 구현
 */

import type { User, TokenPair } from '@shared/types';
import { generateToken, verifyToken } from '../utils/jwt';
import { encrypt, decrypt } from '../utils/encryption';

/**
 * Google OAuth 인증 URL 생성
 * @param redirectUri 리디렉션 URI
 * @returns Google OAuth 인증 URL
 */
export function generateGoogleAuthUrl(redirectUri: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || 'mock-client-id';
  const scope = 'https://www.googleapis.com/auth/calendar';
  const responseType = 'code';
  const accessType = 'offline';
  const prompt = 'consent';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: scope,
    access_type: accessType,
    prompt: prompt,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * OAuth 콜백 코드를 검증 (Mock 구현)
 * @param code OAuth 인증 코드
 * @returns 사용자 정보 및 토큰
 */
export function handleGoogleCallback(code: string): {
  user: User;
  tokens: TokenPair;
} {
  // Mock: 실제로는 Google API를 호출하여 토큰 교환
  // Level 1에서는 검증 로직만 구현
  if (!code || code.length < 10) {
    throw new Error('유효하지 않은 인증 코드입니다');
  }

  // Mock 사용자 정보
  const user: User = {
    user_id: 1,
    google_user_id: `google_${code.substring(0, 10)}`,
    email: 'mock@example.com',
    name: 'Mock User',
    profile_image_url: 'https://via.placeholder.com/150',
    is_active: true,
    created_at: new Date().toISOString(),
    last_login_at: new Date().toISOString(),
  };

  // Mock 토큰
  const tokens: TokenPair = {
    access_token: `mock_access_token_${code}`,
    refresh_token: `mock_refresh_token_${code}`,
    expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1시간 후
    expires_in: 3600,
  };

  return { user, tokens };
}

/**
 * OAuth 토큰을 암호화하여 저장할 형태로 변환
 * @param tokens 토큰 쌍
 * @returns 암호화된 토큰 정보
 */
export function encryptTokens(tokens: TokenPair): {
  encrypted_access_token: string;
  encrypted_refresh_token: string;
  expires_at: string;
} {
  return {
    encrypted_access_token: encrypt(tokens.access_token),
    encrypted_refresh_token: encrypt(tokens.refresh_token),
    expires_at: tokens.expires_at,
  };
}

/**
 * 암호화된 토큰을 복호화
 * @param encryptedTokens 암호화된 토큰 정보
 * @returns 복호화된 토큰 쌍
 */
export function decryptTokens(encryptedTokens: {
  encrypted_access_token: string;
  encrypted_refresh_token: string;
  expires_at: string;
}): TokenPair {
  return {
    access_token: decrypt(encryptedTokens.encrypted_access_token),
    refresh_token: decrypt(encryptedTokens.encrypted_refresh_token),
    expires_at: encryptedTokens.expires_at,
  };
}

/**
 * JWT 토큰 생성
 * @param user 사용자 정보
 * @returns JWT 토큰 문자열
 */
export function createJWTToken(user: User): string {
  return generateToken(user);
}

/**
 * JWT 토큰 검증
 * @param token JWT 토큰 문자열
 * @returns 검증된 사용자 ID
 */
export function verifyJWTToken(token: string): number {
  const payload = verifyToken(token);
  return payload.user_id;
}

/**
 * 토큰 만료 여부 확인
 * @param expiresAt 만료 시간 (ISO 문자열)
 * @returns 만료 여부
 */
export function isTokenExpired(expiresAt: string): boolean {
  const expires = new Date(expiresAt);
  const now = new Date();
  return expires <= now;
}

/**
 * Refresh Token으로 Access Token 갱신 (Mock 구현)
 * @param refreshToken Refresh Token
 * @returns 새로운 토큰 쌍
 */
export function refreshAccessToken(refreshToken: string): TokenPair {
  // Mock: 실제로는 Google API를 호출하여 토큰 갱신
  if (!refreshToken || !refreshToken.startsWith('mock_refresh_token_')) {
    throw new Error('유효하지 않은 Refresh Token입니다');
  }

  return {
    access_token: `mock_new_access_token_${Date.now()}`,
    refresh_token: refreshToken, // Refresh Token은 그대로 유지
    expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    expires_in: 3600,
  };
}
