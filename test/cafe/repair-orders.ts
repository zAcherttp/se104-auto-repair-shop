import { Selector, fixture, test, Role } from 'testcafe';

const loginUrl = 'https://se104-auto-repair-shop.vercel.app/login';
const receptionUrl = 'https://se104-auto-repair-shop.vercel.app/reception';

// Define user role for persistent login session
const adminUser = Role(loginUrl, async t => {
    await t.expect(Selector('form').exists).ok();
    await t
        .typeText('input[name="email"]', 'saladegg24@gmail.com')
        .typeText('input[name="password"]', '123456')
        .click('button[type="submit"]');
    await t.wait(5000);
}, { preserveUrl: true });

fixture('Repair Orders Page (Reception)')
    .page(receptionUrl)
    .beforeEach(async t => {
        await t.useRole(adminUser);
        await t.navigateTo(receptionUrl);
        await t.wait(3000); // Wait for data to load
    });

// 1) Danh sách tạo đơn mới hiển thị trên Chrome (desktop)
test('Danh sách hiển thị đầy đủ trên Desktop (Chrome 1920x1080)', async t => {
    await t.resizeWindow(1920, 1080);

    // Check table existence
    const table = Selector('table');
    await t.expect(table.exists).ok('Table should be displayed');

    // Check table headers (Columns not overflowing)
    const headers = Selector('th');
    await t.expect(headers.count).gt(0, 'Should have table headers');

    const tableBody = Selector('tbody');
    await t.expect(tableBody.exists).ok('Table body should exist');

    const actionButton = Selector('button').withText(/Create|Tạo|Reception|Tiếp nhận/i).nth(0);

    if (await actionButton.exists) {
        const buttonWidth = await actionButton.offsetWidth;

        const buttonText = actionButton.find('span');
        
        if (await buttonText.exists) {
            const textWidth = await buttonText.scrollWidth;
            await t
                .expect(textWidth)
                .lte(buttonWidth, 'Button text is overflowing its container (UI bug)');
        }
    }
});


// 2) Danh sách tạo đơn trên điện thoại (Iphone 14pro max)
test('Giao diện tạo đơn trên iPhone 14 Pro Max (430x932)', async t => {
    await t.resizeWindow(430, 932);

    const createButton = Selector('button').find('svg.lucide-plus').parent();
    await t.expect(createButton.exists).ok('Create button should exist');

    // Lấy vị trí nút
    const btnLeft = await createButton.getBoundingClientRectProperty('left');
    const btnWidth = await createButton.offsetWidth;
    const windowWidth = await t.eval(() => window.innerWidth);

    await t
        .expect(btnLeft + btnWidth)
        .lte(windowWidth, 'Create button is outside viewport, user must scroll horizontally (UI bug)');
});


// 3) Nhập danh sách cho tạo đơn mới trên Edge (desktop)
test('Nhập thông tin tạo đơn mới trên Desktop', async t => {
    await t.resizeWindow(1920, 1080);

    const createButton = Selector('button').find('svg.lucide-plus').parent();
    await t.click(createButton);
    
    await t.wait(1000);

    const licensePlateInput = Selector('input[name="licensePlate"]');
    const nameInput = Selector('input[name="customerName"]');
    const phoneInput = Selector('input[name="phoneNumber"]');
    
    await t
        .expect(licensePlateInput.visible).ok('License plate input visible')
        .expect(nameInput.visible).ok('Name input visible');

    await t
        .typeText(licensePlateInput, '30A-12345')
        .typeText(nameInput, 'Nguyen Van A')
        .typeText(phoneInput, '0987654321');

    await t
        .expect(licensePlateInput.value).eql('30A-12345')
        .expect(nameInput.value).eql('Nguyen Van A')
        .expect(phoneInput.value).eql('0987654321');
});
