/**
 * Level 2: 데이터베이스 연결 및 초기화
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/sports_schedule.db';

// 데이터베이스 디렉토리 생성
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// SQLite 데이터베이스 연결
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    logger.error('데이터베이스 연결 실패:', err);
    throw err;
  }
  logger.info(`데이터베이스 연결 성공: ${DB_PATH}`);
});

// Promise 기반 래퍼
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

/**
 * SQL 실행 (INSERT, UPDATE, DELETE)
 */
export async function run(sql: string, params: unknown[] = []): Promise<sqlite3.RunResult> {
  try {
    return await dbRun(sql, params) as sqlite3.RunResult;
  } catch (error) {
    logger.error('SQL 실행 실패:', { sql, params, error });
    throw error;
  }
}

/**
 * 단일 행 조회
 */
export async function get<T = unknown>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  try {
    return await dbGet(sql, params) as T | undefined;
  } catch (error) {
    logger.error('SQL 조회 실패:', { sql, params, error });
    throw error;
  }
}

/**
 * 여러 행 조회
 */
export async function all<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  try {
    return await dbAll(sql, params) as T[];
  } catch (error) {
    logger.error('SQL 조회 실패:', { sql, params, error });
    throw error;
  }
}

/**
 * 트랜잭션 실행
 */
export async function transaction(callback: () => Promise<void>): Promise<void> {
  try {
    await run('BEGIN TRANSACTION');
    await callback();
    await run('COMMIT');
  } catch (error) {
    await run('ROLLBACK');
    logger.error('트랜잭션 실패:', error);
    throw error;
  }
}

/**
 * 데이터베이스 연결 종료
 */
export function close(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        logger.error('데이터베이스 종료 실패:', err);
        reject(err);
      } else {
        logger.info('데이터베이스 연결 종료');
        resolve();
      }
    });
  });
}

export default db;

