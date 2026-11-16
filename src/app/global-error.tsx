"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="id">
      <body>
        <main>
          <h1>Terjadi galat</h1>
          <button onClick={reset}>Coba lagi</button>
        </main>
      </body>
    </html>
  );
}
