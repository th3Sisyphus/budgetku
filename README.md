# BudgetKu

Aplikasi web perencana anggaran pribadi — mobile-first, bahasa Indonesia, IDR.

Data disimpan di Google Sheets milik pengguna. Tidak ada database server.

## Memulai

Salin `.env.example` ke `.env.local` dan isi variabel yang diperlukan.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Perintah

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build produksi |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Vitest |
| `npm run test:watch` | Vitest watch |
| `npm run test:coverage` | Coverage report |
| `npm run test:e2e` | Playwright E2E |
| `npm run format` | Prettier |

## Dokumentasi

Lihat folder `docs/` untuk PRD, arsitektur, dan panduan desain.
