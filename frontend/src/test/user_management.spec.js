import { test, expect } from "@playwright/test";

test.describe("Smart Flow User Management Tests", () => {
  
  test.beforeEach(async ({ page }) => {
    console.log("--- Тест эхэлж байна: Системд нэвтэрч байна ---");
    // 1. Нэвтрэх (Login)
    await page.goto("http://172.20.10.7:5173/");
    await page.getByRole("button", { name: "Нэвтрэх", exact: true }).first().click();
    await page.fill('input[placeholder="example@mail.com"]', "admin@gmail.com");
    await page.fill('input[placeholder="••••••••"]', "12345678");
    await page.locator('form button:has-text("Нэвтрэх")').click();
    
    // Dashboard ачааллахыг хүлээх
    await expect(page).toHaveURL(/.*dashboard/);
    console.log("✅ Нэвтрэлт амжилттай.");
  });

  test("TC-03: Хэрэглэгчийн мэдээллийг устгах (Сараа - a@gmail.com)", async ({ page }) => {
    console.log("2. 'Тохиргоо' цэс рүү хандаж байна...");
    // Зүүн талын Sidebar-аас 'Тохиргоо' товчийг олох
    await page.click('text=Тохиргоо');

    console.log("3. 'Хэрэглэгчийн тохиргоо' дээр дарж байна...");
    // Гарч ирсэн дэд цэснээс 'Хэрэглэгчийн тохиргоо' сонгох
    await page.click('text=Хэрэглэгчийн тохиргоо');
    
    // URL солигдсоныг шалгах
    await expect(page).toHaveURL(/.*settings/);
    console.log("4. Хэрэглэгчийн жагсаалт руу орлоо.");

    // --- Window Confirm (Browser Alert) Handle хийх ---
    // Устгах товч дарахад гарч ирэх 'Confirm' цонхонд 'OK' дарах тохиргоо
    page.once('dialog', async dialog => {
      console.log(`💬 Confirm цонх илэрлээ: "${dialog.message()}"`);
      await dialog.accept(); // 'Энэ хэрэглэгчийг устгах уу?' гэхэд OK дарах
      console.log("✅ Устгах үйлдлийг баталгаажууллаа.");
    });

    console.log("5. 'a@gmail.com' хаягтай мөрийг хайж байна...");
    // Сараа-ийн мөрийг имэйлээр нь олж, тэр мөр доторх 'Trash2' (устгах) товчийг дарна
    const userRow = page.locator('tr', { hasText: 'a@gmail.com' });
    
    // Хэрэв дата байгаа бол устгах товчийг дарна
    await userRow.locator('button').nth(1).click(); // nth(1) нь Trash2 товч (Edit нь 0)
    
    console.log("6. Устгагдсаныг шалгаж байна...");
    // Дата хүснэгтээс алга болсон эсэхийг шалгах (Hidden болсон байх ёстой)
    await expect(page.locator('text=a@gmail.com')).not.toBeVisible({ timeout: 5000 });

    console.log("✅ АМЖИЛТ: Хэрэглэгч 'Сараа' амжилттай устгагдлаа.");
  });
});