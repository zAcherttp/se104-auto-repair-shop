import { Selector, fixture, test, Role } from 'testcafe';

const loginUrl = 'https://se104-auto-repair-shop.vercel.app/login';

const adminUser = Role(loginUrl, async t => {
    await t.expect(Selector('form').exists).ok();
    await t
        .typeText('input[name="email"]', 'saladegg24@gmail.com')
        .typeText('input[name="password"]', '123456')
        .click('button[type="submit"]');
    await t.wait(5000);
}, { preserveUrl: true });

fixture('Dashboard & Core Pages Access')
    .page('https://se104-auto-repair-shop.vercel.app/reception')
    .beforeEach(async t => {
        await t.useRole(adminUser);
    });

// 1) Reception page loads successfully (Desktop)
test('Reception page loads successfully (Desktop)', async t => {
    await t.resizeWindow(1920, 1080);
    await t.navigateTo('https://se104-auto-repair-shop.vercel.app/reception');
    
    const mainContent = Selector('main');
    await t.expect(mainContent.exists).ok('Main content should exist on Reception page');
    await t.expect(mainContent.visible).ok('Main content should be visible');
});

// 2) Reception page loads successfully (iPad)
test('Reception page loads successfully (iPad)', async t => {
    await t.resizeWindow(768, 1024);
    await t.navigateTo('https://se104-auto-repair-shop.vercel.app/reception');
    
    const mainContent = Selector('main');
    await t.expect(mainContent.exists).ok('Main content should exist on Reception page (iPad)');
});

// 3) Vehicles page loads successfully
test('Vehicles page loads successfully', async t => {
    await t.navigateTo('https://se104-auto-repair-shop.vercel.app/vehicles');
    
    const mainContent = Selector('main');
    await t.expect(mainContent.exists).ok('Main content should exist on Vehicles page');
});

// 4) Payments page loads successfully
test('Payments page loads successfully', async t => {
    await t.navigateTo('https://se104-auto-repair-shop.vercel.app/payments');
    
    const mainContent = Selector('main');
    await t.expect(mainContent.exists).ok('Main content should exist on Payments page');
});
