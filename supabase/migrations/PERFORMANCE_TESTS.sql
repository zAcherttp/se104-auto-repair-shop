-- =====================================================
-- DATABASE PERFORMANCE TESTING
-- =====================================================
-- Tests for query performance, index effectiveness, and RLS overhead
-- =====================================================

-- =====================================================
-- 1. BASELINE PERFORMANCE TESTS
-- =====================================================

-- Test 1: Measure query execution time
EXPLAIN (ANALYZE, BUFFERS, TIMING)
SELECT 
    v.*,
    c.name as customer_name,
    c.phone,
    COUNT(DISTINCT ro.id) as total_repairs,
    COALESCE(SUM(ro.total_amount), 0) as total_repair_cost,
    COALESCE(v.total_paid, 0) as total_paid
FROM vehicles v
LEFT JOIN customers c ON c.id = v.customer_id
LEFT JOIN repair_orders ro ON ro.vehicle_id = v.id
GROUP BY v.id, c.id
ORDER BY v.created_at DESC
LIMIT 100;

-- Test 2: Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Test 3: Find slow queries
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time,
    stddev_exec_time
FROM pg_stat_statements
WHERE query LIKE '%vehicles%' OR query LIKE '%repair_orders%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- =====================================================
-- 2. STRESS TESTS WITH SAMPLE DATA
-- =====================================================

-- Generate test data
DO $$
DECLARE
    i INTEGER;
    customer_id UUID;
    vehicle_id UUID;
BEGIN
    -- Create 1000 test customers
    FOR i IN 1..1000 LOOP
        INSERT INTO customers (name, phone, address)
        VALUES (
            'Test Customer ' || i,
            '090' || LPAD(i::text, 7, '0'),
            'Test Address ' || i
        )
        RETURNING id INTO customer_id;
        
        -- Create 1-3 vehicles per customer
        FOR j IN 1..floor(random() * 3 + 1)::int LOOP
            INSERT INTO vehicles (license_plate, brand, customer_id)
            VALUES (
                '51' || CHR(65 + floor(random() * 26)::int) || '-' || LPAD((i * 10 + j)::text, 5, '0'),
                (ARRAY['Toyota', 'Honda', 'Mazda', 'Ford', 'Hyundai'])[floor(random() * 5 + 1)],
                customer_id
            )
            RETURNING id INTO vehicle_id;
            
            -- Create 2-10 repair orders per vehicle
            FOR k IN 1..floor(random() * 9 + 2)::int LOOP
                INSERT INTO repair_orders (
                    vehicle_id,
                    reception_date,
                    status,
                    total_amount
                )
                VALUES (
                    vehicle_id,
                    CURRENT_DATE - floor(random() * 365)::int,
                    (ARRAY['pending', 'in_progress', 'completed'])[floor(random() * 3 + 1)]::repair_order_status,
                    floor(random() * 10000000 + 100000)
                );
            END LOOP;
        END LOOP;
        
        IF i % 100 = 0 THEN
            RAISE NOTICE 'Created % customers with vehicles and orders', i;
        END IF;
    END LOOP;
END $$;

-- Verify data creation
SELECT 
    (SELECT COUNT(*) FROM customers) as customers,
    (SELECT COUNT(*) FROM vehicles) as vehicles,
    (SELECT COUNT(*) FROM repair_orders) as repair_orders;

-- =====================================================
-- 3. PERFORMANCE BENCHMARKS
-- =====================================================

-- Benchmark 1: Vehicles list with debt calculation (most common query)
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    v.id,
    v.license_plate,
    v.brand,
    c.name as customer_name,
    c.phone,
    COALESCE(SUM(ro.total_amount), 0) as total_repairs,
    COALESCE(v.total_paid, 0) as total_paid,
    COALESCE(SUM(ro.total_amount), 0) - COALESCE(v.total_paid, 0) as debt
FROM vehicles v
LEFT JOIN customers c ON c.id = v.customer_id
LEFT JOIN repair_orders ro ON ro.vehicle_id = v.id
GROUP BY v.id, c.id
ORDER BY v.created_at DESC;

-- Benchmark 2: Reports query (complex aggregations)
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    v.brand,
    COUNT(DISTINCT ro.id) as repair_count,
    SUM(ro.total_amount) as revenue,
    ROUND((COUNT(DISTINCT ro.id)::numeric / (SELECT COUNT(*) FROM repair_orders) * 100), 2) as rate
FROM repair_orders ro
JOIN vehicles v ON v.id = ro.vehicle_id
WHERE ro.reception_date BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY v.brand
ORDER BY revenue DESC;

-- Benchmark 3: Inventory with usage stats
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    sp.id,
    sp.name,
    sp.price,
    sp.stock_quantity,
    COALESCE(SUM(roi.quantity), 0) as total_used
FROM spare_parts sp
LEFT JOIN repair_order_items roi ON roi.spare_part_id = sp.id
GROUP BY sp.id
ORDER BY sp.name;

-- =====================================================
-- 4. INDEX OPTIMIZATION CHECKS
-- =====================================================

-- Check for missing indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
AND (tablename IN ('vehicles', 'repair_orders', 'repair_order_items', 'payments'))
ORDER BY abs(correlation) DESC;

-- Check table bloat
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- =====================================================
-- 5. RLS POLICY PERFORMANCE
-- =====================================================

-- Test RLS overhead
-- Without RLS (run as superuser)
SET ROLE postgres;
EXPLAIN (ANALYZE) SELECT COUNT(*) FROM vehicles;

-- With RLS (run as authenticated user)
SET ROLE authenticated;
SET request.jwt.claims.sub = 'test-user-id';
EXPLAIN (ANALYZE) SELECT COUNT(*) FROM vehicles;

-- =====================================================
-- 6. QUERY OPTIMIZATION SUGGESTIONS
-- =====================================================

-- Create additional indexes if needed
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_repair_orders_vehicle_reception 
ON repair_orders(vehicle_id, reception_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_repair_order_items_order_part 
ON repair_order_items(repair_order_id, spare_part_id) 
WHERE spare_part_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_vehicle_date 
ON payments(vehicle_id, payment_date DESC);

-- Create materialized view for reports (if needed)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_vehicle_stats AS
SELECT 
    v.id,
    v.license_plate,
    v.brand,
    COUNT(DISTINCT ro.id) as total_repairs,
    COALESCE(SUM(ro.total_amount), 0) as total_repair_cost,
    COALESCE(v.total_paid, 0) as total_paid,
    COALESCE(SUM(ro.total_amount), 0) - COALESCE(v.total_paid, 0) as debt
FROM vehicles v
LEFT JOIN repair_orders ro ON ro.vehicle_id = v.id
GROUP BY v.id;

CREATE UNIQUE INDEX ON mv_vehicle_stats(id);

-- Refresh materialized view (run periodically)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_vehicle_stats;

-- =====================================================
-- 7. PERFORMANCE METRICS TO TRACK
-- =====================================================

-- Query to monitor performance over time
SELECT 
    'Vehicles List' as query_name,
    CURRENT_TIMESTAMP as measured_at,
    (
        SELECT COUNT(*) 
        FROM (
            SELECT v.* 
            FROM vehicles v 
            LEFT JOIN customers c ON c.id = v.customer_id
            LIMIT 100
        ) sub
    ) as result_count,
    EXTRACT(EPOCH FROM (clock_timestamp() - statement_timestamp())) * 1000 as execution_time_ms;

-- =====================================================
-- 8. CLEANUP TEST DATA
-- =====================================================

-- Remove test data when done
/*
DELETE FROM repair_order_items WHERE repair_order_id IN (
    SELECT id FROM repair_orders WHERE vehicle_id IN (
        SELECT id FROM vehicles WHERE customer_id IN (
            SELECT id FROM customers WHERE name LIKE 'Test Customer%'
        )
    )
);

DELETE FROM repair_orders WHERE vehicle_id IN (
    SELECT id FROM vehicles WHERE customer_id IN (
        SELECT id FROM customers WHERE name LIKE 'Test Customer%'
    )
);

DELETE FROM payments WHERE vehicle_id IN (
    SELECT id FROM vehicles WHERE customer_id IN (
        SELECT id FROM customers WHERE name LIKE 'Test Customer%'
    )
);

DELETE FROM vehicles WHERE customer_id IN (
    SELECT id FROM customers WHERE name LIKE 'Test Customer%'
);

DELETE FROM customers WHERE name LIKE 'Test Customer%';
*/

-- =====================================================
-- EXPECTED PERFORMANCE TARGETS
-- =====================================================

/*
✅ GOOD PERFORMANCE:
- Vehicles list (100 items): < 100ms
- Single vehicle detail: < 50ms
- Reports aggregation: < 500ms
- Inventory query: < 200ms
- Payment insert: < 100ms

⚠️ NEEDS OPTIMIZATION:
- Any query > 1000ms
- Index scans < 50% of table scans
- Sequential scans on large tables

❌ CRITICAL:
- Any query > 5000ms
- Memory usage > 1GB for single query
- Deadlocks or lock timeouts
*/
