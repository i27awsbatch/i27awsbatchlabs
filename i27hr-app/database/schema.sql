-- i27CoreHR reference schema.
--
-- This mirrors what Hibernate creates automatically in `backend/` (spring.jpa.hibernate.ddl-auto
-- is `update`, so the running app never needs this file). It's kept here per the project's suggested
-- repository layout and as a quick reference for anyone setting up MySQL by hand or writing
-- infrastructure/migration tooling against the schema.

CREATE TABLE IF NOT EXISTS employees (
  id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_code      VARCHAR(20)  NOT NULL UNIQUE,
  first_name         VARCHAR(80)  NOT NULL,
  last_name          VARCHAR(80)  NOT NULL,
  email              VARCHAR(150) NOT NULL UNIQUE,
  phone              VARCHAR(20),
  department         VARCHAR(60)  NOT NULL,
  designation        VARCHAR(80)  NOT NULL,
  manager_id         BIGINT REFERENCES employees(id),
  joining_date       DATE NOT NULL,
  location           VARCHAR(100),
  employment_status  ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  profile_image      VARCHAR(255),
  emergency_contact  VARCHAR(150),
  created_at         DATETIME(6) NOT NULL,
  updated_at         DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id    BIGINT UNIQUE REFERENCES employees(id),
  email          VARCHAR(150) NOT NULL UNIQUE,
  password_hash  VARCHAR(100) NOT NULL,
  role           ENUM('HR_ADMIN','MANAGER','EMPLOYEE') NOT NULL,
  enabled        BIT(1) NOT NULL DEFAULT 1,
  created_at     DATETIME(6) NOT NULL,
  updated_at     DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leave_balances (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id),
  leave_type  ENUM('CASUAL','SICK','EARNED') NOT NULL,
  total_days  INT NOT NULL,
  used_days   INT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_leave_balance_employee_type (employee_id, leave_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leave_requests (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id       BIGINT NOT NULL REFERENCES employees(id),
  leave_type        ENUM('CASUAL','SICK','EARNED') NOT NULL,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  reason            VARCHAR(600) NOT NULL,
  status            ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  reviewed_by       BIGINT REFERENCES employees(id),
  reviewer_comment  VARCHAR(600),
  created_at        DATETIME(6) NOT NULL,
  reviewed_at       DATETIME(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_documents (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id    BIGINT NOT NULL REFERENCES employees(id),
  document_type  VARCHAR(40)  NOT NULL,
  file_name      VARCHAR(255) NOT NULL,
  file_size      BIGINT,
  storage_type   VARCHAR(20)  NOT NULL, -- 'local' | 's3'
  storage_key    VARCHAR(400) NOT NULL, -- relative path (local) or S3 object key
  notes          VARCHAR(500),
  uploaded_by    BIGINT NOT NULL REFERENCES employees(id),
  uploaded_at    DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Backs the dashboard "recent activity" feed. Not in the spec's minimal model, but the smallest
-- addition that lets the activity feed be real data instead of decoration.
CREATE TABLE IF NOT EXISTS activity_log (
  id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_employee_id  BIGINT REFERENCES employees(id),
  actor_name         VARCHAR(150) NOT NULL,
  message            VARCHAR(400) NOT NULL,
  kind               ENUM('APPROVE','SUBMIT','SYSTEM') NOT NULL,
  created_at         DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
