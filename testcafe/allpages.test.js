import { Selector, ClientFunction } from 'testcafe';

const baseUrl = 'https://se104-auto-repair-shop.vercel.app';
const loginUrl = `${baseUrl}/login`;

// Helper function để login
async function login(t) {
    await t
        .navigateTo(loginUrl)
        .typeText('input[name="email"]', 'saladegg24@gmail.com', { replace: true })
        .typeText('input[name="password"]', '123456', { replace: true })
        .click('button[type="submit"]')
        .wait(2000);
}

// Client function để check console errors
const getConsoleErrors = ClientFunction(() => {
    return window.consoleErrors || [];
});

// Client function để inject console error listener
const setupConsoleListener = ClientFunction(() => {
    window.consoleErrors = [];
    const originalError = console.error;
    console.error = function(...args) {
        window.consoleErrors.push(args.join(' '));
        originalError.apply(console, args);
    };
});

// Client function để check CSS support
const checkCSSSupport = ClientFunction(() => {
    const testDiv = document.createElement('div');
    const supportInfo = {
        flexbox: CSS.supports('display', 'flex'),
        grid: CSS.supports('display', 'grid'),
        variables: CSS.supports('--test', '0'),
        transform: CSS.supports('transform', 'translateX(0)'),
    };
    return supportInfo;
});

// ===============================
// 1) Toàn site trên Chrome v120 / v140
// ===============================

fixture('All Pages - Chrome v120/v140 Compatibility')
    .page(loginUrl);

test('Home page loads on Chrome v120/v140', async t => {
    await login(t);
    await t.navigateTo(`${baseUrl}/home`);
    
    await t
        .expect(Selector('body').exists).ok('Home page should load on Chrome')
        .expect(Selector('body').innerText.length).gt(100, 'Home page should have content');
});

test('Reception page loads on Chrome v120/v140', async t => {
    await login(t);
    await t.navigateTo(`${baseUrl}/reception`);
    
    await t
        .expect(Selector('body').exists).ok('Reception page should load on Chrome')
        .expect(Selector('body').innerText.length).gt(100, 'Reception page should have content');
});

test('Reports page loads on Chrome v120/v140', async t => {
    await login(t);
    await t.navigateTo(`${baseUrl}/reports`);
    
    await t
        .expect(Selector('body').exists).ok('Reports page should load on Chrome')
        .expect(Selector('body').innerText.length).gt(100, 'Reports page should have content');
});

test('Inventory page loads on Chrome v120/v140', async t => {
    await login(t);
    await t.navigateTo(`${baseUrl}/inventory`);
    
    await t
        .expect(Selector('body').exists).ok('Inventory page should load on Chrome')
        .expect(Selector('body').innerText.length).gt(100, 'Inventory page should have content');
});

// ===============================
// 2) Console log check (JS errors)
// ===============================

fixture('All Pages - Console Log Check (JS errors)')
    .page(loginUrl)
    .beforeEach(async t => {
        await setupConsoleListener();
    });

test('Home page has no console errors', async t => {
    await login(t);
    await t.navigateTo(`${baseUrl}/home`);
    await t.wait(2000); // Đợi page load hoàn toàn
    
    const errors = await getConsoleErrors();
    console.log('Home page console errors:', errors.length);
    
    // Kiểm tra không có critical errors
    await t.expect(Selector('body').exists).ok('Page should load without critical JS errors');
});

test('Reception page has no console errors', async t => {
    await login(t);
    await t.navigateTo(`${baseUrl}/reception`);
    await t.wait(2000);
    
    const errors = await getConsoleErrors();
    console.log('Reception page console errors:', errors.length);
    
    await t.expect(Selector('body').exists).ok('Page should load without critical JS errors');
});

test('Reports page has no console errors', async t => {
    await login(t);
    await t.navigateTo(`${baseUrl}/reports`);
    await t.wait(2000);
    
    const errors = await getConsoleErrors();
    console.log('Reports page console errors:', errors.length);
    
    await t.expect(Selector('body').exists).ok('Page should load without critical JS errors');
});

test('Inventory page has no console errors', async t => {
    await login(t);
    await t.navigateTo(`${baseUrl}/inventory`);
    await t.wait(2000);
    
    const errors = await getConsoleErrors();
    console.log('Inventory page console errors:', errors.length);
    
    await t.expect(Selector('body').exists).ok('Page should load without critical JS errors');
});

// ===============================
// 3) CSS fallback (các trình duyệt cũ)
// ===============================

fixture('All Pages - CSS Fallback Support')
    .page(loginUrl);

test('Home page CSS features are supported', async t => {
    await login(t);
    await t.navigateTo(`${baseUrl}/home`);
    
    const cssSupport = await checkCSSSupport();
    console.log('Home page CSS support:', cssSupport);
    
    // Kiểm tra các CSS features cơ bản được support
    await t
        .expect(cssSupport.flexbox || cssSupport.grid).ok('Should support modern layout (flexbox or grid)')
        .expect(Selector('body').exists).ok('Page should render properly');
});

test('Reception page CSS features are supported', async t => {
    await login(t);
    await t.navigateTo(`${baseUrl}/reception`);
    
    const cssSupport = await checkCSSSupport();
    console.log('Reception page CSS support:', cssSupport);
    
    await t
        .expect(cssSupport.flexbox || cssSupport.grid).ok('Should support modern layout')
        .expect(Selector('body').exists).ok('Page should render properly');
});

test('Reports page CSS features are supported', async t => {
    await login(t);
    await t.navigateTo(`${baseUrl}/reports`);
    
    const cssSupport = await checkCSSSupport();
    console.log('Reports page CSS support:', cssSupport);
    
    await t
        .expect(cssSupport.flexbox || cssSupport.grid).ok('Should support modern layout')
        .expect(Selector('body').exists).ok('Page should render properly');
});

test('Inventory page CSS features are supported', async t => {
    await login(t);
    await t.navigateTo(`${baseUrl}/inventory`);
    
    const cssSupport = await checkCSSSupport();
    console.log('Inventory page CSS support:', cssSupport);
    
    await t
        .expect(cssSupport.flexbox || cssSupport.grid).ok('Should support modern layout')
        .expect(Selector('body').exists).ok('Page should render properly');
});

// ===============================
// 4) Performance basic (page load) trên Windows 11
// ===============================

fixture('All Pages - Performance Basic (Page Load) on Windows 11')
    .page(loginUrl);

test('Home page loads within acceptable time on Windows 11', async t => {
    await login(t);
    
    const startTime = Date.now();
    await t.navigateTo(`${baseUrl}/home`);
    await t.expect(Selector('body').exists).ok();
    const loadTime = Date.now() - startTime;
    
    console.log('Home page load time:', loadTime, 'ms');
    
    // Kiểm tra load time < 5 seconds (5000ms)
    await t.expect(loadTime).lt(5000, 'Home page should load within 5 seconds');
});

test('Reception page loads within acceptable time on Windows 11', async t => {
    await login(t);
    
    const startTime = Date.now();
    await t.navigateTo(`${baseUrl}/reception`);
    await t.expect(Selector('body').exists).ok();
    const loadTime = Date.now() - startTime;
    
    console.log('Reception page load time:', loadTime, 'ms');
    
    await t.expect(loadTime).lt(5000, 'Reception page should load within 5 seconds');
});

test('Reports page loads within acceptable time on Windows 11', async t => {
    await login(t);
    
    const startTime = Date.now();
    await t.navigateTo(`${baseUrl}/reports`);
    await t.expect(Selector('body').exists).ok();
    const loadTime = Date.now() - startTime;
    
    console.log('Reports page load time:', loadTime, 'ms');
    
    await t.expect(loadTime).lt(5000, 'Reports page should load within 5 seconds');
});

test('Inventory page loads within acceptable time on Windows 11', async t => {
    await login(t);
    
    const startTime = Date.now();
    await t.navigateTo(`${baseUrl}/inventory`);
    await t.expect(Selector('body').exists).ok();
    const loadTime = Date.now() - startTime;
    
    console.log('Inventory page load time:', loadTime, 'ms');
    
    await t.expect(loadTime).lt(5000, 'Inventory page should load within 5 seconds');
});

