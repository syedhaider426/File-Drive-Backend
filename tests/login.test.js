/* Login tests */

describe("Login", () => {
  beforeEach(async () => {
    await page.goto("http://localhost:3000");
  });

  describe("Login page - Invalid Login", () => {
    it('should have an email and password field ""', async () => {
      await expect(page).toMatch("Email");
      await expect(page).toMatch("Password");
    });
    it('should allow not allow the user to login""', async () => {
      await expect(page).toFillForm('form[name="Login"]', {
        email: "a",
        password: "b",
      });
      await page.click("button");
      await expect(page).toMatch("Email");
    });
  });
  describe("Login page - Successful Login", () => {
    it('should have an email and password field ""', async () => {
      await expect(page).toMatch("Email");
      await expect(page).toMatch("Password");
    });
    it('should allow the user to login""', async () => {
      await expect(page).toFillForm('form[name="Login"]', {
        email: "a",
        password: "a",
      });
      await page.click("button");
      await expect(page).toMatch("File");
    });
  });
});
