describe("Register", () => {
  beforeAll(async () => {
    await page.goto("http://localhost:3000/register");
  });
  describe("Invalid register", () => {
    it("should not allow user to register account with existing email", async () => {
      await expect(page).toFillForm('form[name="Register"]', {
        email: "a",
        password: "a",
      });
      await page.click("button");
      await expect(page).toMatch("Email");
    });
    it("should not allow user to register account with empty input", async () => {
      await expect(page).toFillForm('form[name="Register"]', {
        email: "",
        password: "",
      });
      await page.click("button");
      await expect(page).toMatch("Email");
    });
  });
  describe("Successful register", () => {
    it("should allow user to register account with new email", async () => {
      await expect(page).toFillForm('form[name="Register"]', {
        email: "p",
        password: "p",
      });
      await page.click("button");
      await page.waitForSelector(".File");
      await expect(page).toMatch("File");
    });
  });
});
