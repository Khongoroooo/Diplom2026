from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

def login_to_system(driver, wait, email, password):
    print("1. 'Нэвтрэх' товчийг дарж байна...")
    login_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Нэвтрэх']")))
    login_btn.click()

    print("2. Нэвтрэх мэдээлэл бөглөж байна...")
    email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[placeholder="example@mail.com"]')))
    pass_input = driver.find_element(By.CSS_SELECTOR, 'input[placeholder="••••••••"]')

    email_input.send_keys(email)
    pass_input.send_keys(password)

    print("3. Submit дарлаа.")
    driver.find_element(By.XPATH, "//form//button[contains(text(), 'Нэвтрэх')]").click()
    
    wait.until(EC.url_contains("dashboard"))
    print("✅ Системд амжилттай нэвтэрлээ.")