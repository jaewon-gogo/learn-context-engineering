-- 초기 스키마 생성 마이그레이션

-- 스포츠 종목 테이블
CREATE TABLE IF NOT EXISTS sports (
    sports_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sports_name VARCHAR(50) NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

-- 팀 테이블
CREATE TABLE IF NOT EXISTS teams (
    team_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sports_id INTEGER NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    team_official_name VARCHAR(100),
    crawl_url VARCHAR(500) NOT NULL,
    crawl_config TEXT,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (sports_id) REFERENCES sports(sports_id) ON DELETE CASCADE,
    UNIQUE(sports_id, team_name)
);

-- 경기일정 테이블
CREATE TABLE IF NOT EXISTS schedules (
    schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    game_date DATE NOT NULL,
    game_time TIME,
    opponent_team VARCHAR(100) NOT NULL,
    venue_type VARCHAR(10) NOT NULL CHECK (venue_type IN ('HOME', 'AWAY')),
    venue_name VARCHAR(200),
    game_status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (game_status IN ('SCHEDULED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED')),
    game_result VARCHAR(50),
    score VARCHAR(50),
    crawled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    UNIQUE(team_id, game_date, game_time, opponent_team)
);

-- 크롤링 이력 테이블
CREATE TABLE IF NOT EXISTS crawl_history (
    crawl_id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    crawl_started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    crawl_finished_at DATETIME,
    crawl_status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (crawl_status IN ('SUCCESS', 'FAILED', 'IN_PROGRESS')),
    schedules_found INTEGER DEFAULT 0,
    schedules_saved INTEGER DEFAULT 0,
    error_message TEXT,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_user_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    profile_image_url VARCHAR(500),
    oauth_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT NOT NULL,
    token_expires_at DATETIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME
);

-- 사용자별 팀 설정 테이블
CREATE TABLE IF NOT EXISTS user_teams (
    user_team_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    notification_enabled BOOLEAN DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    UNIQUE(user_id, team_id)
);

-- 캘린더 연동 설정 테이블
CREATE TABLE IF NOT EXISTS calendar_settings (
    settings_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    google_calendar_id VARCHAR(255) NOT NULL,
    calendar_name VARCHAR(100) NOT NULL,
    auto_sync BOOLEAN NOT NULL DEFAULT 1,
    sync_interval VARCHAR(20) DEFAULT 'DAILY' CHECK (sync_interval IN ('HOURLY', 'DAILY', 'WEEKLY')),
    email_notification BOOLEAN NOT NULL DEFAULT 1,
    push_notification BOOLEAN NOT NULL DEFAULT 1,
    notification_timing VARCHAR(50) DEFAULT '1일전,1시간전',
    calendar_color VARCHAR(20),
    is_shared BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 캘린더 동기화 이력 테이블
CREATE TABLE IF NOT EXISTS calendar_sync_history (
    sync_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    schedule_id INTEGER NOT NULL,
    google_event_id VARCHAR(255),
    sync_status VARCHAR(20) NOT NULL CHECK (sync_status IN ('SUCCESS', 'FAILED', 'PENDING')),
    synced_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    error_code VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_teams_sports_id ON teams(sports_id);
CREATE INDEX IF NOT EXISTS idx_teams_crawl_url ON teams(crawl_url);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active);

CREATE INDEX IF NOT EXISTS idx_schedules_team_id ON schedules(team_id);
CREATE INDEX IF NOT EXISTS idx_schedules_game_date ON schedules(game_date);
CREATE INDEX IF NOT EXISTS idx_schedules_game_date_team ON schedules(game_date, team_id);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(game_status);

CREATE INDEX IF NOT EXISTS idx_crawl_history_team_id ON crawl_history(team_id);
CREATE INDEX IF NOT EXISTS idx_crawl_history_started_at ON crawl_history(crawl_started_at);
CREATE INDEX IF NOT EXISTS idx_crawl_history_status ON crawl_history(crawl_status);

CREATE INDEX IF NOT EXISTS idx_users_google_user_id ON users(google_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_user_teams_user_id ON user_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_user_teams_team_id ON user_teams(team_id);

CREATE INDEX IF NOT EXISTS idx_calendar_settings_user_id ON calendar_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_sync_history_user_id ON calendar_sync_history(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_history_schedule_id ON calendar_sync_history(schedule_id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_history_status ON calendar_sync_history(sync_status);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_history_synced_at ON calendar_sync_history(synced_at);

