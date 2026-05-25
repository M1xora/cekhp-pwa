# Dokumentasi Basis Pengetahuan — CekHP

Sistem Pakar Diagnosa Kerusakan Smartphone Produksi Cina  
Metode: Forward Chaining  
Tugas Akhir

---

## 1. Daftar Gejala

| Kode | Nama Gejala | Kategori |
|------|-------------|----------|
| G01 | Baterai cepat habis | Baterai |
| G02 | Perangkat cepat panas saat digunakan atau diisi daya | Baterai |
| G03 | Perangkat tidak merespons saat diisi daya | Pengisian Daya |
| G04 | Port charger terasa longgar | Pengisian Daya |
| G05 | Pengisian daya sering terputus | Pengisian Daya |
| G06 | Layar sentuh tidak merespons | Layar |
| G07 | Layar bergaris atau muncul bercak | Layar |
| G08 | Layar gelap meskipun perangkat menyala | Layar |
| G09 | Perangkat stuck logo atau bootloop | Sistem |
| G10 | Perangkat sering restart sendiri | Sistem |
| G11 | Aplikasi sering berhenti sendiri | Sistem |
| G12 | Sistem terasa lambat saat digunakan | Sistem |
| G13 | Speaker tidak mengeluarkan suara | Audio |
| G14 | Suara speaker kecil atau pecah | Audio |
| G15 | Kamera tidak dapat dibuka | Kamera |
| G16 | Hasil kamera buram meskipun lensa bersih | Kamera |
| G17 | Sinyal sering hilang | Jaringan |
| G18 | Kartu SIM tidak terbaca | Jaringan |
| G19 | Perangkat mati total | Daya |
| G20 | Perangkat tidak menyala meskipun sudah diisi daya | Daya |
| G21 | Tombol power sulit digunakan | Daya |
| G22 | Perangkat sangat panas tanpa penggunaan berat | Baterai |
| G23 | Memori penuh dan sistem sering berhenti | Sistem |
| G24 | Wi-Fi atau Bluetooth tidak dapat aktif | Jaringan |
| G25 | Perangkat terkena air atau cairan | Kerusakan Fisik |

**Total: 25 gejala**

---

## 2. Daftar Jenis Kerusakan

| Kode | Jenis Kerusakan | Solusi Awal |
|------|-----------------|-------------|
| K01 | Kerusakan Baterai | Gunakan charger sesuai spesifikasi, hindari penggunaan perangkat saat pengisian daya, tutup aplikasi berat, dan lakukan pemeriksaan baterai ke teknisi jika masalah berulang. |
| K02 | Kerusakan Port Charger | Coba gunakan kabel dan adaptor lain yang masih baik, bersihkan port charger dengan hati-hati, dan lakukan pemeriksaan konektor ke teknisi. |
| K03 | Kerusakan LCD atau Touchscreen | Hindari menekan layar terlalu keras, restart perangkat jika masih memungkinkan, dan lakukan pemeriksaan layar ke teknisi. |
| K04 | Gangguan Sistem Operasi atau Firmware | Hapus aplikasi bermasalah, bersihkan cache, lakukan pembaruan sistem, atau lakukan pemeriksaan software ke teknisi. |
| K05 | Kerusakan Speaker | Periksa pengaturan volume, matikan mode senyap, bersihkan lubang speaker secara hati-hati, dan lakukan pemeriksaan komponen speaker jika suara tetap bermasalah. |
| K06 | Kerusakan Kamera | Tutup aplikasi kamera, hapus cache aplikasi kamera, restart perangkat, dan periksa modul kamera ke teknisi jika masalah tetap muncul. |
| K07 | Gangguan Jaringan atau Kartu SIM | Periksa kartu SIM, coba mode pesawat, atur ulang jaringan, dan lakukan pemeriksaan slot SIM atau komponen jaringan jika sinyal tetap hilang. |
| K08 | Kerusakan IC Power | Jangan memaksa menyalakan perangkat berulang kali, gunakan charger yang sesuai, dan segera lakukan pemeriksaan teknisi. |
| K09 | Kerusakan Akibat Cairan | Matikan perangkat, jangan langsung mengisi daya, jangan dipanaskan berlebihan, dan segera bawa ke teknisi untuk pemeriksaan internal. |

**Total: 9 jenis kerusakan**

---

## 3. Tabel Rule Forward Chaining

| Kode Rule | Aturan IF-THEN | Hasil Diagnosa | Penjelasan |
|-----------|---------------|----------------|------------|
| R01 | IF G01 AND G02 THEN K01 | Kerusakan Baterai | Baterai cepat habis disertai panas berlebih dapat mengarah pada gangguan baterai. |
| R02 | IF G01 AND G22 THEN K01 | Kerusakan Baterai | Baterai cepat habis dan perangkat sangat panas tanpa penggunaan berat dapat menunjukkan kondisi baterai tidak normal. |
| R03 | IF G03 AND G04 THEN K02 | Kerusakan Port Charger | Perangkat tidak merespons pengisian daya dan port terasa longgar dapat mengarah pada kerusakan port charger. |
| R04 | IF G03 AND G05 THEN K02 | Kerusakan Port Charger | Pengisian daya tidak stabil dan sering terputus dapat menunjukkan gangguan konektor pengisian. |
| R05 | IF G06 AND G07 THEN K03 | Kerusakan LCD atau Touchscreen | Layar tidak merespons disertai garis atau bercak dapat mengarah pada kerusakan LCD atau touchscreen. |
| R06 | IF G06 AND G08 THEN K03 | Kerusakan LCD atau Touchscreen | Layar tidak merespons dan gelap meskipun perangkat menyala dapat mengarah pada gangguan layar. |
| R07 | IF G09 AND G10 THEN K04 | Gangguan Sistem Operasi atau Firmware | Bootloop dan restart berulang dapat menunjukkan gangguan sistem operasi atau firmware. |
| R08 | IF G11 AND G12 THEN K04 | Gangguan Sistem Operasi atau Firmware | Aplikasi sering berhenti dan sistem lambat dapat mengarah pada gangguan software. |
| R09 | IF G13 AND G14 THEN K05 | Kerusakan Speaker | Speaker tidak normal dan suara pecah dapat mengarah pada kerusakan speaker. |
| R10 | IF G15 AND G16 THEN K06 | Kerusakan Kamera | Kamera tidak dapat dibuka dan hasil kamera buram dapat mengarah pada gangguan kamera. |
| R11 | IF G17 AND G18 THEN K07 | Gangguan Jaringan atau Kartu SIM | Sinyal hilang dan kartu SIM tidak terbaca dapat mengarah pada gangguan jaringan atau SIM. |
| R12 | IF G19 AND G20 THEN K08 | Kerusakan IC Power | Perangkat mati total dan tidak menyala meskipun sudah diisi daya dapat mengarah pada kerusakan IC power. |
| R13 | IF G20 AND G21 THEN K08 | Kerusakan IC Power | Perangkat sulit menyala dan tombol power bermasalah dapat berkaitan dengan jalur daya atau tombol power. |
| R14 | IF G23 AND G11 THEN K04 | Gangguan Sistem Operasi atau Firmware | Memori penuh disertai aplikasi sering berhenti dapat mengarah pada gangguan sistem. |
| R15 | IF G24 AND G10 THEN K04 | Gangguan Sistem Operasi atau Firmware | Wi-Fi atau Bluetooth gagal aktif disertai restart dapat menunjukkan gangguan sistem. |
| R16 | IF G25 AND G19 THEN K09 | Kerusakan Akibat Cairan | Perangkat terkena cairan dan mati total dapat mengarah pada kerusakan akibat cairan. |
| R17 | IF G25 AND G03 THEN K09 | Kerusakan Akibat Cairan | Perangkat terkena cairan dan tidak dapat mengisi daya dapat mengarah pada kerusakan komponen internal akibat cairan. |
| R18 | IF G02 AND G03 AND G05 THEN K02 | Kerusakan Port Charger | Perangkat panas, tidak merespons pengisian, dan pengisian sering terputus dapat mengarah pada gangguan jalur pengisian. |
| R19 | IF G07 AND G08 THEN K03 | Kerusakan LCD atau Touchscreen | Layar bergaris dan gelap dapat mengarah pada kerusakan panel LCD. |
| R20 | IF G17 AND G24 THEN K07 | Gangguan Jaringan atau Kartu SIM | Gangguan sinyal disertai Wi-Fi atau Bluetooth tidak aktif dapat mengarah pada gangguan konektivitas. |
| R21 | IF G09 AND G11 AND G12 THEN K04 | Gangguan Sistem Operasi atau Firmware | Bootloop, aplikasi sering berhenti, dan sistem lambat dapat mengarah pada gangguan sistem operasi atau firmware. |

**Total: 21 rule**

---

## 4. Catatan

- Merek smartphone (Xiaomi, OPPO, Infinix, Vivo, Realme) hanya digunakan sebagai identitas perangkat dan tidak memengaruhi hasil diagnosa.
- Hasil diagnosa ditentukan sepenuhnya berdasarkan gejala yang dipilih pengguna dan rule yang tersimpan di basis pengetahuan.
- Sistem menggunakan metode **Forward Chaining full-match**: sebuah rule hanya dianggap terpenuhi jika **semua** gejala pada bagian IF dipilih oleh pengguna.
- Sistem hanya memberikan **diagnosa awal** dan tidak menggantikan pemeriksaan langsung oleh teknisi.
- Basis pengetahuan dapat diperbarui oleh admin melalui panel `/admin` tanpa mengubah kode program.
