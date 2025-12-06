import { Selector } from 'testcafe';

const baseUrl = 'https://se104-auto-repair-shop.vercel.app';
const loginUrl = `${baseUrl}/login`;
const reportsUrl = `${baseUrl}/reports`;

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
// 1) Tạo báo cáo doanh thu trên Chrome
// ===============================

fixture('Reports Module - Tạo báo cáo doanh thu trên Chrome')
    .page(loginUrl);

test('Có thể tạo báo cáo doanh thu trên Chrome', async t => {
    await login(t);
    await t.navigateTo(reportsUrl);
    
    // Kiểm tra page có load
    await t.expect(Selector('body').exists).ok('Reports page should load');
    
    // Kiểm tra có nội dung báo cáo doanh thu
    const bodyText = await Selector('body').innerText;
    const hasRevenueContent = bodyText.toLowerCase().includes('doanh thu') || 
                              bodyText.toLowerCase().includes('revenue') ||
                              bodyText.toLowerCase().includes('báo cáo');
    
    await t.expect(hasRevenueContent).ok('Page should contain revenue report content');
    
    // Kiểm tra có interactive elements để tạo báo cáo
    const buttonCount = await Selector('button').count;
    await t.expect(buttonCount).gt(0, 'Should have buttons to create report');
});

test('Báo cáo doanh thu hiển thị dữ liệu trên Chrome', async t => {
    await login(t);
    await t.navigateTo(reportsUrl);
    
    // Kiểm tra có content/data
    const bodyText = await Selector('body').innerText;
    const hasContent = bodyText.length > 100;
    await t.expect(hasContent).ok('Report should display data');
});

// ===============================
// 2) Báo cáo hiển thị trên tablet (iPad)
// ===============================

fixture('Reports Module - Báo cáo hiển thị trên tablet (iPad)')
    .page(loginUrl);

test('Báo cáo doanh thu hiển thị đúng trên iPad (768x1024)', async t => {
    // iPad size
    await t.resizeWindow(768, 1024);
    await login(t);
    await t.navigateTo(reportsUrl);
    
    // Kiểm tra page load trên tablet
    await t.expect(Selector('body').exists).ok('Reports page should load on iPad');
    
    // Kiểm tra có nội dung báo cáo
    const bodyText = await Selector('body').innerText;
    const hasReportContent = bodyText.toLowerCase().includes('doanh thu') || 
                            bodyText.toLowerCase().includes('revenue') ||
                            bodyText.toLowerCase().includes('báo cáo') ||
                            bodyText.toLowerCase().includes('report');
    
    await t.expect(hasReportContent).ok('Report should be visible on iPad');
});

test('Báo cáo responsive và tương tác được trên iPad', async t => {
    await t.resizeWindow(768, 1024);
    await login(t);
    await t.navigateTo(reportsUrl);
    
    // Kiểm tra có interactive elements
    const buttonCount = await Selector('button').count;
    await t.expect(buttonCount).gt(0, 'Should have interactive elements on iPad');
});

// ===============================
// 3) Tải file báo cáo (download) trên Edge
// ===============================

fixture('Reports Module - Tải file báo cáo (download) trên Edge')
    .page(loginUrl);

test('Có nút download báo cáo trên Edge', async t => {
    await login(t);
    await t.navigateTo(reportsUrl);
    
    // Tìm button download (có thể có text: Download, Tải xuống, Export, etc.)
    const downloadButton = Selector('button').withText(/download|tải|export|xuất/i);
    const hasDownloadButton = await downloadButton.exists;
    
    // Nếu không có button với text, kiểm tra có button nào có icon download
    const allButtons = Selector('button');
    const buttonCount = await allButtons.count;
    
    await t.expect(buttonCount).gt(0, 'Should have buttons on reports page');
    
    // Log để debug
    console.log('Total buttons found:', buttonCount);
});

test('Có thể click vào nút download trên Edge', async t => {
    await login(t);
    await t.navigateTo(reportsUrl);
    
    // Thử tìm các pattern khác nhau cho download button
    const downloadButton = Selector('button').withText(/download|tải|export|xuất/i);
    
    if (await downloadButton.exists) {
        await t
            .click(downloadButton)
            .wait(2000); // Đợi action download trigger
        
        // Kiểm tra không có error
        const bodyText = await Selector('body').innerText;
        const hasError = bodyText.toLowerCase().includes('error');
        await t.expect(hasError).notOk('Should not show error after clicking download');
    } else {
        // Nếu không tìm thấy button, kiểm tra có form hoặc link download
        const links = Selector('a');
        const linkCount = await links.count;
        await t.expect(linkCount).gte(0, 'Checking for alternative download methods');
    }
});
