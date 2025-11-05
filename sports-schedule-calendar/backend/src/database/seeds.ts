/**
 * Level 2: 초기 데이터 삽입 (Seeds)
 */

import { run } from './db';
import { logger } from '../utils/logger';

/**
 * 초기 데이터 삽입
 */
export async function seedDatabase(): Promise<void> {
  try {
    logger.info('초기 데이터 삽입 시작...');

    // 스포츠 종목 데이터
    await run(`
      INSERT OR IGNORE INTO sports (sports_name, display_order, is_active) VALUES
      ('야구', 1, 1),
      ('축구', 2, 1),
      ('농구', 3, 1),
      ('배구', 4, 1),
      ('탁구', 5, 1)
    `);

    // 팀 데이터 (야구)
    await run(`
      INSERT OR IGNORE INTO teams (sports_id, team_name, team_official_name, crawl_url, is_active)
      SELECT 
        s.sports_id,
        'LG 트윈스',
        'LG Twins',
        'https://www.lgtwins.com/schedule',
        1
      FROM sports s WHERE s.sports_name = '야구'
    `);

    await run(`
      INSERT OR IGNORE INTO teams (sports_id, team_name, team_official_name, crawl_url, is_active)
      SELECT 
        s.sports_id,
        'KT 위즈',
        'KT Wiz',
        'https://www.ktwiz.co.kr/schedule',
        1
      FROM sports s WHERE s.sports_name = '야구'
    `);

    await run(`
      INSERT OR IGNORE INTO teams (sports_id, team_name, team_official_name, crawl_url, is_active)
      SELECT 
        s.sports_id,
        'SSG 랜더스',
        'SSG Landers',
        'https://www.ssglanders.com/schedule',
        1
      FROM sports s WHERE s.sports_name = '야구'
    `);

    logger.info('초기 데이터 삽입 완료');
  } catch (error) {
    logger.error('초기 데이터 삽입 실패:', error);
    throw error;
  }
}

