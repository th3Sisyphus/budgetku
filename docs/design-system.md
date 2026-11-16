# Dokumen Design System — BudgetKu

> Web perencana anggaran pribadi, mobile-first, bahasa Indonesia, IDR.
> Versi 1.0 · Status: draf implementasi · Rujukan: `docs/information-architecture.md` (IA)
> Stak: Tailwind CSS + shadcn/ui + Radix. Pendamping: `docs/tokens.css`, `tailwind.config.ts`.

Rujukan silang: A-08 (integer), A-10 (tanpa mode gelap), A-15 (default sheet tambah transaksi), A-28 (Tanpa kategori), FL-02 (tambah transaksi ≤3 ketukan), FL-05 (tandai lunas), IA §4.0 (state global), IA §7 (glosarium).

---

## 1. Prinsip Desain

| # | Prinsip | Aturan implementasi yang mengikat |
| --- | --- | --- |
| P1 | **Tenang.** Tidak ada warna mencolok di luar makna uang; animasi hanya memindahkan fokus. | Maksimal satu warna aksen per layar. Tanpa gradien. Tanpa animasi masuk per item. Durasi ≤ 240 ms (§2.5). |
| P2 | **Jelas.** Setiap angka punya label dan satuan yang sama tiap kali muncul (IA §7). | Nominal selalu `text-amount` + `tabular-nums`. Tidak ada angka tanpa label. Nol ≠ belum dimuat (IA §4.0). |
| P3 | **Cepat dicatat.** Input transaksi ≤ 3 ketukan (FL-02). | Papan angka in-sheet, fokus otomatis ke nominal, tanpa modal bertumpuk, FAB terjangkau ibu jari. |
| P4 | **Tidak menghakimi.** Merah bukan warna pengeluaran biasa; merah hanya untuk pelanggaran batas dan galat. | Nada pengeluaran = netral tegas (`--amount-expense`), bukan `danger`. Tanpa skor, sindiran, atau emoji. |
| P5 | **Satu tangan, satu mata.** | Semua kontrol ≥ 44 px, aksi utama di sepertiga bawah layar, kontras teks ≥ 4.5:1. |

---

## 2. Token

Semua nilai ada di `docs/tokens.css`. Jangan menulis hex di komponen; pakai kelas Tailwind (`tailwind.config.ts`) atau `var(--…)`.

### 2.1 Warna inti & kontras WCAG

Kontras dihitung dengan rumus WCAG 2.1 terhadap latar pada kolom "vs". Ambang: teks normal 4.5:1, teks besar 3:1, komponen 3:1.

| Token | Hex | Pemakaian | vs | Rasio | Hasil |
| --- | --- | --- | --- | --- | --- |
| `--color-primary-600` | `#0F766E` | Tombol utama, tautan, cincin fokus | `#FFFFFF` | 4.79:1 | Lulus AA teks |
| `--color-primary-700` | `#115E59` | Hover tombol; teks di latar `primary-100` | `#FFFFFF` | 6.72:1 | Lulus AA+ |
| `--color-primary-100` | `#D1FAE8` | Latar tombol sekunder | `#115E59` | 5.84:1 | Lulus AA — jangan pakai `600` di atasnya (4.16:1) |
| `--color-neutral-900` | `#1C1917` | Teks utama | `#FFFFFF` | 18.1:1 | Lulus AAA |
| `--color-neutral-600` | `#57534E` | Teks sekunder | `#FFFFFF` | 7.9:1 | Lulus AAA |
| `--color-neutral-500` | `#78716C` | Teks redup | `#FFFFFF` | 4.9:1 | Lulus AA |
| `--color-neutral-200` | `#E7E5E4` | Garis pemisah | `#FFFFFF` | 1.20:1 | Dekoratif, bukan teks |
| `--color-neutral-300` | `#D6D3D1` | Batas kontrol | `#FFFFFF` | 1.60:1 | Gagal 3:1 → §2.2 |
| `--color-income-900` | `#14532D` | Nominal pemasukan | `#FFFFFF` | 10.4:1 | Lulus AAA |
| `--color-income-600` | `#15803D` | Glyph pemasukan | `#FFFFFF` | 5.0:1 | Lulus AA |
| `--color-expense-900` | `#881337` | Nominal pengeluaran | `#FFFFFF` | 9.6:1 | Lulus AAA |
| `--color-expense-600` | `#BE123C` | Glyph pengeluaran | `#FFFFFF` | 6.0:1 | Lulus AA |
| `--color-warning-900` | `#78350F` | Teks peringatan | `#FEF3C7` | 7.4:1 | Lulus AAA |
| `--color-warning-600` | `#B45309` | Bilah 75–99% | `#FFFFFF` | 4.7:1 | Lulus AA |
| `--color-danger-900` | `#7F1D1D` | Teks galat | `#FEE2E2` | 7.7:1 | Lulus AAA |
| `--color-danger-600` | `#B91C1C` | Tombol hapus, cincin galat | `#FFFFFF` | 5.9:1 | Lulus AA |
| `--color-success-900` | `#064E3B` | Teks lunas/tercapai | `#D1FAE5` | 8.3:1 | Lulus AAA |
| `--color-success-600` | `#047857` | Bilah < 75% | `#FFFFFF` | 5.4:1 | Lulus AA |

### 2.2 Penyimpangan disengaja & mitigasi

| Temuan | Mitigasi wajib |
| --- | --- |
| `--border-strong` gagal 3:1 | Kontrol yang butuh batas jelas memakai `--color-neutral-500` (4.9:1) sebagai garis; saat diam, kontrol dikenali dari `--surface` di atas `--background`. |
| Teks 12 px redup hanya lulus bila tebal ≥ 600 | Caption dilarang memikul satu-satunya informasi; selalu ada label ≥ 13 px. |
| Teks tombol sekunder | Pakai `--color-primary-700`, bukan `600`. |
| Mode gelap cadangan (A-10, Q-08) | Blok `[data-theme="dark"]` sudah ada, tidak diaktifkan di MVP. Bila diaktifkan, kontras diuji ulang. |

### 2.3 Skala tipografi

| Token | Ukuran / baris | Bobot | Pemakaian |
| --- | --- | --- | --- |
| `text-display` | 30 / 36 | 700, −0.02em | "Sisa uang bulan ini" |
| `text-amount` | 28 / 32 | 700, tabular | Nominal besar di rincian, sheet, dialog |
| `text-h1` | 24 / 32 | 600 | Judul halaman |
| `text-h2` | 20 / 28 | 600 | Judul kartu besar, judul sheet |
| `text-h3` | 17 / 24 | 600 | Judul kelompok/baris |
| `text-body` | 15 / 22 | 400 | Isi, label input |
| `text-small` | 13 / 18 | 400–500 | Metadata, catatan |
| `text-caption` | 12 / 16 | 500–600 | Cap status, label segmen |

Keluarga: Inter → Plus Jakarta Sans → system. Nominal wajib `font-variant-numeric: tabular-nums`. Tidak ada ukuran di luar skala.

### 2.4 Spasi (skala 4 px)

| Token | px | Pemakaian baku |
| --- | --- | --- |
| `space-1` | 4 | Jarak ikon–teks |
| `space-2` | 8 | Padding badge, jarak baris rapat |
| `space-3` | 12 | Padding horizontal, jarak antar-kontrol |
| `space-4` | 16 | Padding kartu, padding tepi mobile, jarak field |
| `space-5` | 20 | Jarak antar-kartu |
| `space-6` | 24 | Jarak antar-bagian |
| `space-8` | 32 | Sebelum judul bagian |
| `space-12` | 48 | Padding layar kosong |

### 2.5 Radius, bayangan, gerak

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `radius-sm` | 8 px | Input, badge |
| `radius-md` | 12 px | Tombol, baris tersorot |
| `radius-lg` | 16 px | Kartu, kartu akun, kartu langganan |
| `radius-xl` | 20 px | Sheet, dialog mobile |
| `radius-pill` | 999 px | FAB, keping kategori, keping filter |
| `shadow-card` | blur 1–3 px | Kartu diam |
| `shadow-raised` | blur 12 px | Dialog desktop, toast |
| `shadow-sheet` | blur 24 px ke atas | Bottom sheet |
| `duration-fast` | 120 ms | Hover, tekan |
| `duration-base` | 180 ms | Ganti state, toast |
| `duration-slow` | 240 ms | Sheet/dialog masuk |
| `ease-standard` | `cubic-bezier(0.2,0,0,1)` | Gerak masuk/perubahan |
| `ease-exit` | `cubic-bezier(0.4,0,1,1)` | Gerak keluar |

Animasikan hanya `transform` dan `opacity`. `prefers-reduced-motion: reduce` menolkan semua durasi.


---

## 3. Palet Kategori (12, aman buta warna)

Dibangun di ruang OKLCH (L 0.55–0.62, C 0.08–0.21). Hue tidak mengandalkan pasangan merah–hijau. Setiap kategori juga punya **keping huruf awal** sehingga identitas tetap terbaca tanpa warna.

| # | Hex | Nama | Catatan buta warna |
| --- | --- | --- | --- |
| 1 | `#2A6FB8` | Biru | Terpisah dari 8 dan 10 oleh luminan |
| 2 | `#C2571A` | Jingga | Luminan jauh dari 1 |
| 3 | `#158F84` | Teal | Hue antara 1 dan 8 |
| 4 | `#8E44AD` | Ungu | Unik |
| 5 | `#A67C00` | Emas tua | Jangan bersebelahan dengan 11 |
| 6 | `#D23D8B` | Magenta | Unik |
| 7 | `#6B7280` | Abu | Netral, selalu tersedia |
| 8 | `#3F7A2E` | Hijau daun | Luminan lebih tinggi dari 10 |
| 9 | `#1F7A96` | Sian tua | Unik |
| 10 | `#A03A2F` | Bata | Luminan lebih rendah dari 8 |
| 11 | `#7A5C2E` | Cokelat | Jangan bersebelahan dengan 5 |
| 12 | `#4B5D9E` | Indigo | Saturasi beda dari 1 |

Aturan:
- Warna kategori **tidak** menjadi warna teks nominal.
- Donat & legenda: urut dari kategori terbesar ke terkecil, maksimal 6 irisan berwarna + "Lainnya" memakai `cat-7`.
- Kategori ke-13 dan seterusnya memakai `cat-7` + keping huruf awal.
- Pengguna memilih dari palet tetap (IA §4.17), bukan color picker bebas.

---

## 4. Aturan Angka & Tanggal

### 4.1 Format uang

`Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0})` → `Rp1.250.000`.

| Aturan | Detail |
| --- | --- |
| Integer | Tanpa desimal/koma (A-08). Papan angka tanpa tombol koma. |
| Tanpa spasi | `Rp1.250.000`, bukan `Rp 1.250.000`. |
| Tabular | Semua nominal rata kolom. |
| Pemendekan | Hanya grafik/keping sempit: `Rp1,2 jt`, `Rp850 rb`. Angka penuh wajib ada di tooltip + label aksesibel. |
| Nol vs belum dimuat | `Rp0` untuk nol nyata; skeleton untuk data belum siap. |
| Negatif | Nominal selalu positif; tanda ditentukan jenis. |
| Rentang | `Rp25.000 – Rp50.000` (en dash berspasi). |

### 4.2 Tanda, glyph, warna per jenis

| Jenis | Tanda | Glyph | Warna teks | Latar keping | Contoh |
| --- | --- | --- | --- | --- | --- |
| Pengeluaran | `−` (U+2212) | `↓` | `--amount-expense` | `--amount-expense-surface` | `−Rp25.000` |
| Pemasukan | `+` | `↑` | `--amount-income` | `--amount-income-surface` | `+Rp8.500.000` |
| Transfer | `⇄` | `⇄` | `--text-secondary` | `--surface-muted` | `⇄Rp500.000` + "Tunai → BCA" |

Warna bukan satu-satunya pembeda: tanda + glyph + kata jenis selalu hadir. Pembaca layar membaca "Pengeluaran dua puluh lima ribu rupiah", bukan "minus".

### 4.3 Tanggal

| Konteks | Format | Contoh |
| --- | --- | --- |
| Hari ini / kemarin | kata relatif | `Hari ini`, `Kemarin` |
| Baris lain | `d MMM` | `12 Agu` |
| Input | `dd/MM/yyyy` | `12/08/2026` |
| Header bulan | `MMMM yyyy` | `Agustus 2026` |
| Tenggat/pengingat | `EEEE, d MMMM yyyy` | `Selasa, 25 Agustus 2026` |
| Sel kalender | hari + total pendek | `12 · 85 rb` |

Zona waktu `Asia/Jakarta` (A-05). Jam hanya untuk "dicatat pada": `12 Agu 2026 · 14.05`.

---

## 5. Komponen

Konvensi bersama (berlaku semua komponen, tidak diulang):
- **Fokus**: `outline: 2px solid var(--focus-ring); outline-offset: 2px`. Tidak ada `outline:none` tanpa pengganti.
- **Lapisan Radix**: konten sheet/dialog boleh fokus; latar `inert` + `aria-hidden`. Tombol tutup selalu ada.
- **Target sentuh**: minimal 44 × 44 px (`min-h-touch`), termasuk tombol ikon saja.
- **Stak shadcn/ui**: tetap pakai `components/ui/*`; ubah hanya lewat token dan `className`, jangan forking perilaku.
- **Loading** memakai skeleton inline (§5.15), bukan spinner layar penuh (IA §4.0).

### 5.1 Button

**Anatomi**: `[ikon kiri] label [ikon kanan]`. Lebar: `auto` (min 96 px), `full`, `icon` (44 × 44).

| Varian | Latar | Teks | Garis | Pakai |
| --- | --- | --- | --- | --- |
| `primary` | `--action-primary` | `--text-inverse` | — | Simpan, Tandai lunas, Masuk dengan Google |
| `secondary` | `--action-primary-soft` | `--color-primary-700` | — | Salin dari bulan lalu, Coba lagi |
| `outline` | transparan | `--text-primary` | `--color-neutral-500` | Batal, Ubah |
| `ghost` | transparan | `--text-secondary` | — | Aksi baris, ikon tutup |
| `destructive` | transparan | `--color-danger-600` | `--color-danger-600` | Hapus transaksi, Hapus langganan |

| State | Perubahan |
| --- | --- |
| Default | `radius-md`, tinggi 44 px (48 px aksi utama sheet), padding `space-4`, `text-body font-medium` |
| Hover (desktop) | `primary` → `--action-primary-hover`; lain → `--surface-muted` |
| Tekan | `scale(0.98)`, `duration-fast` |
| Fokus | Cincin 2 px di luar |
| Disabled | `opacity:.45`, `cursor:not-allowed`, `aria-disabled="true"`, aksi tidak terpanggil |
| Loading | Label "Menyimpan…" + spinner 16 px, `aria-busy="true"`, lebar dikunci |
| Error | Tidak ada; galat lewat pesan field/toast |

**Mobile**: aksi utama di dasar sheet (`sticky bottom-0`, latar `--surface`, `padding-bottom: env(safe-area-inset-bottom)`). Aksi destruktif tidak pernah jadi aksi utama dasar sheet.
**Aksesibilitas**: label = kata kerja glosarium IA §7. Tombol ikon wajib `aria-label`. Ikon dekoratif `aria-hidden`.

### 5.2 Input Nominal

**Anatomi**: label wajib + bidang nominal + helper/galat + papan angka (hanya di sheet).

- Bidang: `text-amount`, rata kanan, `inputMode="numeric"`, awalan `Rp` sebagai teks redup (bukan placeholder).
- Nilai disimpan integer; pemisah ribuan ditambah saat tampil. Mengetik `25000` → `Rp25.000`.
- Papan angka: grid 3 × 4, tombol 56 px, `1-9`, `000`, `0`, hapus. Tanpa titik/koma. `000` menambah tiga nol.
- Pembanding read-only di bawah nominal: `Sisa budget kategori ini Rp150.000` (`text-small`, redup).

| State | Perilaku |
| --- | --- |
| Default | Garis `--color-neutral-500`, latar `--surface` |
| Fokus | Garis `--focus-ring` 2 px + cincin halus |
| Disabled | Latar `--surface-muted`, teks redup |
| Error | Garis `--color-danger-600` 2 px, ikon galat, pesan `text-small` |
| Loading | Bidang nonaktif, tombol "Menyimpan…" |

**Mobile**: fokus otomatis ke nominal saat sheet terbuka (A-15, FL-02). Papan angka in-sheet untuk mencapai 3 ketukan.
**Aksesibilitas**: `aria-describedby` → helper + galat. Papan angka `role="group" aria-label="Papan angka"`; tombol hapus berlabel "Hapus satu angka". Nilai dibacakan terformat ("dua puluh lima ribu rupiah").

### 5.3 Select Kategori

**Anatomi**: keping kategori (huruf awal berwarna) + nama; pilihan aktif ditandai centang, bukan hanya warna.

| Varian | Kapan |
| --- | --- |
| `chips` (sheet mobile) | Keping horizontal-scroll; urutan = frekuensi pemakaian |
| `combobox` (filter, desktop) | Radix `Command` dalam `Popover`, dengan pencarian |

| State | Perilaku |
| --- | --- |
| Default | Keping latar `--surface-muted`, huruf awal di `--cat-n` |
| Hover | Latar `--surface` + `shadow-card` |
| Terpilih | Garis 2 px `--focus-ring` + centang + `aria-pressed="true"` |
| Fokus | Cincin fokus |
| Disabled | `opacity:.45` |
| Error | Pembungkus bergaris `--color-danger-600` |
| Loading | 5 keping skeleton |

**Mobile**: keping tinggi 44 px, radius `pill`, gulir horizontal.
**Aksesibilitas**: keping = `button` `aria-pressed`; grup `role="group"` berlabel "Kategori". Opsi **Tanpa kategori** selalu ada di urutan terakhir (A-28). Bila belum ada kategori, tampil keping **Buat kategori baru** (IA §4.5).

### 5.4 Card Akun

**Anatomi**: keping jenis (T/B/E) · nama · badge **Utama** · saldo terhitung (`text-h2`, tabular) · chevron.

| Varian | Pemakaian |
| --- | --- |
| `list` | `/pengaturan/akun` — baris dengan saldo |
| `picker` | Sheet tambah transaksi — tanpa saldo, dengan centang |
| `archived` | `--surface-muted`, label "Diarsipkan", tanpa aksi ubah |

| State | Perilaku |
| --- | --- |
| Default | Kartu `radius-lg`, `shadow-card`, padding `space-4` |
| Hover | `shadow-raised` |
| Terpilih | Garis 2 px `--focus-ring` + centang |
| Fokus | Cincin fokus seluruh kartu |
| Disabled/arsip | `opacity:.6`, tidak dapat dipilih |
| Error | Baris "Akun gagal dimuat" + **Coba lagi** |
| Loading | Skeleton tinggi 72 px |

**Mobile**: satu kolom; aksi ubah/jadikan default/arsip lewat menu `⋯` 44 px.
**Aksesibilitas**: kartu = `button` bila dapat dipilih, `article` + heading nama bila hanya info. Saldo dibaca "saldo dua ratus ribu rupiah". Badge **Utama** ikut dibacakan.

### 5.5 Item Transaksi

**Anatomi**: keping kategori · kolom tengah (kategori **+** catatan satu baris) · kolom kanan (nominal bertanda + akun redup). Kelompok tanggal: judul `Hari ini` + subtotal harian.

| Varian | Perilaku |
| --- | --- |
| `default` | Pengeluaran / pemasukan |
| `transfer` | Glyph `⇄`, subteks "Tunai → BCA", nominal netral |
| `uncategorized` | Keping `cat-7` + **Tanpa kategori** |
| `deleted-category` | **Kategori dihapus** (A-23) |

| State | Perilaku |
| --- | --- |
| Default | Tinggi 64 px, `border-b` `--border` |
| Hover/tekan | Latar `--surface-muted` |
| Fokus | Cincin fokus inset |
| Loading | 6 baris skeleton 64 px |
| Error hapus | Baris tetap + toast gagal (IA §4.4) |

**Mobile**: baris dapat diketuk penuh; nominal tidak terpotong (`tabular-nums`, `whitespace-nowrap`). Catatan panjang `truncate`, teks penuh di `aria-label`.
**Aksesibilitas**: satu titik fokus per baris; `aria-label="Pengeluaran Rp25.000, Makan, Tunai, 12 Agustus"`.

### 5.6 Progress Budget

**Anatomi**: label kategori + `Terpakai Rp850.000 dari Rp1.000.000` + bilah + cap status.

| Ambang | Warna bilah | Ikon | Teks |
| --- | --- | --- | --- |
| < 75% | `--color-success-600` | — | `85%` |
| 75–99% | `--color-warning-600` | `!` | `85% · hampir habis` |
| ≥ 100% | `--color-danger-600` | `!` | `Lewat Rp50.000` |

Bilah: tinggi 8 px, radius `pill`, latar `--surface-muted`. Nilai > 100% dipotong di 100% visual; teks menyatakan kelebihan.

| State | Perilaku |
| --- | --- |
| Belum diatur | Bilah kosong + tautan **Atur budget** (bukan 0%) |
| Hover | Tidak ada; bila baris dapat diketuk, baris yang menyorot |
| Fokus | Cincin fokus pada baris |
| Loading | Bilah + label skeleton |
| Error | "Budget gagal dimuat" menggantikan angka |

**Mobile**: label dan angka dua baris agar utuh di 320 px.
**Aksesibilitas**: `role="progressbar"` + `aria-valuenow/max` + `aria-valuetext="85 persen terpakai, sisa Rp150.000"`. Status ditandai ikon `!` + kata, bukan warna saja.

### 5.7 Kartu Langganan

**Anatomi**: keping huruf awal · nama · siklus + nominal · chip `Jatuh tempo 3 hari lagi` / `Pengingat aktif` · tombol `Tandai lunas`.

| Varian | Penanda |
| --- | --- |
| `due` (≤ 7 hari) | Garis kiri 4 px `--color-warning-600`, latar `--color-warning-100`, badge `Hari ini` / `H-3` |
| `normal` | Kartu diam |
| `paid` | Badge `Lunas · berikutnya 25 Sep`, teks redup |
| `no-reminder` | Badge `Pengingat tidak aktif` + **Aktifkan pengingat** |

| State | Perilaku |
| --- | --- |
| Hover | `shadow-raised` |
| Fokus | Cincin fokus |
| Loading aksi | "Menandai…" nonaktif; kartu tidak dapat ditutup |
| Error sinkron | Badge `Pengingat tidak aktif` + bar "Sebagian pengingat gagal dibuat." + **Coba lagi** |
| Error lunas | Status kembali + toast gagal (FL-05 6a) |
| Loading | Skeleton 4 kartu |

**Mobile**: `Tandai lunas` tombol `secondary` penuh lebar di dasar kartu (44 px) — aksi tersering di layar ini.
**Aksesibilitas**: badge dibacakan "Jatuh tempo tiga hari lagi". Merah hanya untuk lewat tenggat; mendekati tenggat memakai kuning (P4).

### 5.8 Kartu Wishlist

**Anatomi**: keping ikon · nama target · `Terkumpul Rp2.500.000 dari Rp5.000.000` · bilah + persen · sisa · tenggat.

| Varian | Perilaku |
| --- | --- |
| `berjalan` | Bilah `--color-primary-600` |
| `tercapai` | Bilah `--color-success-600` penuh + badge **Tercapai**, kartu redup |
| `mendekati-tenggat` (≤ 14 hari) | Baris `Perlu Rp…/bulan` + badge tenggat |

| State | Perilaku |
| --- | --- |
| Default | Kartu `radius-lg`, padding `space-4` |
| Tekan | `scale(0.99)` |
| Loading | Skeleton 3 kartu |
| Error | "Wishlist gagal dimuat" + **Coba lagi** |

**Mobile**: satu kolom di bawah 640 px; dua kolom di ≥ 640 px.
**Aksesibilitas**: `role="progressbar"` + `aria-valuetext="50 persen dari target"`. **Tercapai** ditulis, bukan hanya hijau.

### 5.9 Kalender Budget

**Anatomi**: header bulan (`‹ Agustus 2026 ›`) · label hari `Sen–Min` · grid 7 × 6 · sel = tanggal + total pendek · ringkasan bawah (hari tertinggi, rata-rata harian, proyeksi sisa akhir bulan).

Sel: tinggi 48 px, radius `radius-sm`, angka hari dan total `text-caption` tabular.

| Varian sel | Penanda |
| --- | --- |
| `kosong` | Latar `--surface`, teks redup |
| `terpakai` | Latar `--surface-muted` + total |
| `aman` (≤ sisa harian) | Titik `--color-success-600` |
| `lewat` (> sisa harian) | Titik `--color-warning-600` |
| `hari-ini` | Garis 2 px `--focus-ring` |
| `luar-bulan` | `opacity:.35`, tidak dapat diketuk |

| State | Perilaku |
| --- | --- |
| Tekan | Latar `--surface-muted` |
| Fokus | Cincin fokus pada sel |
| Loading | Skeleton grid (42 kotak) |
| Error | "Kalender gagal dimuat" + **Coba lagi**; tombol kembali tetap aktif |

**Mobile**: grid lebar penuh, gutter 2 px, tanpa gulir horizontal.
**Aksesibilitas**: `role="grid"`; tiap sel `aria-label="12 Agustus, pengeluaran Rp85.000, dalam batas"`; status lewat teks, bukan titik saja; navigasi panah.

### 5.10 Tabs

**Anatomi**: deretan label; aktif = garis bawah 2 px `--focus-ring` + `--text-primary`; nonaktif `--text-secondary`.

| Varian | Pakai |
| --- | --- |
| `underline` | Sub-tab: `Budget Bulanan` \| `Kalender` (IA §3.2) |
| `segmented` | Filter jenis: `Semua` \| `Pengeluaran` \| `Pemasukan` \| `Transfer` |

| State | Perilaku |
| --- | --- |
| Hover | Teks → `--text-primary` |
| Fokus | Cincin fokus (Radix `Tabs.Trigger`) |
| Disabled | Tidak dipakai; tab tak relevan disembunyikan |
| Loading | Tidak ada (isi memakai skeleton) |

**Mobile**: `segmented` dapat digulir horizontal di 320 px; tinggi 44 px.
**Aksesibilitas**: Radix Tabs memberi `role="tablist"`, `aria-selected`, navigasi panah. Label memakai glosarium.

### 5.11 Dialog

**Anatomi**: judul · deskripsi satu kalimat · isi · baris aksi kanan (Batal · Aksi utama).

- Mobile (< 768 px): bottom sheet `radius-xl` atas + `shadow-sheet`. Satu pola lapisan untuk semua aksi.
- Desktop (≥ 768 px): modal tengah, `max-w-[420px]`, `radius-xl`, `shadow-raised`.

| State | Perilaku |
| --- | --- |
| Default | Overlay `rgba(28,25,23,.45)` |
| Loading | Aksi utama "Menyimpan…" nonaktif; dialog tidak dapat ditutup (IA §4.5) |
| Error | Pesan galat di dalam dialog; isian utuh; tombol aktif kembali |
| Konfirmasi destruktif | Judul menyebut objek ("Hapus transaksi?"); aksi kanan `destructive` |

**Mobile**: tarik-turun membatalkan **hanya** bila belum ada perubahan tersimpan.
**Aksesibilitas**: Radix `Dialog` + `aria-labelledby`/`describedby`; fokus awal ke field pertama; fokus terperangkap; `Esc` menutup kecuali sedang menyimpan; fokus kembali ke pemicu.

### 5.12 Toast

**Anatomi**: ikon status · pesan satu baris · aksi opsional (`Coba lagi`) · tutup.

| Varian | Ikon | Contoh |
| --- | --- | --- |
| `sukses` | `--color-success-600` | "Transaksi tersimpan." |
| `info` | `--text-secondary` | "Budget disalin dari bulan lalu." |
| `peringatan` | `--color-warning-600` | "Sebagian budget gagal disalin." |
| `galat` | `--color-danger-600` | "Gagal menyimpan. Coba lagi." |

- Mobile: di atas bottom tab (offset 72 px + safe area). Desktop: kanan bawah.
- Durasi: 4 s (info), 6 s (galat/peringatan), tetap bila ada aksi. Maksimal 2 toast.

**Aksesibilitas**: `role="status"` `aria-live="polite"` untuk sukses/info; `role="alert"` untuk galat. Teks tidak dipotong; `Coba lagi` dapat difokus.

### 5.13 Badge Status

**Anatomi**: `text-caption` + ikon opsional; radius `pill`; padding `space-1`/`space-2`.

| Varian | Latar | Teks | Pakai |
| --- | --- | --- | --- |
| `sukses` | `--color-success-100` | `--color-success-900` | Lunas, Tercapai, Pengingat aktif |
| `peringatan` | `--color-warning-100` | `--color-warning-900` | H-3, Jatuh tempo, Hampir habis |
| `bahaya` | `--color-danger-100` | `--color-danger-900` | Lewat tenggat, Lewat budget |
| `netral` | `--surface-muted` | `--text-secondary` | Tunai, Bulanan, Diarsipkan |
| `kategori` | `--surface-muted` | `--text-primary` | dengan keping `--cat-n` di kiri |

**Aksesibilitas**: badge selalu memuat kata status, bukan ikon saja.

### 5.14 Empty State

**Anatomi**: ilustrasi garis 64 px (opsional) · judul satu kalimat · penjelas satu kalimat · satu tombol utama.

| Konteks | Judul | Tombol |
| --- | --- | --- |
| Ringkasan tanpa transaksi | Belum ada catatan bulan ini. | **Catat transaksi** |
| Ringkasan tanpa budget | Budget belum diatur. | **Atur budget** |
| Transaksi | Belum ada transaksi. | **Catat transaksi** |
| Filter kosong | Tidak ada transaksi dengan filter ini. | **Hapus filter** |
| Langganan | Belum ada langganan. | **Tambah langganan** |
| Wishlist | Belum ada wishlist. | **Tambah wishlist** |
| Analisis | Belum ada pengeluaran untuk dianalisis. | **Catat transaksi** |
| Pemasukan | Belum ada pemasukan tercatat bulan ini. | **Catat pemasukan** |

Aturan: satu aksi saja (P5; IA §1 P3). Tanpa emoji. Nada suportif (§8).

### 5.15 Skeleton

**Anatomi**: blok `--surface-muted`, `radius-sm`, animasi `skeleton` (opacity 1 → .55, 1.4 s).

| Konteks | Ukuran |
| --- | --- |
| Kartu ringkasan | 96 px × 100% (4 buah) |
| Baris transaksi | 64 px × 100% (6 buah) |
| Kartu langganan/wishlist | 88 px × 100% |
| Grid kalender | 42 sel × 48 px |
| Grafik | kotak `aspect-video` + 4 baris legenda 16 px |
| Judul | 60% × 20 px |

Skeleton meniru ukuran akhir (tanpa lompatan tata letak). Kontainer `aria-busy="true"`; skeleton `aria-hidden`.

### 5.16 Bottom Sheet Tambah Transaksi

**Anatomi** (atas ke bawah):
1. Gagang tarik (36 × 4 px, `--border-strong`).
2. Header: **Tambah transaksi** + tombol tutup 44 px.
3. Segmented jenis: `Pengeluaran` · `Pemasukan` · `Transfer` (default Pengeluaran, A-15).
4. Bidang nominal besar (`text-amount`) + pembanding sisa budget kategori.
5. Keping kategori (gulir horizontal); untuk Transfer diganti dua pemilih akun.
6. Pemilih akun (default akun terakhir dipakai); Transfer: Akun asal → Akun tujuan.
7. Tanggal (chip `Hari ini`, dapat ditekan membuka kalender input §5.18).
8. Catatan satu baris (opsional).
9. Papan angka 3 × 4 menempel di dasar, di atas aksi.
10. **Simpan** penuh lebar (desktop: **Simpan & tambah lagi**).

| State | Perilaku |
| --- | --- |
| Default | Tinggi maks `92dvh`, isi dapat digulir, papan angka tetap |
| Fokus awal | Bidang nominal (A-15) |
| Loading | "Menyimpan…"; sheet terkunci (tidak dapat ditutup/ditarik) |
| Error validasi | Pesan di bawah field, `aria-invalid`, sheet tetap |
| Error jaringan | Toast galat; isian utuh; tombol aktif kembali |

**Mobile**: aksi di dasar, tombol papan angka 56 px. Desktop: `Ctrl+Enter` menyimpan.
**Jalur 3 ketukan (FL-02)**: **+** → chip nominal cepat → **Simpan**.
**Aksesibilitas**: Radix `Dialog` mode sheet; fokus terperangkap; `Esc` menutup bila tidak menyimpan; label field selalu terlihat; papan angka tidak memicu keyboard sistem.

### 5.17 Bottom Navigation & FAB

- Bottom tab 5 item (IA §3.1), tinggi 56 px + safe area, latar `--surface`, garis atas `--border`.
- Item: ikon 24 px + label `text-caption`; aktif `--action-primary` + label tebal; nonaktif `--text-muted`.
- FAB 56 × 56 px, `radius-pill`, `--action-primary`, ikon tambah, `shadow-raised`, posisi `bottom:72px; right:16px`. Disembunyikan saat sheet terbuka, di `/masuk*`, dan di `/transaksi/baru` (IA §3.3).
- Aksesibilitas: tab dalam `nav` + `aria-current="page"`; FAB `aria-label="Tambah transaksi"`.

### 5.18 Kalender Input Tanggal

- Radix `Popover` + react-day-picker, `radius-lg`, `shadow-raised`.
- Sel 44 × 44 px; hari terpilih `--action-primary` + teks putih; hari ini bergaris `--focus-ring`.
- Tanpa pemilih jam. Batas tanggal lampau = konfigurasi (Q-01).
- Aksesibilitas: navigasi panah, `aria-label` penuh (`Selasa, 12 Agustus 2026`), tombol `‹ Bulan sebelumnya` / `Bulan berikutnya ›`.

---

## 6. Pola Grafik

Library: Recharts (bawaan shadcn/ui `ChartContainer`). Konfigurasi warna lewat `ChartConfig` → `var(--cat-n)`. Tidak ada gradien; garis 2 px; tanpa animasi masuk kecuali `duration-slow` sekali.

### 6.1 Aturan umum

| Aturan | Detail |
| --- | --- |
| Label sumbu | `text-caption` `--text-muted`. Nominal dipendekkan (`Rp1,2 jt`). Tanggal `Agu`, `Sep`. |
| Grid | Hanya garis horizontal, `--border`, 1 px. Tanpa garis vertikal. |
| Warna | Kategori memakai `--cat-n` (§3). Seri tunggal (tren) memakai `--action-primary`. Tidak memakai warna semantik income/expense di dalam donat kategori (menghindari salah baca). |
| Tooltip | Kartu `radius-md`, `shadow-raised`, `--surface`, berisi: nama kategori, nominal penuh (`Rp1.250.000`), persentase. Selalu memakai angka penuh, bukan pendek. |
| Interaksi | Ketuk/klik irisan atau batang → `/transaksi` terfilter (IA §4.14). Target sentuh ≥ 44 px; pada mobile, legenda juga dapat diketuk. |
| Data kosong | Bukan grafik kosong: tampil empty state §5.14. |
| Aksesibilitas | Setiap grafik punya tabel alternatif yang tersembunyi secara visual (`sr-only`) berisi kategori + nominal + persen. `role="img"` + `aria-label` ringkas ("Donat pengeluaran Agustus, 5 kategori, terbesar Makan Rp1.250.000"). |
| Warna saja tidak cukup | Selalu ada label kategori di legenda + nilai. |

### 6.2 Donat kategori

| Aspek | Aturan |
| --- | --- |
| Ukuran | Tinggi 220 px mobile, 260 px desktop; ketebalan cincin 22 px; lubang tengah memuat total (`text-h3` + `text-amount`). |
| Irisan | Maksimal 6 berwarna + `Lainnya` (`cat-7`). Urut menurun. |
| Label | Tidak ada label di irisan. Legenda di bawah: keping warna + nama + nominal + persen (tabel 2 kolom). |
| Tooltip | Nama · `Rp850.000` · `34% dari pengeluaran`. |
| Mode hover | Irisan lain `opacity:.6`. |

### 6.3 Batang tren bulanan

| Aspek | Aturan |
| --- | --- |
| Data | 6 bulan terakhir, satu seri pengeluaran (opsional seri pemasukan dengan `--cat-1`). |
| Batang | Lebar maks 28 px, radius atas `radius-sm`, `--action-primary`. |
| Sumbu Y | 3 garis bantu. Label dipendekkan. |
| Sorotan | Bulan aktif diberi latar kolom `--surface-muted`. |
| Tooltip | `Agustus 2026 · Pengeluaran Rp4.250.000 · Pemasukan Rp8.500.000` + selisih. |
| Mobile | Batang ≥ 20 px; bila 6 bulan tidak muat, gulir horizontal tanpa memotong label. |

### 6.4 Garis saldo

| Aspek | Aturan |
| --- | --- |

---

## 7. Layout & Breakpoint

Mobile-first. Kelas dasar = mobile; perluas dengan `md:`/`lg:`.

| Breakpoint | Lebar | Kerangka | Grid konten | Catatan |
| --- | --- | --- | --- | --- |
| `base` | 320–639 | Bottom tab + FAB, padding tepi 16 px | 1 kolom | Minimum yang diuji: 360 px |
| `sm` | ≥ 640 | Bottom tab, konten `max-w-page` (640 px) di tengah | 2 kolom kartu wishlist/akun | Tablet kecil |
| `md` | ≥ 768 | Sidebar 240 px (dapat dilipat 72 px ikon), bottom tab hilang | 2–3 kolom | Desktop sempit |
| `lg` | ≥ 1024 | Sidebar tetap 240 px, konten `max-w-app` (1200 px) | Tabel padat Transaksi/Analisis/Pemasukan (IA §1 P2) | Kolom "Akun" muncul di baris transaksi |
| `xl` | ≥ 1280 | Sama dengan `lg`; konten tetap 1200 px | Kolom samping ringkasan di Analisis | Tidak melebar tanpa batas |

Aturan:
- **Area sentuh** ≥ 44 × 44 px di semua breakpoint; papan angka 56 px.
- **Jarak antar target** ≥ 8 px; tinggi baris minimum 44 px.
- **Padding tepi**: 16 px mobile, 24 px `md`, 32 px `lg`.
- **Safe area**: `padding-bottom: calc(56px + env(safe-area-inset-bottom))` untuk konten ber-bottom-tab.
- **Zona ibu jari**: aksi primer dan FAB di 25% bawah layar mobile.
- **Tanpa gulir horizontal** di 320 px; keping kategori dan segmented tab dikecualikan (gulir internal).
- **Dasbor < 2 detik** (A-07): kartu ringkasan dirender dulu dari sheet `Ringkasan`; daftar transaksi menyusul dengan skeleton (IA §4.3).

---

## 8. Panduan Konten

### 8.1 Nada

| Prinsip | Lakukan | Hindari |
| --- | --- | --- |
| Netral | "Rp25.000 tercatat." | "Wah, boros juga ya!" |
| Ringkas | "Gagal menyimpan. Coba lagi." | "Maaf, terjadi kesalahan tak terduga pada sistem kami…" |
| Konkret | "Pilih kategori." | "Input tidak valid." |
| Tanpa menyalahkan | "Budget Makan lewat Rp50.000." | "Anda gagal menahan pengeluaran." |
| Baku, sapaan "Anda" | "Anda bisa ubah di Data & Koneksi." | "Kamu", "gue", "lo" |
| Satu istilah per konsep | Glosarium IA §7 | "limit", "spending", "goal" |

### 8.2 Contoh pesan galat

| Konteks | Pesan |
| --- | --- |
| Nominal kosong/0 | Isi nominal lebih dari 0. |
| Batas budget 0 | Isi batas lebih dari 0. |
| Kategori wajib belum dipilih | Pilih kategori. |
| Akun asal = tujuan | Akun asal dan tujuan harus berbeda. |
| Nama target kosong | Beri nama target. |
| Duplikat | Nama akun sudah dipakai. / Kategori ini sudah ada. |
| Tenggat lampau | Pilih tanggal setelah hari ini. |
| Belum ada akun | Belum ada akun. Tambahkan akun dulu. |
| Gagal simpan | Gagal menyimpan. Coba lagi. |
| Gagal hapus | Gagal menghapus. Coba lagi. |
| Gagal muat | Gagal memuat data. Periksa koneksi lalu coba lagi. |
| Sesi berakhir | Sesi berakhir. Masuk lagi untuk melanjutkan. |
| Izin dicabut | Izin Google Drive dibutuhkan. Beri izin lagi. |
| Rate limit | Terlalu banyak permintaan. Tunggu sebentar. |
| Spreadsheet hilang | Spreadsheet tidak ditemukan. Hubungkan ulang atau buat baru. |
| Calendar gagal | Langganan tersimpan, tetapi pengingat gagal dibuat. |
| Data belum siap | Ringkasan bulan ini gagal dimuat. |

Aturan: pesan tidak memuat kata "error", "kesalahan sistem", atau kode HTTP. Sertakan langkah berikutnya bila ada.

### 8.3 Empty state & teks pengingat

| Konteks | Teks |
| --- | --- |
| Onboarding 1 | Akun "Tunai" sudah siap. Anda bisa mengubahnya nanti. |
| Onboarding 2 | Catat pengeluaran pertama Anda. |
| Onboarding 3 | Atur budget bulan ini agar sisa uang lebih terkendali. |
| Banner tagihan | Langganan film jatuh tempo 3 hari lagi. |
| Banner pengingat nonaktif | Pengingat langganan nonaktif. Aktifkan di Data & Koneksi. |
| Pratinjau pengingat | Pengingat tiap tanggal 25, 3 hari sebelum dan pada hari-H. |
| Budget hampir habis | Budget Makan 85% terpakai. Sisa Rp150.000. |
| Budget terlampaui | Budget Makan lewat Rp50.000. |
| Lunas | Tagihan ditandai lunas. Berikutnya 25 Sep. |
| Wishlist tercapai | Target "Dana darurat laptop" tercapai. |
| Bantuan hitung | Perlu disisihkan Rp500.000/bulan agar tercapai 25 Des 2026. |
| Simpan berhasil | Transaksi tersimpan. |

### 8.4 Mikroteks kontrol

| Kontrol | Teks |
| --- | --- |
| Tombol simpan | Simpan |
| Sedang simpan | Menyimpan… |
| Muat ulang | Coba lagi |
| Hapus | Hapus transaksi |
| Konfirmasi hapus | Hapus transaksi ini? Tindakan ini tidak bisa dibatalkan. |
| Tambah | Tambah transaksi / Tambah langganan / Tambah wishlist |
| Sakelar pengingat | Buat pengingat di Google Calendar |

| Data | Saldo kumulatif per hari dalam bulan aktif (sisa uang berjalan). |
| Garis | 2 px `--action-primary`, tanpa titik pada tiap data. |
| Titik | Hanya titik terakhir + label nilai (`Rp…`). |
| Area | Isian `--color-primary-100` `opacity:.35`, tanpa gradien. |
| Tooltip | Tanggal penuh + `Sisa uang Rp3.750.000`. |
| Catatan | Grafik ini **tidak** dipakai di Ringkasan MVP (risiko > 2 detik, A-07); dipakai di Analisis bila data ringkasan harian tersedia. |


---

## 9. Berkas Tambahan

### 9.1 `docs/tokens.css`

Memuat seluruh nilai §2–§3: primer, netral, semantik, 12 warna kategori (+ versi gelap), peran semantik (`--background`, `--surface`, `--action-primary`, `--amount-income`, …), tipografi, spasi, radius, bayangan, durasi/easing, dan helper `.cat-1` … `.cat-12` yang menetapkan `--cat-color`.

Impor **sebelum** direktif Tailwind:

```css
@import "../docs/tokens.css";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 9.2 `tailwind.config.ts`

Memetakan token ke util (`bg-surface`, `text-content-secondary`, `border-border`, `text-amount`, `text-income`, `bg-expense-surface`, `text-cat-3`, `border-border-strong`), menambah `spacing.touch/control`, `borderRadius.pill`, `boxShadow.card/raised/sheet`, `animation.sheet-in/sheet-out/skeleton/toast-in`, `screens` §7, dan `darkMode: ["selector", '[data-theme="dark"]']`.

Kompatibilitas shadcn/ui: komponen bawaan memakai `bg-background`, `text-foreground`, `border-input`, `ring-ring`. Tambahkan alias ini ke `theme.extend.colors`:

```ts
foreground: "var(--text-primary)",
muted: { DEFAULT: "var(--surface-muted)", foreground: "var(--text-secondary)" },
input: "var(--border)",
ring: "var(--focus-ring)",
card: { DEFAULT: "var(--surface)", foreground: "var(--text-primary)" },
```

### 9.3 Checklist implementasi

| # | Cek | Sumber |
| --- | --- | --- |
| 1 | Tidak ada hex di komponen (`grep -r "#[0-9A-Fa-f]\{6\}" components/`) | §2 |
| 2 | Semua nominal lewat `formatIDR()` | §4.1 |
| 3 | Semua tombol/tautan ≥ 44 px | §7 |
| 4 | Setiap grafik punya tabel `sr-only` | §6.1 |
| 5 | Setiap empty state hanya satu CTA | §5.14 |
| 6 | Status tidak hanya warna (ada ikon/kata) | §4.2, §5.6 |
| 7 | Kontras diuji ulang bila token berubah | §2.1 |
| 8 | Jalur 3 ketukan terverifikasi di 360 px | §5.16, FL-02 |

---

## 10. Asumsi Baru

| ID | Asumsi |
| --- | --- |
| D-01 | Tipografi memakai Inter (variabel); fallback system. Font di-host sendiri. |
| D-02 | Primer teal `#0F766E` dipilih karena lolos AA 4.79:1 untuk teks putih; bukan hasil riset merek. |
| D-03 | Nominal dibaca/ditulis integer rupiah tanpa desimal di semua permukaan, termasuk grafik (A-08). |
| D-04 | Chip nominal cepat (`5.000`, `10.000`, `25.000`) diambil dari 3 nominal tersering pengguna; disembunyikan bila belum ada riwayat. |
| D-05 | Dialog mobile memakai pola bottom sheet agar konsisten dengan sheet tambah transaksi; tanpa modal tengah di mobile. |
| D-06 | Recharts + shadcn `ChartContainer` adalah library grafik tunggal. |
| D-07 | `Rp` tanpa spasi mengikuti format aplikasi Android acuan; prosa boleh berspasi. |
| D-08 | Warna kategori disimpan sebagai indeks palet (`1–12`) di sheet `Kategori`, bukan hex, agar mode gelap dapat ditukar. |

---

## 11. Pertanyaan Terbuka

| ID | Pertanyaan | Terkait |
| --- | --- | --- |
| DQ-01 | Apakah chip nominal cepat perlu untuk mencapai 3 ketukan, atau papan angka sudah cukup? | D-04, FL-02 |
| DQ-02 | Apakah mode gelap masuk MVP berikutnya, dan mengikuti `prefers-color-scheme` atau sakelar manual? | A-10, Q-08 |
| DQ-03 | Apakah grafik garis saldo perlu di Analisis MVP bila ringkasan harian belum tentu ada di sheet pra-komputasi? | §6.4, A-07 |
| DQ-04 | Berapa maksimum kategori agar palet 12 warna cukup tanpa pengulangan `cat-7`? | §3, IA §4.17 |
| DQ-05 | Perlukah nominal negatif (koreksi saldo)? Bila ya, aturan tanda §4.2 direvisi. | §4.2, IA Q-01 |
| DQ-06 | Perlukah kontrol ukuran font pengguna, mengingat skala tipografi tetap? | §2.3 |
