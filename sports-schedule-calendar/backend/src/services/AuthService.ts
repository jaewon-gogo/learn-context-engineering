/**
 * Level 2: 인증 서비스 (Level 1 함수들을 재export)
 */

// Level 1 함수들을 import하여 재export
import {
  generateGoogleAuthUrl,
  handleGoogleCallback,
  encryptTokens,
  decryptTokens,
  createJWTToken,
  verifyJWTToken,
  isTokenExpired,
  refreshAccessToken,
} from './AuthServiceLevel1';

// Level 1 함수들을 재export
export {
  generateGoogleAuthUrl,
  handleGoogleCallback,
  encryptTokens,
  decryptTokens,
  createJWTToken,
  verifyJWTToken,
  isTokenExpired,
  refreshAccessToken,
};

// Level 2에서 사용할 서비스 객체
export const AuthService = {
  initiateGoogleLogin: generateGoogleAuthUrl,
  handleGoogleCallback: handleGoogleCallback,
  encryptTokens: encryptTokens,
  decryptTokens: decryptTokens,
  createJWTToken: createJWTToken,
  verifyJWTToken: verifyJWTToken,
  isTokenExpired: isTokenExpired,
  refreshAccessToken: refreshAccessToken,
};
