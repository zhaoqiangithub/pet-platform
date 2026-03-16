-- 救助信息表
CREATE TABLE IF NOT EXISTS t_rescue (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    animal_type VARCHAR(50),
    breed VARCHAR(100),
    age VARCHAR(50),
    health_status VARCHAR(50),
    rescue_status VARCHAR(50) DEFAULT 'pending',
    location_lat DECIMAL(10, 7),
    location_lng DECIMAL(10, 7),
    address VARCHAR(255),
    description TEXT,
    images TEXT,
    contact_phone VARCHAR(20),
    contact_wechat VARCHAR(100),
    review_status VARCHAR(20) DEFAULT 'pending',
    review_comment VARCHAR(500),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INTEGER DEFAULT 0
);

-- 领养信息表
CREATE TABLE IF NOT EXISTS t_adoption (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100),
    animal_type VARCHAR(50),
    breed VARCHAR(100),
    age VARCHAR(50),
    gender VARCHAR(20),
    size VARCHAR(20),
    personality TEXT,
    health_status TEXT,
    requirements TEXT,
    story TEXT,
    images TEXT,
    contact_phone VARCHAR(20),
    contact_wechat VARCHAR(100),
    adoption_status VARCHAR(20) DEFAULT 'available',
    review_status VARCHAR(20) DEFAULT 'pending',
    review_comment VARCHAR(500),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted INTEGER DEFAULT 0
);

-- 状态历史表
CREATE TABLE IF NOT EXISTS t_status_history (
    id BIGINT PRIMARY KEY,
    target_type VARCHAR(50) NOT NULL,
    target_id BIGINT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    progress TEXT,
    images TEXT,
    user_id BIGINT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_rescue_user_id ON t_rescue(user_id);
CREATE INDEX IF NOT EXISTS idx_rescue_status ON t_rescue(rescue_status);
CREATE INDEX IF NOT EXISTS idx_rescue_review_status ON t_rescue(review_status);
CREATE INDEX IF NOT EXISTS idx_adoption_user_id ON t_adoption(user_id);
CREATE INDEX IF NOT EXISTS idx_adoption_status ON t_adoption(adoption_status);
CREATE INDEX IF NOT EXISTS idx_status_history_target ON t_status_history(target_type, target_id);
