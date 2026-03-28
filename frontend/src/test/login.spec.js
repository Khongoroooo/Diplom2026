import { test, expect } from "@playwright/test";

test.describe("Smart Flow Login Tests", () => {
  test.beforeEach(async ({ page }) => {
    console.log("--- Тест эхэлж байна ---");

    console.log("1. Үндсэн хуудас руу хандаж байна...");
    await page.goto("http://172.20.10.7:5173/");

    console.log('2. "Нэвтрэх" товчийг хайж байна...');
    const loginBtn = page
      .getByRole("button", { name: "Нэвтрэх", exact: true })
      .first();
    await loginBtn.click();
    console.log('3. "Нэвтрэх" товчийг дарлаа. Модаль цонхыг хүлээж байна...');

    await expect(page.locator("text=Системд нэвтрэх")).toBeVisible();
    console.log("4. Модаль цонх амжилттай нээгдлээ.");
  });

  test("TC-01: Амжилттай нэвтрэх", async ({ page }) => {
    console.log("5. Имэйл болон нууц үгийг бөглөж байна...");
    await page.fill('input[placeholder="example@mail.com"]', "admin@gmail.com");
    await page.fill('input[placeholder="••••••••"]', "12345678");

    console.log("6. Форм илгээх (Submit) товчийг дарлаа.");
    await page.locator('form button:has-text("Нэвтрэх")').click();

    console.log("7. Dashboard руу шилжихийг хүлээж байна...");
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

    console.log("✅ АМЖИЛТ: Dashboard руу нэвтэрлээ.");
  });

  test("TC-02: Буруу мэдээллээр нэвтрэх", async ({ page }) => {
    console.log("5. Буруу мэдээлэл оруулж байна...");
    await page.fill('input[placeholder="example@mail.com"]', "wrong@mail.com");
    await page.fill('input[placeholder="••••••••"]', "wrongpass");

    // Alert гарч ирэхийг хүлээх
    page.on("dialog", async (dialog) => {
      console.log(`⚠️ ALERT ИЛЭРЛЭЭ: "${dialog.message()}"`);
      expect(dialog.message()).toContain(
        "Нэвтрэх нэр эсвэл нууц үг буруу байна!",
      );
      await dialog.dismiss();
    });

    await page.locator('form button:has-text("Нэвтрэх")').click();
    console.log("✅ АМЖИЛТ: Alert зөв харагдлаа.");
  });
});
