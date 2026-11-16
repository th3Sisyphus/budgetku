"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main>
      <h1>Terjadi galat</h1>
      <button onClick={reset}>Coba lagi</button>
    </main>
  );
}
