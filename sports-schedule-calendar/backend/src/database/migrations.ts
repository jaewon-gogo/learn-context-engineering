/**
 * Level 2: 데이터베이스 마이그레이션 실행
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { run, get, all } from './db';
import { logger } from '../utils/logger';

const MIGRATIONS_DIR = join(__dirname, 'migrations');

/**
 * 마이그레이션 이력 테이블 생성
 */
async function createMigrationsTable(): Promise<void> {
  await run(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * 실행된 마이그레이션 확인
 */
async function getExecutedMigrations(): Promise<string[]> {
  const rows = await all<{ name: string }>('SELECT name FROM migrations ORDER BY id', []);
  return rows.map((row) => row.name);
}

/**
 * 마이그레이션 실행 기록
 */
async function recordMigration(name: string): Promise<void> {
  await run('INSERT INTO migrations (name) VALUES (?)', [name]);
}

/**
 * 모든 마이그레이션 실행
 */
export async function runMigrations(): Promise<void> {
  try {
    logger.info('마이그레이션 시작...');
    
    await createMigrationsTable();
    const executed = await getExecutedMigrations();

    // 마이그레이션 파일 목록 (순서대로)
    const migrationFiles = [
      '001_initial_schema.sql',
    ];

    for (const file of migrationFiles) {
      const migrationName = file.replace('.sql', '');
      
      if (executed.includes(migrationName)) {
        logger.info(`마이그레이션 건너뛰기: ${migrationName}`);
        continue;
      }

      logger.info(`마이그레이션 실행: ${migrationName}`);
      const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
      
      // SQL 문을 세미콜론으로 분리하여 실행
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await run(statement);
      }

      await recordMigration(migrationName);
      logger.info(`마이그레이션 완료: ${migrationName}`);
    }

    logger.info('모든 마이그레이션 완료');
  } catch (error) {
    logger.error('마이그레이션 실패:', error);
    throw error;
  }
}


