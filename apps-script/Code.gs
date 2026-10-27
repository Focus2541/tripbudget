/**
 * TripBudget — รับความเห็นและสถิติการใช้งาน แล้วบันทึกลง Google Sheet
 * วิธีติดตั้งอยู่ใน apps-script/README.md
 *
 * ชีตที่สร้างให้อัตโนมัติ:
 *   Feedback  — ความเห็นจากผู้ใช้
 *   Usage     — จำนวนครั้งที่ใช้แต่ละฟีเจอร์ต่อวัน (ไม่ระบุตัวตน)
 *   Errors    — ข้อความ error ของแอปต่อวัน
 */
const HEADERS = {
  Feedback: ['เวลาที่ได้รับ', 'ประเภท', 'ข้อความ', 'ชื่อเล่น', 'เวอร์ชันแอป', 'ติดตั้งเป็นแอป', 'อุปกรณ์/เบราว์เซอร์', 'เวลาที่ผู้ใช้กดส่ง', 'ข้อมูลทริป (ผู้ใช้ยินยอม)'],
  Usage: ['วันที่', 'เวอร์ชันแอป', 'ฟีเจอร์', 'จำนวนครั้ง', 'เวลาที่ได้รับ'],
  Errors: ['วันที่', 'เวอร์ชันแอป', 'ข้อความ error', 'ตำแหน่ง', 'จำนวนครั้ง', 'เวลาที่ได้รับ']
};
const MAX_BODY = 200000; // กันข้อมูลใหญ่ผิดปกติ

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const raw = (e && e.postData && e.postData.contents) || '';
    if (!raw || raw.length > MAX_BODY) return out_({ok: false, error: 'empty or too large'});
    const d = JSON.parse(raw);
    const now = new Date();
    if (d.kind === 'feedback') {
      sheet_('Feedback').appendRow([
        now, clip_(d.type, 40), clip_(d.message, 5000), clip_(d.nickname, 60), clip_(d.v, 20),
        d.standalone ? 'ใช่' : 'ไม่', clip_(d.ua, 250), clip_(d.at, 40),
        d.trip ? clip_(JSON.stringify(d.trip), 45000) : ''
      ]);
      return out_({ok: true});
    }
    if (d.kind === 'usage') {
      const usage = [], errors = [];
      (Array.isArray(d.days) ? d.days : []).slice(0, 40).forEach(day => {
        const date = clip_(day.date, 10);
        Object.keys(day.counts || {}).slice(0, 300).forEach(k => usage.push([date, clip_(d.v, 20), clip_(k, 80), Number(day.counts[k]) || 0, now]));
        (Array.isArray(day.errors) ? day.errors : []).slice(0, 30).forEach(er => errors.push([date, clip_(d.v, 20), clip_(er.m, 300), clip_(er.s, 100), Number(er.n) || 1, now]));
      });
      appendRows_('Usage', usage);
      appendRows_('Errors', errors);
      return out_({ok: true, usage: usage.length, errors: errors.length});
    }
    return out_({ok: false, error: 'unknown kind'});
  } catch (err) {
    return out_({ok: false, error: String(err)});
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

// เปิดลิงก์ Web app ในเบราว์เซอร์เพื่อเช็กว่าติดตั้งสำเร็จ
function doGet() {
  return ContentService.createTextOutput('TripBudget feedback endpoint OK');
}

function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(HEADERS[name]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS[name].length).setFontWeight('bold');
  }
  return sh;
}
function appendRows_(name, rows) {
  if (!rows.length) return;
  const sh = sheet_(name);
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}
function clip_(v, n) {
  const s = v === undefined || v === null ? '' : String(v);
  // กันสูตรใน Sheet (ข้อความที่ขึ้นต้นด้วย = + - @)
  const safe = /^[=+\-@]/.test(s) ? "'" + s : s;
  return safe.length > n ? safe.slice(0, n) + '…' : safe;
}
function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ทดสอบในหน้า Apps Script: เลือกฟังก์ชันนี้แล้วกด Run จะเห็นแถวทดสอบในชีต Feedback
function testFeedback() {
  doPost({postData: {contents: JSON.stringify({kind: 'feedback', type: 'ทดสอบ', message: 'ทดสอบจาก Apps Script', v: 'test', at: new Date().toISOString()})}});
}
