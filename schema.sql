-- CDLU ERP System - MySQL Schema
-- Run this on Railway MySQL terminal

CREATE DATABASE IF NOT EXISTS cdlu_erp;
USE cdlu_erp;

CREATE TABLE IF NOT EXISTS programs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) UNIQUE,
  type VARCHAR(20),
  duration_years INT DEFAULT 3
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20) UNIQUE,
  faculty VARCHAR(200)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reg_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  father_name VARCHAR(100),
  mother_name VARCHAR(100),
  dob DATE,
  gender VARCHAR(10),
  category VARCHAR(20),
  qualification VARCHAR(50),
  percentage VARCHAR(20),
  phone VARCHAR(10) UNIQUE NOT NULL,
  email VARCHAR(100),
  address TEXT,
  program_id INT,
  semester INT DEFAULT 1,
  admission_year INT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS teachers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(10),
  department_id INT,
  password_hash VARCHAR(255) NOT NULL,
  qualification TEXT,
  join_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  program_id INT,
  department_id INT,
  semester INT,
  credits INT,
  teacher_id INT,
  fees DECIMAL(10,2),
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT,
  course_id INT,
  semester INT,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_reg (student_id, course_id, semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT,
  course_id INT,
  date DATE NOT NULL,
  status ENUM('present','absent','late','leave') NOT NULL,
  marked_by INT,
  semester INT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES teachers(id) ON DELETE SET NULL,
  UNIQUE KEY unique_att (student_id, course_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT,
  semester INT,
  total_fees DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  due_date DATE,
  paid_date DATE,
  status ENUM('unpaid','partial','paid','overdue') DEFAULT 'unpaid',
  payment_mode VARCHAR(20),
  transaction_id VARCHAR(100),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT,
  course_id INT,
  semester INT,
  exam_type ENUM('theory','practical') NOT NULL,
  marks_obtained DECIMAL(5,2),
  max_marks DECIMAL(5,2) DEFAULT 100,
  grade VARCHAR(5),
  entered_by INT,
  entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (entered_by) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS timetable (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT,
  teacher_id INT,
  day ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(50),
  semester INT,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  posted_by INT,
  priority ENUM('normal','urgent','important') DEFAULT 'normal',
  target ENUM('all','students','teachers') DEFAULT 'all',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_students_phone ON students(phone);
CREATE INDEX idx_students_program ON students(program_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_fees_status ON fees(status);
CREATE INDEX idx_notices_created ON notices(created_at);

INSERT INTO departments (name, code, faculty) VALUES
('Computer Science & IT', 'CS', 'Faculty of Science'),
('Commerce', 'COM', 'Faculty of Commerce & Management'),
('Management Studies', 'MGT', 'Faculty of Commerce & Management'),
('Law', 'LAW', 'Faculty of Law'),
('Education', 'EDU', 'Faculty of Education'),
('Arts & Humanities', 'ART', 'Faculty of Arts'),
('Physical Sciences', 'PHY', 'Faculty of Science'),
('Life Sciences', 'BIO', 'Faculty of Science');

INSERT INTO programs (name, code, type, duration_years) VALUES
('Bachelor of Computer Applications', 'BCA', 'UG', 3),
('Bachelor of Business Administration', 'BBA', 'UG', 3),
('Bachelor of Commerce', 'B.Com', 'UG', 3),
('Bachelor of Arts', 'BA', 'UG', 3),
('Bachelor of Science', 'B.Sc', 'UG', 3),
('B.A. LL.B. (Integrated)', 'BA LLB', 'UG', 5),
('Bachelor of Laws', 'LLB', 'UG', 3),
('Bachelor of Education', 'B.Ed', 'UG', 2),
('Master of Computer Applications', 'MCA', 'PG', 2),
('Master of Business Administration', 'MBA', 'PG', 2),
('Master of Arts', 'MA', 'PG', 2),
('Master of Science', 'M.Sc', 'PG', 2),
('Master of Commerce', 'M.Com', 'PG', 2),
('Doctor of Philosophy', 'PhD', 'PhD', 3);
-- New tables for public website features

CREATE TABLE IF NOT EXISTS visitors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ip_address VARCHAR(45),
  visit_date DATE NOT NULL,
  visit_count INT DEFAULT 1,
  UNIQUE KEY unique_visit (ip_address, visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS page_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  page_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255),
  content TEXT,
  image_url VARCHAR(500),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gallery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  media_url VARCHAR(500) NOT NULL,
  media_type ENUM('image','video') DEFAULT 'image',
  category VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS downloads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  category VARCHAR(100),
  file_size VARCHAR(20),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(10),
  type ENUM('student','parent','visitor') DEFAULT 'visitor',
  subject VARCHAR(255),
  message TEXT NOT NULL,
  rating INT DEFAULT 5,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS placements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(200) NOT NULL,
  student_name VARCHAR(100),
  program_id INT,
  package DECIMAL(10,2),
  placement_year YEAR,
  recruitment_date DATE,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location VARCHAR(200),
  category VARCHAR(100),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS news (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  content TEXT,
  image_url VARCHAR(500),
  category VARCHAR(100),
  is_published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tenders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  document_url VARCHAR(500),
  publish_date DATE,
  due_date DATE,
  status ENUM('open','closed','awarded') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS faculty (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  designation VARCHAR(100),
  department_id INT,
  qualification TEXT,
  specialization TEXT,
  email VARCHAR(100),
  phone VARCHAR(10),
  photo_url VARCHAR(500),
  join_date DATE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS scholarships (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2),
  eligibility TEXT,
  application_deadline DATE,
  category VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
