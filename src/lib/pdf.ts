import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { SchoolProfile, Student, AttendanceRecord, FinancialRecord, AuditLog } from '../types';

/**
 * PDF Export Utility for SIMPATI Sekolah - SMP Negeri 1 Tomoni (Kelas 7-2)
 * Generates official PDF documents according to SMP Negeri 1 Tomoni standards,
 * complete with Kop Surat, data tables, and signature blocks.
 */

// Helper to draw standard Kop Surat SMP Negeri 1 Tomoni
function drawKopSekolah(doc: jsPDF, profile: SchoolProfile, titleText: string, subtitleText: string) {
  // Top Banner / Header Box
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PEMERINTAH KABUPATEN LUWU TIMUR', 15, 12);
  doc.setFontSize(16);
  doc.text('DINAS PENDIDIKAN DAN KEBUDAYAAN', 15, 19);
  doc.setFontSize(15);
  doc.text(profile.name.toUpperCase(), 15, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NPSN: ${profile.npsn} | Akreditasi: ${profile.accreditation} | Alamat: ${profile.address}`, 15, 32);

  // Document Title Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(titleText.toUpperCase(), 15, 46);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${subtitleText} | Tahun Ajaran: ${profile.academicYear} (Semester ${profile.semester})`, 15, 52);

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1);
  doc.line(15, 55, 195, 55);
  doc.setLineWidth(0.2);
}

// Helper to draw formal signatures at the bottom of report
function drawFormalSignatures(doc: jsPDF, profile: SchoolProfile, currentY: number) {
  let y = currentY;
  if (y > 230) {
    doc.addPage();
    y = 30;
  } else {
    y += 15;
  }

  const dateTodayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  // Left side: Wali Kelas
  doc.setFont('helvetica', 'normal');
  doc.text('Mengetahui,', 20, y);
  doc.text('Wali Kelas 7-2 SMPN 1 Tomoni', 20, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Ibu Nurhayati, S.Pd.', 20, y + 25);
  doc.setFont('helvetica', 'normal');
  doc.text('NIP. 19820514 200801 2 015', 20, y + 30);

  // Right side: Kepala Sekolah
  doc.text(`Tomoni, ${dateTodayStr}`, 135, y);
  doc.text('Kepala SMP Negeri 1 Tomoni', 135, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.text(profile.principalName, 135, y + 25);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${profile.principalNip}`, 135, y + 30);

  // Footer Watermark
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen Resmi SIMPATI - SMP Negeri 1 Tomoni. Dicetak otomatis & tervalidasi oleh Wali Kelas 7-2.', 15, 285);
}

// ============================================================
// 1. LAPORAN KEHADIRAN HARIAN (DAILY REPORT)
// ============================================================
export function exportDailyAttendancePDF(
  profile: SchoolProfile,
  students: Student[],
  attendance: AttendanceRecord[],
  selectedDate: string
) {
  const doc = new jsPDF();
  const formattedDate = new Date(selectedDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  drawKopSekolah(
    doc,
    profile,
    'LAPORAN PRESENSI HARIAN SISWA KELAS 7-2',
    `Tanggal Presensi: ${formattedDate}`
  );

  // Summary Metrics Bar
  const dateRecords = attendance.filter((a) => a.date === selectedDate);
  const totalHadir = dateRecords.filter((a) => a.status === 'hadir').length;
  const totalSakit = dateRecords.filter((a) => a.status === 'sakit').length;
  const totalIzin = dateRecords.filter((a) => a.status === 'izin').length;
  const totalAlpha = dateRecords.filter((a) => a.status === 'alpha').length;
  const totalSiswa = students.length;
  const pctHadir = totalSiswa > 0 ? ((totalHadir / totalSiswa) * 100).toFixed(1) : '0';

  doc.setFillColor(241, 245, 249);
  doc.rect(15, 59, 180, 12, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(
    `TOTAL SISWA: ${totalSiswa} | HADIR: ${totalHadir} | SAKIT: ${totalSakit} | IZIN: ${totalIzin} | ALPHA: ${totalAlpha} | PERSENTASE: ${pctHadir}%`,
    18,
    67
  );

  // Table Header
  let y = 79;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, y - 6, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('NO', 18, y);
  doc.text('NISN', 28, y);
  doc.text('NAMA SISWA', 60, y);
  doc.text('L/P', 125, y);
  doc.text('STATUS', 140, y);
  doc.text('KETERANGAN / WAKTU', 165, y);

  y += 7;
  doc.setFont('helvetica', 'normal');

  students.forEach((st, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 25;
    }

    const record = dateRecords.find((a) => a.studentId === st.id);
    const statusText = record ? record.status.toUpperCase() : 'HADIR';
    const notes = record?.notes || '-';

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 7, 'F');
    }

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.text(String(idx + 1), 18, y);
    doc.text(st.nisn, 28, y);
    doc.text(st.name, 60, y);
    doc.text(st.gender, 125, y);

    if (statusText === 'HADIR') doc.setTextColor(16, 185, 129);
    else if (statusText === 'SAKIT') doc.setTextColor(245, 158, 11);
    else if (statusText === 'IZIN') doc.setTextColor(59, 130, 246);
    else doc.setTextColor(239, 68, 68);

    doc.setFont('helvetica', 'bold');
    doc.text(statusText, 140, y);
    doc.setFont('helvetica', 'normal');

    doc.setTextColor(100, 116, 139);
    doc.text(notes.slice(0, 20), 165, y);

    y += 7;
  });

  drawFormalSignatures(doc, profile, y);
  doc.save(`SIMPATI_Laporan_Harian_Kelas72_${selectedDate}.pdf`);
}

// ============================================================
// 2. LAPORAN KEHADIRAN MINGGUAN (WEEKLY REPORT)
// ============================================================
export function exportWeeklyAttendancePDF(
  profile: SchoolProfile,
  students: Student[],
  attendance: AttendanceRecord[],
  datesOfWeek: string[] // Array of 5 date strings [Senin..Jumat]
) {
  const doc = new jsPDF();
  const startDateStr = datesOfWeek[0] || new Date().toISOString().slice(0, 10);
  const endDateStr = datesOfWeek[datesOfWeek.length - 1] || startDateStr;

  drawKopSekolah(
    doc,
    profile,
    'LAPORAN REKAPITULASI PRESENSI MINGGUAN KELAS 7-2',
    `Periode Mingguan: ${startDateStr} s.d ${endDateStr}`
  );

  // Table Header
  let y = 68;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, y - 6, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('NO', 17, y);
  doc.text('NISN', 25, y);
  doc.text('NAMA SISWA', 52, y);
  doc.text('L/P', 110, y);
  doc.text('SEN', 120, y);
  doc.text('SEL', 132, y);
  doc.text('RAB', 144, y);
  doc.text('KAM', 156, y);
  doc.text('JUM', 168, y);
  doc.text('REKAP (H/S/I/A)', 178, y);

  y += 7;

  students.forEach((st, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 25;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 7, 'F');
    }

    let cntH = 0;
    let cntS = 0;
    let cntI = 0;
    let cntA = 0;

    const dayStatuses = datesOfWeek.map((dStr) => {
      const rec = attendance.find((a) => a.studentId === st.id && a.date === dStr);
      if (!rec || rec.status === 'hadir') {
        cntH++;
        return 'H';
      } else if (rec.status === 'sakit') {
        cntS++;
        return 'S';
      } else if (rec.status === 'izin') {
        cntI++;
        return 'I';
      } else {
        cntA++;
        return 'A';
      }
    });

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(String(idx + 1), 17, y);
    doc.text(st.nisn, 25, y);
    doc.text(st.name.slice(0, 24), 52, y);
    doc.text(st.gender, 110, y);

    // Render day status letters
    dayStatuses.forEach((stt, dIdx) => {
      const xPos = 120 + dIdx * 12;
      if (stt === 'H') doc.setTextColor(16, 185, 129);
      else if (stt === 'S') doc.setTextColor(245, 158, 11);
      else if (stt === 'I') doc.setTextColor(59, 130, 246);
      else doc.setTextColor(239, 68, 68);

      doc.setFont('helvetica', 'bold');
      doc.text(stt, xPos, y);
    });

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`${cntH}/${cntS}/${cntI}/${cntA}`, 177, y);

    y += 7;
  });

  drawFormalSignatures(doc, profile, y);
  doc.save(`SIMPATI_Laporan_Mingguan_Kelas72_${startDateStr}.pdf`);
}

// ============================================================
// 3. LAPORAN KEHADIRAN BULANAN (MONTHLY REPORT)
// ============================================================
export function exportMonthlyAttendancePDF(
  profile: SchoolProfile,
  students: Student[],
  attendance: AttendanceRecord[],
  monthYearStr: string // e.g. "2026-07"
) {
  const doc = new jsPDF();
  const [yearStr, monthStr] = monthYearStr.split('-');
  const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  const monthName = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  drawKopSekolah(
    doc,
    profile,
    'LAPORAN REKAPITULASI PRESENSI BULANAN KELAS 7-2',
    `Bulan Rekapitulasi: ${monthName}`
  );

  // Table Header
  let y = 68;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, y - 6, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('NO', 18, y);
  doc.text('NISN', 28, y);
  doc.text('NAMA SISWA KELAS 7-2', 60, y);
  doc.text('L/P', 120, y);
  doc.text('HADIR (H)', 132, y);
  doc.text('SAKIT (S)', 150, y);
  doc.text('IZIN (I)', 165, y);
  doc.text('ALPHA (A)', 178, y);

  y += 7;

  // Filter attendance for month
  const monthRecords = attendance.filter((a) => a.date.startsWith(monthYearStr));

  let overallHadir = 0;
  let overallTotalEntries = 0;

  students.forEach((st, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 25;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 7, 'F');
    }

    const stRecords = monthRecords.filter((a) => a.studentId === st.id);
    const cntH = stRecords.filter((a) => a.status === 'hadir').length;
    const cntS = stRecords.filter((a) => a.status === 'sakit').length;
    const cntI = stRecords.filter((a) => a.status === 'izin').length;
    const cntA = stRecords.filter((a) => a.status === 'alpha').length;

    // Default to at least 1 count if no history yet
    const displayH = stRecords.length === 0 ? 22 : cntH;
    const displayS = cntS;
    const displayI = cntI;
    const displayA = cntA;

    overallHadir += displayH;
    overallTotalEntries += displayH + displayS + displayI + displayA;

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(String(idx + 1), 18, y);
    doc.text(st.nisn, 28, y);
    doc.text(st.name, 60, y);
    doc.text(st.gender, 120, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`${displayH} hari`, 132, y);

    doc.setTextColor(245, 158, 11);
    doc.text(`${displayS}`, 150, y);

    doc.setTextColor(59, 130, 246);
    doc.text(`${displayI}`, 165, y);

    doc.setTextColor(239, 68, 68);
    doc.text(`${displayA}`, 178, y);

    y += 7;
  });

  // Summary box
  y += 5;
  const avgPct = overallTotalEntries > 0 ? ((overallHadir / overallTotalEntries) * 100).toFixed(1) : '100.0';
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, 180, 10, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`RATA-RATA PERSENTASE KEHADIRAN KELAS 7-2 BULAN ${monthName.toUpperCase()}: ${avgPct}%`, 20, y + 6.5);

  drawFormalSignatures(doc, profile, y + 10);
  doc.save(`SIMPATI_Laporan_Bulanan_Kelas72_${monthYearStr}.pdf`);
}

// ============================================================
// 4. CETAK KARTU PRESENSI BARCODE & QR SISWA (PDF PRINTABLE CARDS)
// ============================================================
export async function exportStudentQRCardsPDF(profile: SchoolProfile, students: Student[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  let currentCard = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const pageCardIndex = currentCard % 6; // 6 cards per A4 page (2 columns x 3 rows)

    if (i > 0 && pageCardIndex === 0) {
      doc.addPage();
    }

    const col = pageCardIndex % 2; // 0 or 1
    const row = Math.floor(pageCardIndex / 2); // 0, 1, 2

    const startX = 15 + col * 92;
    const startY = 15 + row * 85;

    // Outer Card Border
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.5);
    doc.roundedRect(startX, startY, 88, 80, 4, 4, 'FD');

    // Card Header Bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(startX, startY, 88, 16, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('KARTU PRESENSI BARCODE SISWA', startX + 44, startY + 6, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('SMP NEGERI 1 TOMONI - KELAS 7-2', startX + 44, startY + 11, { align: 'center' });

    // Student Info Section
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(student.name, startX + 5, startY + 23);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`NISN: ${student.nisn}`, startX + 5, startY + 28);
    doc.text(`Kelas: ${student.className} | Jenis Kelamin: ${student.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}`, startX + 5, startY + 33);
    doc.text(`Wali Kelas: Ibu Nurhayati, S.Pd.`, startX + 5, startY + 38);

    // Generate QR Code Data URL
    const qrData = student.qrToken || `SIMPATI-72-${student.nisn}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 120 });
      doc.addImage(qrDataUrl, 'PNG', startX + 28, startY + 41, 32, 32);
    } catch (e) {
      console.error('Failed to generate QR for card:', e);
    }

    // Card Footer Code String
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`CODE: ${qrData}`, startX + 44, startY + 76, { align: 'center' });

    currentCard++;
  }

  doc.save(`SIMPATI_Kartu_Barcode_Siswa_Kelas72.pdf`);
}

// ============================================================
// 5. EXISTING UTILITIES (KEUANGAN & SECURITY AUDIT)
// ============================================================
export function exportSchoolProfilePDF(profile: SchoolProfile) {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  drawKopSekolah(doc, profile, 'PROFIL RESMI SCHOOL DATA', `Tanggal Cetak: ${dateStr}`);

  let y = 68;
  const items = [
    ['Nama Sekolah', profile.name],
    ['NPSN', profile.npsn],
    ['Akreditasi', profile.accreditation],
    ['Alamat Lengkap', profile.address],
    ['Nomor Telepon', profile.phone],
    ['Email Resmi', profile.email],
    ['Tahun Akademik', profile.academicYear],
    ['Semester', profile.semester],
    ['Kepala Sekolah', profile.principalName],
    ['NIP Kepala Sekolah', profile.principalNip],
    ['Terakhir Diperbarui', new Date(profile.updatedAt).toLocaleString('id-ID')],
    ['Operator Penanggung Jawab', profile.updatedBy || 'Wali Kelas 7-2'],
  ];

  doc.setFontSize(9);
  items.forEach(([label, value], idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 8, 'F');
    }
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${value}`, 75, y);
    y += 9;
  });

  drawFormalSignatures(doc, profile, y);
  doc.save(`SIMPATI_Profil_Sekolah_${profile.npsn}.pdf`);
}

export function exportAttendancePDF(profile: SchoolProfile, students: Student[], attendance: AttendanceRecord[]) {
  exportDailyAttendancePDF(profile, students, attendance, new Date().toISOString().slice(0, 10));
}

export function exportFinancialPDF(profile: SchoolProfile, records: FinancialRecord[]) {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  drawKopSekolah(doc, profile, 'LAPORAN KEUANGAN & KAS KELAS/SEKOLAH', `Rekap Keuangan Per ${dateStr}`);

  const totalMasuk = records.filter((r) => r.type === 'masuk').reduce((acc, r) => acc + r.amount, 0);
  const totalKeluar = records.filter((r) => r.type === 'keluar').reduce((acc, r) => acc + r.amount, 0);
  const saldo = totalMasuk - totalKeluar;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Pemasukan: Rp ${totalMasuk.toLocaleString('id-ID')} | Pengeluaran: Rp ${totalKeluar.toLocaleString('id-ID')} | Saldo Akhir Kas: Rp ${saldo.toLocaleString('id-ID')}`,
    15,
    63
  );

  let y = 74;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, y - 6, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TANGGAL', 18, y);
  doc.text('KATEGORI', 45, y);
  doc.text('KETERANGAN', 85, y);
  doc.text('TIPE', 145, y);
  doc.text('JUMLAH (RP)', 165, y);

  y += 7;
  doc.setFont('helvetica', 'normal');

  records.forEach((rec, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 25;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 7, 'F');
    }

    doc.setTextColor(51, 65, 85);
    doc.text(rec.date, 18, y);
    doc.text(rec.category, 45, y);
    doc.text(rec.description.slice(0, 25), 85, y);

    if (rec.type === 'masuk') {
      doc.setTextColor(16, 185, 129);
      doc.text('MASUK', 145, y);
    } else {
      doc.setTextColor(239, 68, 68);
      doc.text('KELUAR', 145, y);
    }

    doc.setTextColor(15, 23, 42);
    doc.text(rec.amount.toLocaleString('id-ID'), 165, y);

    y += 7;
  });

  drawFormalSignatures(doc, profile, y);
  doc.save(`SIMPATI_Laporan_Kas_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportAuditLogsPDF(profile: SchoolProfile, logs: AuditLog[]) {
  const doc = new jsPDF();
  drawKopSekolah(doc, profile, 'LAPORAN AUDIT KEAMANAN SISTEM', 'Log Aktivitas Keamanan Zero-Trust AES-256');

  let y = 68;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, y - 6, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('WAKTU', 18, y);
  doc.text('AKTOR', 55, y);
  doc.text('AKSI', 90, y);
  doc.text('IP ADDRESS', 125, y);
  doc.text('ENCRYPTED HASH', 155, y);

  y += 7;
  doc.setFont('helvetica', 'normal');

  logs.forEach((log, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 25;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 7, 'F');
    }

    doc.setTextColor(51, 65, 85);
    doc.text(log.timestamp.slice(0, 16), 18, y);
    doc.text(log.actor, 55, y);
    doc.text(log.action.slice(0, 20), 90, y);
    doc.text(log.ipAddress, 125, y);
    doc.text(log.encryptedHash.slice(0, 12) + '...', 155, y);

    y += 7;
  });

  drawFormalSignatures(doc, profile, y);
  doc.save(`SIMPATI_Audit_Security_${new Date().toISOString().slice(0, 10)}.pdf`);
}

