/* TripBudget — เวอร์ชันและการตั้งค่า (แก้ที่ไฟล์นี้ที่เดียว)
   - APP_VERSION: เปลี่ยนทุกครั้งที่แก้ไฟล์ใดก็ตามในแอป (index.html, countries.js ฯลฯ)
     แอปของผู้ใช้จะเห็นแถบ "มีอัปเดต" และ service worker จะสร้างแคชชื่อใหม่ตามเลขนี้
   - FEEDBACK_URL: ลิงก์ Web app ของ Google Apps Script (ลงท้ายด้วย /exec)
     ใช้ส่งความเห็นและสถิติการใช้งาน ถ้าเว้นว่าง แอปจะเก็บไว้ในเครื่องรอส่งทีหลัง
   - GATE_URL: ลิงก์ Apps Script ของแอปแปลเมนู ใช้ระบบขออนุญาตใช้งาน (เว้นว่าง = ใครก็ใช้ได้ ไม่ต้องขออนุญาต)
   - MENU_APP_URL: ลิงก์แอปแปลเมนู (เช่น '../menu/') เว้นว่าง = ปุ่ม "แปลเมนู" จะบอกว่ายังไม่เปิดให้ใช้ */
self.APP_VERSION = '5.8.2';
self.FEEDBACK_URL = '';
self.MENU_APP_URL = '../Menu/';
self.GATE_URL = 'https://script.google.com/macros/s/AKfycbxeio51lqWfBqjooKYH9xbVUUr83RiH_l5wnCh73WOY4-RXSWJXY3Mosg-XdNsHzWE1dw/exec';
