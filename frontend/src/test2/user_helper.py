from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import time

def delete_user(driver, wait, target_email):
    print(f"4. Sidebar-аас 'Тохиргоо' цэсийг хайж байна...")
    
    try:
        # 1. 'Тохиргоо' цэс дээр дарах (Sidebar нээх)
        # image_ef0127.png дээрх шиг 'Тохиргоо' текстийг хайна
        settings_menu = wait.until(EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Тохиргоо')] | //div[contains(text(), 'Тохиргоо')] | //*[text()='Тохиргоо']")))
        driver.execute_script("arguments[0].click();", settings_menu)
        print("   ✅ 'Тохиргоо' цэс нээгдлээ.")
        time.sleep(1.5) # Дэд цэс гарч ирэхийг түр хүлээх

        # 2. 'Хэрэглэгчийн тохиргоо' дэд цэсэн дээр дарах
        # image_ed90ae.png дээрх цэнхэр сонголтыг хайна
        user_link = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(., 'Хэрэглэгчийн тохиргоо')] | //*[contains(text(), 'Хэрэглэгчийн тохиргоо')]")))
        user_link.click()
        print("   ✅ 'Хэрэглэгчийн тохиргоо' хуудас руу орлоо.")

        # 3. Хүснэгтийн өгөгдөл ачаалахыг хүлээх
        print("5. Хүснэгтийн өгөгдөл ачаалахыг хүлээж байна...")
        time.sleep(5) # Сүлжээ удаан бол 5 секунд хангалттай

        # 4. Хүснэгт доторх бүх мөрүүдийг (tr) шалгах
        rows = driver.find_elements(By.TAG_NAME, "tr")
        found_row = None

        for row in rows:
            # Мөрийн текст дотор target_email (жишээ нь: a@gmail.com) байгаа эсэхийг шалгах
            if target_email in row.text:
                found_row = row
                break
        
        if found_row:
            print(f"   ✅ '{target_email}' хэрэглэгчийн мөрийг оллоо.")
            
            # Тухайн мөр доторх хамгийн сүүлчийн button (Улаан хогийн сав)
            buttons = found_row.find_elements(By.TAG_NAME, "button")
            if buttons:
                # Устгах товч нь ихэвчлэн сүүлчийнх байдаг (Trash icon)
                delete_btn = buttons[-1]
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", delete_btn)
                time.sleep(1)
                driver.execute_script("arguments[0].click();", delete_btn)
                print("   🗑️ Устгах товчлуур дарагдлаа.")
                
                # 5. Баталгаажуулах цонхыг шийдэх (Alert эсвэл Modal)
                time.sleep(2)
                handle_confirmation(driver, wait)
            else:
                print("   ❌ Алдаа: Тухайн мөрөнд 'Үйлдэл' товчлуур олдсонгүй.")
        else:
            # Хэрэв олдохгүй бол одоо дэлгэц дээр юу харагдаж байгааг хэвлэнэ (Debug)
            print(f"   ❌ Алдаа: '{target_email}' жагсаалтад олдсонгүй.")
            emails = [e.text for e in driver.find_elements(By.XPATH, "//table//td")]
            print(f"   Одоо харагдаж байгаа бүх текстийн хэсэг: {emails[:10]}")

    except Exception as e:
        print(f"❌ Системийн алдаа: {str(e)}")
        raise e

def handle_confirmation(driver, wait):
    """Устгах үйлдлийг баталгаажуулах (Alert эсвэл Custom Modal)"""
    try:
        # Browser-ийн стандарт Alert байгаа эсэхийг шалгах
        alert = driver.switch_to.alert
        print(f"   ⚠️ Alert мессеж: {alert.text}")
        alert.accept()
        print("   ✅ Browser-ийн Alert баталгаажууллаа.")
    except:
        try:
            # Хэрэв React Modal-ын 'Устгах' товч бол
            confirm_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Устгах')] | //button[contains(@class, 'bg-red')]")
            confirm_btn.click()
            print("   ✅ Системийн Modal баталгаажууллаа.")
        except:
            print("   ⚠️ Баталгаажуулах цонх (Alert/Modal) гарсангүй. Шууд устсан байж магадгүй.")