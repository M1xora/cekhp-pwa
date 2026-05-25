-- ============================================================
-- CekHP Diagnostic Tool — Seed Data Knowledge Base Final
-- File: supabase/seed_knowledge_base_final.sql
--
-- Cara menjalankan:
--   1. Buka Supabase Dashboard → SQL Editor
--   2. Buat tab baru (+)
--   3. Paste seluruh isi file ini
--   4. Klik Run (Ctrl+Enter)
--
-- Script ini aman dijalankan berulang kali (UPSERT).
-- Tidak menghapus data yang sudah ada.
-- ============================================================

-- ============================================================
-- 1. JENIS KERUSAKAN (9 kondisi — K01..K09)
-- ============================================================

INSERT INTO conditions (id, code, name, description, recommended_action)
VALUES
  (
    'condition-battery-damage',
    'K01',
    'Kerusakan Baterai',
    'Kerusakan yang berkaitan dengan daya tahan baterai, panas berlebih, atau kondisi baterai yang tidak normal.',
    'Gunakan charger sesuai spesifikasi, hindari penggunaan perangkat saat pengisian daya, tutup aplikasi berat, dan lakukan pemeriksaan baterai ke teknisi jika masalah berulang.'
  ),
  (
    'condition-charging-port',
    'K02',
    'Kerusakan Port Charger',
    'Kerusakan yang berkaitan dengan konektor pengisian daya atau jalur pengisian.',
    'Coba gunakan kabel dan adaptor lain yang masih baik, bersihkan port charger dengan hati-hati, dan lakukan pemeriksaan konektor ke teknisi.'
  ),
  (
    'condition-lcd-touchscreen',
    'K03',
    'Kerusakan LCD atau Touchscreen',
    'Kerusakan pada layar, panel LCD, atau fungsi sentuhan.',
    'Hindari menekan layar terlalu keras, restart perangkat jika masih memungkinkan, dan lakukan pemeriksaan layar ke teknisi.'
  ),
  (
    'condition-os-firmware',
    'K04',
    'Gangguan Sistem Operasi atau Firmware',
    'Gangguan pada sistem operasi, aplikasi, firmware, atau proses booting perangkat.',
    'Hapus aplikasi bermasalah, bersihkan cache, lakukan pembaruan sistem, atau lakukan pemeriksaan software ke teknisi.'
  ),
  (
    'condition-speaker-damage',
    'K05',
    'Kerusakan Speaker',
    'Kerusakan yang berkaitan dengan keluaran suara perangkat.',
    'Periksa pengaturan volume, matikan mode senyap, bersihkan lubang speaker secara hati-hati, dan lakukan pemeriksaan komponen speaker jika suara tetap bermasalah.'
  ),
  (
    'condition-camera-damage',
    'K06',
    'Kerusakan Kamera',
    'Kerusakan yang berkaitan dengan aplikasi kamera atau modul kamera.',
    'Tutup aplikasi kamera, hapus cache aplikasi kamera, restart perangkat, dan periksa modul kamera ke teknisi jika masalah tetap muncul.'
  ),
  (
    'condition-network-sim',
    'K07',
    'Gangguan Jaringan atau Kartu SIM',
    'Gangguan yang berkaitan dengan sinyal, kartu SIM, atau konektivitas jaringan.',
    'Periksa kartu SIM, coba mode pesawat, atur ulang jaringan, dan lakukan pemeriksaan slot SIM atau komponen jaringan jika sinyal tetap hilang.'
  ),
  (
    'condition-ic-power',
    'K08',
    'Kerusakan IC Power',
    'Kerusakan pada komponen daya utama yang dapat menyebabkan perangkat mati total atau sulit menyala.',
    'Jangan memaksa menyalakan perangkat berulang kali, gunakan charger yang sesuai, dan segera lakukan pemeriksaan teknisi.'
  ),
  (
    'condition-liquid-damage',
    'K09',
    'Kerusakan Akibat Cairan',
    'Kerusakan akibat perangkat terkena air atau cairan yang dapat memengaruhi komponen internal.',
    'Matikan perangkat, jangan langsung mengisi daya, jangan dipanaskan berlebihan, dan segera bawa ke teknisi untuk pemeriksaan internal.'
  )
ON CONFLICT (id) DO UPDATE SET
  code             = EXCLUDED.code,
  name             = EXCLUDED.name,
  description      = EXCLUDED.description,
  recommended_action = EXCLUDED.recommended_action;

-- ============================================================
-- 2. GEJALA (25 gejala — G01..G25)
-- ============================================================

INSERT INTO symptoms (id, code, name, description, category)
VALUES
  ('symptom-battery-drain',      'G01', 'Baterai cepat habis',                                    'Daya baterai berkurang dengan sangat cepat meskipun penggunaan perangkat tidak berat.',                                              'Baterai'),
  ('symptom-device-hot',         'G02', 'Perangkat cepat panas saat digunakan atau diisi daya',   'Suhu perangkat meningkat drastis saat digunakan sehari-hari atau saat terhubung ke charger.',                                       'Baterai'),
  ('symptom-no-charge-response', 'G03', 'Perangkat tidak merespons saat diisi daya',              'Perangkat tidak menampilkan indikator pengisian daya meskipun charger sudah terhubung.',                                            'Pengisian Daya'),
  ('symptom-port-loose',         'G04', 'Port charger terasa longgar',                            'Konektor charger mudah lepas atau tidak terpasang dengan erat pada port pengisian.',                                                'Pengisian Daya'),
  ('symptom-charging-disconnect','G05', 'Pengisian daya sering terputus',                         'Proses pengisian daya berhenti dan mulai lagi secara berulang tanpa alasan yang jelas.',                                           'Pengisian Daya'),
  ('symptom-touch-unresponsive', 'G06', 'Layar sentuh tidak merespons',                           'Sentuhan pada layar tidak memberikan respons atau hanya merespons sebagian area.',                                                 'Layar'),
  ('symptom-screen-lines-spots', 'G07', 'Layar bergaris atau muncul bercak',                      'Terdapat garis horizontal atau vertikal, atau bercak warna tidak normal pada layar.',                                              'Layar'),
  ('symptom-screen-black',       'G08', 'Layar gelap meskipun perangkat menyala',                 'Layar tidak menampilkan gambar apapun meskipun perangkat masih dalam kondisi menyala.',                                           'Layar'),
  ('symptom-bootloop',           'G09', 'Perangkat stuck logo atau bootloop',                     'Perangkat berhenti di logo atau terus melakukan restart berulang saat dinyalakan.',                                                'Sistem'),
  ('symptom-random-restart',     'G10', 'Perangkat sering restart sendiri',                       'Perangkat melakukan restart secara tiba-tiba tanpa ada perintah dari pengguna.',                                                   'Sistem'),
  ('symptom-app-crash',          'G11', 'Aplikasi sering berhenti sendiri',                       'Aplikasi tiba-tiba tertutup atau menampilkan pesan force close saat sedang digunakan.',                                           'Sistem'),
  ('symptom-system-slow',        'G12', 'Sistem terasa lambat saat digunakan',                    'Respons perangkat terhadap sentuhan atau perintah terasa lambat dan sering lag.',                                                  'Sistem'),
  ('symptom-no-speaker-sound',   'G13', 'Speaker tidak mengeluarkan suara',                       'Tidak ada suara yang keluar dari speaker meskipun volume sudah diatur ke maksimal.',                                               'Audio'),
  ('symptom-speaker-distorted',  'G14', 'Suara speaker kecil atau pecah',                         'Suara yang keluar dari speaker terdengar kecil, serak, atau terdistorsi.',                                                        'Audio'),
  ('symptom-camera-wont-open',   'G15', 'Kamera tidak dapat dibuka',                              'Aplikasi kamera gagal terbuka atau langsung menutup sendiri saat diluncurkan.',                                                   'Kamera'),
  ('symptom-camera-blurry',      'G16', 'Hasil kamera buram meskipun lensa bersih',               'Foto atau video yang diambil tampak tidak fokus meskipun lensa dalam kondisi bersih.',                                            'Kamera'),
  ('symptom-signal-lost',        'G17', 'Sinyal sering hilang',                                   'Kekuatan sinyal jaringan seluler sering hilang atau berfluktuasi secara tidak normal.',                                           'Jaringan'),
  ('symptom-sim-unread',         'G18', 'Kartu SIM tidak terbaca',                                'Perangkat tidak mendeteksi kartu SIM yang terpasang atau menampilkan pesan tidak ada SIM.',                                       'Jaringan'),
  ('symptom-device-dead',        'G19', 'Perangkat mati total',                                   'Perangkat sama sekali tidak menyala atau tidak memberikan respons apapun.',                                                       'Daya'),
  ('symptom-wont-turn-on',       'G20', 'Perangkat tidak menyala meskipun sudah diisi daya',      'Perangkat tetap tidak bisa dinyalakan meskipun sudah terhubung ke charger dalam waktu cukup.',                                   'Daya'),
  ('symptom-power-button-stuck', 'G21', 'Tombol power sulit digunakan',                           'Tombol daya terasa keras, macet, atau tidak memberikan respons saat ditekan.',                                                    'Daya'),
  ('symptom-hot-idle',           'G22', 'Perangkat sangat panas tanpa penggunaan berat',          'Suhu perangkat sangat tinggi bahkan saat tidak menjalankan aplikasi yang berat.',                                                  'Baterai'),
  ('symptom-storage-full-crash', 'G23', 'Memori penuh dan sistem sering berhenti',                'Penyimpanan internal hampir penuh sehingga menyebabkan sistem sering berhenti atau tidak responsif.',                             'Sistem'),
  ('symptom-wifi-bt-dead',       'G24', 'Wi-Fi atau Bluetooth tidak dapat aktif',                 'Fitur Wi-Fi atau Bluetooth tidak bisa diaktifkan atau terus-menerus terputus.',                                                   'Jaringan'),
  ('symptom-liquid-contact',     'G25', 'Perangkat terkena air atau cairan',                      'Perangkat pernah terkena tumpahan air atau cairan lainnya.',                                                                      'Kerusakan Fisik')
ON CONFLICT (id) DO UPDATE SET
  code        = EXCLUDED.code,
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  category    = EXCLUDED.category;

-- ============================================================
-- 3. RULE DIAGNOSA (21 rule — R01..R21)
-- symptom_ids berisi array id gejala (bukan kode G)
-- ============================================================

INSERT INTO rules (id, code, condition_id, symptom_ids)
VALUES
  ('rule-r01-battery',        'R01', 'condition-battery-damage',   ARRAY['symptom-battery-drain', 'symptom-device-hot']),
  ('rule-r02-battery',        'R02', 'condition-battery-damage',   ARRAY['symptom-battery-drain', 'symptom-hot-idle']),
  ('rule-r03-charging-port',  'R03', 'condition-charging-port',    ARRAY['symptom-no-charge-response', 'symptom-port-loose']),
  ('rule-r04-charging-port',  'R04', 'condition-charging-port',    ARRAY['symptom-no-charge-response', 'symptom-charging-disconnect']),
  ('rule-r05-lcd',            'R05', 'condition-lcd-touchscreen',  ARRAY['symptom-touch-unresponsive', 'symptom-screen-lines-spots']),
  ('rule-r06-lcd',            'R06', 'condition-lcd-touchscreen',  ARRAY['symptom-touch-unresponsive', 'symptom-screen-black']),
  ('rule-r07-os',             'R07', 'condition-os-firmware',      ARRAY['symptom-bootloop', 'symptom-random-restart']),
  ('rule-r08-os',             'R08', 'condition-os-firmware',      ARRAY['symptom-app-crash', 'symptom-system-slow']),
  ('rule-r09-speaker',        'R09', 'condition-speaker-damage',   ARRAY['symptom-no-speaker-sound', 'symptom-speaker-distorted']),
  ('rule-r10-camera',         'R10', 'condition-camera-damage',    ARRAY['symptom-camera-wont-open', 'symptom-camera-blurry']),
  ('rule-r11-network',        'R11', 'condition-network-sim',      ARRAY['symptom-signal-lost', 'symptom-sim-unread']),
  ('rule-r12-ic-power',       'R12', 'condition-ic-power',         ARRAY['symptom-device-dead', 'symptom-wont-turn-on']),
  ('rule-r13-ic-power',       'R13', 'condition-ic-power',         ARRAY['symptom-wont-turn-on', 'symptom-power-button-stuck']),
  ('rule-r14-os',             'R14', 'condition-os-firmware',      ARRAY['symptom-storage-full-crash', 'symptom-app-crash']),
  ('rule-r15-os',             'R15', 'condition-os-firmware',      ARRAY['symptom-wifi-bt-dead', 'symptom-random-restart']),
  ('rule-r16-liquid',         'R16', 'condition-liquid-damage',    ARRAY['symptom-liquid-contact', 'symptom-device-dead']),
  ('rule-r17-liquid',         'R17', 'condition-liquid-damage',    ARRAY['symptom-liquid-contact', 'symptom-no-charge-response']),
  ('rule-r18-charging-port',  'R18', 'condition-charging-port',    ARRAY['symptom-device-hot', 'symptom-no-charge-response', 'symptom-charging-disconnect']),
  ('rule-r19-lcd',            'R19', 'condition-lcd-touchscreen',  ARRAY['symptom-screen-lines-spots', 'symptom-screen-black']),
  ('rule-r20-network',        'R20', 'condition-network-sim',      ARRAY['symptom-signal-lost', 'symptom-wifi-bt-dead']),
  ('rule-r21-os',             'R21', 'condition-os-firmware',      ARRAY['symptom-bootloop', 'symptom-app-crash', 'symptom-system-slow'])
ON CONFLICT (id) DO UPDATE SET
  code         = EXCLUDED.code,
  condition_id = EXCLUDED.condition_id,
  symptom_ids  = EXCLUDED.symptom_ids;

-- ============================================================
-- Verifikasi — jalankan query ini setelah seed berhasil:
-- SELECT COUNT(*) FROM symptoms;   -- harus: 25
-- SELECT COUNT(*) FROM conditions; -- harus: 9
-- SELECT COUNT(*) FROM rules;      -- harus: 21
-- ============================================================
