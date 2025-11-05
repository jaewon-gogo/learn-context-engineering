/**
 * Level 1: 암호화/복호화 유틸리티 테스트
 */

import { encrypt, decrypt, validateEncryptionKey } from '../encryption';

// Mock 환경 변수
const originalEnv = process.env.ENCRYPTION_KEY;

beforeAll(() => {
  // 32바이트 hex 키 (64자리)
  process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
});

afterAll(() => {
  process.env.ENCRYPTION_KEY = originalEnv;
});

describe('encryption', () => {
  describe('encrypt', () => {
    it('텍스트를 암호화할 수 있어야 함', () => {
      const plaintext = 'test-token-123';
      const encrypted = encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:encrypted 형식
    });

    it('같은 텍스트를 암호화하면 다른 결과가 나와야 함 (IV 랜덤성)', () => {
      const plaintext = 'test-token-123';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('decrypt', () => {
    it('암호화된 텍스트를 복호화할 수 있어야 함', () => {
      const plaintext = 'test-token-123';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('잘못된 형식의 암호화된 텍스트는 에러를 발생시켜야 함', () => {
      expect(() => {
        decrypt('invalid-format');
      }).toThrow();
    });

    it('조작된 암호화된 텍스트는 에러를 발생시켜야 함', () => {
      const plaintext = 'test-token-123';
      const encrypted = encrypt(plaintext);
      const parts = encrypted.split(':');
      const tampered = `${parts[0]}:${parts[1]}:tampered-data`;

      expect(() => {
        decrypt(tampered);
      }).toThrow();
    });
  });

  describe('validateEncryptionKey', () => {
    it('유효한 암호화 키를 검증할 수 있어야 함', () => {
      const isValid = validateEncryptionKey();
      expect(isValid).toBe(true);
    });

    it('암호화 키가 없으면 false를 반환해야 함', () => {
      const originalKey = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;

      const isValid = validateEncryptionKey();
      expect(isValid).toBe(false);

      process.env.ENCRYPTION_KEY = originalKey;
    });
  });
});

