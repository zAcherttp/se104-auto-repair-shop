import { Selector } from 'testcafe';

const baseUrl = 'https://se104-auto-repair-shop.vercel.app/reports';

fixture('Reports Module').page(baseUrl);

test('Reports page loads', async t => {
    await t.expect(Selector('body').innerText).contains('Report');
});
