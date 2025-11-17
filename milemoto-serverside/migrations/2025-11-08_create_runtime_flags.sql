CREATE TABLE IF NOT EXISTS runtime_flags (
  flag_key VARCHAR(64) NOT NULL PRIMARY KEY,
  bool_value TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO runtime_flags (flag_key, bool_value)
VALUES ('trustedDeviceFpEnforceAll', 0)
ON DUPLICATE KEY UPDATE flag_key = flag_key;
