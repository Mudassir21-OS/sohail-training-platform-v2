-- =====================================================
-- Sohail Training Platform v2 - Week 2
-- Data Layer: Minimal Seed Data
-- Author: Mudassir Shahab
-- =====================================================

-- Seed one admin account only.
-- New trainees should be created from the dashboard/API, not hardcoded.

INSERT INTO users (name, email, password_hash, role)
VALUES
('Admin User', 'admin@sohail.com', '$2b$10$/Yxwp3IsPnC6vgdMF0kesOazgU4eWAFgomPzevHzpKLdTqnSsc8R.', 'admin');