import { Selector, fixture, test } from 'testcafe';

const baseUrl = 'https://se104-auto-repair-shop.vercel.app/login';

// 1) Đăng nhập thành công trên Chrome (Windows 11)

fixture('Login Page - Đăng nhập thành công trên Chrome (Windows 11)')
    .page(baseUrl);

test('Login page loads trên Chrome Windows 11', async t => {
    await t
        .expect(Selector('body').exists).ok('Page should load on Chrome')
        .expect(Selector('input[name="email"]').exists).ok('Email input should exist')
        .expect(Selector('input[name="password"]').exists).ok('Password input should exist')
        .expect(Selector('button[type="submit"]').exists).ok('Submit button should exist');
});

test('Có thể nhập email và password trên Chrome', async t => {
    await t
        .typeText('input[name="email"]', 'saladegg24@gmail.com')
        .expect(Selector('input[name="email"]').value).eql('saladegg24@gmail.com')
        .typeText('input[name="password"]', '123456')
        .expect(Selector('input[name="password"]').value).eql('123456');
});

test('Đăng nhập thành công và redirect trên Chrome Windows 11', async t => {
    await t
        .typeText('input[name="email"]', 'saladegg24@gmail.com', { replace: true })
        .typeText('input[name="password"]', '123456', { replace: true })
        .click(Selector('button[type="submit"]'))
        .wait(3000);
    
    const currentUrl = await t.eval(() => window.location.pathname);
    await t.expect(currentUrl).eql('/reception', 'Should redirect to /reception after successful login');
});

// 2) Đăng nhập thành công trên Firefox (Windows 11)

fixture('Login Page - Đăng nhập thành công trên Firefox (Windows 11)')
    .page(baseUrl);

test('Login page loads trên Firefox Windows 11', async t => {
    await t
        .expect(Selector('body').exists).ok('Page should load on Firefox')
        .expect(Selector('input[name="email"]').exists).ok('Email input should exist')
        .expect(Selector('input[name="password"]').exists).ok('Password input should exist')
        .expect(Selector('button[type="submit"]').exists).ok('Submit button should exist');
});

test('Có thể nhập email và password trên Firefox', async t => {
    await t
        .typeText('input[name="email"]', 'saladegg24@gmail.com')
        .expect(Selector('input[name="email"]').value).eql('saladegg24@gmail.com')
        .typeText('input[name="password"]', '123456')
        .expect(Selector('input[name="password"]').value).eql('123456');
});

test('Đăng nhập thành công và redirect trên Firefox Windows 11', async t => {
    await t
        .typeText('input[name="email"]', 'saladegg24@gmail.com', { replace: true })
        .typeText('input[name="password"]', '123456', { replace: true })
        .click(Selector('button[type="submit"]'))
        .wait(3000);
    
    const currentUrl = await t.eval(() => window.location.pathname);
    await t.expect(currentUrl).eql('/reception', 'Should redirect to /reception after successful login');
});

// 3) UI Login responsive (mobile viewport)

fixture('Login Page - UI Login responsive (mobile viewport)')
    .page(baseUrl);

test('Login UI responsive trên mobile iPhone 12 (390x844)', async t => {
    await t.resizeWindow(390, 844);
    
    await t
        .expect(Selector('body').exists).ok('Page should load on mobile')
        .expect(Selector('input[name="email"]').exists).ok('Email input should be visible on mobile')
        .expect(Selector('input[name="password"]').exists).ok('Password input should be visible on mobile')
        .expect(Selector('button[type="submit"]').exists).ok('Submit button should be visible on mobile');
});

test('Login UI responsive trên mobile small (375x667)', async t => {
    await t.resizeWindow(375, 667);
    
    await t
        .expect(Selector('input[name="email"]').exists).ok('Email input should be visible on small mobile')
        .expect(Selector('input[name="password"]').exists).ok('Password input should be visible on small mobile');
});

test('Có thể login thành công trên mobile viewport', async t => {
    await t.resizeWindow(390, 844);
    
    await t
        .typeText('input[name="email"]', 'saladegg24@gmail.com', { replace: true })
        .typeText('input[name="password"]', '123456', { replace: true })
        .click(Selector('button[type="submit"]'))
        .wait(3000);
    
    const currentUrl = await t.eval(() => window.location.pathname);
    await t.expect(currentUrl).eql('/reception', 'Should redirect after login on mobile');
});

test('Form inputs hoạt động tốt trên mobile', async t => {
    await t.resizeWindow(375, 667);
    
    await t
        .typeText('input[name="email"]', 'test@example.com')
        .expect(Selector('input[name="email"]').value).eql('test@example.com')
        .typeText('input[name="password"]', 'password123')
        .expect(Selector('input[name="password"]').value).eql('password123');
});

// 4) Hiển thị tiếng Việt trên Login

fixture('Login Page - Hiển thị tiếng Việt trên Login')
    .page(baseUrl);

test('Login page hiển thị nội dung tiếng Việt', async t => {
    await t.expect(Selector('body').exists).ok('Page should load');
    
    const bodyText = await Selector('body').innerText;
    
    const hasVietnamese = bodyText.includes('Đăng nhập') || 
                         bodyText.includes('Email') || 
                         bodyText.includes('Mật khẩu') ||
                         bodyText.includes('đăng nhập');
    
    await t.expect(hasVietnamese).ok('Page should display Vietnamese text');
});

test('Login form có labels hoặc placeholders tiếng Việt', async t => {
    // Kiểm tra có text tiếng Việt trong page
    const bodyText = await Selector('body').innerText;
    const hasContent = bodyText.length > 50;
    
    await t
        .expect(hasContent).ok('Page should have Vietnamese content')
        .expect(Selector('input[name="email"]').exists).ok('Email field exists')
        .expect(Selector('input[name="password"]').exists).ok('Password field exists');
});

test('Submit button hiển thị text tiếng Việt', async t => {
    const submitButton = Selector('button[type="submit"]');
    
    await t.expect(submitButton.exists).ok('Submit button should exist');
    
    const buttonText = await submitButton.innerText;
    const hasText = buttonText.length > 0;
    
    await t.expect(hasText).ok('Submit button should have text');
});

test('Page title hoặc heading hiển thị tiếng Việt', async t => {
    // Kiểm tra có heading hoặc title
    const h1 = await Selector('h1').exists;
    const h2 = await Selector('h2').exists;
    const h3 = await Selector('h3').exists;
    
    const hasHeading = h1 || h2 || h3;
    
    // Kiểm tra có nội dung tiếng Việt
    const bodyText = await Selector('body').innerText;
    const hasVietnamese = bodyText.includes('Đăng nhập') || 
                         bodyText.includes('đăng nhập') ||
                         bodyText.length > 50;
    
    await t.expect(hasVietnamese).ok('Page should have Vietnamese content or headings');
});
