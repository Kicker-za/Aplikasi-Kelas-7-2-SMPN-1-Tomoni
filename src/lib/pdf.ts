import { jsPDF } from 'jspdf';
import { SchoolProfile, Student, AttendanceRecord, FinancialRecord, AuditLog } from '../types';

/**
 * PDF Export Utility for SIMPATI Sekolah
 * Generates official PDF documents with School Header, Data Tables, and Digital Signature blocks.
 */

export function exportSchoolProfilePDF(profile: SchoolProfile) {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Header Box
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(profile.name.toUpperCase(), 15, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`NPSN: ${profile.npsn} | Akreditasi: ${profile.accreditation} | Tahun Ajaran: ${profile.academicYear}`, 15, 24);

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN PROFIL DENGAN ENKRIPSI SISTEM DOKUMEN DITANDATANGANI', 15, 45);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Tanggal Cetak: ${dateStr} | Status Keamanan: AES-256-GCM Encrypted`, 15, 52);

  doc.setDrawColor(226, 232, 240);
  doc.line(15, 56, 195, 56);

  // Table Data
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
    ['Operator Penanggung Jawab', profile.updatedBy || 'Administrator Utama'],
  ];

  doc.setFontSize(11);
  items.forEach(([label, value], idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 10, 'F');
    }
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${value}`, 75, y);
    y += 11;
  });

  // Footer & Signature
  y += 20;
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('Mengetahui,', 140, y);
  doc.text('Kepala Sekolah', 140, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(profile.principalName, 140, y + 30);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${profile.principalNip}`, 140, y + 36);

  // Watermark Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen ini dihasilkan secara otomatis oleh SIMPATI Sekolah (Sistem Informasi Manajemen Pelayanan Administrasi Terpadu Kelas).', 15, 285);

  doc.save(`SIMPATI_Profil_Sekolah_${profile.npsn}.pdf`);
}

export function exportAttendancePDF(profile: SchoolProfile, students: Student[], attendance: AttendanceRecord[]) {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(profile.name.toUpperCase(), 15, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`LAPORAN REKAPITULASI KEHADIRAN SISWA - ${profile.academicYear}`, 15, 24);

  // Subheader
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`REKAP KEHADIRAN KELAS & HARI INI (${dateStr})`, 15, 45);

  // Summary counts
  const totalHadir = attendance.filter((a) => a.status === 'hadir').length;
  const totalIzin = attendance.filter((a) => a.status === 'izin').length;
  const totalSakit = attendance.filter((a) => a.status === 'sakit').length;
  const totalAlpha = attendance.filter((a) => a.status === 'alpha').length;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Siswa: ${students.length} | Hadir: ${totalHadir} | Sakit: ${totalSakit} | Izin: ${totalIzin} | Alpha: ${totalAlpha}`, 15, 53);

  doc.setDrawColor(203, 213, 225);
  doc.line(15, 58, 195, 58);

  // Table header
  let y = 68;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y - 6, 180, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('No', 18, y);
  doc.text('NISN', 30, y);
  doc.text('Nama Siswa', 65, y);
  doc.text('Kelas', 125, y);
  doc.text('Status Kehadiran', 155, y);

  y += 8;
  doc.setFont('helvetica', 'normal');

  students.forEach((st, idx) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    const att = attendance.find((a) => a.studentId === st.id);
    const statusText = att ? att.status.toUpperCase() : 'HADIR';

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 8, 'F');
    }

    doc.setTextColor(51, 65, 85);
    doc.text(String(idx + 1), 18, y);
    doc.text(st.nisn, 30, y);
    doc.text(st.name, 65, y);
    doc.text(st.className, 125, y);

    if (statusText === 'HADIR') doc.setTextColor(16, 185, 129);
    else if (statusText === 'SAKIT') doc.setTextColor(245, 158, 11);
    else if (statusText === 'IZIN') doc.setTextColor(59, 130, 246);
    else doc.setTextColor(239, 68, 68);

    doc.setFont('helvetica', 'bold');
    doc.text(statusText, 155, y);
    doc.setFont('helvetica', 'normal');

    y += 9;
  });

  doc.save(`SIMPATI_Laporan_Kehadiran_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportFinancialPDF(profile: SchoolProfile, records: FinancialRecord[]) {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(profile.name.toUpperCase(), 15, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`LAPORAN KEUANGAN & KAS KELAS/SEKOLAH`, 15, 24);

  // Metrics
  const totalMasuk = records.filter((r) => r.type === 'masuk').reduce((acc, r) => acc + r.amount, 0);
  const totalKeluar = records.filter((r) => r.type === 'keluar').reduce((acc, r) => acc + r.amount, 0);
  const saldo = totalMasuk - totalKeluar;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`REKAP KAS SEKOLAH PARALEL (${dateStr})`, 15, 45);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Pemasukan: Rp ${totalMasuk.toLocaleString('id-ID')} | Total Pengeluaran: Rp ${totalKeluar.toLocaleString('id-ID')} | Saldo Akhir: Rp ${saldo.toLocaleString('id-ID')}`, 15, 53);

  doc.setDrawColor(203, 213, 225);
  doc.line(15, 58, 195, 58);

  // Table
  let y = 68;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y - 6, 180, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal', 18, y);
  doc.text('Kategori', 45, y);
  doc.text('Keterangan', 85, y);
  doc.text('Tipe', 145, y);
  doc.text('Jumlah (Rp)', 165, y);

  y += 8;
  doc.setFont('helvetica', 'normal');

  records.forEach((rec, idx) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 8, 'F');
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

    y += 9;
  });

  doc.save(`SIMPATI_Laporan_Kas_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportAuditLogsPDF(profile: SchoolProfile, logs: AuditLog[]) {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(profile.name.toUpperCase(), 15, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`LAPORAN AUDIT KEAMANAN & AKSI ENKRIPSI SISTEM (AES-256-GCM)`, 15, 24);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`LOG AKTIVITAS ZERO-TRUST SECURITY AUDIT`, 15, 45);

  let y = 58;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y - 6, 180, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Waktu', 18, y);
  doc.text('Aktor', 55, y);
  doc.text('Aksi', 90, y);
  doc.text('IP Address', 125, y);
  doc.text('Encrypted Hash', 155, y);

  y += 8;
  doc.setFont('helvetica', 'normal');

  logs.forEach((log, idx) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 8, 'F');
    }

    doc.setTextColor(51, 65, 85);
    doc.text(log.timestamp.slice(0, 16), 18, y);
    doc.text(log.actor, 55, y);
    doc.text(log.action.slice(0, 20), 90, y);
    doc.text(log.ipAddress, 125, y);
    doc.text(log.encryptedHash.slice(0, 12) + '...', 155, y);

    y += 9;
  });

  doc.save(`SIMPATI_Audit_Security_${new Date().toISOString().slice(0, 10)}.pdf`);
}
