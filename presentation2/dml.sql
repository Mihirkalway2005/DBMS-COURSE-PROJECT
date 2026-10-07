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
