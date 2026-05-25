# Skenario Uji Manual — CekHP

Sistem Pakar Diagnosa Kerusakan Smartphone Produksi Cina  
Metode: Forward Chaining Full-Match  
Tugas Akhir

---

## Catatan Pengujian

- **Merek** hanya digunakan sebagai identitas perangkat dan tidak memengaruhi hasil diagnosa.
- **Tipe perangkat** hanya digunakan sebagai identitas dan tidak memengaruhi hasil diagnosa.
- Hasil diagnosa ditentukan sepenuhnya berdasarkan **gejala yang dipilih** dan **rule** dalam basis pengetahuan.
- Sistem hanya memberikan **diagnosa awal** — pemeriksaan teknisi tetap dibutuhkan untuk kerusakan fisik.
- Rule hanya terpenuhi jika **semua** gejala IF dipilih. Jika hanya sebagian, rule tidak menghasilkan diagnosa.

---

## Tabel Skenario Uji

| No | Skenario | Input Merek | Input Gejala | Rule yang Diharapkan | Hasil yang Diharapkan | Status |
|----|----------|-------------|--------------|----------------------|-----------------------|--------|
| 1 | Kerusakan Baterai — panas dan cepat habis | Xiaomi | G01, G02 | R01: IF G01 AND G02 THEN K01 | K01 — Kerusakan Baterai | ☐ |
| 2 | Kerusakan Baterai — cepat habis dan sangat panas idle | OPPO | G01, G22 | R02: IF G01 AND G22 THEN K01 | K01 — Kerusakan Baterai | ☐ |
| 3 | Kerusakan Port Charger — tidak respons dan longgar | Infinix | G03, G04 | R03: IF G03 AND G04 THEN K02 | K02 — Kerusakan Port Charger | ☐ |
| 4 | Kerusakan Port Charger — pengisian putus-putus | Vivo | G03, G05 | R04: IF G03 AND G05 THEN K02 | K02 — Kerusakan Port Charger | ☐ |
| 5 | Kerusakan LCD/Touchscreen — layar tidak respons dan bergaris | Realme | G06, G07 | R05: IF G06 AND G07 THEN K03 | K03 — Kerusakan LCD atau Touchscreen | ☐ |
| 6 | Kerusakan LCD/Touchscreen — layar gelap dan tidak respons | Xiaomi | G06, G08 | R06: IF G06 AND G08 THEN K03 | K03 — Kerusakan LCD atau Touchscreen | ☐ |
| 7 | Gangguan Sistem Operasi — bootloop dan restart | OPPO | G09, G10 | R07: IF G09 AND G10 THEN K04 | K04 — Gangguan Sistem Operasi atau Firmware | ☐ |
| 8 | Gangguan Firmware — aplikasi crash dan lambat | Infinix | G11, G12 | R08: IF G11 AND G12 THEN K04 | K04 — Gangguan Sistem Operasi atau Firmware | ☐ |
| 9 | Kerusakan Speaker — tidak ada suara dan pecah | Vivo | G13, G14 | R09: IF G13 AND G14 THEN K05 | K05 — Kerusakan Speaker | ☐ |
| 10 | Kerusakan Kamera — tidak bisa dibuka dan buram | Realme | G15, G16 | R10: IF G15 AND G16 THEN K06 | K06 — Kerusakan Kamera | ☐ |
| 11 | Gangguan Jaringan — sinyal hilang dan SIM tidak terbaca | Xiaomi | G17, G18 | R11: IF G17 AND G18 THEN K07 | K07 — Gangguan Jaringan atau Kartu SIM | ☐ |
| 12 | Kerusakan IC Power — mati total dan tidak menyala | OPPO | G19, G20 | R12: IF G19 AND G20 THEN K08 | K08 — Kerusakan IC Power | ☐ |
| 13 | Kerusakan IC Power — tidak menyala dan tombol power rusak | Infinix | G20, G21 | R13: IF G20 AND G21 THEN K08 | K08 — Kerusakan IC Power | ☐ |
| 14 | Kerusakan Akibat Cairan — terkena air dan mati | Vivo | G25, G19 | R16: IF G25 AND G19 THEN K09 | K09 — Kerusakan Akibat Cairan | ☐ |
| 15 | Kerusakan Akibat Cairan — terkena air dan tidak bisa cas | Realme | G25, G03 | R17: IF G25 AND G03 THEN K09 | K09 — Kerusakan Akibat Cairan | ☐ |
| 16 | Multiple rule match — baterai panas, cas tidak respons, dan putus | Xiaomi | G02, G03, G05 | R04, R18 | K02 — Kerusakan Port Charger (2 rule terpenuhi) | ☐ |
| 17 | Multiple rule match — bootloop, crash, lambat | OPPO | G09, G10, G11, G12 | R07, R08, R21 | K04 — Gangguan Sistem Operasi (3 rule terpenuhi) | ☐ |
| 18 | No match — hanya satu gejala dipilih | Infinix | G01 saja | Tidak ada rule | Tampilkan: "Belum ada diagnosa yang sesuai" | ☐ |
| 19 | No match — gejala tidak membentuk rule manapun | Vivo | G13, G17 | Tidak ada rule | Tampilkan: "Belum ada diagnosa yang sesuai" | ☐ |
| 20 | Brand tidak memengaruhi hasil — Xiaomi vs Realme, gejala sama | Xiaomi, lalu Realme | G01, G02 (sama) | R01 untuk keduanya | Hasil diagnosa identik: K01 | ☐ |
| 21 | Rule Kerusakan LCD tambahan — layar bergaris dan gelap | Xiaomi | G07, G08 | R19: IF G07 AND G08 THEN K03 | K03 — Kerusakan LCD atau Touchscreen | ☐ |
| 22 | Gangguan Konektivitas — sinyal hilang dan WiFi tidak aktif | OPPO | G17, G24 | R20: IF G17 AND G24 THEN K07 | K07 — Gangguan Jaringan atau Kartu SIM | ☐ |

---

## Cara Menjalankan Pengujian Manual

1. Jalankan aplikasi: `npm run dev`
2. Buka `http://localhost:5173/diagnosa`
3. **Step 1:** Pilih merek sesuai kolom "Input Merek"
4. **Step 2:** Pilih kategori gejala yang sesuai (Baterai, Layar, Sistem, dll.)
5. **Step 3:** Pilih gejala sesuai kolom "Input Gejala"
6. Klik tombol **Diagnosa**
7. **Step 4:** Verifikasi hasil sesuai kolom "Hasil yang Diharapkan"
8. Tandai kolom Status: ✓ (PASS) atau ✗ (FAIL)

---

## Kriteria Keberhasilan

| Kriteria | Deskripsi |
|---|---|
| Rule Match | Rule yang tercantum di "Rule yang Diharapkan" muncul di hasil dengan badge "✓ Rule Terpenuhi" |
| Kondisi Benar | Nama jenis kerusakan sesuai dengan "Hasil yang Diharapkan" |
| No Partial Match | Gejala yang kurang tidak menghasilkan diagnosa |
| No Match Message | Saat tidak ada rule cocok, tampil pesan "Belum ada diagnosa yang sesuai" |
| Brand Independen | Hasil diagnosa identik untuk merek berbeda dengan gejala sama |
| Disclaimer | Halaman hasil selalu menampilkan catatan "tidak menggantikan pemeriksaan teknisi" |
| Solusi Awal | Setiap hasil menampilkan solusi awal yang dapat dilakukan pengguna |

---

## Skenario Tambahan (Admin Panel)

| No | Skenario | Langkah | Hasil yang Diharapkan | Status |
|----|----------|---------|----------------------|--------|
| A1 | Login admin | Buka `/login`, isi email dan password yang benar | Redirect ke `/admin` | ☐ |
| A2 | Login dengan kredensial salah | Isi password yang salah | Tampil pesan error, tetap di `/login` | ☐ |
| A3 | Tambah gejala baru | `/admin/symptoms` → Tambah Gejala | Gejala muncul di tabel | ☐ |
| A4 | Tambah rule baru | `/admin/rules` → Tambah Rule, pilih gejala dari dropdown | Rule tersimpan dan muncul di tabel | ☐ |
| A5 | Preview IF-THEN rule | Saat membuat rule, pilih beberapa gejala | Preview otomatis tampil dalam format IF G01 AND G02 THEN K01 | ☐ |
| A6 | Rule baru dipakai wizard | Tambah rule baru, jalankan diagnosa dengan gejala sesuai | Hasil diagnosa membaca rule baru dari Supabase | ☐ |
