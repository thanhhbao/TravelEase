CREATE DATABASE travelease;
USE travelease;
SET FOREIGN_KEY_CHECKS = 0;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified_at TIMESTAMP NULL DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  remember_token VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PASSWORD RESET TOKENS
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  email VARCHAR(255) NOT NULL PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  payload LONGTEXT NOT NULL,
  last_activity INT NOT NULL,
  KEY sessions_user_id_index (user_id),
  KEY sessions_last_activity_index (last_activity),
  CONSTRAINT sessions_user_id_foreign FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PERSONAL ACCESS TOKENS
CREATE TABLE IF NOT EXISTS personal_access_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tokenable_type VARCHAR(255) NOT NULL,
  tokenable_id BIGINT UNSIGNED NOT NULL,
  name TEXT NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  abilities TEXT NULL,
  last_used_at TIMESTAMP NULL DEFAULT NULL,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  KEY personal_access_tokens_expires_at_index (expires_at),
  KEY personal_access_tokens_tokenable (tokenable_type, tokenable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- EMAIL VERIFICATION CODES
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  KEY email_verification_codes_email_index (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CACHE
CREATE TABLE IF NOT EXISTS cache (
  `key` VARCHAR(255) NOT NULL PRIMARY KEY,
  `value` MEDIUMTEXT NOT NULL,
  `expiration` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cache_locks (
  `key` VARCHAR(255) NOT NULL PRIMARY KEY,
  `owner` VARCHAR(255) NOT NULL,
  `expiration` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- JOBS
CREATE TABLE IF NOT EXISTS jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  queue VARCHAR(255) NOT NULL,
  payload LONGTEXT NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL,
  reserved_at INT UNSIGNED NULL,
  available_at INT UNSIGNED NOT NULL,
  created_at INT UNSIGNED NOT NULL,
  KEY jobs_queue_index (queue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS job_batches (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  total_jobs INT NOT NULL,
  pending_jobs INT NOT NULL,
  failed_jobs INT NOT NULL,
  failed_job_ids LONGTEXT NOT NULL,
  options MEDIUMTEXT NULL,
  cancelled_at INT NULL,
  created_at INT NOT NULL,
  finished_at INT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS failed_jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  connection TEXT NOT NULL,
  queue TEXT NOT NULL,
  payload LONGTEXT NOT NULL,
  exception LONGTEXT NOT NULL,
  failed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FLIGHTS
CREATE TABLE IF NOT EXISTS flights (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  airline VARCHAR(255) NOT NULL,
  flight_number VARCHAR(50) NOT NULL,
  from_airport VARCHAR(10) NOT NULL,
  to_airport VARCHAR(10) NOT NULL,
  departure_time DATETIME NOT NULL,
  arrival_time DATETIME NOT NULL,
  duration_min INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  seats_available INT NOT NULL DEFAULT 0,
  logo TEXT NULL,
  logo_alt TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  KEY flights_flight_number_index (flight_number),
  KEY flights_from_to_index (from_airport, to_airport)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- HOTELS
CREATE TABLE IF NOT EXISTS hotels (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NULL,
  country VARCHAR(255) NULL,
  stars TINYINT UNSIGNED NULL,
  price_per_night DECIMAL(10,2) NULL,
  thumbnail TEXT NULL,
  description TEXT NULL,
  amenities JSON NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  KEY hotels_city_index (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- HOTEL IMAGES
CREATE TABLE IF NOT EXISTS hotel_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hotel_id BIGINT UNSIGNED NOT NULL,
  url TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  KEY hotel_images_hotel_id_index (hotel_id),
  CONSTRAINT hotel_images_hotel_id_foreign FOREIGN KEY (hotel_id)
    REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ROOMS
CREATE TABLE IF NOT EXISTS rooms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hotel_id BIGINT UNSIGNED NOT NULL,
  external_id BIGINT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL,
  beds VARCHAR(255) NULL,
  max_guests INT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  KEY rooms_hotel_id_index (hotel_id),
  CONSTRAINT rooms_hotel_id_foreign FOREIGN KEY (hotel_id)
    REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ROOM IMAGES
CREATE TABLE IF NOT EXISTS room_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT UNSIGNED NOT NULL,
  url TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  KEY room_images_room_id_index (room_id),
  CONSTRAINT room_images_room_id_foreign FOREIGN KEY (room_id)
    REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  hotel_id BIGINT UNSIGNED NOT NULL,
  room_id BIGINT UNSIGNED NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INT NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('pending','confirmed','cancelled','expired') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  KEY bookings_user_id_index (user_id),
  KEY bookings_hotel_id_index (hotel_id),
  CONSTRAINT bookings_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT bookings_hotel_id_foreign FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  CONSTRAINT bookings_room_id_foreign FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TICKETS
CREATE TABLE IF NOT EXISTS tickets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  flight_id BIGINT UNSIGNED NOT NULL,
  contact_email VARCHAR(255) NULL,
  contact_phone VARCHAR(50) NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('pending','confirmed','cancelled','checked_in') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  KEY tickets_user_id_index (user_id),
  KEY tickets_flight_id_index (flight_id),
  CONSTRAINT tickets_user_id_foreign FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT tickets_flight_id_foreign FOREIGN KEY (flight_id)
    REFERENCES flights(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CONTACTS TABLE
CREATE TABLE IF NOT EXISTS contacts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  status ENUM('pending','resolved') DEFAULT 'pending',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY contacts_user_id_index (user_id),
  CONSTRAINT contacts_user_id_foreign FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TICKET PASSENGERS
CREATE TABLE IF NOT EXISTS ticket_passengers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE NULL,
  passport_number VARCHAR(100) NULL,
  KEY ticket_passengers_ticket_id_index (ticket_id),
  CONSTRAINT ticket_passengers_ticket_id_foreign FOREIGN KEY (ticket_id)
    REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_flights_departure ON flights (departure_time);
CREATE INDEX idx_hotels_price ON hotels (price_per_night);
CREATE INDEX idx_rooms_price ON rooms (price);

ALTER TABLE bookings
  ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'usd' AFTER total_price,
  ADD COLUMN stripe_payment_intent_id VARCHAR(255) NULL AFTER status,
  ADD COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid' AFTER stripe_payment_intent_id;
  
  SELECT * FROM migrations WHERE migration LIKE '%2025_10_30_000001%';
  
  
SELECT id, name, email FROM users;
USE travelease;
SELECT * FROM personal_access_tokens;

SELECT * FROM email_verification_codes ORDER BY created_at DESC LIMIT 10;

		

TRUNCATE TABLE users;
SHOW TABLES LIKE 'contacts';
SELECT * FROM users;
DELETE FROM bookings;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;


SELECT * FROM bookings;

-- Thêm hotel (nếu chưa có)
INSERT INTO hotels (id, slug, name, city, country, stars, price_per_night, thumbnail, created_at, updated_at)
VALUES (1, 'demo-hotel-1', 'Seaside Hotel', 'Da Nang', 'Vietnam', 4, 120.00, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&h=900&q=80', NOW(), NOW())
ON DUPLICATE KEY UPDATE slug=VALUES(slug), thumbnail=VALUES(thumbnail), name=VALUES(name);

-- Thêm room (nếu chưa có)
INSERT INTO rooms (id, hotel_id, external_id, name, beds, max_guests, price, created_at, updated_at)
VALUES (1, 1, NULL, 'Deluxe Room', '1 king', 2, 120.00, NOW(), NOW())
ON DUPLICATE KEY UPDATE hotel_id=VALUES(hotel_id), name=VALUES(name);

ALTER TABLE users 
ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user' AFTER password;

INSERT INTO users (name, email, password, role, created_at)
VALUES (
  'Admin',
  'admin@travelease.com',
  '$2a$10$wO/2oS74F4r8Hk1q5HhZHuBaeM9L9X2nrtuDqH69YCUkSmaoLYx3q',
  'admin',
  NOW()
);
