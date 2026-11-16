# AGENTS.md — Panduan Agen AI untuk BudgetKu

Panduan singkat dan mengikat untuk agen coding (Claude Code, Cursor, Codex) di repo ini.

## 1. Ringkasan Proyek

Aplikasi web perencana anggaran pribadi: mobile-first, bahasa Indonesia, IDR.
Data keuangan disimpan di **satu Google Sheets milik pengguna** (scope `drive.file`); tidak ada DB server.
Backend = route handler Next.js tipis yang memanggil Google API (Sheets, Drive, Calendar).
Login Google OAuth; pengingat langganan = event Calendar berulang + reminder.
Rujukan wajib: `docs/prd.md` (FR/NFR/BR), `docs/information-architecture.md` (IA), `docs/design-system.md` (DS), `docs/tech-stack.md` (AR), `docs/db-schema.md`.

## 2. Perintah Penting

```bash
npm ci                      # install
npm run dev                 # dev server
npm run build               # build produksi
npm run lint                # eslint
npm run typecheck           # tsc --noEmit
npm run test                # vitest run
npm run test:watch          # vitest watch
npm run test:coverage       # vitest run --coverage
npm run test:e2e            # playwright
npm run format              # prettier --write .
```

Belum ada `package.json` di repo. Saat membuatnya, pakai nama script persis di atas. Jangan menambah script baru tanpa alasan.

## 3. Struktur Folder & Penempatan File Baru

```
src/app/(auth)/**                 halaman masuk, izin, galat
src/app/(app)/**                  halaman aplikasi (/, transaksi, budget, ...)
src/app/api/<resource>/route.ts   endpoint tipis per resource
src/components/ui/**              primitif netral (Button, Sheet, Amount)
src/components/layout/**          BottomNav, FAB, DueBanner
src/components/features/**        komponen per fitur
src/lib/google/**                 OAuth, klien Google, retry, errors
src/lib/sheets/**                 schema, bootstrap, mapper, cache, migrate
src/lib/sheets/repositories/**    satu *.repo.ts per sheet
src/lib/calendar/**               mapping RRULE, sync, reconcile
src/lib/domain/**                 fungsi murni BR-01..BR-30
src/lib/validation/**             skema Zod
src/lib/server/**                 session, withUser, ratelimit, responses
src/hooks/**                      hook klien
src/types/**                      sheets.ts, api.ts, auth.ts
tests/{unit,integration,e2e}/**
apps-script/**                    skrip terpasang di spreadsheet pengguna
```

Aturan:
- Halaman baru → di bawah `src/app/(app)/`, ikuti rute IA §2.2.
- Tipe baris sheet hanya di `src/types/sheets.ts`.
- Logika bisnis hanya di `src/lib/domain/`. Jangan menghitung ulang di komponen atau route.
- File > 300 baris wajib dipecah; komponen fitur ke `components/features/<fitur>/`.

## 4. Konvensi Kode

- TypeScript strict; jangan pakai `any`, `as unknown as`, atau `@ts-ignore`.
- File & ekspor lib/domain = `kebab-case`; komponen React = `PascalCase`.
- Import absolut via `@/` (contoh `@/lib/domain/money`). Tanpa rantai `../../`.
- Server Component = default. Tambahkan `"use client"` hanya bila butuh state/event/browser API.
- Grafik (Recharts) wajib `next/dynamic({ ssr: false })` + skeleton.
- Route yang menyentuh Google wajib `export const runtime = "nodejs"`.
- Modul `lib/google`, `lib/sheets`, `lib/calendar`, `lib/server` wajib `import "server-only"`.
- **Validasi Zod di setiap batas data**: payload masuk (route), baris keluar Google (mapper), response API (klien). Tidak ada data mentah yang dipakai langsung.
- Semua teks UI berbahasa Indonesia sesuai glosarium IA §7. Dilarang "Dashboard", "Spending", "Reminder".

## 5. Aturan Data (WAJIB)

1. Nominal rupiah = **integer**. Tanpa float, tanpa desimal.
2. ID = UUID v4 string, dibuat server. Jangan pakai nomor baris Sheets sebagai ID.
3. Hapus = **lunak** (`deleted_at` terisi) untuk `Transactions` & `Subscriptions`; baris terhapus diabaikan di semua total.
4. Saldo, sisa budget, total per kategori **dihitung, tidak disimpan**. Satu-satunya cache: sheet `Summary`.
5. Seluruh akses Sheets **hanya** lewat `src/lib/sheets/repositories/**`. Tidak ada `google.sheets(...)` di luar folder itu.
6. Dilarang memanggil Google API langsung dari komponen UI. Alur: komponen → hook/route → repo.
7. Upsert `Budgets` berkunci `month + category_id`. `append` untuk upsert DILARANG (buat baris ganda).
8. Baca Sheets maksimal 1 `batchGet` per permintaan halaman; 0 panggilan Google di dalam loop baris.
9. Semua tulis idempoten (NFR-30). `append` selalu membawa `id` dari server.
10. Format uang hanya lewat `lib/domain/money.ts` (`formatIDR`, `parseIDRInput`).

## 6. Aturan Keamanan

- Token OAuth **tidak pernah** ke `localStorage`/`sessionStorage`/cookie non-HttpOnly.
- Tidak ada secret di kode klien. Hanya `NEXT_PUBLIC_*` boleh sampai ke klien, dan tidak untuk token.
- Jangan log data keuangan: nominal, nama kategori/akun, isi catatan, email. Log hanya ID ter-hash, endpoint, status, durasi.
- Scope OAuth minimal: login awal `openid email profile drive.file`; `calendar.events` diminta inkremental.
- Tidak ada endpoint yang menerima `spreadsheetId` dari klien; rujukan selalu dari sesi (NFR-13).
- Pesan galat ke pengguna berbahasa Indonesia tanpa detail internal/stack trace.

## 7. Aturan Calendar

- Setiap `Subscription` dan `Wishlist` yang punya jatuh tempo dan diaktifkan pengingatnya wajib menyimpan `calendar_event_id`; baris `Reminders` mencerminkan event yang sama.
- Event dibuat dengan `RRULE` (Bulanan/Tahunan), `useDefault=false`, 2 override reminder (4320 & 0 menit), event sepanjang hari.
- **Ubah** data ber-event → `events.patch` (RRULE/summary). `insert` ulang DILARANG (pengingat ganda).
- **Hapus** data ber-event → `events.delete`, lalu kosongkan `calendar_event_id` + `reminder_status=inactive`.
- Urutan tulis selalu **Sheets dulu, Calendar kemudian** (AR-04). Kegagalan Calendar tidak membatalkan baris Sheets.
- Status `active` hanya setelah `events.get` mengembalikan 200 dengan `recurrence` + 2 reminder. Dilarang menandai aktif keliru.
- Tandai lunas (FR-35) **tidak** mengubah event.

## 8. Aturan UI

- Ikuti design system: warna/tipografi/spasi hanya dari `docs/tokens.css` & `tailwind.config.ts`. Tanpa nilai literal (`#fff`, `p-[13px]`).
- Setiap data wajib punya **3 state**: loading (skeleton), empty (pesan + aksi), error (pesan + **Coba lagi**). Tidak ada spinner tanpa akhir.
- Aksesibel: target sentuh ≥ 44×44 px, fokus terlihat, `aria-live` untuk toast/galat, tanpa informasi yang hanya lewat warna, satu `<h1>` per halaman, `lang="id"`.
- Mobile-first 320–414 px tanpa scroll horizontal; desktop ≥ 1024 px pakai sidebar.
- Ikon hanya dari `lucide-react`.

## 9. Aturan Pengujian

- Logika keuangan & tanggal wajib punya unit test: `lib/domain/**` (BR-01..BR-30) dan `lib/sheets/mapper.ts`.
- Setiap BR-xx punya minimal satu uji yang menyebut ID-nya di judul (`"BR-17: 31 Jan → 28 Feb 2026"`).
- **Mock Google API di semua uji.** Tanpa network nyata; fixture di `tests/fixtures/google/*.json`.
- Uji waktu deterministik: suntik `TZDate`/fake clock. Jangan bergantung pada `Date.now()` nyata.
- Cakupan minimum: `lib/domain` ≥ 90%, `lib/sheets` ≥ 75%, total ≥ 70%.
- Perbaikan bug = tambahkan uji reproduksi lebih dulu.

## 10. Definition of Done

- `npm run typecheck`, `npm run lint`, `npm run test` lulus.
- Validasi Zod ada di batas data baru; tipe di `src/types/` diperbarui.
- 3 state UI (loading/empty/error) ada untuk data baru.
- Aksesibilitas dasar: fokus, label, `aria-live` pada galat.
- Tidak ada data keuangan di log; tidak ada token di klien.
- Bila menyentuh skema Sheets: migrasi idempoten + `schema_version` naik + `docs/db-schema.md` diperbarui.
- Bila menyentuh Calendar: patch/delete event sesuai §7 dan idempoten.
- Uji baru menyertai perubahan; ringkasan perubahan ditulis jujur (termasuk yang belum diuji).

## 11. DILARANG

- Menambah dependensi tanpa alasan tertulis di PR.
- Upgrade `tailwindcss` ke v4 (merusak token DS).
- `runtime = "edge"` pada route yang menyentuh Google API.
- `append` untuk upsert; menulis `Budgets` tanpa kunci gabungan.
- Menyimpan saldo/total hasil hitung ke sheet selain `Summary`.
- Hapus permanen kategori/akun yang pernah dipakai (pakai arsip).
- `deleteDimension` untuk hapus baris (merusak indeks baris).
- Mengubah skema sheet tanpa migrasi + `schema_version` naik.
- Memanggil `google.sheets`/`events.*` di komponen atau route langsung.
- Memakai `any`, `@ts-ignore`, atau mematikan aturan lint tanpa komentar alasan.
- Menambah fitur non-MVP (lampiran, CSV, multi mata uang, Web Push, email ringkasan) tanpa persetujuan.
- Menaruh token, `refresh_token`, atau data transaksi di log/analitik.
- Mengubah label UI di luar glosarium IA §7.

## 12. Alur Kerja Agen

1. **Baca** PRD bagian terkait (FR/NFR/BR), IA halaman terkait, dan `docs/tech-stack.md` §3 sebelum menyentuh kode.
2. **Rencana singkat** (≤ 5 baris): file yang diubah, data yang disentuh, risiko. Perubahan > 1 file tanpa rencana = jangan lanjut.
3. **Ubah sekecil mungkin**: satu tujuan per PR. Tanpa refactor sampingan.
4. **Jalankan** `npm run typecheck`, `npm run lint`, `npm run test` (dan `test:e2e` bila menyentuh UI/alur).
5. **Ringkas** perubahan: file, alasan, apa yang diuji, apa yang belum, rujukan FR/BR.

### 12.1 Sub-agen opsional (bila dipakai)

| Peran | Tugas | Batas (tidak boleh) |
| --- | --- | --- |
| Perencana | Baca PRD/IA/tech-stack, pecah tugas, sebut FR/BR yang terkena | Menulis kode; mengubah skema |
| Pengimplementasi | Tulis kode sesuai rencana; tambah Zod + 3 state UI | Menambah dependensi; ubah skema tanpa migrasi |
| Penguji | Tulis/jalankan unit + integrasi dengan mock Google; cek cakupan | Mengubah perilaku produksi agar uji lulus |
| Peninjau keamanan | Cek token, secret, PII di log, scope OAuth, IDOR, rate limit | Merge; menurunkan standar keamanan |

Handoff wajib menyertakan: daftar file, rujukan FR/BR, hasil perintah, dan risiko terbuka.
