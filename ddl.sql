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
