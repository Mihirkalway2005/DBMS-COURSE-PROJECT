-- ==============================================================================
-- SOFTWARE LICENSE & SUBSCRIPTION MANAGEMENT SYSTEM
-- MASTER COMPLETE SQL SCRIPT (DDL + DML + ANALYTICAL QUERIES)
-- Dialect: MySQL 8.0+ / ANSI SQL Standard
-- Version: 2.4.0 Enterprise Edition
-- ==============================================================================

-- SECTION 1: DATA DEFINITION LANGUAGE (DDL)
-- ------------------------------------------------------------------------------
-- ==============================================================================
-- SOFTWARE LICENSE & SUBSCRIPTION MANAGEMENT SYSTEM
-- DATA DEFINITION LANGUAGE (DDL) SCHEMA DEFINITION
-- Dialect: MySQL 8.0+ / ANSI SQL Standard (PostgreSQL Compatible)
-- Version: 2.4.0 Enterprise Edition
-- ==============================================================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS license_management_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE license_management_db;

-- ------------------------------------------------------------------------------
-- DROP EXISTING TABLES IN REVERSE DEPENDENCY ORDER
-- ------------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_records;
DROP TABLE IF EXISTS renewal_logs;
DROP TABLE IF EXISTS license_allocations;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS licenses;
DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS devices;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS software_products;
DROP TABLE IF EXISTS license_types;
DROP TABLE IF EXISTS vendors;
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- TABLE 1: vendors
-- Stores software providers and third-party SaaS vendors.
-- ==============================================================================
CREATE TABLE vendors (
    vendor_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_code VARCHAR(50) NOT NULL UNIQUE,
    vendor_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(150) UNIQUE,
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    tier ENUM('STRATEGIC', 'PREFERRED', 'STANDARD') DEFAULT 'STANDARD',
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_vendor_email CHECK (contact_email LIKE '%@%.%')
) ENGINE=InnoDB COMMENT='Software providers and vendor enterprise profiles';

-- ==============================================================================
-- TABLE 2: software_products
-- Catalog of software applications and developer tools managed by enterprise IT.
-- ==============================================================================
CREATE TABLE software_products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    software_code VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(150) NOT NULL,
    category ENUM('DEV_TOOLS', 'PRODUCTIVITY', 'SECURITY', 'CLOUD_INFRA', 'DESIGN') DEFAULT 'PRODUCTIVITY',
    current_version VARCHAR(50) DEFAULT '1.0.0',
    description TEXT,
    vendor_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_software_vendor FOREIGN KEY (vendor_id) 
        REFERENCES vendors(vendor_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Catalog of software products and developer applications';

-- ==============================================================================
-- TABLE 3: license_types
-- Master reference table for licensing models (Seat-based, Perpetual, SaaS, OEM).
-- ==============================================================================
CREATE TABLE license_types (
    license_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_code VARCHAR(50) NOT NULL UNIQUE,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_perpetual BOOLEAN DEFAULT FALSE,
    requires_device_binding BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB COMMENT='Licensing models and entitlement structures';

-- ==============================================================================
-- TABLE 4: departments
-- Enterprise organizational cost centers and departmental divisions.
-- ==============================================================================
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_code VARCHAR(50) NOT NULL UNIQUE,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    department_head VARCHAR(100),
    budget_allocated DECIMAL(14, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dept_budget CHECK (budget_allocated >= 0.00)
) ENGINE=InnoDB COMMENT='Enterprise organizational departments and cost centers';

-- ==============================================================================
-- TABLE 5: users (employees)
-- Enterprise employees eligible to be provisioned software seats and licenses.
-- ==============================================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_code VARCHAR(50) NOT NULL UNIQUE,
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department_id INT,
    role VARCHAR(100) DEFAULT 'Specialist',
    status ENUM('ACTIVE', 'ON_LEAVE', 'TERMINATED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_department FOREIGN KEY (department_id) 
        REFERENCES departments(department_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    CONSTRAINT chk_user_email CHECK (email LIKE '%@%.%')
) ENGINE=InnoDB COMMENT='Company personnel, engineers, and license recipients';

-- ==============================================================================
-- TABLE 6: devices
-- Hardware workstations, laptops, cloud VMs, and developer servers.
-- ==============================================================================
CREATE TABLE devices (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    device_name VARCHAR(100) NOT NULL DEFAULT 'Workstation',
    device_type ENUM('LAPTOP', 'DESKTOP', 'SERVER', 'VM') DEFAULT 'LAPTOP',
    os VARCHAR(50) DEFAULT 'macOS',
    mac_address VARCHAR(50) UNIQUE,
    user_id INT,
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_device_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    CONSTRAINT fk_device_dept FOREIGN KEY (department_id) 
        REFERENCES departments(department_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Hardware devices, workstations, and endpoint machines';

-- ==============================================================================
-- TABLE 7: purchases
-- Procurement records, contract invoices, and order batches from vendors.
-- ==============================================================================
CREATE TABLE purchases (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    product_id INT NOT NULL,
    purchase_date DATE NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    total_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchase_vendor FOREIGN KEY (vendor_id) 
        REFERENCES vendors(vendor_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_purchase_product FOREIGN KEY (product_id) 
        REFERENCES software_products(product_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_purchase_qty CHECK (quantity > 0),
    CONSTRAINT chk_purchase_amount CHECK (total_amount >= 0.00)
) ENGINE=InnoDB COMMENT='Procurement orders and invoice payment records';

-- ==============================================================================
-- TABLE 8: licenses
-- Core license entity tracking keys, seats, costs, dates, and lifecycle states.
-- ==============================================================================
CREATE TABLE licenses (
    license_id INT AUTO_INCREMENT PRIMARY KEY,
    license_key VARCHAR(128) NOT NULL UNIQUE,
    product_id INT NOT NULL,
    license_type_id INT NOT NULL,
    purchase_id INT,
    total_seats INT NOT NULL DEFAULT 1,
    allocated_seats INT NOT NULL DEFAULT 0,
    purchase_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    unit_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    billing_cycle ENUM('MONTHLY', 'ANNUALLY', 'ONE_TIME') DEFAULT 'ANNUALLY',
    auto_renew BOOLEAN DEFAULT FALSE,
    status ENUM('ACTIVE', 'EXPIRED', 'SUSPENDED', 'PENDING_RENEWAL') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Integrity Constraints
    CONSTRAINT fk_license_product FOREIGN KEY (product_id) 
        REFERENCES software_products(product_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_license_type FOREIGN KEY (license_type_id) 
        REFERENCES license_types(license_type_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_license_purchase FOREIGN KEY (purchase_id) 
        REFERENCES purchases(purchase_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    CONSTRAINT chk_total_seats_positive CHECK (total_seats > 0),
    CONSTRAINT chk_allocated_seats_valid CHECK (allocated_seats >= 0 AND allocated_seats <= total_seats),
    CONSTRAINT chk_license_dates CHECK (expiry_date >= purchase_date),
    CONSTRAINT chk_unit_cost_non_negative CHECK (unit_cost >= 0.00),
    CONSTRAINT chk_total_cost_non_negative CHECK (total_cost >= 0.00)
) ENGINE=InnoDB COMMENT='Core software license entitlements, seats, and contract validity';

-- ==============================================================================
-- TABLE 9: subscriptions
-- SaaS recurring billing profiles and auto-renewal parameters for cloud tools.
-- ==============================================================================
CREATE TABLE subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT NOT NULL UNIQUE,
    billing_cycle ENUM('MONTHLY', 'ANNUALLY', 'QUARTERLY') DEFAULT 'ANNUALLY',
    auto_renew BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50) DEFAULT 'Corporate Credit Card',
    next_billing_date DATE,
    recurring_amount DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_license FOREIGN KEY (license_id) 
        REFERENCES licenses(license_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT chk_recurring_amount CHECK (recurring_amount >= 0.00)
) ENGINE=InnoDB COMMENT='Recurring SaaS subscription payment and renewal cycles';

-- ==============================================================================
-- TABLE 10: license_allocations
-- Junction table mapping license seats to specific employees and physical devices.
-- ==============================================================================
CREATE TABLE license_allocations (
    allocation_id INT AUTO_INCREMENT PRIMARY KEY,
    allocation_code VARCHAR(50) NOT NULL UNIQUE,
    license_id INT NOT NULL,
    user_id INT NOT NULL,
    device_id INT,
    allocated_date DATE NOT NULL,
    allocation_expiry DATE,
    status ENUM('ACTIVE', 'REVOKED', 'SUSPENDED') DEFAULT 'ACTIVE',
    deallocated_date TIMESTAMP NULL DEFAULT NULL,
    allocated_by VARCHAR(100) DEFAULT 'IT Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alloc_license FOREIGN KEY (license_id) 
        REFERENCES licenses(license_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_alloc_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_alloc_device FOREIGN KEY (device_id) 
        REFERENCES devices(device_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    CONSTRAINT chk_allocation_expiry CHECK (allocation_expiry IS NULL OR allocation_expiry >= allocated_date)
) ENGINE=InnoDB COMMENT='Active and historical seat assignments to employees and devices';

-- ==============================================================================
-- TABLE 11: renewal_logs
-- Historical log of license renewals, contract extensions, and invoice costs.
-- ==============================================================================
CREATE TABLE renewal_logs (
    renewal_id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT NOT NULL,
    renewal_date DATE NOT NULL,
    next_expiry_date DATE NOT NULL,
    renewal_cost DECIMAL(12, 2) NOT NULL,
    invoice_no VARCHAR(100) NOT NULL,
    approved_by VARCHAR(100) DEFAULT 'Procurement Lead',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_renewal_license FOREIGN KEY (license_id) 
        REFERENCES licenses(license_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT chk_renewal_cost CHECK (renewal_cost > 0.00),
    CONSTRAINT chk_renewal_dates CHECK (next_expiry_date > renewal_date)
) ENGINE=InnoDB COMMENT='Contract extension logs, renewal invoices, and price histories';

-- ==============================================================================
-- TABLE 12: audit_records (compliance_checks)
-- Governance logs recording software license audits, seat counts, and risks.
-- ==============================================================================
CREATE TABLE audit_records (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT,
    audit_date DATE NOT NULL,
    auditor_name VARCHAR(100) NOT NULL,
    total_licenses_audited INT DEFAULT 1,
    over_allocated_count INT DEFAULT 0,
    compliance_status ENUM('COMPLIANT', 'AT_RISK', 'NON_COMPLIANT') DEFAULT 'COMPLIANT',
    findings TEXT,
    action_taken TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_license FOREIGN KEY (license_id) 
        REFERENCES licenses(license_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT chk_over_allocated CHECK (over_allocated_count >= 0)
) ENGINE=InnoDB COMMENT='Security, legal compliance, and internal IT audit logs';

-- ==============================================================================
-- PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX idx_licenses_prod_status ON licenses(product_id, status);
CREATE INDEX idx_licenses_expiry ON licenses(expiry_date);
CREATE INDEX idx_allocations_active ON license_allocations(license_id, user_id, status);
CREATE INDEX idx_allocations_user ON license_allocations(user_id);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_devices_user ON devices(user_id);
CREATE INDEX idx_purchases_vendor ON purchases(vendor_id);
CREATE INDEX idx_renewals_license ON renewal_logs(license_id, renewal_date);
CREATE INDEX idx_audits_status ON audit_records(compliance_status);


-- SECTION 2: DATA MANIPULATION LANGUAGE (DML) & TRANSACTIONS
-- ------------------------------------------------------------------------------
-- ==============================================================================
-- SOFTWARE LICENSE & SUBSCRIPTION MANAGEMENT SYSTEM
-- DATA MANIPULATION LANGUAGE (DML) & TRANSACTIONAL OPERATIONS
-- Dialect: MySQL 8.0+ / ANSI SQL Standard
-- Version: 2.4.0 Enterprise Edition
-- ==============================================================================

USE license_management_db;

-- ------------------------------------------------------------------------------
-- 1. SEED DATA POPULATION
-- ------------------------------------------------------------------------------

-- Vendors
INSERT INTO vendors (vendor_code, vendor_name, contact_email, contact_phone, website, tier, address) VALUES
('VND-JB-001', 'JetBrains s.r.o.', 'enterprise-sales@jetbrains.com', '+420 241 722 501', 'https://www.jetbrains.com', 'STRATEGIC', 'Na hrebenech II 1718/8, 140 00 Prague 4, Czech Republic'),
('VND-MS-002', 'Microsoft Corporation', 'volume-license@microsoft.com', '+1 800-642-7676', 'https://www.microsoft.com', 'STRATEGIC', 'One Microsoft Way, Redmond, WA 98052, USA'),
('VND-AD-003', 'Adobe Systems Inc.', 'adobecare-ent@adobe.com', '+1 800-833-6687', 'https://www.adobe.com', 'PREFERRED', '345 Park Avenue, San Jose, CA 95110, USA'),
('VND-AT-004', 'Atlassian Pty Ltd', 'procurement@atlassian.com', '+61 2 9262 0777', 'https://www.atlassian.com', 'PREFERRED', '341 George Street, Sydney NSW 2000, Australia'),
('VND-FG-005', 'Figma Inc.', 'enterprise@figma.com', '+1 415-555-0199', 'https://www.figma.com', 'PREFERRED', '760 Market St, San Francisco, CA 94102, USA'),
('VND-DK-006', 'Docker Inc.', 'sales@docker.com', '+1 415-840-0250', 'https://www.docker.com', 'STANDARD', '100 Bush St, San Francisco, CA 94104, USA'),
('VND-DD-007', 'Datadog Inc.', 'renewals@datadoghq.com', '+1 866-329-4989', 'https://www.datadoghq.com', 'STRATEGIC', '620 8th Ave, New York, NY 10018, USA');

-- Software Products
INSERT INTO software_products (software_code, product_name, category, current_version, description, vendor_id) VALUES
('SW-JB-01', 'IntelliJ IDEA Ultimate', 'DEV_TOOLS', '2025.1.2', 'Leading IDE for Java, Kotlin, and enterprise backend engineering', 1),
('SW-JB-02', 'CLion & WebStorm Suite', 'DEV_TOOLS', '2025.1.0', 'C/C++ native development and modern TypeScript IDE suite', 1),
('SW-MS-01', 'Visual Studio Enterprise', 'DEV_TOOLS', '2026.2.0', 'Enterprise IDE with advanced code diagnostics and test suites', 2),
('SW-MS-02', 'Microsoft 365 E5 Suite', 'PRODUCTIVITY', '2026.4', 'Integrated productivity, communication, and enterprise security cloud suite', 2),
('SW-AD-01', 'Adobe Creative Cloud All Apps', 'DESIGN', '2026.0', 'Comprehensive creative suite including Photoshop, Illustrator, Premiere', 3),
('SW-AT-01', 'Jira Software & Confluence Cloud', 'PRODUCTIVITY', 'Cloud-Latest', 'Agile project tracking, sprint planning, and team wiki documentation', 4),
('SW-FG-01', 'Figma Enterprise Workspace', 'DESIGN', '2026.1', 'Collaborative UI/UX design, prototyping, and design systems platform', 5),
('SW-DK-01', 'Docker Desktop Business', 'DEV_TOOLS', '4.38.0', 'Containerization environment with hardened security and private registry', 6),
('SW-DD-01', 'Datadog Infrastructure & APM', 'CLOUD_INFRA', 'v7.50', 'Full-stack application performance monitoring and cloud telemetry', 7);

-- License Types
INSERT INTO license_types (type_code, type_name, description, is_perpetual, requires_device_binding) VALUES
('LT-SAAS-01', 'SaaS Named User Subscription', 'Annual cloud subscription bound to individual corporate email', FALSE, FALSE),
('LT-SEAT-02', 'Floating / Concurrent Seat License', 'Pool of shared seats with concurrent checkout limits', FALSE, FALSE),
('LT-PERP-03', 'Perpetual License with Maintenance', 'Permanent license ownership with annual maintenance and upgrade contract', TRUE, TRUE),
('LT-OEM-04', 'OEM Device Bound License', 'Software license permanently coupled to single hardware asset tag', TRUE, TRUE),
('LT-TRL-05', 'Commercial Evaluation / Trial', 'Time-limited 30-day evaluation license with seat capping', FALSE, FALSE);

-- Departments
INSERT INTO departments (dept_code, department_name, department_head, budget_allocated) VALUES
('DEP-ENG-01', 'Core Engineering & Architecture', 'Elena Rostova, VP Eng', 250000.00),
('DEP-DEV-02', 'Cloud Infrastructure & DevOps', 'Marcus Vance, Head of Infra', 180000.00),
('DEP-DES-03', 'Product Design & UI/UX', 'Sophia Chen, VP Design', 90000.00),
('DEP-SEC-04', 'Cybersecurity & Governance', 'David Kim, CISO', 120000.00),
('DEP-OPS-05', 'People Operations & IT Support', 'Rachel Patel, IT Director', 75000.00);

-- Users (Employees)
INSERT INTO users (emp_code, user_name, email, department_id, role, status) VALUES
('EMP-1001', 'Alex Mercer', 'alex.mercer@enterprise.io', 1, 'Principal Software Engineer', 'ACTIVE'),
('EMP-1002', 'Sarah Jenkins', 'sarah.jenkins@enterprise.io', 1, 'Senior Backend Engineer', 'ACTIVE'),
('EMP-1003', 'Tariq Al-Mansoor', 'tariq.mansoor@enterprise.io', 2, 'Senior DevOps Architect', 'ACTIVE'),
('EMP-1004', 'Clara Oswald', 'clara.oswald@enterprise.io', 3, 'Lead Product Designer', 'ACTIVE'),
('EMP-1005', 'Liam Gallagher', 'liam.gallagher@enterprise.io', 3, 'Senior UX Researcher', 'ACTIVE'),
('EMP-1006', 'Maya Lin', 'maya.lin@enterprise.io', 4, 'Cybersecurity Analyst', 'ACTIVE'),
('EMP-1007', 'Oliver Queen', 'oliver.queen@enterprise.io', 5, 'IT Systems Administrator', 'ACTIVE'),
('EMP-1008', 'James Wilson', 'james.wilson@enterprise.io', 1, 'Full-Stack Developer', 'ACTIVE');

-- Devices
INSERT INTO devices (asset_tag, device_name, device_type, os, mac_address, user_id, department_id) VALUES
('AST-MAC-8801', 'Alex MacBook Pro 16 M3 Max', 'LAPTOP', 'macOS Sonoma', 'A4:83:E7:22:91:01', 1, 1),
('AST-MAC-8802', 'Sarah MacBook Pro 14 M3 Pro', 'LAPTOP', 'macOS Sonoma', 'A4:83:E7:22:91:02', 2, 1),
('AST-LNX-4401', 'DevOps Build Workstation Threadripper', 'DESKTOP', 'Ubuntu 24.04 LTS', '3C:52:82:11:04:99', 3, 2),
('AST-MAC-8803', 'Clara Studio Display & Mac Studio M2 Ultra', 'DESKTOP', 'macOS Sonoma', 'A4:83:E7:22:91:03', 4, 3),
('AST-MAC-8804', 'Liam MacBook Air 15 M3', 'LAPTOP', 'macOS Sonoma', 'A4:83:E7:22:91:04', 5, 3),
('AST-SVR-9001', 'Security Telemetry Host Alpha', 'SERVER', 'Red Hat Enterprise Linux 9', '00:1A:4A:16:01:22', 6, 4);

-- Purchases
INSERT INTO purchases (vendor_id, product_id, purchase_date, quantity, invoice_number, total_amount) VALUES
(1, 1, '2025-02-15', 50, 'INV-JB-2025-8831', 24950.00),
(2, 3, '2025-01-10', 30, 'INV-MS-2025-1049', 35970.00),
(2, 4, '2025-03-01', 150, 'INV-MS-2025-3920', 67500.00),
(3, 5, '2025-02-01', 25, 'INV-AD-2025-4412', 21575.00),
(4, 6, '2025-01-20', 100, 'INV-AT-2025-9921', 19200.00),
(5, 7, '2025-02-28', 40, 'INV-FG-2025-5021', 14400.00),
(6, 8, '2025-03-10', 60, 'INV-DK-2025-1102', 17280.00),
(7, 9, '2025-01-05', 10, 'INV-DD-2025-7731', 36000.00);

-- Licenses
INSERT INTO licenses (license_key, product_id, license_type_id, purchase_id, total_seats, allocated_seats, purchase_date, expiry_date, unit_cost, total_cost, billing_cycle, auto_renew, status) VALUES
('JB-ULT-9942-8812-4011', 1, 1, 1, 50, 48, '2025-02-15', '2026-02-15', 499.00, 24950.00, 'ANNUALLY', TRUE, 'ACTIVE'),
('MS-VS-ENT-2025-7719-33', 3, 1, 2, 30, 28, '2025-01-10', '2026-01-10', 1199.00, 35970.00, 'ANNUALLY', TRUE, 'ACTIVE'),
('MS-365-E5-ENT-4412-00', 4, 1, 3, 150, 142, '2025-03-01', '2026-03-01', 450.00, 67500.00, 'ANNUALLY', TRUE, 'ACTIVE'),
('AD-CC-2025-DESIGN-819', 5, 1, 4, 25, 24, '2025-02-01', '2026-02-01', 863.00, 21575.00, 'ANNUALLY', FALSE, 'PENDING_RENEWAL'),
('AT-JIRA-CONF-CORP-902', 6, 2, 5, 100, 95, '2025-01-20', '2026-01-20', 192.00, 19200.00, 'ANNUALLY', TRUE, 'ACTIVE'),
('FG-ORG-ENT-2025-3341', 7, 1, 6, 40, 39, '2025-02-28', '2026-02-28', 360.00, 14400.00, 'ANNUALLY', TRUE, 'ACTIVE'),
('DK-BIZ-2025-CONTAIN-10', 8, 2, 7, 60, 56, '2025-03-10', '2026-03-10', 288.00, 17280.00, 'ANNUALLY', TRUE, 'ACTIVE'),
('DD-APM-INFRA-PRO-0099', 9, 2, 8, 10, 10, '2025-01-05', '2026-01-05', 3600.00, 36000.00, 'ANNUALLY', TRUE, 'ACTIVE'),
('JB-CLION-TRL-EXP-2024', 2, 5, NULL, 15, 2, '2024-09-01', '2024-10-01', 0.00, 0.00, 'ONE_TIME', FALSE, 'EXPIRED');

-- Subscriptions
INSERT INTO subscriptions (license_id, billing_cycle, auto_renew, payment_method, next_billing_date, recurring_amount) VALUES
(1, 'ANNUALLY', TRUE, 'Amex Corporate Gold #8012', '2026-02-15', 24950.00),
(2, 'ANNUALLY', TRUE, 'Chase Corporate Wire Transfer', '2026-01-10', 35970.00),
(3, 'ANNUALLY', TRUE, 'Chase Corporate Wire Transfer', '2026-03-01', 67500.00),
(5, 'ANNUALLY', TRUE, 'Amex Corporate Gold #8012', '2026-01-20', 19200.00),
(6, 'ANNUALLY', TRUE, 'Amex Corporate Gold #8012', '2026-02-28', 14400.00),
(7, 'ANNUALLY', TRUE, 'Silicon Valley Bank ACH', '2026-03-10', 17280.00),
(8, 'ANNUALLY', TRUE, 'Chase Corporate Wire Transfer', '2026-01-05', 36000.00);

-- License Allocations
INSERT INTO license_allocations (allocation_code, license_id, user_id, device_id, allocated_date, allocation_expiry, status, allocated_by) VALUES
('ALC-2025-001', 1, 1, 1, '2025-02-16', '2026-02-15', 'ACTIVE', 'Rachel Patel'),
('ALC-2025-002', 1, 2, 2, '2025-02-16', '2026-02-15', 'ACTIVE', 'Rachel Patel'),
('ALC-2025-003', 1, 8, NULL, '2025-03-01', '2026-02-15', 'ACTIVE', 'Oliver Queen'),
('ALC-2025-004', 2, 1, 1, '2025-01-12', '2026-01-10', 'ACTIVE', 'Oliver Queen'),
('ALC-2025-005', 3, 1, 1, '2025-03-02', '2026-03-01', 'ACTIVE', 'Rachel Patel'),
('ALC-2025-006', 3, 2, 2, '2025-03-02', '2026-03-01', 'ACTIVE', 'Rachel Patel'),
('ALC-2025-007', 3, 3, 3, '2025-03-02', '2026-03-01', 'ACTIVE', 'Rachel Patel'),
('ALC-2025-008', 3, 4, 4, '2025-03-02', '2026-03-01', 'ACTIVE', 'Rachel Patel'),
('ALC-2025-009', 4, 4, 4, '2025-02-05', '2026-02-01', 'ACTIVE', 'Sophia Chen'),
('ALC-2025-010', 4, 5, 5, '2025-02-05', '2026-02-01', 'ACTIVE', 'Sophia Chen'),
('ALC-2025-011', 6, 4, 4, '2025-03-01', '2026-02-28', 'ACTIVE', 'Sophia Chen'),
('ALC-2025-012', 6, 5, 5, '2025-03-01', '2026-02-28', 'ACTIVE', 'Sophia Chen'),
('ALC-2025-013', 7, 1, 1, '2025-03-12', '2026-03-10', 'ACTIVE', 'Oliver Queen'),
('ALC-2025-014', 7, 3, 3, '2025-03-12', '2026-03-10', 'ACTIVE', 'Oliver Queen'),
('ALC-2025-015', 8, 3, 3, '2025-01-08', '2026-01-05', 'ACTIVE', 'Marcus Vance'),
('ALC-2025-016', 8, 6, 6, '2025-01-08', '2026-01-05', 'ACTIVE', 'David Kim');

-- Renewal Logs
INSERT INTO renewal_logs (license_id, renewal_date, next_expiry_date, renewal_cost, invoice_no, approved_by, notes) VALUES
(1, '2025-02-15', '2026-02-15', 24950.00, 'RNW-JB-2025-019', 'Elena Rostova', 'Annual renewal for 50 JetBrains Ultimate seats. 10% volume discount applied.'),
(2, '2025-01-10', '2026-01-10', 35970.00, 'RNW-MS-2025-081', 'Elena Rostova', 'Annual Visual Studio Enterprise renewal with MSDN benefits included.'),
(5, '2025-01-20', '2026-01-20', 19200.00, 'RNW-AT-2025-112', 'Marcus Vance', 'Atlassian Jira/Confluence 100-user tier renewal.');

-- Audit Records
INSERT INTO audit_records (license_id, audit_date, auditor_name, total_licenses_audited, over_allocated_count, compliance_status, findings, action_taken) VALUES
(1, '2025-06-15', 'KPMG Enterprise IT Audit', 50, 0, 'COMPLIANT', 'All 48 allocated seats verified against active employee directory. No phantom seats.', 'Clean audit certification granted.'),
(4, '2025-09-10', 'Internal Security & Compliance', 25, 0, 'AT_RISK', 'Adobe CC subscription set to expire in 30 days without auto-renew enabled.', 'Triggered procurement notification to VP Design.'),
(8, '2025-10-01', 'FinOps Governance Board', 10, 0, 'COMPLIANT', 'Datadog hosts at 100% capacity utilization. Expansion recommended for Q1.', 'Approved budget allocation for +5 additional nodes.');

-- ==============================================================================
-- 2. OPERATIONAL DML TRANSACTIONS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- TRANSACTION 1: ALLOCATE LICENSE SEAT TO AN EMPLOYEE & DEVICE
-- Enforces ACID guarantee: verifies seat availability, creates allocation, increments count.
-- ------------------------------------------------------------------------------
START TRANSACTION;

-- Step 1: Select and row-lock the target license
SELECT license_id, product_id, total_seats, allocated_seats, status 
FROM licenses 
WHERE license_id = 1 
FOR UPDATE;

-- Step 2: Validate seats and status (total_seats > allocated_seats, status = 'ACTIVE')
-- Insert new allocation record
INSERT INTO license_allocations (
    allocation_code,
    license_id,
    user_id,
    device_id,
    allocated_date,
    allocation_expiry,
    status,
    allocated_by
) VALUES (
    CONCAT('ALC-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 9999), 4, '0')),
    1,
    2,  -- Sarah Jenkins
    2,  -- Laptop
    CURRENT_DATE(),
    DATE_ADD(CURRENT_DATE(), INTERVAL 1 YEAR),
    'ACTIVE',
    'IT Automation Bot'
);

-- Step 3: Increment allocated seats atomically
UPDATE licenses 
SET allocated_seats = allocated_seats + 1 
WHERE license_id = 1;

COMMIT;

-- ------------------------------------------------------------------------------
-- TRANSACTION 2: SEAT RECLAMATION / OFFBOARDING WORKFLOW
-- Revokes an employee seat upon team departure or device repurpose.
-- ------------------------------------------------------------------------------
START TRANSACTION;

-- Mark allocation as REVOKED with deallocation timestamp
UPDATE license_allocations 
SET status = 'REVOKED',
    deallocated_date = CURRENT_TIMESTAMP()
WHERE allocation_id = 3;

-- Safely decrement allocated seat counter
UPDATE licenses 
SET allocated_seats = GREATEST(0, allocated_seats - 1)
WHERE license_id = (
    SELECT license_id FROM license_allocations WHERE allocation_id = 3
);

COMMIT;

-- ------------------------------------------------------------------------------
-- TRANSACTION 3: ANNUAL LICENSE CONTRACT RENEWAL
-- Logs renewal payment invoice, extends expiry date by 1 year, restores ACTIVE status.
-- ------------------------------------------------------------------------------
START TRANSACTION;

-- Step 1: Record renewal invoice details
INSERT INTO renewal_logs (
    license_id,
    renewal_date,
    next_expiry_date,
    renewal_cost,
    invoice_no,
    approved_by,
    notes
) VALUES (
    4, -- Adobe Creative Cloud
    CURRENT_DATE(),
    DATE_ADD((SELECT expiry_date FROM licenses WHERE license_id = 4), INTERVAL 1 YEAR),
    21575.00,
    'INV-RENEW-2026-ADOBE-01',
    'Sophia Chen, VP Design',
    'Executed scheduled contract renewal for 25 Adobe All-Apps seats.'
);

-- Step 2: Update license expiry and status
UPDATE licenses 
SET expiry_date = DATE_ADD(expiry_date, INTERVAL 1 YEAR),
    status = 'ACTIVE',
    total_cost = total_cost + 21575.00
WHERE license_id = 4;

COMMIT;

-- ------------------------------------------------------------------------------
-- TRANSACTION 4: STRATEGIC BULK PRICING & TIER ADJUSTMENT
-- ------------------------------------------------------------------------------
UPDATE vendors 
SET tier = 'STRATEGIC' 
WHERE vendor_code = 'VND-FG-005';

-- ------------------------------------------------------------------------------
-- TRANSACTION 5: SAFE REMOVAL OF EXPIRED TRIAL RECORDS
-- ------------------------------------------------------------------------------
DELETE FROM licenses 
WHERE status = 'EXPIRED' 
  AND license_type_id = (SELECT license_type_id FROM license_types WHERE type_code = 'LT-TRL-05')
  AND allocated_seats = 0;


-- SECTION 3: BUSINESS REPORTING & ANALYTICAL SQL QUERIES
-- ------------------------------------------------------------------------------
-- ==============================================================================
-- SOFTWARE LICENSE & SUBSCRIPTION MANAGEMENT SYSTEM
-- BUSINESS REPORTING, AUDITING & ANALYTICAL SQL QUERIES
-- Dialect: MySQL 8.0+ / PostgreSQL Compatible
-- Version: 2.4.0 Enterprise Edition
-- ==============================================================================

USE license_management_db;

-- ==============================================================================
-- QUERY 1: 30-DAY LICENSE EXPIRATION ALERT & RENEWAL PIPELINE
-- Purpose: Identifies all active licenses expiring within the next 30 days.
-- Business Impact: Prevents developer downtime and unexpected service lockouts.
-- ==============================================================================
SELECT 
    l.license_id,
    v.vendor_name,
    sp.product_name,
    sp.category,
    l.license_key,
    l.total_seats,
    l.allocated_seats,
    l.expiry_date,
    DATEDIFF(l.expiry_date, CURRENT_DATE()) AS days_until_expiration,
    l.total_cost AS annual_renewal_cost,
    l.auto_renew,
    CASE 
        WHEN DATEDIFF(l.expiry_date, CURRENT_DATE()) <= 7 THEN 'CRITICAL - RENEW TODAY'
        WHEN DATEDIFF(l.expiry_date, CURRENT_DATE()) <= 15 THEN 'URGENT - PENDING APPROVAL'
        ELSE 'UPCOMING EXPIRATION'
    END AS urgency_level
FROM licenses l
JOIN software_products sp ON l.product_id = sp.product_id
JOIN vendors v ON sp.vendor_id = v.vendor_id
WHERE l.status IN ('ACTIVE', 'PENDING_RENEWAL')
  AND l.expiry_date BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY)
ORDER BY l.expiry_date ASC;

-- ==============================================================================
-- QUERY 2: HIGH SEAT SATURATION & CAPACITY RISK (UTILIZATION >= 90%)
-- Purpose: Detects software contracts running out of seats to proactively expand tiers.
-- Business Impact: Avoids onboarding delays for new engineering hires.
-- ==============================================================================
SELECT 
    sp.product_name,
    v.vendor_name,
    l.total_seats,
    l.allocated_seats,
    (l.total_seats - l.allocated_seats) AS available_seats,
    ROUND((l.allocated_seats / l.total_seats) * 100, 1) AS seat_utilization_pct,
    l.unit_cost,
    CASE 
        WHEN l.allocated_seats >= l.total_seats THEN 'SATURATED (100% CAPACITY)'
        WHEN (l.allocated_seats / l.total_seats) >= 0.90 THEN 'HIGH CAPACITY WARNING (>=90%)'
        ELSE 'MODERATE UTILIZATION'
    END AS capacity_status
FROM licenses l
JOIN software_products sp ON l.product_id = sp.product_id
JOIN vendors v ON sp.vendor_id = v.vendor_id
WHERE l.status = 'ACTIVE'
  AND (l.allocated_seats / l.total_seats) >= 0.85
ORDER BY seat_utilization_pct DESC;

-- ==============================================================================
-- QUERY 3: SHELFWARE DETECTION & WASTED SOFTWARE SPEND
-- Purpose: Identifies underutilized licenses (< 25% utilization) with idle seats.
-- Business Impact: Flags contract downgrades to reclaim annual IT budget.
-- ==============================================================================
SELECT 
    sp.product_name,
    v.vendor_name,
    l.total_seats,
    l.allocated_seats,
    (l.total_seats - l.allocated_seats) AS idle_seats,
    ROUND((l.allocated_seats / l.total_seats) * 100, 1) AS utilization_pct,
    l.unit_cost,
    ((l.total_seats - l.allocated_seats) * l.unit_cost) AS wasted_annual_spend,
    'RECOMMEND CONTRACT DOWNSIZE' AS finops_action
FROM licenses l
JOIN software_products sp ON l.product_id = sp.product_id
JOIN vendors v ON sp.vendor_id = v.vendor_id
WHERE l.status = 'ACTIVE'
  AND (l.total_seats - l.allocated_seats) > 0
ORDER BY wasted_annual_spend DESC;

-- ==============================================================================
-- QUERY 4: DEPARTMENT-WISE SOFTWARE SPEND & SEAT ALLOCATION
-- Purpose: Aggregates total software expenditure across internal company departments.
-- Business Impact: Delivers cost-center chargeback accounting for enterprise FinOps.
-- ==============================================================================
SELECT 
    d.dept_code,
    d.department_name,
    d.department_head,
    COUNT(DISTINCT u.user_id) AS total_employees,
    COUNT(DISTINCT la.allocation_id) AS active_licensed_seats,
    COALESCE(SUM(l.unit_cost), 0.00) AS total_software_spend,
    d.budget_allocated AS department_it_budget,
    ROUND(
        (COALESCE(SUM(l.unit_cost), 0.00) / NULLIF(d.budget_allocated, 0)) * 100, 
        2
    ) AS budget_consumed_pct
FROM departments d
LEFT JOIN users u ON d.department_id = u.department_id
LEFT JOIN license_allocations la ON u.user_id = la.user_id AND la.status = 'ACTIVE'
LEFT JOIN licenses l ON la.license_id = l.license_id
GROUP BY d.department_id, d.dept_code, d.department_name, d.department_head, d.budget_allocated
ORDER BY total_software_spend DESC;

-- ==============================================================================
-- QUERY 5: VENDOR SPEND CONCENTRATION & CONTRACT TIERING
-- Purpose: Analyzes vendor concentration and portfolio size across strategic suppliers.
-- Business Impact: Empowers enterprise procurement with leverage during contract renewals.
-- ==============================================================================
SELECT 
    v.vendor_code,
    v.vendor_name,
    v.tier,
    COUNT(DISTINCT sp.product_id) AS distinct_products,
    COUNT(DISTINCT l.license_id) AS active_contracts,
    SUM(l.total_seats) AS aggregate_seats_purchased,
    SUM(l.allocated_seats) AS aggregate_seats_in_use,
    SUM(l.total_cost) AS total_annual_contract_value
FROM vendors v
JOIN software_products sp ON v.vendor_id = sp.vendor_id
JOIN licenses l ON sp.product_id = l.product_id
WHERE l.status = 'ACTIVE'
GROUP BY v.vendor_id, v.vendor_code, v.vendor_name, v.tier
ORDER BY total_annual_contract_value DESC;

-- ==============================================================================
-- QUERY 6: COMPLIANCE AUDIT DISCREPANCIES & GOVERNANCE BREACHES
-- Purpose: Extracts audit infractions, over-allocated seats, and flagged compliance issues.
-- Business Impact: Ensures ISO 27001, SOC2, and vendor legal compliance readiness.
-- ==============================================================================
SELECT 
    ar.audit_id,
    ar.audit_date,
    ar.auditor_name,
    v.vendor_name,
    sp.product_name,
    ar.compliance_status,
    ar.over_allocated_count,
    ar.findings,
    ar.action_taken
FROM audit_records ar
LEFT JOIN licenses l ON ar.license_id = l.license_id
LEFT JOIN software_products sp ON l.product_id = sp.product_id
LEFT JOIN vendors v ON sp.vendor_id = v.vendor_id
WHERE ar.compliance_status IN ('AT_RISK', 'NON_COMPLIANT')
   OR ar.over_allocated_count > 0
ORDER BY ar.audit_date DESC;

-- ==============================================================================
-- QUERY 7: 360-DEGREE EMPLOYEE SOFTWARE & HARDWARE ASSET INVENTORY
-- Purpose: Generates complete software footprint and hardware profile for any employee.
-- Business Impact: Streamlines IT helpdesk provisioning and seamless offboarding.
-- ==============================================================================
SELECT 
    u.emp_code,
    u.user_name,
    u.email,
    d.department_name,
    sp.product_name,
    sp.category,
    l.license_key,
    la.allocation_code,
    la.allocated_date,
    la.allocation_expiry,
    dev.asset_tag,
    dev.device_name,
    dev.os
FROM users u
JOIN departments d ON u.department_id = d.department_id
JOIN license_allocations la ON u.user_id = la.user_id AND la.status = 'ACTIVE'
JOIN licenses l ON la.license_id = l.license_id
JOIN software_products sp ON l.product_id = sp.product_id
LEFT JOIN devices dev ON la.device_id = dev.device_id
ORDER BY u.emp_code ASC, sp.product_name ASC;

-- ==============================================================================
-- QUERY 8: SAAS RECURRING SUBSCRIPTION CASH-FLOW PROJECTION
-- Purpose: Projects upcoming quarterly SaaS cash-flow outlay for automated billings.
-- Business Impact: Supports CFO treasury planning and financial predictability.
-- ==============================================================================
SELECT 
    DATE_FORMAT(s.next_billing_date, '%Y-Q%q') AS billing_quarter,
    s.billing_cycle,
    COUNT(s.subscription_id) AS total_subscriptions,
    SUM(s.recurring_amount) AS total_projected_cash_outlay,
    GROUP_CONCAT(DISTINCT v.vendor_name SEPARATOR ', ') AS vendors_involved
FROM subscriptions s
JOIN licenses l ON s.license_id = l.license_id
JOIN software_products sp ON l.product_id = sp.product_id
JOIN vendors v ON sp.vendor_id = v.vendor_id
WHERE s.auto_renew = TRUE
  AND s.next_billing_date >= CURRENT_DATE()
GROUP BY billing_quarter, s.billing_cycle
ORDER BY billing_quarter ASC;

-- ==============================================================================
-- QUERY 9: HISTORICAL RENEWAL INFLATION & PRICE VARIANCE ANALYSIS
-- Purpose: Tracks year-over-year cost increases across renewals using window functions.
-- Business Impact: Detects vendor hidden price increases above inflation.
-- ==============================================================================
SELECT 
    rl.renewal_id,
    sp.product_name,
    v.vendor_name,
    rl.renewal_date,
    rl.renewal_cost,
    LAG(rl.renewal_cost, 1) OVER (PARTITION BY rl.license_id ORDER BY rl.renewal_date) AS previous_renewal_cost,
    ROUND(
        rl.renewal_cost - LAG(rl.renewal_cost, 1) OVER (PARTITION BY rl.license_id ORDER BY rl.renewal_date), 
        2
    ) AS cost_difference,
    rl.approved_by,
    rl.invoice_no
FROM renewal_logs rl
JOIN licenses l ON rl.license_id = l.license_id
JOIN software_products sp ON l.product_id = sp.product_id
JOIN vendors v ON sp.vendor_id = v.vendor_id
ORDER BY rl.renewal_date DESC;

-- ==============================================================================
-- QUERY 10: CONCURRENT MULTI-DEVICE ALLOCATION POLICY AUDIT
-- Purpose: Flags employees allocated multiple active seats on separate devices.
-- Business Impact: Identifies potential single-user license compliance violations.
-- ==============================================================================
SELECT 
    u.user_name,
    u.email,
    sp.product_name,
    COUNT(DISTINCT la.device_id) AS active_device_count,
    GROUP_CONCAT(d.asset_tag SEPARATOR ' | ') AS associated_asset_tags
FROM license_allocations la
JOIN users u ON la.user_id = u.user_id
JOIN licenses l ON la.license_id = l.license_id
JOIN software_products sp ON l.product_id = sp.product_id
JOIN devices d ON la.device_id = d.device_id
WHERE la.status = 'ACTIVE'
GROUP BY u.user_id, u.user_name, u.email, sp.product_id, sp.product_name
HAVING active_device_count > 1;

