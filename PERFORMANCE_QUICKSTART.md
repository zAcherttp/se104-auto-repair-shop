# 🚀 Quick Start: Performance Testing

## Prerequisites

```powershell
# Install k6 for load testing
choco install k6

# Install Lighthouse CI
pnpm add -D @lhci/cli

# Install bundle analyzer
pnpm add -D @next/bundle-analyzer
```

## Quick Commands

### 1. Frontend Performance

```powershell
# Lighthouse audit
pnpm lighthouse

# Performance tests
pnpm test:performance

# Bundle analysis
pnpm analyze
```

### 2. Backend Performance

```sql
-- In Supabase SQL Editor, run:
\i supabase/migrations/PERFORMANCE_TESTS.sql
```

### 3. Load Testing

```powershell
# Quick smoke test (1 user, 30 seconds)
k6 run k6-load-test.js --vus 1 --duration 30s

# Full load test
k6 run k6-load-test.js

# With custom environment
k6 run k6-load-test.js `
  --env SUPABASE_URL=https://your-project.supabase.co `
  --env SUPABASE_ANON_KEY=your-key
```

## 📊 Performance Targets

| Metric                 | Target  | Critical |
| ---------------------- | ------- | -------- |
| Lighthouse Performance | > 85    | > 70     |
| FCP                    | < 2s    | < 3s     |
| LCP                    | < 2.5s  | < 4s     |
| API Response (p95)     | < 500ms | < 1s     |
| Database Queries       | < 100ms | < 500ms  |
| Error Rate             | < 1%    | < 5%     |

## 🔍 Quick Checks

### Check Current Performance

```powershell
# 1. Build and check bundle size
pnpm build

# 2. Run dev and check page loads
pnpm dev

# 3. Open DevTools → Performance tab
# Record page load and analyze
```

### Database Performance

```sql
-- Check slow queries
SELECT query, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public';
```

## 🐛 Debug Performance Issues

### Slow Page Load

1. Check Network tab in DevTools
2. Look for large bundles or slow API calls
3. Use React DevTools Profiler
4. Check `pnpm build` output for large routes

### Slow Database Queries

1. Run `EXPLAIN ANALYZE` on slow queries
2. Check for missing indexes
3. Review RLS policy overhead
4. Consider materialized views for reports

### High Memory Usage

1. Check Chrome DevTools → Memory
2. Take heap snapshot
3. Look for memory leaks in components
4. Review TanStack Query cache settings

## 📈 Continuous Monitoring

### Production Setup

1. Deploy to Vercel
2. Add Vercel Analytics
3. Monitor Supabase metrics
4. Set up alerts for:
   - Error rate > 1%
   - Response time > 1s
   - CPU > 80%
   - Memory > 90%

## 🎯 Before Release Checklist

- [ ] `pnpm build` - Check bundle sizes
- [ ] `pnpm lighthouse` - Run Lighthouse audit
- [ ] `pnpm test:performance` - Run performance tests
- [ ] `k6 run k6-load-test.js` - Load test
- [ ] Test with 1000+ records in database
- [ ] Check Core Web Vitals in production

---

For detailed documentation, see: `PERFORMANCE_TESTING.md`
