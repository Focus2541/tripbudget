/* TripBudget — เวอร์ชันและการตั้งค่า (แก้ที่ไฟล์นี้ที่เดียว)
   - APP_VERSION: เปลี่ยนทุกครั้งที่แก้ไฟล์ใดก็ตามในแอป (index.html, countries.js ฯลฯ)
     แอปของผู้ใช้จะเห็นแถบ "มีอัปเดต" และ service worker จะสร้างแคชชื่อใหม่ตามเลขนี้
   - FEEDBACK_URL: ลิงก์ Web app ของ Google Apps Script (ลงท้ายด้วย /exec)
     ใช้ส่งความเห็นและสถิติการใช้งาน ถ้าเว้นว่าง แอปจะเก็บไว้ในเครื่องรอส่งทีหลัง */
self.APP_VERSION = '5.4.0';
self.FEEDBACK_URL = '';
