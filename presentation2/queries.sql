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
