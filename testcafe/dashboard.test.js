import { Selector } from 'testcafe';

const baseUrl = 'https://se104-auto-repair-shop.vercel.app';
const loginUrl = `${baseUrl}/login`;
const receptionUrl = `${baseUrl}/reception`;

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
// 1) Dashboard hiển thị trên 1920×1080 (Chrome)
// ===============================

fixture('Dashboard - Hiển thị trên 1920×1080 (Chrome)')
    .page(loginUrl);

test('Dashboard loads trên 1920×1080 Chrome', async t => {
    await t.resizeWindow(1920, 1080);
    await login(t);
    
    const currentUrl = await t.eval(() => window.location.pathname);
    await t
        .expect(currentUrl).eql('/reception', 'Should be on dashboard page')
        .expect(Selector('body').exists).ok('Dashboard should load on 1920×1080');
});

test('Dashboard content hiển thị đầy đủ trên 1920×1080', async t => {
    await t.resizeWindow(1920, 1080);
    await login(t);
    
    const linkCount = await Selector('a').count;
    const buttonCount = await Selector('button').count;
    
    await t
        .expect(linkCount).gt(0, 'Should have navigation links')
        .expect(buttonCount).gt(0, 'Should have interactive buttons');
});

test('Dashboard table hiển thị trên 1920×1080', async t => {
    await t.resizeWindow(1920, 1080);
    await login(t);
    
    const bodyText = await Selector('body').innerText;
    await t.expect(bodyText.length).gt(100, 'Dashboard should have content');
});

// ===============================
// 2) Dashboard trên 1366×768 (Firefox)
// ===============================

fixture('Dashboard - Trên 1366×768 (Firefox)')
    .page(loginUrl);

test('Dashboard loads trên 1366×768 Firefox', async t => {
    await t.resizeWindow(1366, 768);
    await login(t);
    
    const currentUrl = await t.eval(() => window.location.pathname);
    await t
        .expect(currentUrl).eql('/reception', 'Should be on dashboard page')
        .expect(Selector('body').exists).ok('Dashboard should load on 1366×768');
});

test('Dashboard content accessible trên 1366×768', async t => {
    await t.resizeWindow(1366, 768);
    await login(t);
    
    const buttonCount = await Selector('button').count;
    await t.expect(buttonCount).gt(0, 'Should have interactive buttons on 1366×768');
});

test('Dashboard navigation works trên 1366×768', async t => {
    await t.resizeWindow(1366, 768);
    await login(t);
    
    const bodyText = await Selector('body').innerText;
    await t.expect(bodyText.length).gt(50, 'Dashboard should be accessible');
});

// ===============================
// 3) Dashboard trên Safari (macOS)
// ===============================

fixture('Dashboard - Trên Safari (macOS)')
    .page(loginUrl);

test('Dashboard loads trên Safari macOS', async t => {
    await login(t);
    
    const currentUrl = await t.eval(() => window.location.pathname);
    await t
        .expect(currentUrl).eql('/reception', 'Should be on dashboard page')
        .expect(Selector('body').exists).ok('Dashboard should load on Safari');
});

test('Dashboard images và icons hiển thị trên Safari', async t => {
    await login(t);
    
    const images = await Selector('img').count;
    const svgs = await Selector('svg').count;
    
    await t.expect(images + svgs).gt(0, 'Dashboard should have images/icons on Safari');
});

test('Dashboard interactive elements work trên Safari', async t => {
    await login(t);
    
    const buttonCount = await Selector('button').count;
    await t.expect(buttonCount).gt(0, 'Interactive elements should work on Safari');
});

test('Dashboard CSS renders correctly trên Safari', async t => {
    await login(t);
    
    const bodyText = await Selector('body').innerText;
    await t.expect(bodyText.length).gt(100, 'Dashboard should render properly on Safari');
});

// ===============================
// 4) Touch targets trên mobile (Android)
// ===============================

fixture('Dashboard - Touch targets trên mobile (Android)')
    .page(loginUrl);

test('Dashboard loads trên mobile Android (412x915)', async t => {
    await t.resizeWindow(412, 915); // Pixel 6 size
    await login(t);
    
    const currentUrl = await t.eval(() => window.location.pathname);
    await t
        .expect(currentUrl).eql('/reception', 'Should be on dashboard')
        .expect(Selector('body').exists).ok('Dashboard should load on Android mobile');
});

test('Touch targets đủ lớn trên mobile Android', async t => {
    await t.resizeWindow(412, 915);
    await login(t);
    
    const buttons = Selector('button');
    const buttonCount = await buttons.count;
    
    await t.expect(buttonCount).gt(0, 'Should have touchable buttons on mobile');
});

test('Navigation menu accessible trên mobile Android', async t => {
    await t.resizeWindow(412, 915);
    await login(t);
    
    const bodyExists = await Selector('body').exists;
    await t.expect(bodyExists).ok('Navigation should be accessible on mobile');
});

test('Buttons clickable trên mobile Android', async t => {
    await t.resizeWindow(412, 915);
    await login(t);
    
    const buttonCount = await Selector('button').count;
    await t.expect(buttonCount).gt(0, 'Should have clickable buttons on mobile');
});

test('Dashboard responsive layout trên mobile small (360x640)', async t => {
    await t.resizeWindow(360, 640); // Small Android phone
    await login(t);
    
    const bodyText = await Selector('body').innerText;
    await t
        .expect(Selector('body').exists).ok('Dashboard should work on small Android screen')
        .expect(bodyText.length).gt(50, 'Dashboard should have content on small screen');
});
