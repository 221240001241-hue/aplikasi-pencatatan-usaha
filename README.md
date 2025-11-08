# Labaku - Aplikasi Pencatatan Keuangan UMKM
https://221240001241-hue.github.io/aplikasi-pencatatan-usaha/

Labaku adalah aplikasi web progresif (PWA) sederhana untuk mencatat dan mengelola keuangan usaha kecil dan menengah (UMKM). Dirancang dengan fokus pada kemudahan penggunaan dan kebutuhan dasar pelaku UMKM.

## 📱 Halaman & Fitur

### 1. Beranda (index.html)
**Tujuan**: Memberikan ringkasan cepat kondisi keuangan usaha.

**Fitur Utama**:
- Ringkasan laba periode berjalan
- Total pemasukan & pengeluaran
- Periode aktif dengan tampilan kompak
- Daftar transaksi terbaru (5 teratas)
- Tombol floating action untuk tambah transaksi cepat

**Elemen UI**:
- Header dengan logo & profil
- Card ringkasan keuangan
- Card transaksi terbaru
- FAB (Floating Action Button) dengan menu:
  - Tambah Pemasukan
  - Tambah Pengeluaran

### 2. Form Transaksi (transaction-form.html)
**Tujuan**: Input data transaksi baru dengan mudah dan cepat.

**Fitur**:
- Toggle jenis transaksi (Pemasukan/Pengeluaran)
- Input nominal dengan validasi
- Pilihan kategori transaksi
- Pilihan tanggal
- Input catatan (opsional)
- Pilihan akun (Kas/Bank)

**Validasi**:
- Nominal harus > 0
- Kategori wajib dipilih
- Tanggal tidak boleh masa depan
- Feedback visual untuk error

### 3. Halaman Rekap (recap.html)
**Tujuan**: Analisis mendalam keuangan per periode.

**Fitur**:
- Ringkasan periode (Laba, Masuk, Keluar)
- Tabel kategori dengan total
- Filter transaksi:
  - Semua
  - Pemasukan saja
  - Pengeluaran saja
- Tabel detail transaksi
- Export data:
  - Export ke CSV
  - Cetak laporan

**Visualisasi**:
- Breakdown kategori
- Tabel transaksi lengkap
- Format angka IDR
- Status eksekusi

### 4. Profil & Pengaturan (profile.html)
**Tujuan**: Manajemen profil usaha dan data aplikasi.

**Informasi Usaha**:
- Nama bisnis
- Jenis usaha
- Tombol simpan profil

**Manajemen Data**:
- Cadangkan Data (backup JSON)
- Pulihkan Data (restore)
- Hapus Semua Transaksi
- Reset Semua Data

**Keamanan**:
- Konfirmasi untuk aksi destructive
- Feedback visual (toast)
- Preview sebelum restore

### 5. Menu Navigasi
**Bottom Navigation**:
- Tambah Pemasukan
- Tambah Pengeluaran
- Beranda
- Rekap
- Profil

**Fitur Navigasi**:
- Indikator halaman aktif
- Animasi feedback sentuh
- Label aksesibilitas
- Ikon intuitif

## 📋 Product Requirements Document (PRD)

### Latar Belakang
- UMKM membutuhkan alat pencatatan keuangan yang sederhana
- Banyak pelaku UMKM kesulitan memantau arus kas dan laba usaha
- Dibutuhkan solusi yang bisa diakses dari perangkat mobile

### Target Pengguna
- Pemilik UMKM
- Pedagang retail skala kecil
- Usaha rumahan
- Wirausaha pemula

### Kebutuhan Utama
1. Pencatatan transaksi (pemasukan & pengeluaran)
2. Perhitungan laba secara real-time
3. Rekap keuangan per periode
4. Manajemen data (backup & restore)

### Batasan Teknis
- Aplikasi berbasis web (PWA-ready)
- Penyimpanan data menggunakan localStorage
- Tampilan responsif untuk mobile
- Tidak memerlukan server/database eksternal

## 🎯 Minimum Viable Product (MVP)

### Fitur Inti
1. **Manajemen Transaksi**
   - Input pemasukan
   - Input pengeluaran
   - Kategorisasi transaksi
   - Pencatatan tanggal & catatan

2. **Ringkasan Keuangan**
   - Total pemasukan periode
   - Total pengeluaran periode
   - Perhitungan laba
   - Daftar transaksi terbaru

3. **Laporan & Rekap**
   - Filter transaksi per periode
   - Rekap per kategori
   - Export data (CSV)
   - Cetak laporan

4. **Manajemen Data**
   - Backup data (JSON)
   - Restore data
   - Reset data

## 🔄 Alur Penggunaan Detail

### 1. Setup Awal & Konfigurasi
1. Buka aplikasi di browser
   - Akses melalui localhost atau hosting
   - Tampilan otomatis menyesuaikan device

2. Setup Profil Usaha
   - Buka menu Profil
   - Isi nama bisnis
   - Isi jenis usaha
   - Klik "Simpan Profil"

3. Persiapan Pencatatan
   - Identifikasi kategori transaksi
   - Siapkan dokumen pendukung
   - Pahami alur input data

### 2. Pencatatan Transaksi Harian

#### A. Via Floating Action Button (FAB)
1. Di beranda, klik tombol "+" (FAB)
2. Pilih jenis: "Pemasukan" atau "Pengeluaran"
3. Isi form transaksi:
   - Nominal (wajib)
   - Kategori (wajib)
   - Tanggal (default hari ini)
   - Akun (Kas/Bank)
   - Catatan (opsional)
4. Klik "Simpan"
5. Notifikasi sukses muncul

#### B. Via Bottom Navigation
1. Klik ikon "↑" untuk Pemasukan atau "↓" untuk Pengeluaran
2. Form transaksi terbuka
3. Isi detail seperti di atas
4. Data tersimpan otomatis ke localStorage
5. Kembali ke halaman sebelumnya

#### C. Edit/Hapus Transaksi
1. Di halaman Rekap
2. Cari transaksi yang dimaksud
3. Klik untuk detail
4. Pilih edit atau hapus
5. Konfirmasi perubahan

### 3. Monitoring & Analisis Keuangan

#### A. Monitor di Beranda
1. Ringkasan Real-time
   - Laba periode: selisih masuk-keluar
   - Total pemasukan periode
   - Total pengeluaran periode
   
2. Quick Overview
   - 5 transaksi terbaru
   - Indikator jenis (warna)
   - Tanggal & kategori
   - Nominal & catatan

#### B. Analisis di Rekap
1. Atur Periode
   - Klik icon kalender
   - Pilih rentang tanggal
   - Data update otomatis

2. Analisis Kategori
   - Lihat total per kategori
   - Bandingkan masuk-keluar
   - Sort berdasar nominal
   
3. Filter & Cari
   - Filter: Semua/Masuk/Keluar
   - Cari berdasar kategori
   - Cari berdasar catatan
   
4. Export & Laporan
   - Export ke CSV (Excel)
   - Cetak laporan detail
   - Format siap print

### 4. Manajemen Data & Maintenance

#### A. Backup Data (Cadangkan)
1. Backup Rutin
   - Buka halaman Profil
   - Klik "Cadangkan Data"
   - File JSON terdownload
   - Format: `labaku-backup-YYYY-MM-DD.json`

2. Penyimpanan Backup
   - Simpan di lokasi aman
   - Buat multiple backup
   - Beri nama sesuai periode
   - Simpan di cloud (rekomendasi)

#### B. Restore Data
1. Pulihkan dari Backup
   - Buka halaman Profil
   - Klik "Pulihkan Data"
   - Pilih file backup JSON
   - Konfirmasi restore
   - Data ter-restore

2. Verifikasi Restore
   - Cek total transaksi
   - Cek periode terakhir
   - Cek kategori & pengaturan
   - Pastikan data lengkap

#### C. Reset & Pembersihan
1. Reset Transaksi
   - Hapus semua transaksi
   - Pengaturan tetap
   - Konfirmasi dulu
   - Tidak bisa dibatalkan

2. Reset Total
   - Hapus semua data
   - Kembali ke kondisi awal
   - Perlu backup dulu
   - Double konfirmasi

## 💡 Tips & Best Practices

### Penggunaan Optimal
1. **Pencatatan Rutin**
   - Catat transaksi segera
   - Gunakan FAB untuk input cepat
   - Isi catatan detail
   - Cek ulang nominal

2. **Kategorisasi**
   - Buat kategori konsisten
   - Pilih nama kategori jelas
   - Bedakan jenis masuk/keluar
   - Hindari kategori "Lain-lain"

3. **Monitoring**
   - Cek beranda tiap hari
   - Review rekap mingguan
   - Analisis tren bulanan
   - Export data untuk arsip

4. **Backup & Keamanan**
   - Backup mingguan wajib
   - Simpan multiple backup
   - Cek hasil restore
   - Amankan file backup

### Produktivitas
1. **Shortcuts & Gestur**
   - Gunakan FAB untuk input cepat
   - Scroll halus di rekap
   - Filter untuk analisis cepat
   - Bottom nav untuk navigasi

2. **Laporan & Analisis**
   - Export CSV untuk Excel
   - Print laporan rapi
   - Filter sesuai kebutuhan
   - Analisis per kategori

3. **Maintenance**
   - Hapus transaksi salah
   - Backup sebelum reset
   - Update profil bila perlu
   - Cek storage browser

## 🔒 Privasi & Keamanan

### Penyimpanan Data
1. **Lokal Storage**
   - Data di browser saja
   - Tidak ada server eksternal
   - Privasi terjamin
   - Akses cepat

2. **Backup & Recovery**
   - Format JSON aman
   - Enkripsi native browser
   - Restore mudah
   - Validasi otomatis

3. **Pembersihan Data**
   - Reset selektif tersedia
   - Konfirmasi ganda
   - Backup otomatis
   - Tidak bisa dibatalkan

### Keamanan Browser
1. **Storage Quota**
   - Monitor penggunaan
   - Cleanup berkala
   - Backup sebelum penuh
   - Hindari error quota

2. **Cache & Cookies**
   - Cache minimal
   - No tracking cookies
   - Tidak perlu login
   - Data tetap aman

## 🛠 Spesifikasi Teknis

### Platform & Teknologi
1. **Frontend**
   - HTML5 Semantic
   - CSS3 Modern
   - Vanilla JavaScript
   - Mobile-first Design

2. **Penyimpanan**
   - localStorage API
   - JSON format
   - Backup portable
   - CSV export

3. **UI/UX**
   - Responsive layout
   - Touch-friendly
   - Smooth transitions
   - Feather icons

4. **Performance**
   - Lightweight (<100KB)
   - No dependencies
   - Instant loading
   - Offline capable

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge (Chromium)

### Bahasa & Lokalisasi
- Bahasa: Indonesia
- Format: IDR (Rupiah)
- Date: DD/MM/YYYY
- Timezone: Asia/Jakarta

---
© 2025 Labaku - Aplikasi Pencatatan Keuangan UMKM"# aplikasi-pencatatan-usaha" 
