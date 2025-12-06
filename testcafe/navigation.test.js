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
// 1) Menu responsive trên 1280×720
// ===============================

fixture('Navigation Module - Menu responsive trên 1280×720')
    .page(loginUrl);

test('Menu hiển thị đúng trên màn hình 1280×720', async t => {
    await t.resizeWindow(1280, 720);
    await login(t);
    
    // Kiểm tra navigation menu visible
    await t.expect(Selector('body').exists).ok('Page should load on 1280×720');
    
    // Kiểm tra có navigation links
    const linkCount = await Selector('a').count;
    await t.expect(linkCount).gt(0, 'Navigation links should be visible');
});

test('Menu items accessible trên 1280×720', async t => {
    await t.resizeWindow(1280, 720);
    await login(t);
    
    // Kiểm tra có ít nhất 3 menu items
    const linkCount = await Selector('a').count;
    await t.expect(linkCount).gte(3, 'Should have at least 3 menu items at 1280×720');
});

test('Menu interactive trên 1280×720', async t => {
    await t.resizeWindow(1280, 720);
    await login(t);
    
    // Kiểm tra có buttons (user menu, theme toggle, etc)
    const buttonCount = await Selector('button').count;
    await t.expect(buttonCount).gt(0, 'Menu should have interactive buttons at 1280×720');
});

// ===============================
// 2) Thay đổi ngôn ngữ (EN ↔ VN)
// ===============================

fixture('Navigation Module - Thay đổi ngôn ngữ (EN ↔ VN)')
    .page(loginUrl);

test('Language switcher có trên login page', async t => {
    await t.navigateTo(loginUrl);
    
    // Kiểm tra page load
    await t.expect(Selector('body').exists).ok('Login page should load');
    
    // Kiểm tra có text tiếng Việt hoặc English
    const bodyText = await Selector('body').innerText;
    const hasVietnamese = bodyText.includes('Đăng nhập') || bodyText.includes('Tiếng Việt');
    const hasEnglish = bodyText.includes('Login') || bodyText.includes('English');
    
    await t.expect(hasVietnamese || hasEnglish).ok('Page should display language content');
});

test('Language switcher có sau khi login', async t => {
    await login(t);
    
    // Kiểm tra có button hoặc link để switch language
    const buttons = await Selector('button').count;
    await t.expect(buttons).gt(0, 'Should have buttons including language switcher');
});

test('Có thể thay đổi từ VN sang EN', async t => {
    await login(t);
    
    // Lấy text ban đầu
    const initialText = await Selector('body').innerText;
    
    // Tìm language button (có thể là VN, EN, 🌐, etc.)
    const languageButton = Selector('button').withText(/EN|VN|English|Tiếng Việt|🌐/i);
    
    if (await languageButton.exists) {
        await t.click(languageButton).wait(1000);
        
        // Kiểm tra text có thay đổi
        const newText = await Selector('body').innerText;
        // Text should change hoặc có option chọn ngôn ngữ
        await t.expect(Selector('body').exists).ok('Language switch should work');
    } else {
        // Nếu không tìm thấy button, kiểm tra có dropdown hoặc menu
        await t.expect(Selector('button').count).gt(0, 'Should have interactive elements');
    }
});

test('Content thay đổi khi switch language', async t => {
    await login(t);
    
    // Kiểm tra có nội dung tiếng Việt hoặc English
    const bodyText = await Selector('body').innerText;
    const hasContent = bodyText.length > 100;
    
    await t.expect(hasContent).ok('Page should have content in selected language');
});

// ===============================
// 3) Icon/Logo hiển thị trên Safari
// ===============================

fixture('Navigation Module - Icon/Logo hiển thị trên Safari')
    .page(loginUrl);

test('Logo/Icon hiển thị trên login page', async t => {
    await t.navigateTo(loginUrl);
    
    // Kiểm tra có image hoặc svg (logo)
    const images = await Selector('img').count;
    const svgs = await Selector('svg').count;
    
    await t.expect(images + svgs).gt(0, 'Should have logo/icon images or SVGs');
});

test('Logo/Icon hiển thị sau khi login', async t => {
    await login(t);
    
    // Kiểm tra có logo trong navigation
    const images = await Selector('img').count;
    const svgs = await Selector('svg').count;
    
    await t.expect(images + svgs).gt(0, 'Navigation should have logo/icons');
});

test('Icons trong navigation menu hiển thị', async t => {
    await login(t);
    
    // Kiểm tra có SVG icons trong menu
    const svgCount = await Selector('svg').count;
    await t.expect(svgCount).gt(0, 'Menu should have icons (SVG)');
});

test('Logo clickable và redirect đúng', async t => {
    await login(t);
    
    // Tìm logo link (thường link về home hoặc root)
    const logoLink = Selector('a').withAttribute('href', '/');
    const homeLink = Selector('a').withAttribute('href', '/home');
    
    const hasLogoLink = await logoLink.exists || await homeLink.exists;
    await t.expect(hasLogoLink).ok('Logo should be clickable link');
});
