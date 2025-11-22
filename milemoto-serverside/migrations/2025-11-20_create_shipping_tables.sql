-- Table for global shipping methods
CREATE TABLE IF NOT EXISTS shipping_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE, -- 'flat_rate', 'area_wise', 'product_wise'
  name VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'inactive',
  cost DECIMAL(10, 2) DEFAULT NULL, -- Used for Flat Rate global cost and Area Wise fallback
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed initial methods
INSERT IGNORE INTO shipping_methods (code, name, status, cost) VALUES
('flat_rate', 'Flat Rate', 'inactive', 0.00),
('area_wise', 'Area Wise', 'inactive', 0.00),
('product_wise', 'Product Wise', 'inactive', NULL);

-- Table for Area Wise rates
CREATE TABLE IF NOT EXISTS shipping_area_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  country_id BIGINT UNSIGNED NOT NULL,
  state_id BIGINT UNSIGNED DEFAULT NULL,
  city_id BIGINT UNSIGNED DEFAULT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
  FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  
  -- Ensure unique combination of location
  UNIQUE KEY unique_location_rate (country_id, state_id, city_id)
);