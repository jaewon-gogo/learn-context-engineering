/**
 * Level 1: 암호화/복호화 유틸리티
 * AES-256-GCM 알고리즘을 사용하여 OAuth 토큰 암호화
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * 암호화 키를 가져옵니다 (환경 변수에서)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY가 설정되지 않았습니다');
  }
  // 32바이트 hex 키를 Buffer로 변환
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY는 64자리 hex 문자열이어야 합니다 (32바이트)');
  }
  return Buffer.from(key, 'hex');
}

/**
 * 텍스트를 암호화합니다
 * @param text 암호화할 텍스트
 * @returns 암호화된 문자열 (format: iv:authTag:encrypted)
 */
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // iv:authTag:encrypted 형식으로 반환
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error(`암호화 실패: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 암호화된 텍스트를 복호화합니다
 * @param encryptedText 암호화된 문자열 (format: iv:authTag:encrypted)
 * @returns 복호화된 텍스트
 */
export function decrypt(encryptedText: string): string {
  try {
    const key = getEncryptionKey();
    const parts = encryptedText.split(':');

    if (parts.length !== 3) {
      throw new Error('잘못된 암호화 형식입니다');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`복호화 실패: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 암호화 키가 유효한지 검증합니다
 * @returns 검증 결과
 */
export function validateEncryptionKey(): boolean {
  try {
    getEncryptionKey();
    return true;
  } catch {
    return false;
  }
}

