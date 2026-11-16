# Dokumen Persyaratan Produk (PRD) — BudgetKu

> Aplikasi web perencana anggaran pribadi, mobile-first, bahasa Indonesia, mata uang IDR.
> Versi dokumen: 1.0 · Status: draf untuk reviu · Lingkup: MVP + rencana v1.1/v2
> Rujukan IA: `docs/information-architecture.md` (disebut **IA**). Rujukan asumsi IA: A-01 dst.

---

## 1. Ringkasan, Masalah, Tujuan, Metrik

### 1.1 Ringkasan produk

Aplikasi web yang mencatat pengeluaran, pemasukan, dan transfer; menetapkan budget bulanan per kategori; mengingatkan tagihan langganan lewat Google Calendar; dan menampilkan analisis pengeluaran. Data pengguna tersimpan di satu spreadsheet Google Sheets milik pengguna sendiri. Backend = route handler tipis pemanggil Google API; tanpa database server.

### 1.2 Masalah

| ID | Masalah | Bukti/gejala (persona IA) |
| --- | --- | --- |
| P-01 | Pengguna tidak tahu sisa uang bulan berjalan tanpa membuka bank/e-wallet satu per satu. | P1 Rani: tujuan utama = tahu sisa uang < 5 detik. |
| P-02 | Pencatatan transaksi manual dirasa lambat, sehingga ditinggalkan. | P1: mencatat sambii berdiri di kasir. |
| P-03 | Tagihan langganan terpotong tanpa disadari. | P1: "langganan terpotong tanpa terasa". |
| P-04 | Pendapatan tidak tetap membuat budget bulanan sulit dijadikan acuan. | P2 Dimas. |
| P-05 | Aplikasi keuangan terasa rumit & istilah teknis membingungkan pengguna baru. | P3 Sari. |
| P-06 | Pengguna ragu menyerahkan data keuangan ke layanan yang menyimpan data di server pihak ketiga. | Konteks: kendala privasi data. |

### 1.3 Tujuan (sasaran produk)

| ID | Tujuan | Terkait |
| --- | --- | --- |
| G-01 | Pengguna bisa mencatat 1 pengeluaran dalam ≤ 3 ketukan dari halaman mana pun. | P-02 |
| G-02 | Dashboard menampilkan sisa uang bulan berjalan dalam < 2 detik (p75) setelah data tersedia. | P-01 |
| G-03 | Semua tagihan langganan dalam 7 hari ke depan terlihat di aplikasi pada hari yang sama trigger dibuat. | P-03 |
| G-04 | Pengguna baru bisa menyelesaikan pencatatan transaksi pertama tanpa bantuan. | P-05 |
| G-05 | Tidak ada data keuangan yang disimpan di server BudgetKu. | P-06 |

### 1.4 Metrik keberhasilan (terukur, diukur per bulan)

| ID | Metrik | Rumus | Baseline (rilis MVP) | Target MVP | Target v1.1 |
| --- | --- | --- | --- | --- | --- |
| M-01 | Waktu input transaksi (median ketukan) | jumlah ketukan dari buka aplikasi sampai toast "Transaksi tersimpan" | TBD-ukur | ≤ 3 ketukan p50, ≤ 4 p90 | ≤ 3 p90 |
| M-02 | Waktu muat dashboard | p75 `performance` dari navigasi `/` sampai kartu "Sisa uang bulan ini" berisi angka | TBD-ukur | < 2.000 ms p75 di 4G turbo | < 1.500 ms |
| M-03 | % tagihan yang dikirim pengingat tepat waktu | (jumlah event Calendar terkirim reminder pada jadwal) ÷ (jumlah langganan aktif ber-pengingat) | TBD-ukur | ≥ 98% | ≥ 99% |
| M-04 | % langganan aktif yang punya pengingat Calendar | langganan `status_pengingat=aktif` ÷ langganan aktif | TBD-ukur | ≥ 80% | ≥ 90% |
| M-05 | Tingkat penyelesaian transaksi pertama | pengguna baru yang menyimpan ≥ 1 transaksi dalam 24 jam ÷ pengguna baru login | TBD-ukur | ≥ 60% | ≥ 75% |
| M-06 | Tingkat penyelesaian onboarding | pengguna yang menutup onboarding (langkah 3) ÷ pengguna baru | TBD-ukur | ≥ 50% | ≥ 70% |
| M-07 | Waktu setup akun | p75 waktu dari klik "Izinkan & Buat Spreadsheet" sampai `/` siap | TBD-ukur | < 10.000 ms | < 7.000 ms |
| M-08 | Tingkat galat tulis | (jumlah respons 5xx pada endpoint tulis) ÷ (jumlah request tulis) | TBD-ukur | < 1% | < 0,5% |
| M-09 | Tingkat galat 429 Sheets (rate limit) | request yang menerima 429 ÷ request Sheets | TBD-ukur | < 2% | < 1% |

Aturan: M-01..M-09 diukur lewat logging minimal (ID pengguna ter-hash, nama endpoint, durasi, status). Tidak ada konten keuangan yang masuk log.

---

## 2. Target Pengguna dan Skenario

Persona rinci ada di IA §1 (P1 Rani, P2 Dimas, P3 Sari). Bagian ini menambah pemetaan persona ke prioritas fitur dan skenario uji.

### 2.1 Segmen

| ID | Segmen | Persona IA | Perangkat utama | Fitur paling kritis |
| --- | --- | --- | --- | --- |
| U-01 | Karyawan bergaji tetap dengan multi akun | P1 | Mobile, satu tangan | Transaksi cepat, Ringkasan, Langganan |
| U-02 | Freelance pendapatan tidak tetap | P2 | Mobile + desktop | Analisis, Pemasukan, Wishlist |
| U-03 | Pengguna baru, tanpa pengalaman aplikasi keuangan | P3 | Mobile | Onboarding, empty state, form sederhana |

ASUMSI A-37: segmen U-01 adalah prioritas pertama untuk setiap keputusan desain/alokasi kerja; U-02 kedua; U-03 ketiga (dilayani lewat kejelasan, bukan fitur tambahan).

### 2.2 Skenario utama

| ID | Skenario | Persona | Alur IA | Kondisi sukses |
| --- | --- | --- | --- | --- |
| SC-01 | Mencatat pengeluaran di kasir | U-01 | FL-02 | Tersimpan ≤ 3 ketukan; total harian berubah. |
| SC-02 | Cek sisa uang sebelum belanja | U-01 | §4.3 | Angka "Sisa uang bulan ini" tampil < 2 detik. |
| SC-03 | Melihat kategori yang sudah bocor | U-01 | §4.7, §4.14 | Bilah progres merah/kuning tampil; peringkat kategori tampil. |
| SC-04 | Menambah langganan + pengingat | U-01 | FL-03 | Baris tersimpan + event Calendar ber-RRULE + 2 reminder. |
| SC-05 | Menandai tagihan bulan ini lunas | U-01 | FL-05 | Status lunas tersimpan; tanggal tagihan maju 1 siklus. |
| SC-06 | Menetapkan budget September | U-01 | FL-04 | Baris `Budget` tersimpan (upsert); sisa budget berubah. |
| SC-07 | Rekap akhir bulan untuk klien | U-02 | §4.14, §4.15 | Perbandingan bulan ini vs bulan lalu tampil; batang 6 bulan tampil. |
| SC-08 | Menyisihkan dana ke Wishlist | U-02 | FL-06 | `terkumpul` bertambah; riwayat sisihan bertambah. |
| SC-09 | Pencatatan transaksi pertama tanpa bantuan | U-03 | FL-01 → FL-02 | Transaksi tersimpan tanpa bantuan eksternal. |
| SC-10 | Mengubah budget yang ternyata terlalu kecil | U-01 | FL-04 | Batas tetap dapat disimpan (A-31); baris peringatan tampil. |

### 2.3 Yang tidak dilayani

Pengguna yang butuh: sinkronisasi rekening bank otomatis (open banking), pencatatan bersama pasangan/keluarga, laporan pajak, pemakaian offline penuh. Semua di luar ruang lingkup (§3.2).

---

## 3. Ruang Lingkup & Rilis Bertahap

### 3.1 In-scope MVP

| Kelompok | Item | FR terkait | Halaman IA |
| --- | --- | --- | --- |
| Auth & data | Login Google OAuth, pembuatan spreadsheet otomatis, penutupan sesi | FR-01..FR-05 | 1.1, 1.2, 1.3, 9.3 |
| Transaksi | Pengeluaran, pemasukan, transfer, rincian/ubah/hapus | FR-06..FR-14 | 3.1, 3.2, 3.3 |
| Kategori | CRUD kategori pengeluaran & pemasukan, arsip | FR-15..FR-18 | 9.2 |
| Akun (dompet) | CRUD akun, akun default, arsip | FR-19..FR-23 | 9.1 |
| Budget | Budget bulanan per kategori, salin bulan lalu, kalender budget | FR-24..FR-30 | 4.1, 4.2 |
| Langganan | CRUD langganan, tandai lunas, sinkron Calendar | FR-31..FR-39 | 5.1, 5.2 |
| Wishlist | CRUD wishlist, sisihkan dana, status tercapai | FR-40..FR-45 | 6.1, 6.2, 6.3 |
| Analisis | Donat per kategori, batang 6 bulan, perbandingan bulan | FR-46..FR-49 | 7.1 |
| Pemasukan | Total, daftar, rata-rata, perbandingan | FR-50..FR-52 | 8.1 |
| Ringkasan | Kartu sisa uang, sisa budget, 5 transaksi terakhir, banner tagihan | FR-53..FR-58 | 2.1 |
| Data & koneksi | Status spreadsheet/Calendar, hubungkan ulang, buka Sheets | FR-59..FR-62 | 9.3 |
| Onboarding | Onboarding 3 langkah, seed akun & kategori | FR-63..FR-65 | 1.2, 2.1 |

### 3.2 Out-of-scope (semua rilis MVP)

Lampiran struk, impor CSV, multi mata uang, berbagi budget dengan pasangan, email ringkasan, Web Push, mode gelap (A-10; TBD Q-08 IA), pemilih bahasa (A-09), halaman profil publik, laporan pajak, integrasi bank terbuka. Tidak ada route, menu, atau empty state untuk item ini (IA §0.2).

### 3.3 Rilis bertahap

| Rilis | Isi | Alasan urutan | FR |
| --- | --- | --- | --- |
| **MVP (R1)** | FR-01..FR-65 kecuali yang ditandai v1.1/v2 | Menutup P-01..P-06 minimum | §4 |
| **v1.1 (R2)** | Impor CSV, mode gelap, ekspor/unduh salinan, rollover budget eksplisit (§6.1 BR-05), pencarian lintas bulan, email ringkasan via Apps Script | Menutup kebutuhan lanjutan U-02 | FR-66..FR-72 |
| **v2 (R3)** | Berbagi budget dengan pasangan, multi mata uang, lampiran struk, Web Push, widget PWA | Fitur kompleks; menuntut revisi model relasi (IA §6) | FR-73..FR-78 |

ASUMSI A-38: v1.1 dan v2 tidak dikerjakan paralel; v2 menunggu jawaban Q-04 IA (versioning skema sheet).

---

## 4. Persyaratan Fungsional (FR)

Format tiap item: user story · MoSCoW · minimal 1 kriteria penerimaan Given/When/Then · aturan edge case. Rujukan halaman memakai penomoran IA §2.2.

### 4.1 Autentikasi & penyiapan data

**FR-01 — Login Google**
Story: Sebagai pengguna baru, saya ingin masuk dengan akun Google agar tidak perlu membuat sandi. · **Must** · Halaman: 1.1, 1.2
- Given saya belum punya sesi, When saya membuka `/` atau halaman pengguna, Then saya dialihkan ke `/masuk` dan hanya melihat tombol **Masuk dengan Google**.
- Given saya sudah punya sesi valid, When saya membuka `/masuk`, Then saya dialihkan ke `/`.
- Edge: OAuth dibatalkan → kembali ke `/masuk` + bar "Masuk dibatalkan."; tidak ada data yang berubah.
- Edge: izin Drive ditolak → `/masuk/galat` dengan **Coba lagi**; tidak ada spreadsheet dibuat.
- Edge: sesi ada tetapi rujukan spreadsheet tidak ada → setelah OAuth, arahkan ke `/masuk/izin`, bukan dashboard.

**FR-02 — Pembuatan spreadsheet otomatis**
Story: Sebagai pengguna baru, saya ingin data saya otomatis tersimpan di Drive saya agar tidak perlu menyiapkan apa pun. · **Must** · Halaman: 1.2
- Given saya menyetujui izin Drive dan belum punya rujukan spreadsheet, When saya menekan **Izinkan & Buat Spreadsheet**, Then sistem membuat 1 spreadsheet `BudgetKu — Data Saya` dengan sheet `Akun, Kategori, Transaksi, Budget, Langganan, Wishlist, Pengingat, Ringkasan`.
- Given pembuatan gagal, When terjadi galat, Then tidak ada rujukan tersimpan dan saya tetap di `/masuk/izin` dengan **Coba lagi**.
- Edge: sheet `Transaksi` atau `Akun` gagal dibuat → jangan arahkan ke `/`; tampilkan "Penyiapan data belum selesai." + **Coba lagi** (IA FL-01 langkah 8a).
- Edge: proses ulang setelah gagal sebagian → pakai spreadsheet yang sama, jangan buat file kedua (idempoten per akun Google).

**FR-03 — Reuse spreadsheet pada login ulang**
Story: Sebagai pengguna lama, saya ingin login lagi dan menemukan data saya utuh. · **Must** · Halaman: 1.1
- Given rujukan spreadsheet ada dan file masih dapat diakses, When saya login, Then saya langsung ke `/` tanpa membuat spreadsheet baru.
- Edge: file dipindah/dihapus → arahkan ke `/pengaturan/data` dengan status "Spreadsheet tidak ditemukan" + **Hubungkan ulang** / **Buat spreadsheet baru**; tidak menghapus apa pun.

**FR-04 — Keluar sesi**
Story: Sebagai pengguna, saya ingin keluar dari sesi agar orang lain di perangkat ini tidak melihat data saya. · **Should** · Halaman: 9.3
- Given saya login, When saya menekan **Keluar**, Then sesi berakhir, cookie dihapus, dan saya diarahkan ke `/masuk`.
- Edge: keluar tidak menghapus spreadsheet dan tidak mencabut izin Google (A-26). Buka halaman terproteksi setelah keluar → dialihkan ke `/masuk`.

**FR-05 — Perbaikan izin (re-auth)**
Story: Sebagai pengguna dengan izin dicabut, saya ingin memberi izin lagi tanpa kehilangan data. · **Must** · Halaman: semua (state global IA §4.0), 9.3
- Given izin Drive/Calendar dicabut, When saya melakukan aksi tulis atau membuka halaman data, Then muncul bar "Izin Google Drive dibutuhkan." + aksi menuju `/masuk/izin`, dan aksi tulis dinonaktifkan.
- Edge: izin Calendar ditolak tetapi Drive disetujui → aplikasi tetap dapat dipakai; banner "Pengingat langganan nonaktif." + tautan `/pengaturan/data`.
- Edge: sesi kedaluwarsa (401) → data yang sudah tampil tetap terbaca; aksi tulis nonaktif sampai login ulang.

### 4.2 Kategori

**FR-15 — Daftar kategori**
Story: Sebagai pengguna, saya ingin melihat semua kategori agar memahami klasifikasi pencatatan. · **Must** · Halaman: 9.2
- Given saya punya kategori tersimpan, When saya membuka `/pengaturan/kategori`, Then tampil dua bagian (Pengeluaran, Pemasukan) berisi nama, keping warna, dan jumlah transaksi terkait.
- Edge: kategori terarsip tidak tampil di daftar utama; sediakan penanda/filter "Diarsipkan".
- Edge: belum ada kategori → empty state "Belum ada kategori…" + **Tambah kategori** (IA §4.17).

**FR-16 — Tambah/ubah kategori**
Story: Sebagai pengguna, saya ingin membuat kategori sendiri agar pencatatan sesuai kebiasaan saya. · **Must** · Halaman: 9.2, 3.2
- Given saya menekan **Tambah kategori** dan mengisi nama + jenis + warna, When saya menekan **Simpan**, Then baris baru ter-append ke sheet `Kategori` dengan `arsip=false` dan tampil di daftar.
- Given saya menekan **Ubah nama**, When nama baru unik dalam jenis yang sama, Then nama baris diperbarui di sheet.
- Edge: nama duplikat dalam jenis yang sama → "Kategori ini sudah ada."; simpan diblokir.
- Edge: nama sama dengan jenis berbeda → diizinkan (Pengeluaran "Hadiah" ≠ Pemasukan "Hadiah").
- Edge: nama kosong/hanya spasi → "Beri nama kategori."; panjang 1–40 karakter setelah trim.
- Edge: warna di luar palet tetap → ditolak validasi klien sebelum panggilan API.

**FR-17 — Arsip kategori**
Story: Sebagai pengguna, saya ingin menyembunyikan kategori yang tak lagi dipakai tanpa merusak riwayat. · **Must** · Halaman: 9.2
- Given kategori sudah dipakai transaksi, When saya menekan **Arsipkan**, Then `arsip=true` disimpan; kategori tidak lagi muncul di pemilih keping (3.2) sementara transaksi lama tetap utuh.
- Edge: aksi hapus permanen tidak tersedia untuk kategori yang pernah dipakai (A-25).
- Edge: kategori terarsip yang masih dipakai → di Analisis diberi label "Kategori dihapus" dan tetap dihitung (A-23, IA §4.14).
- Edge: mengarsipkan kategori yang punya baris `Budget` bulan berjalan → baris budget tetap tersimpan; kategori tampil di `/budget` dengan penanda "Diarsipkan".

**FR-18 — Kategori bawaan saat onboarding**
Story: Sebagai pengguna baru, saya ingin kategori bawaan agar bisa langsung mencatat. · **Must** · Halaman: 1.2
- Given onboarding selesai, When spreadsheet dibuat, Then sheet `Kategori` berisi minimal: Pengeluaran = Makan, Transportasi, Tagihan, Belanja, Langganan; Pemasukan = Gaji (A-27, A-33).
- Edge: pengguna mengarsipkan semua kategori bawaan → diperbolehkan; empty state kategori tetap tampil.
- Edge: seed gagal sebagian → tandai "Penyiapan data belum selesai."; jangan arahkan ke `/` (konsisten FR-02).

### 4.3 Akun (dompet)

**FR-19 — Daftar akun + saldo**
Story: Sebagai pengguna, saya ingin melihat semua akun dan saldonya agar tahu posisi uang. · **Must** · Halaman: 9.1
- Given saya punya akun, When saya membuka `/pengaturan/akun`, Then tampil nama, jenis (Tunai/Bank/E-wallet), saldo terhitung, dan penanda akun default.
- Edge: saldo dihitung dari transaksi (A-03), bukan angka yang dapat diedit langsung; tidak ada field saldo di form.
- Edge: belum ada akun → empty state "Belum ada akun." + **Tambah akun** (IA §4.16).

**FR-20 — Tambah/ubah akun**
Story: Sebagai pengguna, saya ingin membuat akun sesuai rekening yang saya pakai. · **Must** · Halaman: 9.1, 3.2
- Given saya mengisi nama + jenis lalu menekan **Simpan**, When nama unik, Then baris baru ter-append ke sheet `Akun` dan muncul di pemilih akun pada sheet transaksi.
- Edge: nama duplikat → "Nama akun sudah dipakai."; simpan diblokir.
- Edge: mengubah jenis akun yang sudah punya transaksi → diizinkan; saldo tidak berubah.
- Edge: nama kosong → "Beri nama akun."; panjang 1–40 karakter setelah trim.

**FR-21 — Akun default**
Story: Sebagai pengguna, saya ingin akun default terisi otomatis agar input lebih cepat. · **Should** · Halaman: 9.1
- Given ada akun default, When sheet Tambah Transaksi dibuka, Then akun = akun terakhir dipakai; bila belum ada riwayat, akun = akun default (A-15).
- Edge: akun default diarsipkan → `default=false` otomatis dan akun aktif pertama menjadi default baru.
- Edge: hanya boleh 1 akun default; menetapkan default baru menurunkan penanda default lama.

**FR-22 — Arsip akun**
Story: Sebagai pengguna, saya ingin mengarsipkan akun yang sudah tidak dipakai tanpa menghapus riwayat. · **Must** · Halaman: 9.1
- Given akun punya transaksi, When saya menekan **Arsipkan**, Then `arsip=true` disimpan; akun tidak tampil di pemilih akun baru.
- Edge: akun tidak dapat dihapus permanen bila punya transaksi (A-25).
- Edge: akun terarsip tetap muncul di rincian transaksi lama dan di filter transaksi dengan penanda "Diarsipkan".

**FR-23 — Akun darurat pada sheet transaksi**
Story: Sebagai pengguna baru tanpa akun, saya ingin tetap bisa mencatat agar tidak buntu. · **Should** · Halaman: 3.2
- Given belum ada akun sama sekali, When sheet Tambah Transaksi dibuka, Then tombol **Buat akun "Tunai"** tersedia dan langsung menyimpan akun lalu memilihnya (A-17, IA §4.5).
- Edge: pembuatan akun cepat gagal → toast "Gagal menyimpan. Coba lagi."; nominal & kategori yang sudah diisi tidak hilang.

### 4.4 Transaksi

**FR-06 — Tambah transaksi ≤ 3 ketukan**
Story: Sebagai pengguna di kasir, saya ingin mencatat pengeluaran dalam ≤ 3 ketukan agar tidak memperlambat antrean. · **Must** · Halaman: 3.2 (sheet, FL-02)
- Given saya di halaman mana pun, When saya menekan **+**, Then sheet Tambah Transaksi terbuka dengan jenis Pengeluaran, tanggal hari ini, akun terakhir dipakai, dan fokus pada papan angka (A-15).
- Given sheet terbuka, When saya menekan chip nominal lalu **Simpan**, Then total ketukan dari halaman asal = 3 dan baris ter-append ke sheet `Transaksi`.
- Given append berhasil, When respons diterima, Then sheet tertutup, toast "Transaksi tersimpan.", dan angka total harian/sisa uang/progres budget diperbarui.
- Edge: nominal 0/kosong → "Isi nominal lebih dari 0."; sheet tetap terbuka.
- Edge: append gagal (jaringan/kuota) → toast "Gagal menyimpan. Coba lagi."; seluruh isian dipertahankan.
- Edge: kategori tidak dipilih → disimpan sebagai **Tanpa kategori** (A-28); tidak mengurangi budget kategori mana pun, tetapi tetap mengurangi sisa uang.
- Edge: FAB tidak ditampilkan di `/transaksi/baru`, `/masuk*`, dan saat sheet sudah terbuka (IA §3.3).

**FR-07 — Nominal integer**
Story: Sebagai pengguna, saya ingin mengetik nominal tanpa desimal agar cepat. · **Must** · Halaman: 3.2, 4.1, 5.2, 6.2, 6.3
- Given saya mengetik nominal, When saya mengetik karakter selain digit, Then karakter tersebut diabaikan (tidak ada `.`/`,` pada input).
- Given nominal tersimpan, When ditampilkan, Then format `Rp1.250.000` (titik ribuan, tanpa desimal) (A-08).
- Edge: nominal melebihi 999.999.999.999 → "Nominal terlalu besar."; simpan diblokir.
- Edge: pengguna menempel teks "Rp 25.000,00" → digit diekstrak menjadi 25000 (pembersihan otomatis), ditampilkan `Rp25.000`.

**FR-08 — Jenis Pengeluaran/Pemasukan/Transfer**
Story: Sebagai pengguna, saya ingin memilih jenis transaksi agar pencatatan sesuai kenyataan. · **Must** · Halaman: 3.2
- Given sheet terbuka, When saya memilih **Transfer**, Then muncul pemilih akun asal dan akun tujuan, dan pemilih kategori disembunyikan.
- Given saya memilih **Transfer** dengan akun asal = akun tujuan, When saya menekan **Simpan**, Then "Akun asal dan tujuan harus berbeda."; simpan diblokir.
- Edge: jenis Pemasukan → daftar keping berisi kategori pemasukan saja.
- Edge: mengubah jenis Pengeluaran→Pemasukan setelah kategori dipilih → pilihan kategori direset karena beda jenis.

**FR-09 — Daftar & filter transaksi**
Story: Sebagai pengguna, saya ingin menelusuri transaksi agar bisa memeriksa catatan lama. · **Must** · Halaman: 3.1
- Given ada transaksi, When saya membuka `/transaksi`, Then baris dikelompokkan per tanggal dengan subtotal harian, dan total masuk/keluar periode tampil di atas.
- Given saya memilih filter (jenis/bulan/akun/kategori/pencarian catatan), When filter diterapkan, Then daftar hanya menampilkan baris yang cocok dan total ikut berubah.
- Given filter tidak menghasilkan baris, When daftar kosong, Then tampil "Tidak ada transaksi dengan filter ini." + **Hapus filter**.
- Edge: pagination 50 baris + **Muat lebih banyak** (A-16); tiap ketukan menambah 50 baris.
- Edge: transfer tampil satu baris bertanda ⇄ (akun asal → tujuan), bukan dua baris (IA §6).
- Edge: transaksi **Tanpa kategori** tampil dengan label "Tanpa kategori", bukan baris kosong.

**FR-10 — Rincian transaksi**
Story: Sebagai pengguna, saya ingin melihat rincian satu transaksi agar yakin catatannya benar. · **Must** · Halaman: 3.3
- Given saya mengetuk satu baris, When halaman rincian terbuka, Then tampil nominal, jenis, kategori, akun, tanggal, catatan, dan waktu pencatatan.
- Edge: ID tidak ditemukan (sudah dihapus di Sheets) → "Transaksi ini tidak ditemukan." + **Kembali ke daftar** (IA §4.6).
- Edge: transfer → tampil "akun asal → akun tujuan" dan tidak menampilkan kategori.

**FR-11 — Ubah transaksi**
Story: Sebagai pengguna, saya ingin memperbaiki salah ketik nominal atau kategori. · **Must** · Halaman: 3.3
- Given halaman rincian terbuka, When saya menekan **Ubah**, mengubah nilai, dan menekan **Simpan perubahan**, Then baris di sheet diperbarui pada baris yang sama (bukan baris baru) dan ringkasan/budget dihitung ulang.
- Edge: mengubah jenis Pengeluaran→Transfer menghapus `id_kategori` pada baris tersebut.
- Edge: gagal simpan → isian dipertahankan, tombol aktif kembali, toast gagal.
- Edge: mengubah tanggal lintas bulan → baris berpindah dari perhitungan bulan lama ke bulan baru; ringkasan kedua bulan dihitung ulang.

**FR-12 — Hapus transaksi**
Story: Sebagai pengguna, saya ingin menghapus catatan yang salah agar tidak mengacaukan analisis. · **Must** · Halaman: 3.3
- Given halaman rincian terbuka, When saya menekan **Hapus transaksi** dan menyetujui konfirmasi dua langkah, Then baris dihapus dari sheet dan saya kembali ke `/transaksi` dengan toast "Transaksi dihapus."
- Edge: konfirmasi batal → tidak ada perubahan.
- Edge: gagal hapus → baris tetap ada + toast "Gagal menghapus. Coba lagi."
- Edge: menghapus transaksi hasil pelunasan langganan (punya `id_langganan`) → status **Lunas** langganan tidak dibatalkan; tampilkan catatan "Transaksi pelunasan dihapus." (Q-PRD-05).

**FR-13 — Simpan & tambah lagi**
Story: Sebagai pengguna desktop, saya ingin memasukkan beberapa transaksi berturut-turut. · **Could** · Halaman: 3.2
- Given saya di desktop, When saya menekan **Simpan & tambah lagi**, Then baris tersimpan dan form direset ke default (Pengeluaran, hari ini, akun terakhir) dengan sheet tetap terbuka.
- Edge: pintasan `Ctrl+Enter` = aksi simpan yang sama.
- Edge: transaksi pertama gagal → form tidak direset; isian pertama dipertahankan.

**FR-14 — Pelacak pemasukan**
Story: Sebagai pengguna berpendapatan tidak tetap, saya ingin memantau total pemasukan bulan ini agar bisa menyesuaikan belanja. · **Must** · Halaman: 8.1
- Given ada pemasukan bulan berjalan, When saya membuka `/pemasukan`, Then tampil total pemasukan, jumlah pemasukan, rata-rata per pemasukan, daftar pemasukan, dan perbandingan dengan bulan lalu.
- Given belum ada pemasukan bulan ini, When halaman dibuka, Then "Belum ada pemasukan tercatat bulan ini." + **Catat pemasukan** (sheet terbuka dengan jenis Pemasukan).
- Edge: bulan lalu tanpa pemasukan → perbandingan tampil "—" (bukan ∞/NaN).
- Edge: pemasukan bernominal 0 tidak dapat disimpan (konsisten FR-06).

### 4.5 Budget

**FR-24 — Lihat budget bulanan**
Story: Sebagai pengguna, saya ingin melihat batas dan pemakaian per kategori agar tahu yang bocor. · **Must** · Halaman: 4.1
- Given ada kategori pengeluaran, When saya membuka `/budget`, Then tampil header (Total budget, Terpakai, Sisa budget) dan baris per kategori dengan batas, terpakai, sisa, serta bilah progres (hijau < 75%, kuning 75–99%, merah ≥ 100%).
- Edge: kategori tanpa baris `Budget` → baris bertanda "Belum diatur" dengan tombol **Atur budget**.
- Edge: kategori terarsip dengan baris budget → tetap tampil dengan penanda "Diarsipkan" (FR-17).
- Edge: pengeluaran **Tanpa kategori** tidak mengurangi budget kategori mana pun, tetapi muncul sebagai baris informasi di bawah daftar (A-28).

**FR-25 — Tetapkan batas kategori (upsert)**
Story: Sebagai pengguna, saya ingin menetapkan batas per kategori agar belanja terarah. · **Must** · Halaman: 4.1 (FL-04)
- Given saya mengetuk **Atur budget**/**Ubah** dan mengisi nominal integer lalu menekan **Simpan**, When baris `bulan+id_kategori` belum ada, Then baris baru dibuat; bila sudah ada, baris yang sama diperbarui (upsert, bukan append ganda).
- Given simpan berhasil, When dialog tertutup, Then bilah progres + header Total/Sisa dihitung ulang dan toast "Budget tersimpan."
- Edge: nominal 0/kosong → "Isi batas lebih dari 0."; dialog tetap terbuka.
- Edge: batas < pengeluaran berjalan → tetap disimpan + baris peringatan "Batas di bawah pengeluaran saat ini." (A-31, SC-10).
- Edge: gagal simpan → dialog tetap terbuka, isian utuh, toast "Gagal menyimpan batas. Coba lagi."

**FR-26 — Hapus batas kategori**
Story: Sebagai pengguna, saya ingin membatalkan batas kategori yang tidak relevan. · **Should** · Halaman: 4.1
- Given kategori punya batas bulan ini, When saya menekan **Hapus batas** dan menyetujui, Then baris `Budget` bulan+kategori dihapus dan baris kembali bertanda "Belum diatur".
- Edge: pengeluaran kategori tersebut tetap dihitung di **Sisa uang bulan ini**, tidak lagi di **Sisa budget**.
- Edge: gagal hapus → batas lama tetap tampil + toast gagal.

**FR-27 — Salin budget bulan lalu**
Story: Sebagai pengguna, saya ingin menyalin batas bulan lalu agar tidak menyetel ulang. · **Should** · Halaman: 4.1 (FL-04 langkah 8)
- Given bulan aktif belum punya baris `Budget` dan bulan sebelumnya punya, When saya menekan **Salin dari bulan lalu**, Then pratinjau daftar batas tampil dan **Salin budget** menulis semua baris sekaligus (batch).
- Edge: bulan sebelumnya tanpa budget → tombol tidak ditampilkan (bukan nonaktif) (IA FL-04 8a).
- Edge: sebagian baris gagal → baris berhasil tetap tersimpan + toast "Sebagian budget gagal disalin." + **Coba lagi** untuk sisanya (upsert idempoten).
- Edge: kategori sumber sudah terarsip → tetap disalin dengan penanda "Diarsipkan".

**FR-28 — Pemilih bulan pada budget**
Story: Sebagai pengguna, saya ingin melihat/menyiapkan budget bulan lain. · **Should** · Halaman: 4.1, 4.2
- Given saya menekan ‹ atau ›, When bulan berubah, Then header dan daftar kategori dimuat untuk bulan itu; bulan berjalan ditandai "Bulan ini".
- Edge: membuat batas untuk bulan mendatang → diizinkan.
- Edge: bulan lampau → batas dapat diubah, tetapi tampil catatan "Bulan yang sudah lewat" (agar pengguna tahu itu bukan anggaran aktif).

**FR-29 — Kalender budget**
Story: Sebagai pengguna, saya ingin melihat sebaran pengeluaran harian dan sisa budget per hari agar tahu ritme belanja. · **Should** · Halaman: 4.2
- Given bulan aktif punya batas dan transaksi, When saya membuka `/budget/kalender`, Then grid Senin–Minggu menampilkan pengeluaran harian dan sisa budget harian (sisa budget bulan ÷ sisa hari, A-18) dengan warna status.
- Given saya mengetuk satu tanggal, When navigasi selesai, Then `/transaksi` terbuka terfilter tanggal tersebut.
- Edge: hari tanpa transaksi → angka 0 ditampilkan sebagai "—" pada nilai pengeluaran, bukan menyembunyikan sel.
- Edge: bulan tanpa transaksi → grid tetap tampil + teks "Belum ada pengeluaran bulan ini." (IA §4.8).
- Edge: hari terakhir bulan → pembagi sisa hari minimal 1 (tidak membagi nol).
- Edge: bulan tanpa budget sama sekali → hanya pengeluaran harian yang tampil; sisa budget harian kosong.

**FR-30 — Ringkasan kalender**
Story: Sebagai pengguna, saya ingin tahu hari paling boros dan proyeksi akhir bulan. · **Could** · Halaman: 4.2
- Given ada pengeluaran bulan aktif, When kalender tampil, Then bagian bawah menampilkan hari dengan pengeluaran tertinggi, rata-rata harian, dan proyeksi sisa akhir bulan.
- Edge: proyeksi dihitung dari rata-rata harian s.d. hari ini × sisa hari; bila rata-rata 0 → proyeksi = sisa budget utuh.
- Edge: bila proyeksi negatif → tampil "Proyeksi melebihi budget sebesar Rp…" dengan warna merah, bukan angka negatif tanpa konteks.

### 4.6 Langganan & pengingat Calendar

**FR-31 — Daftar langganan**
Story: Sebagai pengguna, saya ingin melihat langganan aktif dan jadwal tagihannya agar tidak terlewat. · **Must** · Halaman: 5.1
- Given ada langganan, When saya membuka `/langganan`, Then tampil ringkasan (total biaya per bulan, jumlah aktif) dan dua kelompok: **Jatuh tempo** (≤ 7 hari) dan **Lainnya**.
- Given satu baris, When dirender, Then tampil nama, nominal, siklus (Bulanan/Tahunan), tanggal tagihan berikutnya, akun sumber dana, dan status pengingat.
- Edge: belum ada langganan → "Belum ada langganan…" + **Tambah langganan** (IA §4.9).
- Edge: siklus Tahunan dihitung sebagai nominal ÷ 12 pada total bulanan, dibulatkan ke integer; pembulatan ditandai pada tooltip "dibulatkan".
- Edge: langganan `status_pengingat=tidak aktif` tetap masuk perhitungan total; hanya status pengingatnya yang berbeda.

**FR-32 — Tambah langganan + pengingat**
Story: Sebagai pengguna, saya ingin menambah langganan dan otomatis mendapat pengingat agar tidak lupa membayar. · **Must** · Halaman: 5.2 (FL-03)
- Given saya mengisi nama, nominal integer, siklus, tanggal tagihan berikutnya, dan akun sumber, When saya menekan **Simpan & buat pengingat**, Then baris `Langganan` ditulis lebih dulu (status `aktif`, `id_event_calendar` kosong) (A-21).
- Given baris tersimpan, When Calendar berhasil, Then event berulang dibuat (`RRULE:FREQ=MONTHLY;BYMONTHDAY=<t>` atau `FREQ=YEARLY`), `reminders.overrides = [4320 menit, 0 menit]` (A-29), lalu `id_event_calendar` ditulis balik dan baris `Pengingat` ditambahkan.
- Given keduanya berhasil, When saya kembali ke `/langganan`, Then toast "Langganan ditambahkan. Pengingat dibuat di Google Calendar."
- Edge: validasi gagal (nama kosong, nominal 0, tanggal kosong) → pesan per-field; tidak ada panggilan API (IA FL-03 4a).
- Edge: gagal tulis Sheets → tidak ada panggilan Calendar sama sekali; isian dipertahankan.
- Edge: gagal Calendar setelah Sheets berhasil → `status_pengingat=tidak aktif` + dialog "Langganan tersimpan, tetapi pengingat gagal dibuat." + **Coba lagi** / **Lanjut tanpa pengingat**.
- Edge: pratinjau kalimat pengingat harus memakai istilah glosarium IA §7 ("Pengingat tiap tanggal 25, 3 hari sebelum dan pada hari-H.").

**FR-33 — Simpan tanpa pengingat**
Story: Sebagai pengguna, saya ingin menambah langganan tanpa memberi izin Calendar. · **Should** · Halaman: 5.2
- Given saya menekan **Simpan tanpa pengingat**, When baris tersimpan, Then `status_pengingat=tidak aktif` dan tidak ada panggilan Calendar.
- Edge: pengguna mengaktifkan pengingat belakangan dari baris langganan → event dibuat saat itu (FR-38).
- Edge: jumlah langganan tanpa pengingat tampil sebagai angka di `/pengaturan/data` (FR-60) agar pengguna sadar.

**FR-34 — Ubah langganan**
Story: Sebagai pengguna, saya ingin mengubah nominal/tanggal langganan saat harga naik. · **Must** · Halaman: 5.1
- Given saya mengetuk baris langganan dan mengubah nilai lalu menyimpan, When baris diperbarui, Then event Calendar di-`patch` (bukan dibuat baru) agar tidak ada pengingat ganda (A-30, IA FL-03 catatan).
- Edge: `patch` gagal → perubahan Sheets tetap tersimpan + `status_pengingat=tidak aktif` + aksi **Coba lagi** (idempoten).
- Edge: mengubah siklus Bulanan↔Tahunan → RRULE diganti (`FREQ=MONTHLY` ↔ `FREQ=YEARLY`); tanggal tagihan berikutnya dihitung ulang (BR-03).
- Edge: mengubah tanggal ke 29/30/31 → BR-03 dipakai; event ikut dipatch dengan `BYMONTHDAY` baru.

**FR-35 — Tandai lunas**
Story: Sebagai pengguna, saya ingin menandai tagihan bulan ini lunas agar statusnya bersih dan tanggal berikutnya maju. · **Must** · Halaman: 5.1 (FL-05)
- Given saya menekan **Tandai lunas**, When dialog konfirmasi tampil, Then ada sakelar **Catat juga sebagai pengeluaran** (default aktif) + akun sumber terisi (A-32).
- Given saya menyetujui, When Sheets berhasil, Then `terakhir_lunas = <tanggal tagihan>`, `tagihan_berikutnya = +1 siklus` (BR-03), dan baris pindah ke **Lainnya** dengan label "Lunas · berikutnya <tanggal>".
- Given sakelar aktif, When Sheets berhasil, Then ditambahkan 1 transaksi Pengeluaran: nominal = nominal langganan, kategori = "Langganan" (A-33), akun = akun sumber, tanggal = hari ini, `id_langganan` terisi.
- Edge: dialog ditutup → tidak ada perubahan.
- Edge: gagal tulis Sheets → status baris kembali + toast "Gagal menandai lunas. Coba lagi."; tidak ada transaksi dibuat.
- Edge: transaksi gagal setelah status lunas tersimpan → status lunas **tetap**; bar "Langganan lunas, tetapi pengeluaran gagal dicatat." + **Catat manual** (sheet terisi otomatis).
- Edge: langganan tanpa `id_event_calendar` → tombol tetap tersedia; tidak ada panggilan Calendar sama sekali (A-34).
- Edge: menekan **Tandai lunas** dua kali pada siklus yang sama → diblokir; label "Sudah lunas untuk siklus ini" dan tanggal tidak maju dua kali (idempoten per siklus).

**FR-36 — Hapus/hentikan langganan**
Story: Sebagai pengguna, saya ingin berhenti berlangganan tanpa menyisakan pengingat. · **Must** · Halaman: 5.1
- Given langganan ber-`id_event_calendar`, When saya menekan **Hapus langganan** dan menyetujui, Then baris `Langganan` dihapus **dan** event Calendar dihapus, lalu baris `Pengingat` ikut dihapus.
- Edge: penghapusan event gagal (izin dicabut/jaringan) → baris tetap dihapus tetapi tampil bar "Pengingat lama masih ada di Google Calendar. Hapus manual." + tautan event.
- Edge: transaksi lama ber-`id_langganan` tidak dihapus; tetap tampil dengan nama langganan yang sudah dihapus (disimpan sebagai label teks pada baris transaksi, lihat §8 catatan FR-12).
- Edge: menghapus langganan yang belum lunas bulan ini → diizinkan, dengan peringatan "Tagihan bulan ini belum ditandai lunas."

**FR-37 — Hentikan/aktifkan pengingat**
Story: Sebagai pengguna, saya ingin mematikan pengingat sementara tanpa menghapus langganan. · **Should** · Halaman: 5.1
- Given pengingat aktif, When saya menekan **Hentikan pengingat**, Then event Calendar dihapus, `id_event_calendar` dikosongkan, `status_pengingat=tidak aktif`, dan baris `Pengingat` ditandai `tidak aktif`.
- Edge: gagal hapus event → `status_pengingat` tetap `aktif` + toast gagal (tidak boleh berbohong soal status).
- Edge: tombol menjadi **Aktifkan pengingat** setelah berhasil.

**FR-38 — Aktifkan pengingat dari baris langganan**
Story: Sebagai pengguna, saya ingin mengaktifkan pengingat yang dulu ditolak. · **Should** · Halaman: 5.1, 9.3 (FR-60)
- Given izin Calendar tersedia dan `status_pengingat=tidak aktif`, When saya menekan **Aktifkan pengingat**, Then event baru dibuat dengan RRULE & reminder sesuai FR-32 dan `id_event_calendar` disimpan.
- Edge: izin Calendar belum ada → dialog meminta izin menuju `/pengaturan/data` (FR-60); tidak ada event dibuat sebelum izin ada.
- Edge: event duplikat terdeteksi (mis. dibuat saat percobaan sebelumnya) → patch event yang ada, jangan buat kedua (A-30).

**FR-39 — Banner tagihan jatuh tempo**
Story: Sebagai pengguna, saya ingin melihat tagihan ≤ 7 hari agar tidak terlewat saat tidak membuka tab Langganan. · **Must** · Halaman: 2.1, semua halaman (banner IA §3.2)
- Given ada langganan dengan `tagihan_berikutnya − hari ini ≤ 7 hari` dan belum lunas, When halaman apa pun dimuat, Then banner tampil di atas dengan maksimal 3 baris + **Lihat semua** menuju `/langganan`.
- Edge: banner ditutup → tersembunyi sampai pergantian hari berikutnya (per hari, A-06/Q-07), tidak permanen per siklus.
- Edge: Calendar tidak dapat dijangkau → banner tetap tampil dari data `Langganan` di Sheets (cadangan in-app).
- Edge: tagihan jatuh tempo hari ini → baris ditandai "Jatuh tempo hari ini".
- Edge: tagihan sudah lewat (mis. terlewat 2 hari) → tetap tampil dengan penanda "Terlewat", tidak disembunyikan.

### 4.7 Wishlist

**FR-40 — Daftar wishlist**
Story: Sebagai pengguna, saya ingin melihat progres semua target tabungan agar tahu mana yang mendekati tercapai. · **Must** · Halaman: 6.1
- Given ada target, When saya membuka `/wishlist`, Then tampil kartu per target: nama, nominal target, terkumpul, bilah progres + persentase, sisa, tenggat, status (Berjalan/Tercapai).
- Given urutan, When daftar dirender, Then belum tercapai (tenggat terdekat dulu) di atas, lalu tercapai.
- Edge: target tanpa tenggat → diletakkan setelah yang punya tenggat di kelompok belum tercapai.
- Edge: belum ada target → "Belum ada wishlist…" + **Tambah wishlist** (IA §4.11).

**FR-41 — Tambah wishlist**
Story: Sebagai pengguna, saya ingin menetapkan target tabungan agar lebih disiplin. · **Must** · Halaman: 6.2 (FL-06)
- Given saya mengisi nama, nominal target integer, tenggat (opsional), akun sumber, When saya menekan **Simpan**, Then baris baru ter-append dengan `terkumpul=0`, `status=berjalan`, dan kartu tampil dengan progres 0% (bukan negatif).
- Given tenggat diisi, When form diisi, Then bantuan hitung "Perlu disisihkan Rp… /bulan agar tercapai tanggal …" tampil di klien dan **tidak** disimpan.
- Edge: nama kosong → "Beri nama target."; nominal 0 → "Isi nominal target lebih dari 0."; tenggat lampau → "Pilih tanggal setelah hari ini."; tidak ada panggilan API.
- Edge: belum ada akun → "Belum ada akun. Tambahkan akun dulu." + tautan `/pengaturan/akun`; simpan diblokir (sama seperti `/langganan/baru`).
- Edge: tenggat tepat hari ini → diizinkan (bukan lampau).
- Edge: gagal simpan → isian dipertahankan + toast gagal.

**FR-42 — Rincian wishlist + sisihkan dana**
Story: Sebagai pengguna, saya ingin menyisihkan dana ke target dan melihat riwayatnya. · **Must** · Halaman: 6.3
- Given halaman rincian terbuka, When saya menekan **Sisihkan dana** dan mengisi nominal + akun lalu **Simpan**, Then `terkumpul` bertambah dan satu baris riwayat sisihan (tanggal, nominal, akun) tercatat.
- Edge: sisihan melebihi target → diizinkan; progres mentok 100% dan `status` otomatis **Tercapai** tanpa galat (A-36).
- Edge: gagal simpan → dialog tetap terbuka, isian utuh.
- Edge: target tidak ditemukan (dihapus di Sheets) → "Wishlist ini tidak ditemukan." + **Kembali**.
- Edge: sisihan bernominal 0 → "Isi nominal lebih dari 0."

**FR-43 — Ubah target wishlist**
Story: Sebagai pengguna, saya ingin menaikkan nominal target saat kebutuhan berubah. · **Should** · Halaman: 6.3
- Given saya menekan **Ubah target**, When saya mengubah nama/nominal/tenggat lalu menyimpan, Then baris diperbarui dan persentase/sisa dihitung ulang.
- Edge: nominal target baru lebih kecil dari `terkumpul` → diizinkan; status menjadi **Tercapai** dan bilah tetap 100%.
- Edge: gagal simpan → isian dipertahankan.

**FR-44 — Tandai tercapai & hapus wishlist**
Story: Sebagai pengguna, saya ingin menutup target yang sudah selesai atau dibatalkan. · **Should** · Halaman: 6.3
- Given target berjalan, When saya menekan **Tandai Tercapai**, Then `status=tercapai` dan kartu pindah ke kelompok tercapai.
- Given saya menekan **Hapus wishlist** dan menyetujui, When Sheets berhasil, Then baris `Wishlist` dihapus; transaksi sisihan lama **tidak** dihapus (IA §6).
- Edge: gagal hapus → target tetap tampil + toast gagal.
- Edge: menghapus target tercapai tidak mengubah **Sisa uang bulan ini** (sisihan tetap transaksi yang sudah terhitung).

**FR-45 — Sisihan sebagai transfer**
Story: Sebagai pengguna, saya ingin dana target benar-benar terpisah agar tidak terpakai. · **Should** · Halaman: 6.3 (A-22)
- Given saya menyetujui sisihan, When tersimpan, Then sistem mencatat transfer dari akun sumber (FR-08) sehingga saldo akun sumber berkurang dan `terkumpul` bertambah.
- Edge: akun sumber diarsipkan setelah target dibuat → dialog sisihan memaksa pilih akun aktif.
- Edge: transaksi sisihan dihapus manual → `terkumpul` tidak otomatis turun pada MVP; sediakan aksi "Sinkronkan terkumpul" di v1.1 (Q-PRD-03).

### 4.8 Ringkasan

**FR-53 — Kartu sisa uang bulan ini**
Story: Sebagai pengguna, saya ingin tahu sisa uang bulan ini dalam sekali lihat. · **Must** · Halaman: 2.1
- Given data ringkasan tersedia, When `/` terbuka, Then kartu "Sisa uang bulan ini" = pemasukan bulan berjalan − pengeluaran bulan berjalan (integer; transfer tidak dihitung) dan tampil tanpa perlu scroll di viewport 360×640.
- Edge: angka tidak pernah dirender `0` sebelum data siap; tampil skeleton (IA §4.0, §4.3).
- Edge: nilai negatif → ditampilkan `−Rp…` dengan warna merah + teks "Pengeluaran melebihi pemasukan bulan ini".

**FR-54 — Kartu sisa budget**
Story: Sebagai pengguna, saya ingin tahu berapa budget yang masih tersisa. · **Must** · Halaman: 2.1
- Given ada baris `Budget` bulan aktif, When kartu dirender, Then "Sisa budget" = total batas − pengeluaran terkategori bulan berjalan.
- Edge: belum ada budget → kartu diganti empty state "Budget belum diatur." + **Atur budget**.
- Edge: sisa negatif → tampil "Melebihi budget sebesar Rp…" bukan bilangan negatif mentah.
- Edge: pengeluaran **Tanpa kategori** tidak mengurangi sisa budget tetapi mengurangi sisa uang (BR-01, BR-02).

**FR-55 — Daftar kategori dengan progres**
Story: Sebagai pengguna, saya ingin langsung melihat kategori mana yang mendekati batas. · **Should** · Halaman: 2.1
- Given ada budget kategori, When kartu kategori dirender, Then bilah progres tampil dengan warna sesuai ambang (hijau < 75%, kuning 75–99%, merah ≥ 100%).
- Edge: kategori tanpa budget → tampil "Belum diatur" tanpa bilah.
- Edge: kategori terarsip tetap tampil bila punya batas bulan aktif (FR-24).

**FR-56 — 5 transaksi terakhir**
Story: Sebagai pengguna, saya ingin memastikan catatan terakhir benar. · **Should** · Halaman: 2.1
- Given ada transaksi, When `/` dimuat, Then 5 transaksi terbaru (urut tanggal lalu waktu pencatatan) tampil dengan tanda −/+/⇄.
- Edge: tidak ada transaksi bulan ini → empty state "Belum ada catatan bulan ini…" + **Catat transaksi**.
- Edge: daftar ini boleh dimuat menyusul kartu ringkasan agar dashboard tetap < 2 detik (IA §4.3).

**FR-57 — Pemilih bulan pada ringkasan**
Story: Sebagai pengguna, saya ingin melihat ringkasan bulan lalu tanpa membuka Analisis. · **Should** · Halaman: 2.1
- Given saya menekan ‹/› pada pemilih bulan, When bulan berubah, Then kartu dan daftar memuat bulan tersebut; bulan berjalan ditandai "Bulan ini".
- Edge: navigasi ke masa depan dibatasi maksimal 1 bulan setelah bulan berjalan.
- Edge: banner tagihan hanya tampil pada bulan berjalan, tidak pada bulan lampau.

**FR-58 — Navigasi dari kartu ringkasan**
Story: Sebagai pengguna, saya ingin menelusuri angka sampai ke detail. · **Could** · Halaman: 2.1
- Given saya mengetuk kartu angka, When navigasi selesai, Then `/transaksi` terbuka dengan filter jenis yang sesuai.
- Edge: mengetuk kartu "Sisa budget" → `/budget`, bukan `/transaksi`.
- Edge: mengetuk kategori → `/budget` dengan kategori tersebut disorot.

### 4.9 Analisis

**FR-46 — Donat + peringkat kategori**
Story: Sebagai pengguna, saya ingin tahu kategori mana yang menghabiskan uang paling banyak. · **Must** · Halaman: 7.1
- Given ada pengeluaran bulan aktif, When `/analisis` terbuka, Then grafik donat pengeluaran per kategori dan daftar terurut nominal + persentase tampil; jumlah persentase = 100% ± 0,1%.
- Edge: kategori terarsip yang masih dipakai → label "Kategori dihapus" dan tetap dihitung (A-23, IA §4.14).
- Edge: kelompok **Tanpa kategori** ikut tampil (konsisten FR-09; Q-05 IA).
- Edge: satu kategori = 100% total → donat tetap satu warna penuh, tanpa galat render.
- Edge: tanpa pengeluaran → "Belum ada pengeluaran untuk dianalisis…" + **Catat transaksi**.

**FR-47 — Batang 6 bulan terakhir**
Story: Sebagai pengguna berpendapatan tidak tetap, saya ingin melihat tren pengeluaran antar-bulan. · **Should** · Halaman: 7.1
- Given ada data, When grafik batang dirender, Then 6 bulan terakhir tampil; bulan tanpa data tampil sebagai batang 0 dengan label bulan.
- Edge: kurang dari 6 bulan data → bulan tanpa data tetap tampil sebagai 0.

**FR-48 — Perbandingan dengan bulan sebelumnya**
Story: Sebagai pengguna, saya ingin tahu pengeluaran naik atau turun. · **Should** · Halaman: 7.1, 8.1
- Given ada data bulan ini dan bulan lalu, When header perbandingan dirender, Then tampil selisih nominal dan persentase dengan penanda naik/turun.
- Edge: bulan lalu 0 → persentase "—"; hanya selisih nominal yang ditampilkan.
- Edge: selisih 0 → tampil "Sama dengan bulan lalu".

**FR-49 — Rata-rata harian & kategori naik tertinggi**
Story: Sebagai pengguna, saya ingin tahu laju belanja harian dan kategori yang melonjak. · **Could** · Halaman: 7.1
- Given ada pengeluaran bulan aktif, When kartu render, Then rata-rata harian = total pengeluaran ÷ jumlah hari terlewati bulan ini (hari berjalan dihitung 1) dan kategori dengan kenaikan tertinggi vs bulan lalu ditampilkan.
- Edge: persentase kenaikan dari basis 0 → tampil "Baru bulan ini" alih-alih persentase.
- Edge: semua kategori turun → bagian diganti "Kategori turun terbanyak".

### 4.10 Pemasukan (halaman)

**FR-50 — Ringkasan pemasukan bulan berjalan**
Story: Sebagai pengguna, saya ingin tahu total dan frekuensi pemasukan bulan ini. · **Must** · Halaman: 8.1
- Given ada pemasukan, When `/pemasukan` terbuka, Then tampil total pemasukan, jumlah pemasukan, dan rata-rata per pemasukan (dibulatkan ke integer).
- Edge: total 0 → empty state, bukan kartu berisi Rp0.
- Edge: rata-rata dengan jumlah 0 tidak dihitung; kartu disembunyikan.

**FR-51 — Daftar pemasukan**
Story: Sebagai pengguna, saya ingin melihat sumber pemasukan saya. · **Must** · Halaman: 8.1
- Given ada pemasukan, When daftar dirender, Then tiap baris menampilkan tanggal, akun, kategori pemasukan, dan nominal; mengetuk baris membuka `/transaksi/[id]`.
- Edge: pemasukan **Tanpa kategori** tampil dengan label "Tanpa kategori".
- Edge: bulan mengikuti pemilih bulan yang sama dengan FR-57.

**FR-52 — Catat pemasukan dari halaman pemasukan**
Story: Sebagai pengguna, saya ingin mencatat pemasukan langsung dari halaman ini. · **Should** · Halaman: 8.1
- Given saya menekan **+ Catat pemasukan**, When sheet terbuka, Then jenis sudah terpilih **Pemasukan** dan daftar keping berisi kategori pemasukan.
- Edge: validasi nominal, penyimpanan, dan kegagalan sama seperti FR-06.
- Edge: setelah simpan, total & daftar pemasukan diperbarui tanpa muat ulang penuh.

### 4.11 Data & koneksi

**FR-59 — Status spreadsheet**
Story: Sebagai pengguna, saya ingin tahu apakah data saya masih terhubung. · **Must** · Halaman: 9.3
- Given login aktif, When `/pengaturan/data` terbuka, Then tampil nama spreadsheet, waktu modifikasi terakhir, status (Terhubung / Bermasalah), dan akun Google yang dipakai (nama + email).
- Edge: "Bermasalah" = panggilan baca Sheets gagal 401/403/404/5xx atau file tidak ditemukan (Q-11 IA).
- Edge: tombol **Buka spreadsheet di Google Sheets** membuka tab baru; bila file hilang, tombol dinonaktifkan.

**FR-60 — Status Calendar + pengingat terpasang**
Story: Sebagai pengguna, saya ingin tahu apakah pengingat langganan aktif. · **Must** · Halaman: 9.3
- Given izin Calendar ada, When halaman terbuka, Then status "Aktif" + jumlah pengingat terpasang dan jumlah langganan tanpa pengingat ditampilkan.
- Given izin Calendar tidak ada/dicabut, When halaman terbuka, Then status "Tidak aktif" + tombol **Aktifkan izin Calendar**.
- Edge: kegagalan pembuatan event terakhir ditampilkan sebagai catatan "Pengingat terakhir gagal dibuat: <tanggal>" agar status tidak menyesatkan.

**FR-61 — Hubungkan ulang spreadsheet**
Story: Sebagai pengguna yang file-nya dipindah, saya ingin menyambungkan lagi tanpa kehilangan data. · **Should** · Halaman: 9.3
- Given status "Spreadsheet tidak ditemukan", When saya menekan **Hubungkan ulang** dan memilih file, Then rujukan diperbarui dan halaman memuat data dari file itu.
- Edge: file terpilih tidak punya sheet wajib → "File ini bukan spreadsheet BudgetKu."; rujukan tidak diubah.
- Edge: **Buat spreadsheet baru** tidak menghapus file lama dan tidak memigrasi data; peringatan ditampilkan lebih dulu.

**FR-62 — Aktivasi izin Calendar dari halaman data**
Story: Sebagai pengguna, saya ingin mengaktifkan pengingat tanpa mengulang seluruh onboarding. · **Should** · Halaman: 9.3
- Given izin Calendar belum ada, When saya menekan **Aktifkan izin Calendar** dan menyetujui, Then status menjadi "Aktif" dan tawaran "Aktifkan pengingat untuk N langganan" muncul.
- Edge: izin ditolak lagi → status tetap "Tidak aktif"; tidak ada event dibuat.
- Edge: pembuatan event massal berjalan berurutan dengan progres; kegagalan satu langganan tidak membatalkan yang lain.

### 4.12 Onboarding

**FR-63 — Onboarding 3 langkah**
Story: Sebagai pengguna baru, saya ingin panduan singkat agar tahu langkah pertama. · **Must** · Halaman: 2.1 (FL-01 langkah 9)
- Given login pertama berhasil, When `/` terbuka, Then kartu onboarding tampil dengan 3 langkah: (1) Akun siap — "Tunai", (2) Catat transaksi pertama, (3) Atur budget bulan ini.
- Edge: menutup onboarding kapan saja → status "onboarding selesai" disimpan dan kartu tidak muncul lagi.
- Edge: pengguna yang sudah selesai onboarding tidak melihat kartu ini lagi pada login berikutnya (per akun Google).

**FR-64 — Langkah onboarding dapat diklik**
Story: Sebagai pengguna baru, saya ingin langsung menjalankan langkah dari kartu panduan. · **Should** · Halaman: 2.1
- Given kartu onboarding tampil, When saya mengetuk langkah 2, Then sheet Tambah Transaksi terbuka (FR-06); langkah 3 membuka `/budget`.
- Edge: langkah ditandai centang setelah aksi terkait berhasil (1 transaksi tersimpan; 1 batas budget tersimpan).
- Edge: kartu onboarding tidak menghalangi akses FAB dan tab bawah.

**FR-65 — Penutupan onboarding otomatis**
Story: Sebagai pengguna, saya ingin panduan hilang setelah selesai agar tidak mengganggu. · **Should** · Halaman: 2.1
- Given ketiga langkah selesai, When `/` dimuat ulang, Then kartu onboarding tidak tampil lagi tanpa aksi pengguna.
- Edge: pengguna menghapus transaksi satu-satunya → onboarding **tidak** muncul kembali (status selesai menang).
- Edge: status onboarding disimpan di spreadsheet (bukan localStorage) agar konsisten antar-perangkat.

### 4.13 Persyaratan rilis lanjutan

| FR | Fitur | Rilis | Ringkas |
| --- | --- | --- | --- |
| FR-66 | Impor CSV | v1.1 | Unggah CSV → pratinjau pemetaan kolom → validasi per baris → impor batch; baris galat tidak menghentikan baris lain; laporan hasil berisi alasan galat. |
| FR-67 | Mode gelap | v1.1 | Mengikuti `prefers-color-scheme` + sakelar eksplisit di `/pengaturan/data`; kontras teks tetap ≥ 4,5:1. |
| FR-68 | Unduh salinan data | v1.1 | Tombol "Unduh XLSX" memakai Drive export; tidak ada berkas yang disimpan di server BudgetKu. |
| FR-69 | Rollover budget eksplisit | v1.1 | Sakelar per bulan: sisa batas bulan lalu ditambahkan ke batas bulan ini (BR-05), ditandai di UI. |
| FR-70 | Pencarian lintas bulan | v1.1 | Pencarian catatan di luar bulan aktif; indeks disiapkan Apps Script agar tetap < 2 detik. |
| FR-71 | Email ringkasan bulanan | v1.1 | Dikirim Apps Script tanggal 1: total masuk/keluar, kategori teratas, tagihan 7 hari ke depan; dapat dimatikan. |
| FR-72 | Rekonsiliasi wishlist | v1.1 | Aksi "Sinkronkan terkumpul" menghitung ulang `terkumpul` dari transaksi sisihan (menutup edge FR-45). |
| FR-73 | Berbagi budget pasangan | v2 | Dua pengguna mengakses satu spreadsheet; revisi model relasi + aturan konflik tulis (§9.4). |
| FR-74 | Multi mata uang | v2 | Kolom mata uang per akun + kurs manual harian; total per mata uang dipisah. |
| FR-75 | Lampiran struk | v2 | Unggah 1 gambar per transaksi ke folder Drive khusus; tautan disimpan di baris transaksi. |
| FR-76 | Web Push | v2 | Pengingat tagihan via push browser sebagai pelengkap Calendar; butuh service worker. |
| FR-77 | Widget PWA | v2 | Manifest + service worker; pintasan "Tambah transaksi" dan sisa uang di layar utama. |
| FR-78 | Anggaran bersama kategori | v2 | Kategori ditandai "bersama" untuk kebutuhan berbagi budget (bergantung FR-73). |

---

## 5. Persyaratan Non-Fungsional (NFR)

Setiap NFR punya ambang ukur dan cara uji. Tidak ada kata "cepat"/"mudah" tanpa angka.

### 5.1 Performa

| ID | Persyaratan | Ambang ukur | Cara uji | Prioritas |
| --- | --- | --- | --- | --- |
| NFR-01 | Waktu muat dashboard | p75 < 2.000 ms pada profil "4G turbo" (Chrome DevTools), p95 < 3.000 ms | Lighthouse + WebPageTest pada `/` dengan 1.000 baris `Transaksi` di spreadsheet uji | Must |
| NFR-02 | Waktu simpan transaksi | p75 < 1.200 ms dari ketukan **Simpan** sampai toast muncul | 100 penyimpanan berturut pada spreadsheet uji | Must |
| NFR-03 | Waktu muat daftar transaksi | p75 < 1.500 ms untuk 50 baris pertama | Uji daftar terfilter bulan berjalan | Must |
| NFR-04 | Ukuran bundle JS awal | ≤ 250 KB gzip untuk route `/` | Analisis bundle di CI | Should |
| NFR-05 | Waktu interaksi | INP p75 < 200 ms pada halaman utama | Web Vitals (RUM) | Should |
| NFR-06 | Stabilitas tata letak | CLS < 0,1 untuk semua halaman | Web Vitals | Should |
| NFR-07 | Tanpa scroll horizontal | tidak ada `scrollWidth > clientWidth` pada 320 px, 360 px, 414 px | Uji manual + snapshot otomatis | Must |
| NFR-08 | Waktu setup akun | p75 < 10.000 ms dari klik **Izinkan & Buat Spreadsheet** sampai `/` siap (M-07) | Uji alur baru 10 kali pada akun kosong | Should |
| NFR-09 | Pertumbuhan data linier | 5.000 baris `Transaksi` tetap terbaca < 3.000 ms pada daftar terfilter | Uji beban data sintetis | Should |

### 5.2 Keamanan

| ID | Persyaratan | Ambang ukur | Prioritas |
| --- | --- | --- | --- |
| NFR-10 | Token OAuth disimpan server-side | token tidak pernah dikirim ke klien; tidak ada token di `localStorage`/`sessionStorage` | Must |
| NFR-11 | Cookie sesi | `HttpOnly`, `Secure`, `SameSite=Lax`, masa berlaku ≤ 30 hari, dirotasi saat login | Must |
| NFR-12 | Validasi input di server | 100% endpoint tulis menolak payload tidak valid; nominal hanya integer > 0 dan ≤ 999.999.999.999 | Must |
| NFR-13 | Otorisasi per pengguna | 100% request memakai rujukan spreadsheet milik sesi; tidak ada endpoint menerima ID spreadsheet dari klien | Must |
| NFR-14 | Batas laju endpoint | ≤ 30 request tulis per menit per sesi; respons 429 dengan `Retry-After` | Should |
| NFR-15 | Enkripsi transport | HTTPS/TLS 1.2+ wajib; HTTP dialihkan ke HTTPS; HSTS `max-age` ≥ 31.536.000 s | Must |
| NFR-16 | Header keamanan | CSP tanpa `unsafe-inline` untuk skrip, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` | Should |
| NFR-17 | Tanpa kredensial di repositori | pemindai rahasia CI = 0 temuan; `.env` tidak pernah ter-commit | Must |
| NFR-18 | Logging tanpa data keuangan | 0 nilai nominal/nama kategori/nama akun di log; hanya ID ter-hash, endpoint, status, durasi | Must |
| NFR-19 | Revalidasi sesi | sesi dicabut dalam ≤ 1 jam setelah pengguna mencabut izin di akun Google | Should |

### 5.3 Privasi

| ID | Persyaratan | Ambang ukur | Prioritas |
| --- | --- | --- | --- |
| NFR-20 | Data hanya di Drive pengguna | 0 tabel/berkas data pengguna di infrastruktur BudgetKu; backend stateless | Must |
| NFR-21 | Cakupan izin minimum | hanya `drive.file` + `calendar.events`; tanpa `drive.readonly`/`drive` penuh | Must |
| NFR-22 | Isi penyimpanan rujukan | hanya ID pengguna Google, ID spreadsheet, preferensi onboarding; tidak ada baris transaksi | Must |
| NFR-23 | Penghapusan jejak | aksi "Keluar & hapus rujukan" menghapus catatan pengguna di server dalam ≤ 24 jam; spreadsheet pengguna tidak disentuh | Should |
| NFR-24 | Transparansi izin | `/masuk/izin` menyebut tiap izin dalam bahasa manusia; perubahan cakupan izin diberitahukan di `/pengaturan/data` | Must |
| NFR-25 | Retensi log | log operasional disimpan ≤ 30 hari | Should |
| NFR-26 | Analitik | 0 pelacak pemasaran pihak ketiga; hanya metrik produk tanpa konten keuangan | Must |

### 5.4 Ketersediaan & keandalan

| ID | Persyaratan | Ambang ukur | Prioritas |
| --- | --- | --- | --- |
| NFR-27 | Ketersediaan aplikasi | ≥ 99,5% per bulan (di luar gangguan Google Sheets/Calendar) | Should |
| NFR-28 | Penanganan galat Sheets | 0 layar putih / stack trace terlihat pengguna saat Sheets gagal | Must |
| NFR-29 | Retry otomatis | panggilan Google API diulang maksimal 3 kali dengan backoff eksponensial (200 ms, 500 ms, 1.200 ms) untuk galat 429/5xx dan galat jaringan | Must |
| NFR-30 | Idempotensi tulis | 100% operasi upsert (budget, lunas, pengingat) aman dijalankan dua kali tanpa duplikasi data | Must |
| NFR-31 | Keandalan pengingat | ≥ 98% event Calendar yang dibuat tersimpan dengan RRULE dan 2 reminder sesuai (M-03) | Must |
| NFR-32 | Rekonsiliasi pengingat terjadwal | pengecekan harian (Apps Script) membandingkan `Langganan` dengan Calendar; selisih dilaporkan di `/pengaturan/data` | Should |
| NFR-33 | Pemulihan kegagalan Calendar | 100% kegagalan pembuatan event menghasilkan `status_pengingat=tidak aktif` + aksi coba lagi; tidak pernah ditandai "aktif" secara keliru | Must |
| NFR-34 | Keutuhan urutan tulis | urutan Sheets → Calendar (A-21) dipertahankan pada 100% endpoint yang memanggil Calendar | Must |

### 5.5 Aksesibilitas (WCAG 2.1 AA)

| ID | Persyaratan | Ambang ukur | Prioritas |
| --- | --- | --- | --- |
| NFR-35 | Kontras teks | ≥ 4,5:1 untuk teks normal; ≥ 3:1 untuk teks besar dan komponen UI/grafis penting | Must |
| NFR-36 | Target sentuh | area sentuh ≥ 44×44 px CSS untuk tab, FAB, chip, ikon aksi | Must |
| NFR-37 | Navigasi keyboard | 100% aksi tercapai dengan Tab/Enter/Esc; urutan fokus logis; indikator fokus ≥ 2 px terlihat | Must |
| NFR-38 | Label semantik | setiap kontrol punya nama aksesibel; grafik donat & batang punya alternatif tabel/teks | Must |
| NFR-39 | Pengumuman status | toast dan galat diumumkan lewat `aria-live` (galat `assertive`); tidak ada informasi hanya lewat warna | Must |
| NFR-40 | Tanpa ketergantungan warna | status budget selalu disertai teks/ikon (contoh "Terpakai 92%") | Must |
| NFR-41 | Zoom & reflow | terbaca pada zoom 200% dan lebar 320 px tanpa scroll horizontal (selaras NFR-07) | Must |
| NFR-42 | Validasi form aksesibel | pesan galat terhubung ke field lewat `aria-describedby`; galat diumumkan saat submit | Must |
| NFR-43 | Judul & bahasa halaman | satu `<h1>` per halaman, `lang="id"`, `title` deskriptif | Must |
| NFR-44 | Audit aksesibilitas | 0 pelanggaran level A/AA pada audit otomatis (axe) untuk 10 halaman inti | Should |

### 5.6 Kompatibilitas browser & perangkat

| ID | Persyaratan | Ambang ukur | Prioritas |
| --- | --- | --- | --- |
| NFR-45 | Dukungan browser | 2 versi terakhir Chrome, Safari, Edge, Firefox (mobile & desktop); rute inti berfungsi tanpa galat konsol | Must |
| NFR-46 | Rentang viewport | 320 px – 1.920 px; desktop ≥ 1.024 px memakai sidebar 240 px (IA §3.1) | Must |
| NFR-47 | iOS Safari | fitur inti berfungsi pada iOS 16+; sheet tidak melompat saat keyboard muncul | Must |
| NFR-48 | Koneksi lambat | pada 3G lambat halaman tetap dapat dipakai (skeleton + pesan), bukan spinner tanpa akhir | Should |
| NFR-49 | PWA dasar | manifest + ikon terpasang; dapat ditambahkan ke layar utama; tanpa mode offline penuh | Could |

---

## 6. Aturan Bisnis

Notasi **BR-xx**. Semua rumus memakai integer rupiah. Tanggal memakai zona waktu perangkat (A-05).

### 6.1 Perhitungan saldo, budget, turunan

| ID | Aturan | Rumus / ambang |
| --- | --- | --- |
| BR-01 | Saldo akun | `saldo(akun) = Σ pemasukan(akun) + Σ transfer_masuk(akun) − Σ pengeluaran(akun) − Σ transfer_keluar(akun)` |
| BR-02 | Transfer netral | pengaruh transfer terhadap total kekayaan = 0; hanya memindahkan saldo antar akun |
| BR-03 | Sisa uang bulan ini | `Σ pemasukan(bulan) − Σ pengeluaran(bulan)`; transfer dikecualikan |
| BR-04 | Sisa budget bulan ini | `Σ batas(kategori, bulan) − Σ pengeluaran_terkategori(bulan)`; pengeluaran **Tanpa kategori** dikecualikan |
| BR-05 | Rollover budget | MVP: tanpa rollover otomatis (A-04 = warisan baris bulan, bukan pemindahan sisa). v1.1: bila sakelar aktif → `batas_efektif = batas + max(0, sisa_bulan_lalu)` (FR-69) |
| BR-06 | Sisa budget harian | `sisa_budget_bulan ÷ max(1, jumlah_hari_tersisa_dari_hari_ini)` (A-18) |
| BR-07 | Warisan budget bulan | bulan tanpa baris `Budget` berarti batas 0 untuk semua kategori, kecuali pengguna menekan **Salin dari bulan lalu** (FR-27) |
| BR-08 | Persentase terpakai | `terpakai ÷ batas × 100` dibulatkan 1 desimal; hijau < 75%, kuning 75–99%, merah ≥ 100% |
| BR-09 | Pembulatan | nominal selalu integer; pembagian (rata-rata, sisa harian, tahunan÷12) dibulatkan ke integer terdekat (0,5 ke atas) |
| BR-10 | Kategori terarsip | transaksi lamanya tetap dihitung di semua total; label "Kategori dihapus" (A-23) |
| BR-11 | Saldo tidak dapat diedit langsung | tidak ada field saldo di form akun (FR-19) |
| BR-12 | Hapus transaksi mengubah saldo | saldo selalu hasil hitung ulang, bukan nilai tersimpan |
| BR-13 | Sheet `Ringkasan` adalah cache | bila tidak sinkron, yang benar adalah hitungan dari `Transaksi`; `Ringkasan` diregenerasi (A-07) |
| BR-14 | Sumber tunggal waktu | `dibuat` memakai jam server; tanggal transaksi dipilih pengguna (default hari ini) |

### 6.2 Tanggal tagih berikutnya (siklus langganan)

| ID | Aturan | Contoh |
| --- | --- | --- |
| BR-15 | Bulanan: maju 1 bulan, tanggal sama | 25 Jan → 25 Feb |
| BR-16 | Tahunan: maju 1 tahun, tanggal sama | 25 Jan 2026 → 25 Jan 2027 |
| BR-17 | Tanggal 29/30/31 di bulan pendek: mundur ke hari terakhir bulan tujuan (A-35) | 31 Jan → 28 Feb 2026 → 31 Mar |
| BR-18 | 29 Feb pada tahun non-kabisat: mundur ke 28 Feb | 29 Feb 2028 → 28 Feb 2029 |
| BR-19 | "Jatuh tempo" = `0 ≤ tagihan_berikutnya − hari ini ≤ 7` hari | tagihan hari ini = jatuh tempo hari ini |
| BR-20 | "Terlewat" = `hari ini > tagihan_berikutnya` dan siklus belum lunas | tetap tampil di banner (FR-39) |
| BR-21 | Tandai lunas maju tepat 1 siklus | mencegah pergeseran ganda (FR-35 edge) |
| BR-22 | Tanggal tagih dihitung di waktu lokal perangkat | perubahan zona waktu menggeser maksimal 1 hari; tidak dikoreksi otomatis |
| BR-23 | Pelunasan tidak mengubah event Calendar | reminder tetap milik Calendar (A-06, A-34) |

### 6.3 Aturan lain

| ID | Aturan |
| --- | --- |
| BR-24 | Batas budget boleh lebih kecil dari pengeluaran berjalan (A-31); hanya peringatan |
| BR-25 | Sisihan wishlist boleh melebihi target (A-36); status menjadi **Tercapai** |
| BR-26 | Satu akun default per pengguna; "Jadikan default" menurunkan penanda default lama secara atomik |
| BR-27 | Kategori/akun yang pernah dipakai tidak dapat dihapus permanen; hanya diarsipkan (A-25) |
| BR-28 | Transaksi tanpa kategori tidak memengaruhi budget kategori mana pun (A-28) |
| BR-29 | Nominal selalu > 0 untuk transaksi, batas, langganan, target wishlist, dan sisihan |
| BR-30 | Satu pengguna = satu spreadsheet; tidak ada penggabungan data antar pengguna pada MVP (A-12) |

---

## 7. Spesifikasi Sinkronisasi Google Calendar

Calendar = sumber kebenaran **pengingat**; Sheets = sumber kebenaran **status lunas**. Formula event mengikuti A-29; idempotensi mengikuti A-30.

### 7.1 Kapan event dibuat

| Trigger | Aksi |
| --- | --- |
| FR-32 **Simpan & buat pengingat** (Sheets sudah berhasil) | `events.insert`: `summary = Tagihan: <nama langganan>`, event sepanjang hari pada tanggal tagihan, `RRULE:FREQ=MONTHLY;BYMONTHDAY=<t>` (Bulanan) atau `FREQ=YEARLY` (Tahunan), `reminders.useDefault=false`, `overrides=[{minutes:4320},{minutes:0}]` |
| FR-38 **Aktifkan pengingat** pada baris `tidak aktif` | bila `id_event_calendar` masih ada → `events.patch`; bila kosong → `events.insert` |
| FR-62 aktivasi massal setelah izin diberikan | berurutan untuk N langganan, maksimal 1 event per langganan; progres ditampilkan; kegagalan 1 baris tidak membatalkan sisanya |

### 7.2 Kapan event diubah

| Perubahan di Sheets | Aksi Calendar |
| --- | --- |
| Nama langganan (FR-34) | `events.patch` pada `summary` |
| Nominal langganan | tidak ada perubahan event (nominal tidak masuk ke event) |
| Tanggal tagihan | `events.patch` pada `recurrence` (`BYMONTHDAY` baru) — wajib patch, dilarang insert |
| Siklus Bulanan ↔ Tahunan | `events.patch` mengganti `FREQ` |
| Akun sumber dana | tidak ada perubahan event |

### 7.3 Kapan event dihapus

| Trigger | Aksi |
| --- | --- |
| FR-36 **Hapus langganan** | `events.delete(id_event_calendar)`, lalu hapus baris `Langganan` dan baris `Pengingat` |
| FR-37 **Hentikan pengingat** | `events.delete` → kosongkan `id_event_calendar`, `status_pengingat=tidak aktif`, tandai baris `Pengingat` tidak aktif |
| Penghapusan gagal (403/404/5xx) | niat pengguna di Sheets tetap diterapkan, tetapi tampilkan bar "Pengingat lama masih ada di Google Calendar. Hapus manual." + tautan event. **Dilarang** menandai pengingat "aktif". |
| Rekonsiliasi menemukan event sudah tidak ada | tandai `tidak aktif` + tawarkan **Aktifkan pengingat** (NFR-32) |

### 7.4 Aturan reminder

| ID | Aturan |
| --- | --- |
| CR-01 | 2 reminder per event: 4.320 menit (3 hari) sebelum dan 0 menit (hari-H) |
| CR-02 | `useDefault=false` wajib, agar pengingat bawaan kalender pengguna tidak menambah notifikasi |
| CR-03 | Event sepanjang hari (`start.date`, `end.date = tanggal + 1`) agar tidak terpengaruh jam kerja |
| CR-04 | Zona waktu event = zona waktu kalender utama pengguna; tanggal tagihan tidak digeser jam server |
| CR-05 | **Tandai lunas** tidak mengubah event (tetap berulang; A-34) |
| CR-06 | Judul event memakai istilah glosarium IA §7 ("Tagihan: …"), bukan istilah Inggris |

### 7.5 Event dihapus manual oleh pengguna

1. Deteksi: rekonsiliasi harian (Apps Script, NFR-32) memanggil `events.get` untuk setiap `id_event_calendar`; 404 = dihapus manual.
2. `Pengingat.status = tidak aktif`; `Langganan.status_pengingat = tidak aktif`; `id_event_calendar` dikosongkan.
3. `/langganan` menampilkan "Pengingat tidak aktif" + tombol **Aktifkan pengingat** (FR-38); baris tetap masuk perhitungan total bulanan.
4. Banner in-app tetap bekerja dari data Sheets (FR-39), sehingga tagihan tidak hilang dari pandangan.
5. Bila pengguna mengaktifkan lagi, event dibuat baru (tidak memulihkan event lama) dan `id_event_calendar` diperbarui.
6. Catatan "Pengingat dimatikan di luar aplikasi" tampil sekali dan dapat ditutup; tidak diulang tiap kunjungan.

### 7.6 Penanganan token kedaluwarsa

| Kondisi | Perilaku |
| --- | --- |
| Access token kedaluwarsa, refresh token valid | refresh otomatis; pengguna tidak melihat galat |
| Refresh token gagal `invalid_grant` | sesi butuh login ulang; aksi Calendar dihentikan; bar "Izin Calendar perlu diperbarui." + **Aktifkan izin Calendar** (FR-62) |
| Izin dicabut (403) | `status_pengingat=tidak aktif` untuk baris terkait; 1 bar ringkasan di `/langganan`, bukan galat per baris berulang |
| Kuota Calendar (`rateLimitExceeded`) | tahan antrean pembuatan event; toast "Terlalu banyak permintaan. Tunggu sebentar." + **Coba lagi** (IA §4.0) |
| Sheets juga gagal bersamaan | urutan pesan: Sheets dulu, Calendar kemudian; pengguna melihat satu aksi utama (masuk ulang / coba lagi) |
| Retry | 3 kali dengan backoff 200/500/1.200 ms (NFR-29); 401 setelah refresh gagal tidak diulang otomatis |
| Keandalan | status `aktif` hanya boleh diberikan bila `events.get` pada `id_event_calendar` mengembalikan 200 dengan `recurrence` dan 2 override reminder |

---

## 8. Batasan Google Sheets

### 8.1 Kuota & batas yang mengikat desain

| ID | Batasan | Angka | Dampak |
| --- | --- | --- | --- |
| SH-01 | Kuota baca Sheets API | 300 permintaan baca/menit per proyek; 60/menit per pengguna | wajib cache + batch; dilarang polling |
| SH-02 | Kuota tulis Sheets API | 300 permintaan tulis/menit per proyek; 60/menit per pengguna | antrean tulis per sesi (NFR-14) |
| SH-03 | Batas ukuran sel | 50.000 karakter/sel | catatan transaksi dibatasi 140 karakter |
| SH-04 | Batas sel per spreadsheet | 10.000.000 sel | 5.000 baris `Transaksi` × 12 kolom = 60.000 sel; aman |
| SH-05 | Batas sheet per file | 200 sheet | 8 sheet terpakai |
| SH-06 | Batas ukuran file | 100 MB | estimasi 5.000 transaksi < 5 MB |
| SH-07 | Kuota Apps Script (akun konsumen) | 90 menit waktu eksekusi/hari; 20.000 trigger/hari | cukup untuk regenerasi `Ringkasan` + rekonsiliasi harian |
| SH-08 | Batas waktu eksekusi | 6 menit per eksekusi | regenerasi `Ringkasan` diproses per bulan, bukan seluruh riwayat |
| SH-09 | Jumlah kolom `Transaksi` | 12 kolom (lihat §10 tabel) | penambahan kolom = migrasi skema (Q-04 IA) |

ASUMSI A-39: aplikasi berjalan pada project Google Cloud dengan kuota default; peningkatan kuota diajukan bila pengguna aktif > 500.

### 8.2 Strategi batch

| ID | Strategi | Aturan |
| --- | --- | --- |
| BT-01 | Baca satu kali per halaman | maksimal 1 `values.batchGet` per permintaan halaman untuk sheet yang dibutuhkan |
| BT-02 | Tulis batch | `values.batchUpdate` untuk operasi > 1 baris (salin budget, seed onboarding, regenerasi `Ringkasan`) |
| BT-03 | Range sempit | baca hanya kolom & baris dibutuhkan (`Transaksi!A2:K51` untuk halaman pertama) |
| BT-04 | Append tunggal | `values.append` 1 baris untuk transaksi (FR-06) agar latensi minimum (NFR-02) |
| BT-05 | Upsert terkontrol | indeks baris diambil dari cache (BT-06), bukan `values.get` per baris |
| BT-06 | Bebas N+1 | 0 panggilan Sheets di dalam loop baris |
| BT-07 | Penulisan `Ringkasan` | satu `values.update` per range, bukan per sel |

### 8.3 Cache

| ID | Aturan | Ambang |
| --- | --- | --- |
| CA-01 | Cache referensi (Akun, Kategori) | TTL 5 menit per sesi; invalidasi langsung saat ada tulis ke sheet terkait |
| CA-02 | Cache `Ringkasan` | dipakai untuk `/`; dianggap basi setelah regenerasi atau 5 menit; tidak memblokir interaksi |
| CA-03 | Cache indeks baris | TTL 60 detik; kunci = spreadsheet + sheet; invalidasi saat sesi ini append/update |
| CA-04 | Tanpa cache untuk daftar transaksi | agar perubahan manual di Sheets terlihat setelah muat ulang |
| CA-05 | Aksi "Muat ulang data" | tersedia di `/pengaturan/data` untuk invalidasi seluruh cache sesi |
| CA-06 | Isolasi cache | cache per sesi/pengguna; dilarang cache bersama antar pengguna |
| CA-07 | Tanpa cache untuk status pengingat | status Calendar dibaca dari data Sheets terbaru (CA-01), bukan di-cache panjang |

### 8.4 Penanganan konflik tulis

| ID | Aturan |
| --- | --- |
| CF-01 | Model *last write wins* per baris, dilengkapi kolom `diperbarui` untuk deteksi |
| CF-02 | Upsert `Budget` berkunci `bulan + id_kategori`; penulisan terakhir menang dan UI menampilkan nilai hasil baca setelah respons |
| CF-03 | Edit manual baris `Langganan` di Sheets dihormati: aplikasi memakai nilai terbaru hasil baca, bukan nilai cache |
| CF-04 | `id_event_calendar` hilang dari baris → rekonsiliasi ke `tidak aktif`, dilarang membuat event duplikat |
| CF-05 | Baris dihapus manual di Sheets → pesan "tidak ditemukan" (FR-10, FR-42), bukan galat teknis |
| CF-06 | Edit manual yang membuat `tagihan_berikutnya` lampau → tawarkan "Perbarui ke siklus berikutnya" |
| CF-07 | Tabrakan multi-perangkat (A-11): operasi tulis membaca ulang saat 409/5xx; maksimal 1 percobaan ulang otomatis |
| CF-08 | Sheets tidak menyediakan kunci transaksi; semua operasi wajib idempoten (NFR-30) |
| CF-09 | Konflik pada `Ringkasan` tidak memblokir apa pun: `Ringkasan` diregenerasi ulang dari `Transaksi` (BR-13) |

---

## 9. Risiko, Ketergantungan, Mitigasi

### 9.1 Risiko produk & teknis

| ID | Risiko | Dampak | Probabilitas | Mitigasi | Penanggung |
| --- | --- | --- | --- | --- | --- |
| R-01 | Kuota Sheets API habis (SH-01, SH-02) sehingga tulis gagal | pengguna tidak bisa mencatat; M-08 turun | Sedang | cache + batch (§8.2/8.3), antrean tulis, respons 429 dengan **Coba lagi**, pengajuan peningkatan kuota (A-39) | Backend |
| R-02 | Latensi Sheets membuat dashboard > 2 detik (NFR-01) | M-02 gagal; pengguna meninggalkan aplikasi | Tinggi | sheet `Ringkasan` pra-komputasi (A-07), kartu ringkasan dimuat lebih dulu (FR-56 edge), cache CA-02 | Frontend + Backend |
| R-03 | Pengguna mengedit/menghapus struktur spreadsheet manual | aplikasi gagal baca; data tampak hilang | Sedang | validasi sheet wajib (FR-61, FR-02), pesan "tidak ditemukan" (CF-05), aksi **Hubungkan ulang** | Backend |
| R-04 | Event Calendar dihapus manual → tagihan terlewat | M-03, M-04 turun; kepercayaan turun | Sedang | rekonsiliasi harian (NFR-32), banner in-app dari Sheets (FR-39), status tidak pernah menandai "aktif" keliru (NFR-33) | Backend |
| R-05 | Izin Calendar tidak diberikan pengguna | fitur pengingat tidak terpakai (M-04) | Tinggi | nilai default sakelar aktif (FR-32), ajakan di `/pengaturan/data` (FR-60), banner pengingat nonaktif (FR-05) | Produk |
| R-06 | Google mengubah kebijakan verifikasi OAuth / scope | rilis MVP tertunda | Sedang | hanya scope minimum (`drive.file`, `calendar.events`) (NFR-21); siapkan halaman kebijakan privasi & alasan izin | Produk |
| R-07 | Interpretasi "budget" berbeda antar pengguna (rollover) | keluhan angka dianggap salah | Sedang | BR-05/BR-07 eksplisit; label UI "Belum diatur" vs "Batas 0"; tombol **Salin dari bulan lalu**; v1.1 sakelar rollover (FR-69) | Produk |
| R-08 | Nominal besar / angka koma dari kebiasaan pengguna | data kotor | Sedang | FR-07 (pembersihan input, batas 999.999.999.999), validasi server NFR-12 | Frontend |
| R-09 | Regenerasi `Ringkasan` melewati batas 6 menit (SH-08) | angka ringkasan basi | Rendah | proses per bulan, bukan seluruh riwayat; batch write (BT-02); fallback hitung klien untuk bulan berjalan | Backend |
| R-10 | Pengguna menganggap data "tidak aman" karena ada di Sheets | adopsi rendah | Sedang | pesan privasi di `/masuk` dan `/masuk/izin` (NFR-24), tautan buka spreadsheet (FR-59) | Produk |
| R-11 | Kategori/akun terarsip membingungkan di laporan | salah tafsir total | Sedang | label "Kategori dihapus"/"Diarsipkan" konsisten (BR-10, FR-17, FR-22) | Desain |
| R-12 | Skema sheet berubah antar versi | data pengguna lama rusak | Sedang | versioning skema (Q-04 IA), migrasi idempoten lewat Apps Script, kolom tambahan di akhir | Backend |
| R-13 | Konflik tulis multi-perangkat | data tertimpa | Rendah | *last write wins* + kolom `diperbarui` (CF-01/CF-07), idempotensi (NFR-30) | Backend |
| R-14 | Aplikasi dipakai untuk mencatat keuangan bersama tanpa fitur berbagi | salah ekspektasi | Sedang | nyatakan batasan di halaman izin + FAQ; FR-73 di v2 | Produk |
| R-15 | Aksesibilitas gagal pada komponen sheet (fokus terperangkap) | pengguna pembaca layar tidak bisa memakai | Sedang | NFR-37, NFR-39, NFR-42; uji dengan NVDA/TalkBack untuk sheet transaksi | Frontend |

### 9.2 Ketergantungan eksternal

| ID | Ketergantungan | Jenis | Rencana bila bermasalah |
| --- | --- | --- | --- |
| D-01 | Google OAuth 2.0 | wajib | tidak ada alternatif pada MVP; galat masuk ditangani FR-01 |
| D-02 | Google Drive API (`drive.file`) | wajib | tidak ada alternatif; spreadsheet = satu-satunya penyimpanan |
| D-03 | Google Sheets API v4 | wajib | fallback baca parsial via Apps Script Web App bila kuota habis (hanya baca) |
| D-04 | Google Calendar API v3 | pengingat | banner dalam aplikasi (FR-39) + email ringkasan Apps Script (FR-71, v1.1) sebagai cadangan |
| D-05 | Google Apps Script (terpasang) | agregasi & rekonsiliasi | bila gagal, `Ringkasan` dihitung di klien untuk bulan berjalan (dengan batas baris) |
| D-06 | Layanan hosting route handler | wajib | dokumentasikan batas cold start; pilih runtime yang mendukung Node/edge sesuai kebutuhan SDK Google |

ASUMSI A-40: Apps Script terpasang pada spreadsheet pengguna (diperlukan A-07); bila pengguna menolak pemasangan, dashboard masuk mode "hitung di klien" dengan peringatan performa.

### 9.3 Ketergantungan internal

| ID | Ketergantungan | Rujukan |
| --- | --- | --- |
| I-01 | Struktur 8 sheet harus selesai sebelum fitur apa pun diuji end-to-end | IA §6, FR-02 |
| I-02 | Glosarium IA §7 dipakai di semua label | IA §7, §4 semua FR |
| I-03 | Aturan tanggal tagih sama di FR-34, FR-35, FR-39, dan CR-04 | BR-15..BR-23 |
| I-04 | Definisi urutan tulis Sheets→Calendar konsisten di FR-32, FR-35, FR-36 | A-21, NFR-34 |

---

## 10. Skema Tabel Database (Sheets)

Delapan sheet, mengikuti IA §6. Setiap sheet punya kolom `id` teks (bukan nomor baris) karena Sheets tidak memberi kunci primer. `diperbarui` ditambahkan agar konflik tulis terdeteksi (CF-01).

### 10.1 `Akun`

| Kolom | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `id_akun` | string (UUID v4) | ya | dibuat klien/server, unik |
| `nama` | string ≤ 40 | ya | unik antar akun non-arsip (FR-20) |
| `jenis` | enum | ya | `Tunai` \| `Bank` \| `E-wallet` (A-24) |
| `default` | boolean | ya | maksimal 1 bernilai TRUE (BR-26) |
| `arsip` | boolean | ya | TRUE = disembunyikan dari pemilih (FR-22) |
| `dibuat` | datetime ISO-8601 | ya | waktu server |
| `diperbarui` | datetime ISO-8601 | ya | diperbarui tiap tulis |

### 10.2 `Kategori`

| Kolom | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `id_kategori` | string (UUID v4) | ya | unik |
| `nama` | string ≤ 40 | ya | unik dalam `jenis` yang sama (FR-16) |
| `jenis` | enum | ya | `Pengeluaran` \| `Pemasukan` |
| `warna` | string | ya | nilai dari palet tetap |
| `arsip` | boolean | ya | TRUE = tidak tampil di pemilih (FR-17) |
| `dibuat` / `diperbarui` | datetime ISO-8601 | ya | audit |

### 10.3 `Transaksi`

| Kolom | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `id_transaksi` | string (UUID v4) | ya | unik; dipakai di route `/transaksi/[id]` |
| `tanggal` | date `YYYY-MM-DD` | ya | default hari ini; boleh lampau (Q-01 IA) |
| `nominal` | integer | ya | > 0, ≤ 999.999.999.999 (FR-07, NFR-12) |
| `jenis` | enum | ya | `Pengeluaran` \| `Pemasukan` \| `Transfer` |
| `id_kategori` | string \| kosong | tidak | kosong = **Tanpa kategori** (A-28) |
| `id_akun` | string FK `Akun` | ya | akun asal |
| `id_akun_tujuan` | string FK `Akun` | hanya Transfer | wajib bila `jenis = Transfer` (FR-08) |
| `id_langganan` | string FK `Langganan` | tidak | terisi bila hasil **Tandai lunas** (FR-35) |
| `nama_langganan_teks` | string ≤ 60 | tidak | salinan nama agar tetap terbaca bila langganan dihapus (FR-36 edge) |
| `id_wishlist` | string FK `Wishlist` | tidak | terisi bila hasil **Sisihkan dana** (FR-45) |
| `catatan` | string ≤ 140 | tidak | batas dari SH-03 |
| `dibuat` / `diperbarui` | datetime ISO-8601 | ya | audit |

### 10.4 `Budget`

| Kolom | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `bulan` | string `YYYY-MM` | ya | bagian kunci gabungan (A-04) |
| `id_kategori` | string FK `Kategori` | ya | bagian kunci gabungan |
| `batas` | integer | ya | > 0 (FR-25, BR-29) |
| `diperbarui` | datetime ISO-8601 | ya | dasar konflik CF-02 |

Kunci primer gabungan: `bulan + id_kategori` (unik; upsert, bukan append — FR-25).

### 10.5 `Langganan`

| Kolom | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `id_langganan` | string (UUID v4) | ya | unik |
| `nama` | string ≤ 60 | ya | masuk judul event (CR-06) |
| `nominal` | integer | ya | > 0 |
| `siklus` | enum | ya | `Bulanan` \| `Tahunan` (A-19) |
| `tagihan_berikutnya` | date | ya | dihitung BR-15..BR-18 |
| `terakhir_lunas` | date \| kosong | tidak | diisi FR-35 |
| `status_lunas_siklus` | enum | ya | `belum` \| `lunas` (idempoten per siklus) |
| `id_akun` | string FK `Akun` | ya | akun sumber dana |
| `id_event_calendar` | string \| kosong | tidak | diisi bila pengingat dibuat (FR-32) |
| `status_pengingat` | enum | ya | `aktif` \| `tidak aktif` (A-06, NFR-33) |
| `diperbarui` | datetime ISO-8601 | ya | audit |

### 10.6 `Wishlist`

| Kolom | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `id_wishlist` | string (UUID v4) | ya | unik |
| `nama` | string ≤ 60 | ya | |
| `nominal_target` | integer | ya | > 0 |
| `terkumpul` | integer | ya | awal 0; bertambah lewat sisihan (FR-42) |
| `tenggat` | date \| kosong | tidak | tenda terdekat untuk pengurutan (FR-40) |
| `id_akun` | string FK `Akun` | ya | akun sumber sisihan (A-22) |
| `status` | enum | ya | `berjalan` \| `tercapai` |
| `diperbarui` | datetime ISO-8601 | ya | audit |

Riwayat sisihan dibaca dari sheet `Transaksi` (baris dengan `id_wishlist` terisi), sehingga tidak ada sheet riwayat terpisah.

### 10.7 `Pengingat`

| Kolom | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `id_pengingat` | string (UUID v4) | ya | unik |
| `id_langganan` | string FK `Langganan` | ya | |
| `id_event_calendar` | string | ya | ID event Calendar |
| `status` | enum | ya | `aktif` \| `tidak aktif` |
| `dibuat` | datetime ISO-8601 | ya | |

Baris `Pengingat` = cermin keberadaan event (A-06). Bila event dihapus manual, baris ditandai `tidak aktif` (§7.5).

### 10.8 `Ringkasan`

Sheet pra-komputasi (A-07). Satu baris per bulan per metrik, ditulis ulang batch (BT-07, SH-08).

| Kolom | Tipe | Aturan |
| --- | --- | --- |
| `bulan` | string `YYYY-MM` | kunci bulan |
| `total_pemasukan` | integer | BR-03 |
| `total_pengeluaran` | integer | BR-03 |
| `total_terkategori` | integer | dasar BR-04 |
| `total_batas` | integer | `Σ batas` bulan itu |
| `jumlah_transaksi` | integer | hitungan baris |
| `diperbarui` | datetime ISO-8601 | waktu regenerasi terakhir |
| `versi_skema` | integer | mis. 1 (R-12) |

### 10.9 `Meta` (kontrol & preferensi)

Sheet tambahan untuk keadaan aplikasi. Meski bukan salah satu dari 8 sheet awal (FR-02), ini ditambahkan pada rilis MVP.

| Kolom | Tipe | Aturan |
| --- | --- | --- |
| `kunci` | string | contoh `onboarding_selesai`, `versi_skema`, `tz_pengguna` |
| `nilai` | string | nilai |
| `diperbarui` | datetime ISO-8601 | audit |

Konsekuensi: FR-02 langkah pembuatan sheet harus menyertakan `Meta` (perubahan terhadap daftar 8 sheet di IA FL-01). Risiko kecil, dicatat sebagai Q-PRD-01.

---

## 11. Matriks Keterlacakan

Kolom: FR → halaman IA (§2.2) → tabel database (§10) → kriteria uji (dapat diuji, tanpa kata subjektif).

| FR | Halaman IA | Tabel | Uji |
| --- | --- | --- | --- |
| FR-01 | 1.1, 1.2 | `Meta` | Buka `/` tanpa sesi → 302 ke `/masuk`; login → 302 ke `/` |
| FR-02 | 1.2 | semua + `Meta` | Buat spreadsheet uji → 9 sheet ada; rujukan tersimpan |
| FR-03 | 1.1 | `Meta` | Login ulang → 0 spreadsheet baru tercipta |
| FR-04 | 9.3 | `Meta` | **Keluar** → cookie sesi kosong; `/` → `/masuk` |
| FR-05 | semua, 9.3 | `Meta` | Cabut izin → aksi tulis 403 → bar izin tampil |
| FR-06 | 3.2 | `Transaksi` | Ketukan dari `/` sampai toast = 3; baris +1 |
| FR-07 | 3.2, 4.1, 5.2, 6.2, 6.3 | `Transaksi`, `Budget`, `Langganan`, `Wishlist` | Input `"Rp 25.000,00"` → tersimpan 25000, tampil `Rp25.000` |
| FR-08 | 3.2 | `Transaksi` | Transfer → `id_kategori` kosong; asal=tujuan → diblokir |
| FR-09 | 3.1 | `Transaksi` | Filter kategori → semua baris cocok; total = Σ baris tampil |
| FR-10 | 3.3 | `Transaksi` | ID tak ada → teks "Transaksi ini tidak ditemukan." |
| FR-11 | 3.3 | `Transaksi` | Ubah nominal → jumlah baris tetap 1; nilai berubah |
| FR-12 | 3.3 | `Transaksi` | Hapus → baris −1; `Ringkasan` terbarui |
| FR-13 | 3.2 | `Transaksi` | Simpan & tambah lagi → 2 baris; form reset ke default |
| FR-14 | 8.1 | `Transaksi` | Total pemasukan = Σ baris pemasukan bulan itu |
| FR-15 | 9.2 | `Kategori` | Dua bagian tampil; jumlah transaksi per kategori benar |
| FR-16 | 9.2, 3.2 | `Kategori` | Duplikat jenis sama → diblokir; jenis beda → tersimpan |
| FR-17 | 9.2 | `Kategori` | Arsipkan → hilang dari pemilih; transaksi lama tetap dihitung |
| FR-18 | 1.2 | `Kategori` | Spreadsheet baru → 5 kategori pengeluaran + 1 pemasukan ada |
| FR-19 | 9.1 | `Akun`, `Transaksi` | Saldo = BR-01 untuk 10 transaksi uji |
| FR-20 | 9.1, 3.2 | `Akun` | Tambah akun → muncul di pemilih sheet transaksi |
| FR-21 | 9.1 | `Akun` | Set default ke-2 → hanya 1 baris `default=TRUE` |
| FR-22 | 9.1 | `Akun` | Arsipkan → hilang dari pemilih; histori tetap tampil |
| FR-23 | 3.2 | `Akun` | Tanpa akun → **Buat akun "Tunai"** tersedia dan langsung terpilih |
| FR-24 | 4.1 | `Budget`, `Transaksi` | Batas 1.000.000, terpakai 760.000 → bilah kuning, sisa 240.000 |
| FR-25 | 4.1 | `Budget` | Simpan 2x → 1 baris, batas = nilai terakhir |
| FR-26 | 4.1 | `Budget` | Hapus batas → baris hilang, label "Belum diatur" |
| FR-27 | 4.1 | `Budget` | Salin bulan lalu → baris bulan ini = jumlah kategori berbatas |
| FR-28 | 4.1, 4.2 | `Budget` | Ganti bulan → header & daftar berubah; label "Bulan ini" |
| FR-29 | 4.2 | `Transaksi`, `Budget` | Sisa harian = BR-06 untuk 3 tanggal uji |
| FR-30 | 4.2 | `Transaksi` | Hari tertinggi = `max(Σ harian)`; proyeksi = BR-06 lanjutan |
| FR-31 | 5.1 | `Langganan` | Total bulanan = Σ bulanan + Σ (tahunan ÷ 12) dibulatkan |
| FR-32 | 5.2 | `Langganan`, `Pengingat` | Event tercipta dengan `RRULE` + 2 override reminder |
| FR-33 | 5.2 | `Langganan` | Tanpa pengingat → 0 panggilan Calendar; status `tidak aktif` |
| FR-34 | 5.1 | `Langganan`, `Pengingat` | Ubah tanggal → `events.patch`; jumlah event tetap 1 |
| FR-35 | 5.1 | `Langganan`, `Transaksi` | Tandai lunas → `tagihan_berikutnya` maju 1 siklus |
| FR-36 | 5.1 | `Langganan`, `Pengingat` | Hapus → baris langganan & pengingat hilang; event hilang |
| FR-37 | 5.1 | `Langganan`, `Pengingat` | Hentikan → `id_event_calendar` kosong; status `tidak aktif` |
| FR-38 | 5.1, 9.3 | `Langganan`, `Pengingat` | Aktifkan → 1 event; `aktif` setelah `events.get` 200 |
| FR-39 | 2.1, semua | `Langganan` | Tagihan 3 hari lagi → banner maks 3 baris + **Lihat semua** |
| FR-40 | 6.1 | `Wishlist` | Urutan: belum tercapai (tenggat naik) lalu tercapai |
| FR-41 | 6.2 | `Wishlist` | Simpan → `terkumpul=0`; bantuan hitung tampil, tidak tersimpan |
| FR-42 | 6.3 | `Wishlist`, `Transaksi` | Sisihkan 250.000 → `terkumpul` +250.000; 1 baris riwayat |
| FR-43 | 6.3 | `Wishlist` | Target baru < terkumpul → status `tercapai`, bilah 100% |
| FR-44 | 6.3 | `Wishlist`, `Transaksi` | Hapus target → transaksi sisihan tetap ada |
| FR-45 | 6.3 | `Transaksi`, `Akun` | Saldo akun sumber turun sebesar sisihan (BR-01) |
| FR-46 | 7.1 | `Transaksi`, `Kategori` | Σ persentase = 100% ± 0,1; label "Kategori dihapus" muncul |
| FR-47 | 7.1 | `Transaksi` | 6 batang tampil; bulan kosong = batang 0 berlabel |
| FR-48 | 7.1, 8.1 | `Transaksi` | Naik 20% → label "naik 20%" + selisih nominal benar |
| FR-49 | 7.1 | `Transaksi` | Rata-rata = total ÷ hari terlewati (hari ini dihitung 1) |
| FR-50 | 8.1 | `Transaksi` | Total & rata-rata = BR-03/BR-09 untuk data uji |
| FR-51 | 8.1 | `Transaksi` | Baris berisi tanggal, akun, kategori, nominal |
| FR-52 | 8.1 | `Transaksi` | Ketuk **Catat pemasukan** → jenis sudah Pemasukan |
| FR-53 | 2.1 | `Ringkasan`, `Transaksi` | Angka = BR-03; tampil tanpa scroll pada 360×640 |
| FR-54 | 2.1 | `Budget`, `Transaksi` | Angka = BR-04; tanpa baris budget → empty state |
| FR-55 | 2.1 | `Budget`, `Transaksi` | Warna sesuai BR-08 pada 74%, 80%, 105% |
| FR-56 | 2.1 | `Transaksi` | Tepat 5 baris, urut tanggal lalu `dibuat` menurun |
| FR-57 | 2.1 | `Ringkasan` | Ganti bulan → angka sesuai baris `Ringkasan` bulan itu |
| FR-58 | 2.1 | — | Ketuk kartu "Sisa budget" → `/budget` |
| FR-59 | 9.3 | `Meta` | Nama + `diperbarui` file tampil; status cocok kondisi uji |
| FR-60 | 9.3 | `Langganan`, `Pengingat` | Jumlah pengingat = baris `Pengingat.status=aktif` |
| FR-61 | 9.3 | `Meta` | Pilih file bukan BudgetKu → ditolak; rujukan tidak berubah |
| FR-62 | 9.3 | `Langganan`, `Pengingat` | Setelah izin → N event dibuat, progres N/N |
| FR-63 | 2.1 | `Meta` | Login pertama → kartu 3 langkah tampil |
| FR-64 | 2.1 | `Meta` | Ketuk langkah 2 → sheet terbuka dengan jenis Pengeluaran |
| FR-65 | 2.1 | `Meta` | 3 langkah selesai → kartu hilang setelah muat ulang |
| FR-66 | v1.1 | `Transaksi` | CSV 100 baris (2 galat) → 98 tersimpan + laporan 2 galat |
| FR-67 | v1.1, 9.3 | `Meta` | `prefers-color-scheme: dark` → kontras ≥ 4,5:1 |
| FR-68 | v1.1, 9.3 | — | Klik unduh → XLSX terunduh; 0 byte tersimpan di server |
| FR-69 | v1.1, 4.1 | `Budget` | Sisa bulan lalu 50.000 → `batas_efektif` +50.000, ditandai UI |
| FR-70 | v1.1, 3.1 | `Transaksi` | Cari "kopi" lintas 3 bulan → 3 hasil; < 2 detik |
| FR-71 | v1.1 | `Transaksi`, `Langganan` | Email terkirim tanggal 1; angka = BR-03 |
| FR-72 | v1.1, 6.3 | `Wishlist`, `Transaksi` | Hapus 1 sisihan → **Sinkronkan** menurunkan `terkumpul` |
| FR-73 | v2 | `Transaksi` dll. | 2 akun Google menulis 1 spreadsheet tanpa kehilangan baris |
| FR-74 | v2 | `Akun`, `Transaksi` | Dua mata uang → total terpisah, tidak dikonversi |
| FR-75 | v2, 3.3 | `Transaksi` | Unggah gambar → tautan Drive tersimpan di baris |
| FR-76 | v2 | `Langganan` | Push diterima saat tab tertutup |
| FR-77 | v2 | — | Aplikasi terpasang & pintasan berfungsi |
| FR-78 | v2, 4.1 | `Kategori`, `Budget` | Kategori bertanda bersama tampil untuk kedua pengguna |

### 11.1 Matriks NFR → bukti uji

| NFR | Uji | Bukti |
| --- | --- | --- |
| NFR-01..NFR-09 | Lighthouse/WebPageTest + uji beban data sintetis | laporan CI + nilai terukur |
| NFR-10..NFR-19 | audit manual + pemindai rahasia + uji otorisasi lintas sesi | daftar periksa bertanda tangan |
| NFR-20..NFR-26 | tinjauan skema penyimpanan server (harus kosong dari data keuangan) + audit izin OAuth | dokumen bukti |
| NFR-27..NFR-34 | observabilitas + uji kegagalan tersuntik (cabut izin, paksa 429) | log uji |
| NFR-35..NFR-44 | axe otomatis + uji manual NVDA/TalkBack/Tab | laporan aksesibilitas |
| NFR-45..NFR-49 | matriks perangkat/browser | matriks hasil uji |

### 11.2 Aturan keterlacakan

1. Setiap FR di §4 memetakan ke minimal 1 halaman IA §2.2 (atau ditandai rilis lanjutan) dan ke minimal 1 baris uji.
2. Setiap tabel di §10 dipakai oleh minimal 1 FR.
3. Setiap NFR punya ambang angka dan bukti uji; tidak ada NFR tanpa angka.
4. Perubahan FR wajib memperbarui baris §11 dan tabel §10 yang terpengaruh.

---

## 12. Rekap Asumsi Baru

Asumsi IA A-01..A-36 tetap berlaku dan tidak dicabut (A-20). PRD menambah 4 asumsi.

| ID | Asumsi | Rujukan |
| --- | --- | --- |
| A-37 | Prioritas persona: U-01 (Rani) > U-02 (Dimas) > U-03 (Sari) | §2.1 |
| A-38 | v2 tidak dikerjakan paralel dengan v1.1; menunggu jawaban Q-04 IA | §3.3 |
| A-39 | Kuota Google Cloud default cukup sampai sekitar 500 pengguna aktif; peningkatan kuota diajukan setelahnya | §8.1 |
| A-40 | Apps Script terpasang di spreadsheet pengguna; bila ditolak, dashboard masuk mode hitung-klien dengan peringatan performa | §9.2 |

---

## 13. Pertanyaan Terbuka

| ID | Pertanyaan | Terkait | Dampak bila tak terjawab |
| --- | --- | --- | --- |
| Q-PRD-01 | Setujui sheet ke-9 `Meta` (keadaan onboarding & versi skema) di luar 8 sheet IA? | FR-02, FR-63, §10.9 | Penempatan status onboarding; revisi IA §6 |
| Q-PRD-02 | Perlu batas rentang tanggal transaksi lampau (mis. maks 5 tahun)? IA Q-01 belum memutuskan. | FR-10, FR-11 | Aturan validasi tanggal & filter bulan |
| Q-PRD-03 | Perlu akun tujuan terpisah untuk dana wishlist, atau cukup akun sumber (A-22)? | FR-45, BR-01 | Rumus saldo & jumlah akun per pengguna |
| Q-PRD-04 | Boleh menandai lunas dicatat sebagai pengeluaran pada tanggal tagihan (bukan hari ini) bila ditandai terlambat? | FR-35 | Perhitungan bulan transaksi (BR-03) |
| Q-PRD-05 | Saat transaksi pelunasan dihapus, apakah status **Lunas** langganan ikut dibatalkan? | FR-12, FR-35 | Konsistensi status lunas vs transaksi |
| Q-PRD-06 | Target M-01..M-09 ditetapkan tanpa baseline; perlu rilis internal 2 minggu lebih dulu untuk mengukur baseline? | §1.4 | Target tidak punya pembanding |
| Q-PRD-07 | Boleh pengguna menonaktifkan sheet `Ringkasan` (A-40) dan menerima dashboard lebih lambat? | A-07, A-40, NFR-01 | Mode operasi ganda; kompleksitas dukungan |
| Q-PRD-08 | Siapa menanggung biaya pengiriman email ringkasan v1.1 (kuota Apps Script pengguna vs layanan lain)? | FR-71, D-05 | Kelayakan fitur email |
| Q-PRD-09 | Perlu indikator "data terakhir disinkronkan" di setiap halaman, atau cukup di `/pengaturan/data`? | CA-02, CA-05 | Kepercayaan pengguna pada angka |
| Q-PRD-10 | Apakah **Sisihkan dana** harus selalu berupa transfer (A-22) atau boleh sekadar menandai tanpa transaksi? | FR-45, BR-02 | Model data wishlist |
| Q-PRD-11 | Perlukah penggabungan Analisis + Pemasukan menjadi tab "Laporan" (IA Q-02) sebelum MVP, mengingat kedua halaman ini sering dipakai U-02? | §2.1, §3.1 | Struktur navigasi mobile (5 item) |
| Q-PRD-12 | Perlu konfirmasi tambahan untuk penghapusan langganan berbiaya besar (mis. > Rp500.000/bulan) atau cukup konfirmasi dua langkah? | FR-36 | Kesalahan hapus yang tidak dapat dibatalkan |


---
