// src/data/mockData.ts
//
// FALLBACK DEVELOPMENT — Hanya dipakai jika Supabase tidak tersedia.
// Jangan import file ini langsung di komponen UI.
// Semua akses data harus melalui service layer (symptomService, conditionService, ruleService).
//
// Data ini selaras dengan file seed: supabase/seed_knowledge_base_final.sql
// Jumlah: 25 gejala, 9 jenis kerusakan, 21 rule — semua Bahasa Indonesia.

import type { Condition, Symptom, Rule } from '../types/knowledge-base';

// ─── 9 Jenis Kerusakan — K01..K09 ────────────────────────────────────────────
// id diurutkan ASC sesuai ORDER BY id di migration

export const mockConditions: Condition[] = [
  {
    id: 'condition-battery-damage',
    code: 'K01',
    name: 'Kerusakan Baterai',
    description:
      'Kerusakan yang berkaitan dengan daya tahan baterai, panas berlebih, atau kondisi baterai yang tidak normal.',
    recommendedAction:
      'Gunakan charger sesuai spesifikasi, hindari penggunaan perangkat saat pengisian daya, tutup aplikasi berat, dan lakukan pemeriksaan baterai ke teknisi jika masalah berulang.',
  },
  {
    id: 'condition-charging-port',
    code: 'K02',
    name: 'Kerusakan Port Charger',
    description:
      'Kerusakan yang berkaitan dengan konektor pengisian daya atau jalur pengisian.',
    recommendedAction:
      'Coba gunakan kabel dan adaptor lain yang masih baik, bersihkan port charger dengan hati-hati, dan lakukan pemeriksaan konektor ke teknisi.',
  },
  {
    id: 'condition-lcd-touchscreen',
    code: 'K03',
    name: 'Kerusakan LCD atau Touchscreen',
    description:
      'Kerusakan pada layar, panel LCD, atau fungsi sentuhan.',
    recommendedAction:
      'Hindari menekan layar terlalu keras, restart perangkat jika masih memungkinkan, dan lakukan pemeriksaan layar ke teknisi.',
  },
  {
    id: 'condition-os-firmware',
    code: 'K04',
    name: 'Gangguan Sistem Operasi atau Firmware',
    description:
      'Gangguan pada sistem operasi, aplikasi, firmware, atau proses booting perangkat.',
    recommendedAction:
      'Hapus aplikasi bermasalah, bersihkan cache, lakukan pembaruan sistem, atau lakukan pemeriksaan software ke teknisi.',
  },
  {
    id: 'condition-speaker-damage',
    code: 'K05',
    name: 'Kerusakan Speaker',
    description:
      'Kerusakan yang berkaitan dengan keluaran suara perangkat.',
    recommendedAction:
      'Periksa pengaturan volume, matikan mode senyap, bersihkan lubang speaker secara hati-hati, dan lakukan pemeriksaan komponen speaker jika suara tetap bermasalah.',
  },
  {
    id: 'condition-camera-damage',
    code: 'K06',
    name: 'Kerusakan Kamera',
    description:
      'Kerusakan yang berkaitan dengan aplikasi kamera atau modul kamera.',
    recommendedAction:
      'Tutup aplikasi kamera, hapus cache aplikasi kamera, restart perangkat, dan periksa modul kamera ke teknisi jika masalah tetap muncul.',
  },
  {
    id: 'condition-network-sim',
    code: 'K07',
    name: 'Gangguan Jaringan atau Kartu SIM',
    description:
      'Gangguan yang berkaitan dengan sinyal, kartu SIM, atau konektivitas jaringan.',
    recommendedAction:
      'Periksa kartu SIM, coba mode pesawat, atur ulang jaringan, dan lakukan pemeriksaan slot SIM atau komponen jaringan jika sinyal tetap hilang.',
  },
  {
    id: 'condition-ic-power',
    code: 'K08',
    name: 'Kerusakan IC Power',
    description:
      'Kerusakan pada komponen daya utama yang dapat menyebabkan perangkat mati total atau sulit menyala.',
    recommendedAction:
      'Jangan memaksa menyalakan perangkat berulang kali, gunakan charger yang sesuai, dan segera lakukan pemeriksaan teknisi.',
  },
  {
    id: 'condition-liquid-damage',
    code: 'K09',
    name: 'Kerusakan Akibat Cairan',
    description:
      'Kerusakan akibat perangkat terkena air atau cairan yang dapat memengaruhi komponen internal.',
    recommendedAction:
      'Matikan perangkat, jangan langsung mengisi daya, jangan dipanaskan berlebihan, dan segera bawa ke teknisi untuk pemeriksaan internal.',
  },
];

// ─── 25 Gejala — G01..G25 ────────────────────────────────────────────────────
// id diurutkan ASC sesuai ORDER BY id di migration

export const mockSymptoms: Symptom[] = [
  {
    id: 'symptom-battery-drain',
    code: 'G01',
    name: 'Baterai cepat habis',
    description: 'Daya baterai berkurang dengan sangat cepat meskipun penggunaan perangkat tidak berat.',
    category: 'Baterai',
  },
  {
    id: 'symptom-device-hot',
    code: 'G02',
    name: 'Perangkat cepat panas saat digunakan atau diisi daya',
    description: 'Suhu perangkat meningkat drastis saat digunakan sehari-hari atau saat terhubung ke charger.',
    category: 'Baterai',
  },
  {
    id: 'symptom-no-charge-response',
    code: 'G03',
    name: 'Perangkat tidak merespons saat diisi daya',
    description: 'Perangkat tidak menampilkan indikator pengisian daya meskipun charger sudah terhubung.',
    category: 'Pengisian Daya',
  },
  {
    id: 'symptom-port-loose',
    code: 'G04',
    name: 'Port charger terasa longgar',
    description: 'Konektor charger mudah lepas atau tidak terpasang dengan erat pada port pengisian.',
    category: 'Pengisian Daya',
  },
  {
    id: 'symptom-charging-disconnect',
    code: 'G05',
    name: 'Pengisian daya sering terputus',
    description: 'Proses pengisian daya berhenti dan mulai lagi secara berulang tanpa alasan yang jelas.',
    category: 'Pengisian Daya',
  },
  {
    id: 'symptom-touch-unresponsive',
    code: 'G06',
    name: 'Layar sentuh tidak merespons',
    description: 'Sentuhan pada layar tidak memberikan respons atau hanya merespons sebagian area.',
    category: 'Layar',
  },
  {
    id: 'symptom-screen-lines-spots',
    code: 'G07',
    name: 'Layar bergaris atau muncul bercak',
    description: 'Terdapat garis horizontal atau vertikal, atau bercak warna tidak normal pada layar.',
    category: 'Layar',
  },
  {
    id: 'symptom-screen-black',
    code: 'G08',
    name: 'Layar gelap meskipun perangkat menyala',
    description: 'Layar tidak menampilkan gambar apapun meskipun perangkat masih dalam kondisi menyala.',
    category: 'Layar',
  },
  {
    id: 'symptom-bootloop',
    code: 'G09',
    name: 'Perangkat stuck logo atau bootloop',
    description: 'Perangkat berhenti di logo atau terus melakukan restart berulang saat dinyalakan.',
    category: 'Sistem',
  },
  {
    id: 'symptom-random-restart',
    code: 'G10',
    name: 'Perangkat sering restart sendiri',
    description: 'Perangkat melakukan restart secara tiba-tiba tanpa ada perintah dari pengguna.',
    category: 'Sistem',
  },
  {
    id: 'symptom-app-crash',
    code: 'G11',
    name: 'Aplikasi sering berhenti sendiri',
    description: 'Aplikasi tiba-tiba tertutup atau menampilkan pesan force close saat sedang digunakan.',
    category: 'Sistem',
  },
  {
    id: 'symptom-system-slow',
    code: 'G12',
    name: 'Sistem terasa lambat saat digunakan',
    description: 'Respons perangkat terhadap sentuhan atau perintah terasa lambat dan sering lag.',
    category: 'Sistem',
  },
  {
    id: 'symptom-no-speaker-sound',
    code: 'G13',
    name: 'Speaker tidak mengeluarkan suara',
    description: 'Tidak ada suara yang keluar dari speaker meskipun volume sudah diatur ke maksimal.',
    category: 'Audio',
  },
  {
    id: 'symptom-speaker-distorted',
    code: 'G14',
    name: 'Suara speaker kecil atau pecah',
    description: 'Suara yang keluar dari speaker terdengar kecil, serak, atau terdistorsi.',
    category: 'Audio',
  },
  {
    id: 'symptom-camera-wont-open',
    code: 'G15',
    name: 'Kamera tidak dapat dibuka',
    description: 'Aplikasi kamera gagal terbuka atau langsung menutup sendiri saat diluncurkan.',
    category: 'Kamera',
  },
  {
    id: 'symptom-camera-blurry',
    code: 'G16',
    name: 'Hasil kamera buram meskipun lensa bersih',
    description: 'Foto atau video yang diambil tampak tidak fokus meskipun lensa dalam kondisi bersih.',
    category: 'Kamera',
  },
  {
    id: 'symptom-signal-lost',
    code: 'G17',
    name: 'Sinyal sering hilang',
    description: 'Kekuatan sinyal jaringan seluler sering hilang atau berfluktuasi secara tidak normal.',
    category: 'Jaringan',
  },
  {
    id: 'symptom-sim-unread',
    code: 'G18',
    name: 'Kartu SIM tidak terbaca',
    description: 'Perangkat tidak mendeteksi kartu SIM yang terpasang atau menampilkan pesan tidak ada SIM.',
    category: 'Jaringan',
  },
  {
    id: 'symptom-device-dead',
    code: 'G19',
    name: 'Perangkat mati total',
    description: 'Perangkat sama sekali tidak menyala atau tidak memberikan respons apapun.',
    category: 'Daya',
  },
  {
    id: 'symptom-wont-turn-on',
    code: 'G20',
    name: 'Perangkat tidak menyala meskipun sudah diisi daya',
    description: 'Perangkat tetap tidak bisa dinyalakan meskipun sudah terhubung ke charger dalam waktu cukup.',
    category: 'Daya',
  },
  {
    id: 'symptom-power-button-stuck',
    code: 'G21',
    name: 'Tombol power sulit digunakan',
    description: 'Tombol daya terasa keras, macet, atau tidak memberikan respons saat ditekan.',
    category: 'Daya',
  },
  {
    id: 'symptom-hot-idle',
    code: 'G22',
    name: 'Perangkat sangat panas tanpa penggunaan berat',
    description: 'Suhu perangkat sangat tinggi bahkan saat tidak menjalankan aplikasi yang berat.',
    category: 'Baterai',
  },
  {
    id: 'symptom-storage-full-crash',
    code: 'G23',
    name: 'Memori penuh dan sistem sering berhenti',
    description: 'Penyimpanan internal hampir penuh sehingga menyebabkan sistem sering berhenti atau tidak responsif.',
    category: 'Sistem',
  },
  {
    id: 'symptom-wifi-bt-dead',
    code: 'G24',
    name: 'Wi-Fi atau Bluetooth tidak dapat aktif',
    description: 'Fitur Wi-Fi atau Bluetooth tidak bisa diaktifkan atau terus-menerus terputus.',
    category: 'Jaringan',
  },
  {
    id: 'symptom-liquid-contact',
    code: 'G25',
    name: 'Perangkat terkena air atau cairan',
    description: 'Perangkat pernah terkena tumpahan air atau cairan lainnya.',
    category: 'Kerusakan Fisik',
  },
];

// ─── 21 Rule — R01..R21 ──────────────────────────────────────────────────────
// Mengacu pada symptom.id dan condition.id di atas

export const mockRules: Rule[] = [
  {
    id: 'rule-r01-battery',
    code: 'R01',
    conditionId: 'condition-battery-damage',
    symptomIds: ['symptom-battery-drain', 'symptom-device-hot'],
  },
  {
    id: 'rule-r02-battery',
    code: 'R02',
    conditionId: 'condition-battery-damage',
    symptomIds: ['symptom-battery-drain', 'symptom-hot-idle'],
  },
  {
    id: 'rule-r03-charging-port',
    code: 'R03',
    conditionId: 'condition-charging-port',
    symptomIds: ['symptom-no-charge-response', 'symptom-port-loose'],
  },
  {
    id: 'rule-r04-charging-port',
    code: 'R04',
    conditionId: 'condition-charging-port',
    symptomIds: ['symptom-no-charge-response', 'symptom-charging-disconnect'],
  },
  {
    id: 'rule-r05-lcd',
    code: 'R05',
    conditionId: 'condition-lcd-touchscreen',
    symptomIds: ['symptom-touch-unresponsive', 'symptom-screen-lines-spots'],
  },
  {
    id: 'rule-r06-lcd',
    code: 'R06',
    conditionId: 'condition-lcd-touchscreen',
    symptomIds: ['symptom-touch-unresponsive', 'symptom-screen-black'],
  },
  {
    id: 'rule-r07-os',
    code: 'R07',
    conditionId: 'condition-os-firmware',
    symptomIds: ['symptom-bootloop', 'symptom-random-restart'],
  },
  {
    id: 'rule-r08-os',
    code: 'R08',
    conditionId: 'condition-os-firmware',
    symptomIds: ['symptom-app-crash', 'symptom-system-slow'],
  },
  {
    id: 'rule-r09-speaker',
    code: 'R09',
    conditionId: 'condition-speaker-damage',
    symptomIds: ['symptom-no-speaker-sound', 'symptom-speaker-distorted'],
  },
  {
    id: 'rule-r10-camera',
    code: 'R10',
    conditionId: 'condition-camera-damage',
    symptomIds: ['symptom-camera-wont-open', 'symptom-camera-blurry'],
  },
  {
    id: 'rule-r11-network',
    code: 'R11',
    conditionId: 'condition-network-sim',
    symptomIds: ['symptom-signal-lost', 'symptom-sim-unread'],
  },
  {
    id: 'rule-r12-ic-power',
    code: 'R12',
    conditionId: 'condition-ic-power',
    symptomIds: ['symptom-device-dead', 'symptom-wont-turn-on'],
  },
  {
    id: 'rule-r13-ic-power',
    code: 'R13',
    conditionId: 'condition-ic-power',
    symptomIds: ['symptom-wont-turn-on', 'symptom-power-button-stuck'],
  },
  {
    id: 'rule-r14-os',
    code: 'R14',
    conditionId: 'condition-os-firmware',
    symptomIds: ['symptom-storage-full-crash', 'symptom-app-crash'],
  },
  {
    id: 'rule-r15-os',
    code: 'R15',
    conditionId: 'condition-os-firmware',
    symptomIds: ['symptom-wifi-bt-dead', 'symptom-random-restart'],
  },
  {
    id: 'rule-r16-liquid',
    code: 'R16',
    conditionId: 'condition-liquid-damage',
    symptomIds: ['symptom-liquid-contact', 'symptom-device-dead'],
  },
  {
    id: 'rule-r17-liquid',
    code: 'R17',
    conditionId: 'condition-liquid-damage',
    symptomIds: ['symptom-liquid-contact', 'symptom-no-charge-response'],
  },
  {
    id: 'rule-r18-charging-port',
    code: 'R18',
    conditionId: 'condition-charging-port',
    symptomIds: ['symptom-device-hot', 'symptom-no-charge-response', 'symptom-charging-disconnect'],
  },
  {
    id: 'rule-r19-lcd',
    code: 'R19',
    conditionId: 'condition-lcd-touchscreen',
    symptomIds: ['symptom-screen-lines-spots', 'symptom-screen-black'],
  },
  {
    id: 'rule-r20-network',
    code: 'R20',
    conditionId: 'condition-network-sim',
    symptomIds: ['symptom-signal-lost', 'symptom-wifi-bt-dead'],
  },
  {
    id: 'rule-r21-os',
    code: 'R21',
    conditionId: 'condition-os-firmware',
    symptomIds: ['symptom-bootloop', 'symptom-app-crash', 'symptom-system-slow'],
  },
];
