import { Selector, fixture, test, Role } from 'testcafe';

const loginUrl = 'https://se104-auto-repair-shop.vercel.app/login';
const reportsUrl = 'https://se104-auto-repair-shop.vercel.app/reports';

const adminUser = Role(loginUrl, async t => {
    await t.expect(Selector('form').exists).ok();
    await t
        .typeText('input[name="email"]', 'saladegg24@gmail.com')
        .typeText('input[name="password"]', '123456')
        .click('button[type="submit"]');
    await t.wait(5000);
}, { preserveUrl: true });

fixture('Reports Page')
    .page(reportsUrl)
    .beforeEach(async t => {
        await t.useRole(adminUser);
        await t.navigateTo(reportsUrl);
        await t.wait(3000);
    });

// ===============================
// 1) Báo cáo hiển thị trên Chrome, Edge, Safari (desktop)
// ===============================
test('Báo cáo hiển thị đúng trên Desktop (1920x1080)', async t => {
    await t.resizeWindow(1920, 1080);

    // Chỉ cần kiểm tra giao diện mở được bình thường (có biểu đồ Sales)
    const salesChartTitle = Selector('div').withText(/Sales Overview|Doanh thu/i);
    await t.expect(salesChartTitle.exists).ok('Sales Overview chart should be visible');
});

// ===============================
// 2) Báo cáo hiển thị trên tablet (iPad)
// ===============================
test('Báo cáo hiển thị trên iPad (768x1024)', async t => {
    await t.resizeWindow(768, 1024);

    // Check for visibility
    const salesChartTitle = Selector('div').withText(/Sales Overview|Doanh thu/i);
    await t.expect(salesChartTitle.visible).ok('Chart title should be visible on iPad');

    // Check if content fits (no horizontal scroll on body)
    const bodyScrollWidth = await Selector('body').scrollWidth;
    const windowInnerWidth = await t.eval(() => window.innerWidth);
    
    // Allow small tolerance for scrollbars
    await t.expect(bodyScrollWidth).lte(windowInnerWidth + 20, 'Content should fit on iPad screen');
    
    // Check if charts are not obscured
    // We check if the card content is visible
    const cardContent = salesChartTitle.parent().sibling('div'); // CardContent
    await t.expect(cardContent.visible).ok('Chart content should be visible');
});

// ===============================
// 3) Xem giao diện trên Tablet (Kiểm tra lỗi)
// ===============================
test('Giao diện Tablet (Kiểm tra lỗi hiển thị)', async t => {
    await t.resizeWindow(768, 1024);
    
    // Không cần bấm nút gì hết, chỉ kiểm tra giao diện
    // Mong muốn: Giao diện bị lỗi (ví dụ: bị tràn màn hình) -> Test sẽ FAIL
    
    const bodyScrollWidth = await Selector('body').scrollWidth;
    const windowInnerWidth = await t.eval(() => window.innerWidth);
    
    // Kiểm tra nghiêm ngặt: Không được phép có thanh cuộn ngang dù chỉ 1px
    // Nếu giao diện bị lỗi (tràn), điều kiện này sẽ sai và Test sẽ Failed.
    await t.expect(bodyScrollWidth).lte(windowInnerWidth, 'Content should fit perfectly on tablet (This test is expected to fail if UI is buggy)');
});
