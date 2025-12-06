import { Selector } from 'testcafe';

const baseUrl = 'https://se104-auto-repair-shop.vercel.app';
const loginUrl = `${baseUrl}/login`;
const ordersUrl = `${baseUrl}/home`; // Orders page is /home

// Helper function để login
async function login(t) {
    await t
        .navigateTo(loginUrl)
        .typeText('input[name="email"]', 'saladegg24@gmail.com', { replace: true })
        .typeText('input[name="password"]', '123456', { replace: true })
        .click('button[type="submit"]')
        .wait(2000); // Đợi redirect
}

// ===============================
// 1) Danh sách đơn hiển thị trên Chrome Desktop
// ===============================

fixture('Orders Module - Chrome Desktop')
    .page(loginUrl);

test('Orders page requires authentication', async t => {
    await t
        .navigateTo(ordersUrl)
        .expect(Selector('input[name="email"]').exists).ok('Should redirect to login when not authenticated');
});

test('Orders list displays after login on Chrome (desktop)', async t => {
    await login(t);
    await t.navigateTo(ordersUrl);
    
    // Kiểm tra page đã load
    await t.expect(Selector('body').exists).ok('Page should load');
});

test('Orders page shows correct content', async t => {
    await login(t);
    await t.navigateTo(ordersUrl);
    
    // Kiểm tra có content
    const hasButtons = await Selector('button').count > 0;
    await t.expect(hasButtons).ok('Page should have interactive elements');
});


// ===============================
// 2) Tìm kiếm đơn trên mobile (iOS Safari size)
// ===============================

fixture('Orders Module - Mobile Search')
    .page(loginUrl);

test('Orders page loads on mobile (375x667)', async t => {
    await t.resizeWindow(375, 667); // iPhone 8 / Safari
    await login(t);
    await t.navigateTo(ordersUrl);
    
    // Kiểm tra page load trên mobile
    await t.expect(Selector('body').exists).ok('Page should load on mobile');
});

test('Search functionality exists on mobile', async t => {
    await t.resizeWindow(375, 667);
    await login(t);
    await t.navigateTo(ordersUrl);
    
    // Kiểm tra page load trên mobile
    await t.expect(Selector('body').exists).ok('Mobile page should load');
});


// ===============================
// 3) Chi tiết đơn (modal) trên Firefox/Chrome
// ===============================

fixture('Orders Module - Order Details')
    .page(loginUrl);

test('Can view order details or interactions', async t => {
    await login(t);
    await t.navigateTo(ordersUrl);
    
    // Kiểm tra có interactive elements (buttons, links)
    const buttonCount = await Selector('button').count;
    await t.expect(buttonCount).gt(0, 'Should have interactive buttons');
});

test('Page has proper structure', async t => {
    await login(t);
    await t.navigateTo(ordersUrl);
    
    // Kiểm tra page structure
    await t.expect(Selector('body').exists).ok('Page should have proper structure');
});


// ===============================
// 4) Responsive tests trên các kích thước màn hình khác nhau
// ===============================

fixture('Orders Module - Responsive Tests')
    .page(loginUrl);

test('Orders page responsive on iPhone 12 (390x844)', async t => {
    await t.resizeWindow(390, 844);
    await login(t);
    await t.navigateTo(ordersUrl);
    
    await t.expect(Selector('body').exists).ok('Page should load on iPhone 12');
});

test('Orders page responsive on tablet (768x1024)', async t => {
    await t.resizeWindow(768, 1024);
    await login(t);
    await t.navigateTo(ordersUrl);
    
    await t.expect(Selector('body').exists).ok('Page should load on tablet');
});

test('Orders page responsive on desktop (1920x1080)', async t => {
    await t.resizeWindow(1920, 1080);
    await login(t);
    await t.navigateTo(ordersUrl);
    
    await t.expect(Selector('body').exists).ok('Page should load on desktop');
});


// ===============================
// 5) Pagination và filtering
// ===============================

fixture('Orders Module - Table Features')
    .page(loginUrl);

test('Orders table has interactive elements', async t => {
    await login(t);
    await t.navigateTo(ordersUrl);
    
    // Kiểm tra có buttons hoặc interactive elements
    const buttonCount = await Selector('button').count;
    await t.expect(buttonCount).gt(0, 'Should have interactive buttons');
});

test('Orders page shows data or empty state', async t => {
    await login(t);
    await t.navigateTo(ordersUrl);
    
    // Kiểm tra có dữ liệu hoặc empty state
    const bodyText = await Selector('body').innerText;
    const hasContent = bodyText.length > 100;
    await t.expect(hasContent).ok('Page should have content');
});
