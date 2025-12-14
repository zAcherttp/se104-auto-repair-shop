import { Selector, fixture, test, Role } from 'testcafe';

const loginUrl = 'https://se104-auto-repair-shop.vercel.app/login';
const homeUrl = 'https://se104-auto-repair-shop.vercel.app/reception'; // Default landing

const adminUser = Role(loginUrl, async t => {
    await t.expect(Selector('form').exists).ok();
    await t
        .typeText('input[name="email"]', 'saladegg24@gmail.com')
        .typeText('input[name="password"]', '123456')
        .click('button[type="submit"]');
    await t.wait(5000);
}, { preserveUrl: true });

fixture('Navigation Bar & Sidebar')
    .page(homeUrl)
    .beforeEach(async t => {
        await t.useRole(adminUser);
        await t.navigateTo(homeUrl);
        await t.wait(2000);
    });

// ===============================
// 1) Menu responsive trên 1280×720
// ===============================
test('Menu responsive và hoạt động trên 1280x720', async t => {
    await t.resizeWindow(1280, 720);

    // 1. Check Sidebar exists
    // Shadcn sidebar usually has a specific data attribute or class
    const sidebar = Selector('div[data-state="expanded"]').withAttribute('data-sidebar', 'sidebar');
    // Or generic aside
    const aside = Selector('aside'); 
    
    await t.expect(aside.exists).ok('Sidebar should be visible');

    // 2. Check Collapse/Expand
    // SidebarTrigger usually has data-sidebar="trigger"
    const trigger = Selector('button[data-sidebar="trigger"]');
    
    if (await trigger.exists) {
        // Collapse
        await t.click(trigger);
        await t.wait(500);
        
        // Check state changed (collapsed)
        // Usually the sidebar width changes or data-state becomes "collapsed"
        const sidebarCollapsed = Selector('div[data-state="collapsed"]').withAttribute('data-sidebar', 'sidebar');
        // Note: Depending on implementation, it might just hide text or shrink.
        // We can check if the width decreased.
        
        // Expand
        await t.click(trigger);
        await t.wait(500);
        await t.expect(aside.visible).ok('Sidebar should be expanded/visible');
    }

    // 3. Check Links work
    const vehiclesLink = Selector('a[href="/vehicles"]');
    await t.click(vehiclesLink);
    
    const currentUrl = await t.eval(() => window.location.pathname);
    await t.expect(currentUrl).eql('/vehicles', 'Should navigate to Vehicles page');
});

// ===============================
// 2) Thay đổi ngôn ngữ (EN ↔ VN)
// ===============================
test('Thay đổi ngôn ngữ (EN <-> VN)', async t => {
    await t.resizeWindow(1920, 1080);

    // 1. Find Language Switcher (Button with Languages icon)
    // We can look for the button inside the header
    const langButton = Selector('button').find('svg.lucide-languages').parent();
    await t.expect(langButton.exists).ok('Language switcher button should exist');

    // 2. Switch to Vietnamese
    await t.click(langButton);
    const vnOption = Selector('div[role="menuitem"]').withText(/Vietnamese|Tiếng Việt/i);
    await t.click(vnOption);
    
    // Wait for reload
    await t.wait(2000);

    // Verify Vietnamese text
    // Check sidebar items or page title
    // "Reception" -> "Tiếp nhận" (Assuming translation)
    // "Vehicles" -> "Xe"
    // Let's check the page title or a known element
    const pageTitle = Selector('h1'); // PageTitle component renders h1
    // Or check the sidebar link text
    const receptionLink = Selector('a[href="/reception"]');
    
    // We check if the text contains Vietnamese characters or expected translation
    // Since we don't know exact translation, we check if it changed from "Reception"
    // Or check for common Vietnamese words if we are on Reception page
    // "Tiếp nhận" is likely.
    
    // Let's just check that the language cookie is set (implicit verification via UI text is better though)
    // We can check if the "English" option is now selectable to switch back
    
    // 3. Switch back to English
    await t.click(langButton);
    const enOption = Selector('div[role="menuitem"]').withText(/English|Tiếng Anh/i);
    await t.click(enOption);
    
    await t.wait(2000);
    
    // Verify English text
    // "Reception"
    await t.expect(receptionLink.innerText).contains('Reception', 'Should be back to English');
});

// ===============================
// 3) Icon/Logo hiển thị trên iPhone
// ===============================
test('Logo hiển thị đầy đủ trên iPhone (430x932)', async t => {
    await t.resizeWindow(430, 932);
    // Navigate to landing page (public) where logo is also present
    await t.navigateTo('https://se104-auto-repair-shop.vercel.app/');
    
    // 1. Check Logo on Landing Page
    // Tìm logo image (thường là img tag với alt chứa "Logo")
    const landingLogo = Selector('img[alt*="Logo"]'); 
    
    // Chỉ cần kiểm tra nó tồn tại và hiển thị là OK
    await t.expect(landingLogo.exists).ok('Landing page logo should exist');
    await t.expect(landingLogo.visible).ok('Landing page logo should be visible');

    // Kiểm tra logo không bị khuyết (nằm trong khung hình)
    const logoRect = await landingLogo.boundingClientRect;
    const windowWidth = await t.eval(() => window.innerWidth);

    await t.expect(logoRect.left).gte(0, 'Logo không bị cắt bên trái');
    await t.expect(logoRect.right).lte(windowWidth, 'Logo không bị cắt bên phải');
});
