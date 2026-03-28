from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
import auth_helper 
import user_helper 
import time

options = webdriver.ChromeOptions()
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
wait = WebDriverWait(driver, 10)

try:
    print("--- СЕЛЕНИУМ ТЕСТ: ХОНГОРЗУЛЫГ УСТГАХ ---")
    driver.get("http://172.20.10.7:5173/")
    driver.maximize_window()
    auth_helper.login_to_system(driver, wait, "admin@gmail.com", "12345678")

# Saraa-г устгах (яг зураг дээрх имэйлээр нь)
    user_helper.delete_user(driver, wait, "hongoroo1289810@gmail.com")

    print("--- ТЕСТ АМЖИЛТТАЙ ДУУСЛАА ---")
finally:
    time.sleep(3)
    driver.quit()