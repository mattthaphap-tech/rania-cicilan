# Calonnya Cicilan — v1 (kit: Three.js + Remotion)

Video: `src/videos/02_rania_cicilan/` · 9:16 · 30 fps · 104,9 detik · audio sudah jadi (`public/rania/mix.mp3`, −14 LUFS).

## Cara render (di komputermu sendiri)
1. Pasang Node.js LTS (nodejs.org).
2. **Mac:** klik dua kali `render.command` → Enter (video default = Rania) → pilih 1 (preview 540x960) atau 2 (Full HD).
   **Windows/Linux:** buka terminal di folder `code`, lalu:
   `npm install` → `npm run gates` → `npm run preview` (hasil: `out/preview.mp4`).
   Full HD: `npx remotion render src/index.ts Video out/rania_full.mp4 --codec h264 --concurrency=2`
3. Edit langsung: `npm run studio`.

## Isi
- 6 karakter baru di `src/engine/chars/charparts.ts`: rania, rina (sanggul besar), dewi (hijab), budi (botak, kumis), nenek, katering (topi + celemek).
- Set 3D: halaman rumah, meja prasmanan, balon, banner "75" + 7 mini-set untuk close-up benda (THR, cangkir teh, kartu tally, papan TENDA/KATERING/SOUND SYSTEM, nota yang menyala, kalender, gelembung "kapan nikah?").
- Struktur sama dengan versi 2D: 3 "dunia" pembuka (Lebaran/nikahan/arisan) → satu ruangan → "Semua diam" (musik berhenti mati) → nota → "Cicilan" → balikan di akhir.
- Teks/caption dari narasimu (timing kata dihitung dari suara narator, `tools/build_timeline.py`).
- Suara: narator + musik sintetis + foley kecil + hawa ruangan (`tools/make_audio.py`).

## Yang SUDAH dicek di sini
- Type-check file video baru; logic gate (orang menembus orang/dinding/meja) = **0 masalah di 3147 frame**; audio −14,3 LUFS, jeda sunyi 59,7–60,5 s terukur.

## Yang BELUM bisa dicek di sini (tidak ada internet / three.js)
- **Framing gates** (wajah terpotong, kamera di dalam benda) dan **render sebenarnya** belum dijalankan. Kalau `npm run gates` menampilkan error, kirim teks error-nya ke saya; saya perbaiki sebagai v2 (v1 tetap disimpan).
- Tampilan hijab Tante Dewi, sanggul Tante Rina, dan posisi gelembung "?" saya gambar tanpa melihat hasilnya; mungkin perlu disetel.

## Setelan cepat
- Waktu shot: `tools/build_timeline.py` (daftar `SHOTS`) lalu jalankan ulang skripnya. Kamera: `takes.ts`. Akting: `stage.ts` (`TR`). Warna/properti: `set.tsx`.
