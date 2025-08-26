-- Codefit(DB).png 기반 회원가입 플로우 테이블 정의
CREATE DATABASE IF NOT EXISTS codefit CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE codefit;

-- locations
CREATE TABLE IF NOT EXISTS locations (
  location_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  location_name VARCHAR(100) NOT NULL UNIQUE
);

-- base_users
CREATE TABLE IF NOT EXISTS base_users (
  base_user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  user_role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_base_users_email (email)
);

-- users (프로필)
CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  base_user_id BIGINT NOT NULL UNIQUE,
  gender VARCHAR(10),
  mobile VARCHAR(30),
  current_position VARCHAR(100),
  year_salary VARCHAR(50),
  career VARCHAR(50),
  bio TEXT,
  profile_image_path VARCHAR(255),
  is_profile_complete BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_baseuser FOREIGN KEY (base_user_id) REFERENCES base_users(base_user_id)
);

-- users_locations_relation
CREATE TABLE IF NOT EXISTS users_locations_relation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  base_user_id BIGINT NOT NULL,
  location_id BIGINT NOT NULL,
  CONSTRAINT fk_ulr_baseuser FOREIGN KEY (base_user_id) REFERENCES base_users(base_user_id),
  CONSTRAINT fk_ulr_location FOREIGN KEY (location_id) REFERENCES locations(location_id),
  INDEX idx_ulr_base_user (base_user_id),
  INDEX idx_ulr_location (location_id)
);


-- 기본 지역 seed
INSERT IGNORE INTO locations(location_name) VALUES
('서울'),('경기'),('인천'),('부산'),('대구'),('대전'),('광주'),('울산'),('강원'),('충북'),('충남'),('전북'),('전남'),('경북'),('경남'),('제주'),('원격근무');


