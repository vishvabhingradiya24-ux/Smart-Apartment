-- Select your Smart Apartment database in MySQL Workbench before running this file.
CREATE TABLE IF NOT EXISTS assets (
  asset_id INT NOT NULL AUTO_INCREMENT,
  asset_name VARCHAR(150) NOT NULL,
  category VARCHAR(80) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  assigned INT NOT NULL DEFAULT 0,
  condition_status VARCHAR(40) NOT NULL DEFAULT 'Good',
  location VARCHAR(150) NOT NULL DEFAULT '',
  status ENUM('Available', 'In Use', 'Maintenance') NOT NULL DEFAULT 'Available',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (asset_id),
  CONSTRAINT chk_assets_quantity CHECK (quantity >= 0),
  CONSTRAINT chk_assets_assigned CHECK (assigned >= 0 AND assigned <= quantity)
);
