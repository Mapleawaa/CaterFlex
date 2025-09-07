-- 餐饮灵活用工小程序数据库初始化脚本
-- Database: miniprogram_dev

USE miniprogram_dev;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(255),
    role ENUM('worker', 'company', 'admin') DEFAULT 'worker',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 企业表
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    contact VARCHAR(100),
    phone VARCHAR(20),
    business_license VARCHAR(50),
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 工作岗位表
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    salary DECIMAL(10,2) NOT NULL,
    salary_unit ENUM('hour', 'day', 'piece') DEFAULT 'hour',
    work_date DATE NOT NULL,
    work_time VARCHAR(50),
    location TEXT,
    requirements TEXT,
    status ENUM('draft', 'published', 'closed', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    worker_id INT NOT NULL,
    company_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    work_hours DECIMAL(4,2),
    total_amount DECIMAL(10,2),
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (worker_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- 考勤记录表
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    worker_id INT NOT NULL,
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    location TEXT,
    work_hours DECIMAL(4,2),
    status ENUM('checked_in', 'checked_out', 'completed') DEFAULT 'checked_in',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (worker_id) REFERENCES users(id)
);

-- 证书表
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    type ENUM('health_certificate', 'skill_certificate', 'other') NOT NULL,
    name VARCHAR(200) NOT NULL,
    number VARCHAR(100),
    issue_date DATE,
    expire_date DATE,
    status ENUM('valid', 'expired', 'pending') DEFAULT 'pending',
    file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES users(id)
);

-- 插入测试数据
INSERT INTO users (username, phone, name, role) VALUES 
('test_worker', '13800138000', '张三', 'worker'),
('test_company', '13900139000', '李经理', 'company');

INSERT INTO companies (name, address, contact, phone, business_license, status) VALUES 
('美味餐厅', '上海市浦东新区张江高科技园区', '李经理', '021-12345678', '91310000123456789X', 'verified');

INSERT INTO jobs (company_id, title, description, salary, work_date, work_time, location, status) VALUES 
(1, '服务员', '负责餐厅日常服务工作', 25.00, '2024-01-15', '11:00-14:00', '上海市浦东新区', 'published'),
(1, '厨师助理', '协助主厨完成菜品制作', 30.00, '2024-01-16', '17:00-21:00', '上海市浦东新区', 'published');