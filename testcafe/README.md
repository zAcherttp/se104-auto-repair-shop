# TestCafe Tests for Auto Repair Shop

This directory contains end-to-end TestCafe tests for the Auto Repair Shop web application. The tests are written in **TypeScript** using TestCafe's API (`Selector`, `Role`, `fixture`, `test`) and target the production deployment at `https://se104-auto-repair-shop.vercel.app`.

**Quick notes**

- All tests are written in TypeScript (`.ts` files)
- Run tests with `npx testcafe` or `pnpm exec testcafe` from the repository root
- Use backslashes for paths on Windows PowerShell (examples below)
- Tests use Role-based authentication for persistent login sessions
- If you get errors about TestCafe or browsers, ensure dependencies are installed with `pnpm install` and the target browser is available

**Files & what they do**

- **`authentication.ts`**: Complete authentication flow testing

  - Login page load tests (Chrome, Firefox, Edge, Safari)
  - Email/password input validation
  - Successful login and redirect to `/reception`
  - Cross-browser compatibility tests (Windows 11)
  - Mobile responsiveness tests (iPhone, iPad, Android)

- **`dashboard.ts`**: Core dashboard and page access tests

  - Reception page loads (Desktop & iPad)
  - Vehicles page accessibility
  - Payments page accessibility
  - Tests use authenticated admin user role

- **`navigation.ts`**: Navigation and sidebar functionality

  - Menu responsiveness at 1280×720 resolution
  - Sidebar collapse/expand functionality
  - Navigation link clicks (Reception, Vehicles, Payments, Reports, Settings)
  - Sidebar state persistence tests
  - Tests use authenticated admin user role

- **`repair-orders.ts`**: Repair orders and reception page tests

  - Table display on Desktop (1920×1080)
  - Button text overflow validation
  - Mobile responsiveness (iPhone 12 Pro)
  - Content fitting validation
  - Tests use authenticated admin user role

- **`reports.ts`**: Reports page functionality
  - Reports display on Desktop (1920×1080)
  - Chart visibility on iPad (768×1024)
  - Mobile responsiveness validation
  - Content overflow checks
  - Tests use authenticated admin user role

> All test files use a shared `adminUser` Role with credentials (`saladegg24@gmail.com` / `123456`) for authenticated testing.

**Recommended run commands (PowerShell)**

- Run all TypeScript tests in Chrome (headed):

```powershell
npx testcafe chrome testcafe\*.ts
```

- Run all tests in headless Chrome:

```powershell
npx testcafe "chrome:headless" testcafe\*.ts
```

- Use `pnpm` if you prefer (uses repo-installed TestCafe):

```powershell
pnpm exec testcafe chrome testcafe\*.ts
```

- Run a specific test file:

```powershell
# Authentication tests
npx testcafe chrome testcafe\authentication.ts

# Dashboard tests
npx testcafe chrome testcafe\dashboard.ts

# Navigation tests
npx testcafe chrome testcafe\navigation.ts

# Repair orders tests
npx testcafe chrome testcafe\repair-orders.ts

# Reports tests
npx testcafe chrome testcafe\reports.ts
```

- Run a single test by its name:

```powershell
npx testcafe chrome testcafe\authentication.ts -t "Login page loads trên Chrome Windows 11"
```

- Run tests in multiple browsers:

```powershell
npx testcafe chrome,firefox,edge testcafe\*.ts
```

**Troubleshooting**

- If `testcafe` command not found: install deps with:

```powershell
pnpm install
```

- If a browser is not available, TestCafe will print a helpful message. Install the target browser (e.g., Chrome) or use a different browser alias (e.g., `edge`, `firefox`, `safari`).

- Do not run test files directly with `node` or `ts-node` (e.g. `node testcafe\authentication.ts`) — Use the TestCafe runner as shown above. TestCafe has built-in TypeScript support.

- Additional examples\*\*

- Headed run of reports tests only:

```powershell
npx testcafe chrome testcafe\reports.ts
```

- Headless run of multiple test files:

```powershell
pnpm exec testcafe "chrome:headless" testcafe\authentication.ts testcafe\dashboard.ts testcafe\navigation.ts
```

- Run with screenshots on failure:

```powershell
npx testcafe chrome testcafe\*.ts --screenshots path=screenshots,takeOnFails=true
```

- Run with video recording:

```powershell
npx testcafe chrome testcafe\*.ts --video artifacts/videos
```

- Generate JSON report:

```powershell
npx testcafe chrome testcafe\*.ts --reporter json:testcafe-report.json
```

**CI/CD tips**

- Use `pnpm install --frozen-lockfile` to ensure deterministic installs
- Run tests in headless mode in CI and capture artifacts with TestCafe reporters:

```powershell
pnpm exec testcafe "chrome:headless" testcafe\*.ts --reporter spec,json:reports/testcafe-results.json
```

- For parallel execution (faster CI runs):

```powershell
npx testcafe chrome:headless testcafe\*.ts --concurrency 3
```

**Test Credentials**

- Email: `saladegg24@gmail.com`
- Password: `123456`
- Role: Admin user with full access

---

## Quick Reference

| Test File           | Purpose                                           | Browser Support               |
| ------------------- | ------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------- |
| `authentication.ts` | Login flows & auth validation                     | Chrome, Firefox, Edge, Safari |
| `dashboard.ts`      | Core pages access (Reception, Vehicles, Payments) | Chrome (Desktop & iPad)       |
| `navigation.ts`     | Sidebar & navigation functionality                | Chrome (Desktop)              |
| `repair-orders.ts`  | Reception page & repair order tables              | Chrome (Desktop & Mobile)     |
| `reports.ts`        | Reports page & chart visibility                   | Chrome (Desktop & iPad)       | artifacts with TestCafe reporters (e.g., `--reporter xunit:reports/result.xml`). |

---

If you want, I can also generate short one-line descriptions for each `test()` in each file (parsed from the files themselves) and add them into this README. Would you like me to do that now?

**Per-test run commands (Windows PowerShell)**

Use these `npx` or `pnpm exec` commands to run each individual test file. Replace `chrome` with another browser alias if needed.

- `allpages.test.js`:

```powershell
npx testcafe chrome testcafe\allpages.test.js
npx testcafe "chrome:headless" testcafe\allpages.test.js
pnpm exec testcafe "chrome:headless" testcafe\allpages.test.js
```

- `login-page.test.js`:

```powershell
npx testcafe chrome testcafe\login-page.test.js
npx testcafe "chrome:headless" testcafe\login-page.test.js
pnpm exec testcafe "chrome:headless" testcafe\login-page.test.js
```

- `dashboard.test.js`:

```powershell
npx testcafe chrome testcafe\dashboard.test.js
npx testcafe "chrome:headless" testcafe\dashboard.test.js
pnpm exec testcafe "chrome:headless" testcafe\dashboard.test.js
```

- `navigation.test.js`:

```powershell
npx testcafe chrome testcafe\navigation.test.js
npx testcafe "chrome:headless" testcafe\navigation.test.js
pnpm exec testcafe "chrome:headless" testcafe\navigation.test.js
```

- `orders.test.js`:

```powershell
npx testcafe chrome testcafe\orders.test.js
npx testcafe "chrome:headless" testcafe\orders.test.js
pnpm exec testcafe "chrome:headless" testcafe\orders.test.js
```

- `reports.test.js`:

```powershell
npx testcafe chrome testcafe\reports.test.js
npx testcafe "chrome:headless" testcafe\reports.test.js
pnpm exec testcafe "chrome:headless" testcafe\reports.test.js
```

You can also run all tests in headless mode with:

```powershell
pnpm exec testcafe "chrome:headless" testcafe\*.test.js
```
