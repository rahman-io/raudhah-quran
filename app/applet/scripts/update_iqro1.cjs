const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/iqroData.ts');
let code = fs.readFileSync(filePath, 'utf8');

const iqro1Pages = [
  {
    "pageNumber": 1,
    "title": "Halaman 1: Huruf اَ (A) dan بَ (BA)",
    "subtitle": "Pengenalan Huruf Tunggal Vokal Fathah Pendek",
    "teacherNote": "Baca langsung A, BA dan seterusnya. Tidak perlu dieja. Baca dengan pendek dan tegas.",
    "rows": [
      {
        "id": "j1_p1_r1",
        "items": [
          { "id": "1", "arabic": "أَ  بَ  أَ", "latin": "A - BA - A" },
          { "id": "2", "arabic": "أَ  بَ", "latin": "A - BA" },
          { "id": "3", "arabic": "بَ", "latin": "BA" }
        ]
      },
      {
        "id": "j1_p1_r2",
        "items": [
          { "id": "4", "arabic": "بَ  بَ  بَ", "latin": "BA - BA - BA" },
          { "id": "5", "arabic": "أَ  أَ  أَ", "latin": "A - A - A" },
          { "id": "6", "arabic": "بَ  أَ  بَ", "latin": "BA - A - BA" }
        ]
      },
      {
        "id": "j1_p1_r3",
        "items": [
          { "id": "7", "arabic": "بَ  أَ  بَ", "latin": "BA - A - BA" },
          { "id": "8", "arabic": "أَ  بَ  بَ", "latin": "A - BA - BA" },
          { "id": "9", "arabic": "بَ  بَ  أَ", "latin": "BA - BA - A" }
        ]
      },
      {
        "id": "j1_p1_r4",
        "items": [
          { "id": "10", "arabic": "أَ  بَ  أَ", "latin": "A - BA - A" },
          { "id": "11", "arabic": "أَ  بَ  أَ", "latin": "A - BA - A" },
          { "id": "12", "arabic": "بَ  أَ  بَ", "latin": "BA - A - BA" }
        ]
      },
      {
        "id": "j1_p1_r5",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  أَ", "latin": "A - BA - A" },
          { "id": "14", "arabic": "بَ  بَ  بَ", "latin": "BA - BA - BA" },
          { "id": "15", "arabic": "أَ  أَ  أَ", "latin": "A - A - A" }
        ]
      },
      {
        "id": "j1_p1_r6",
        "items": [
          { "id": "16", "arabic": "أَ  بَ", "latin": "A - BA" },
          { "id": "17", "arabic": "أَ  بَ", "latin": "A - BA" },
          { "id": "18", "arabic": "أَ  بَ", "latin": "A - BA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 2,
    "title": "Halaman 2: Huruf بَ (BA) dan تَ (TA)",
    "subtitle": "Membaca Langsung A, BA, TA Pendek 1 Ketukan",
    "teacherNote": "Baca langsung A, BA, TA dan seterusnya. Tidak perlu dieja. Baca dengan pendek.",
    "rows": [
      {
        "id": "j1_p2_r1",
        "items": [
          { "id": "1", "arabic": "أَ  بَ  تَ", "latin": "A - BA - TA" },
          { "id": "2", "arabic": "بَ  تَ  أَ", "latin": "BA - TA - A" }
        ]
      },
      {
        "id": "j1_p2_r2",
        "items": [
          { "id": "3", "arabic": "تَ  أَ  بَ", "latin": "TA - A - BA" },
          { "id": "4", "arabic": "أَ  بَ  تَ", "latin": "A - BA - TA" }
        ]
      },
      {
        "id": "j1_p2_r3",
        "items": [
          { "id": "5", "arabic": "بَ  تَ  أَ", "latin": "BA - TA - A" },
          { "id": "6", "arabic": "أَ  تَ  بَ", "latin": "A - TA - BA" }
        ]
      },
      {
        "id": "j1_p2_r4",
        "items": [
          { "id": "7", "arabic": "تَ  أَ  بَ", "latin": "TA - A - BA" },
          { "id": "8", "arabic": "تَ  أَ  تَ", "latin": "TA - A - TA" }
        ]
      },
      {
        "id": "j1_p2_r5",
        "items": [
          { "id": "9", "arabic": "أَ  تَ  بَ", "latin": "A - TA - BA" },
          { "id": "10", "arabic": "تَ  تَ  أَ", "latin": "TA - TA - A" }
        ]
      },
      {
        "id": "j1_p2_r6",
        "items": [
          { "id": "11", "arabic": "أَ  بَ  تَ", "latin": "A - BA - TA" },
          { "id": "12", "arabic": "أَ  بَ  تَ", "latin": "A - BA - TA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 3,
    "title": "Halaman 3: Huruf ثَ (TSA)",
    "subtitle": "Pengenalan Huruf ثَ (TSA) Ujung Lidah",
    "teacherNote": "Bedakan bunyi huruf ثَ (TSA) dengan ujung lidah bertemu ujung gigi seri atas.",
    "rows": [
      {
        "id": "j1_p3_r1",
        "items": [
          { "id": "1", "arabic": "ثَ  أَ  بَ", "latin": "TSA - A - BA" },
          { "id": "2", "arabic": "ثَ  بَ  تَ", "latin": "TSA - BA - TA" }
        ]
      },
      {
        "id": "j1_p3_r2",
        "items": [
          { "id": "3", "arabic": "بَ  تَ  ثَ", "latin": "BA - TA - TSA" },
          { "id": "4", "arabic": "بَ  أَ  ثَ", "latin": "BA - A - TSA" }
        ]
      },
      {
        "id": "j1_p3_r3",
        "items": [
          { "id": "5", "arabic": "أَ  تَ  بَ", "latin": "A - TA - BA" },
          { "id": "6", "arabic": "ثَ  بَ  ثَ", "latin": "TSA - BA - TSA" }
        ]
      },
      {
        "id": "j1_p3_r4",
        "items": [
          { "id": "7", "arabic": "تَ  بَ  تَ", "latin": "TA - BA - TA" },
          { "id": "8", "arabic": "أَ  ثَ  ثَ", "latin": "A - TSA - TSA" }
        ]
      },
      {
        "id": "j1_p3_r5",
        "items": [
          { "id": "9", "arabic": "تَ  تَ  أَ", "latin": "TA - TA - A" },
          { "id": "10", "arabic": "بَ  ثَ  ثَ", "latin": "BA - TSA - TSA" }
        ]
      },
      {
        "id": "j1_p3_r6",
        "items": [
          { "id": "11", "arabic": "ثَ  بَ  تَ", "latin": "TSA - BA - TA" },
          { "id": "12", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 4,
    "title": "Halaman 4: Huruf جَ (JA)",
    "subtitle": "Pengenalan Huruf جَ (JA)",
    "teacherNote": "Suara جَ dibaca bersih tanpa mendesis pendek 1 ketukan.",
    "rows": [
      {
        "id": "j1_p4_r1",
        "items": [
          { "id": "1", "arabic": "أَ  جَ  جَ", "latin": "A - JA - JA" },
          { "id": "2", "arabic": "ثَ  أَ  جَ", "latin": "TSA - A - JA" }
        ]
      },
      {
        "id": "j1_p4_r2",
        "items": [
          { "id": "3", "arabic": "أَ  تَ  جَ", "latin": "A - TA - JA" },
          { "id": "4", "arabic": "ثَ  بَ  جَ", "latin": "TSA - BA - JA" }
        ]
      },
      {
        "id": "j1_p4_r3",
        "items": [
          { "id": "5", "arabic": "بَ  جَ  ثَ", "latin": "BA - JA - TSA" },
          { "id": "6", "arabic": "ثَ  أَ  جَ", "latin": "TSA - A - JA" }
        ]
      },
      {
        "id": "j1_p4_r4",
        "items": [
          { "id": "7", "arabic": "جَ  أَ  بَ", "latin": "JA - A - BA" },
          { "id": "8", "arabic": "جَ  أَ  ثَ", "latin": "JA - A - TSA" }
        ]
      },
      {
        "id": "j1_p4_r5",
        "items": [
          { "id": "9", "arabic": "تَ  أَ  جَ", "latin": "TA - A - JA" },
          { "id": "10", "arabic": "ثَ  جَ  جَ", "latin": "TSA - JA - JA" }
        ]
      },
      {
        "id": "j1_p4_r6",
        "items": [
          { "id": "11", "arabic": "جَ  أَ  جَ", "latin": "JA - A - JA" },
          { "id": "12", "arabic": "جَ  ثَ  ثَ", "latin": "JA - TSA - TSA" }
        ]
      },
      {
        "id": "j1_p4_r7",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ  جَ", "latin": "A - BA - TA - TSA - JA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 5,
    "title": "Halaman 5: Huruf حَ (HA Halus)",
    "subtitle": "Pengenalan Huruf حَ (HA Dari Tengah Tenggorokan)",
    "teacherNote": "Suara حَ dibaca bersih dan halus dari tengah tenggorokan.",
    "rows": [
      {
        "id": "j1_p5_r1",
        "items": [
          { "id": "1", "arabic": "جَ  أَ  حَ", "latin": "JA - A - HA" },
          { "id": "2", "arabic": "حَ  حَ  ثَ", "latin": "HA - HA - TSA" }
        ]
      },
      {
        "id": "j1_p5_r2",
        "items": [
          { "id": "3", "arabic": "حَ  جَ  تَ", "latin": "HA - JA - TA" },
          { "id": "4", "arabic": "بَ  حَ  ثَ", "latin": "BA - HA - TSA" }
        ]
      },
      {
        "id": "j1_p5_r3",
        "items": [
          { "id": "5", "arabic": "جَ  حَ  تَ", "latin": "JA - HA - TA" },
          { "id": "6", "arabic": "أَ  حَ  بَ", "latin": "A - HA - BA" }
        ]
      },
      {
        "id": "j1_p5_r4",
        "items": [
          { "id": "7", "arabic": "جَ  أَ  ثَ", "latin": "JA - A - TSA" },
          { "id": "8", "arabic": "حَ  أَ  حَ", "latin": "HA - A - HA" }
        ]
      },
      {
        "id": "j1_p5_r5",
        "items": [
          { "id": "9", "arabic": "ثَ  بَ  حَ", "latin": "TSA - BA - HA" },
          { "id": "10", "arabic": "تَ  أَ  حَ", "latin": "TA - A - HA" }
        ]
      },
      {
        "id": "j1_p5_r6",
        "items": [
          { "id": "11", "arabic": "أَ  جَ  جَ", "latin": "A - JA - JA" },
          { "id": "12", "arabic": "أَ  حَ  حَ", "latin": "A - HA - HA" }
        ]
      },
      {
        "id": "j1_p5_r7",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ  جَ  حَ", "latin": "A - BA - TA - TSA - JA - HA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 6,
    "title": "Halaman 6: Huruf خَ (KHO)",
    "subtitle": "Pengenalan Huruf خَ (KHO Dari Tenggorokan Atas)",
    "teacherNote": "Suara خَ dibaca dari tenggorokan atas (berbunyi agak kasar).",
    "rows": [
      {
        "id": "j1_p6_r1",
        "items": [
          { "id": "1", "arabic": "خَ  أَ  خَ", "latin": "KHO - A - KHO" },
          { "id": "2", "arabic": "جَ  أَ  خَ", "latin": "JA - A - KHO" }
        ]
      },
      {
        "id": "j1_p6_r2",
        "items": [
          { "id": "3", "arabic": "ثَ  أَ  خَ", "latin": "TSA - A - KHO" },
          { "id": "4", "arabic": "خَ  تَ  جَ", "latin": "KHO - TA - JA" }
        ]
      },
      {
        "id": "j1_p6_r3",
        "items": [
          { "id": "5", "arabic": "بَ  أَ  خَ", "latin": "BA - A - KHO" },
          { "id": "6", "arabic": "تَ  حَ  ثَ", "latin": "TA - HA - TSA" }
        ]
      },
      {
        "id": "j1_p6_r4",
        "items": [
          { "id": "7", "arabic": "جَ  أَ  خَ", "latin": "JA - A - KHO" },
          { "id": "8", "arabic": "بَ  حَ  ثَ", "latin": "BA - HA - TSA" }
        ]
      },
      {
        "id": "j1_p6_r5",
        "items": [
          { "id": "9", "arabic": "تَ  أَ  خَ", "latin": "TA - A - KHO" },
          { "id": "10", "arabic": "جَ  حَ  ثَ", "latin": "JA - HA - TSA" }
        ]
      },
      {
        "id": "j1_p6_r6",
        "items": [
          { "id": "11", "arabic": "أَ  خَ  خَ", "latin": "A - KHO - KHO" },
          { "id": "12", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" }
        ]
      },
      {
        "id": "j1_p6_r7",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ  جَ  حَ  خَ", "latin": "A s.d. KHO" }
        ]
      }
    ]
  },
  {
    "pageNumber": 7,
    "title": "Halaman 7: Huruf دَ (DA)",
    "subtitle": "Pengenalan Huruf دَ (DA)",
    "teacherNote": "Suara دَ dibaca pendek dan tipis 1 ketukan.",
    "rows": [
      {
        "id": "j1_p7_r1",
        "items": [
          { "id": "1", "arabic": "خَ  دَ  دَ", "latin": "KHO - DA - DA" },
          { "id": "2", "arabic": "حَ  دَ  خَ", "latin": "HA - DA - KHO" }
        ]
      },
      {
        "id": "j1_p7_r2",
        "items": [
          { "id": "3", "arabic": "حَ  دَ  ثَ", "latin": "HA - DA - TSA" },
          { "id": "4", "arabic": "جَ  خَ  دَ", "latin": "JA - KHO - DA" }
        ]
      },
      {
        "id": "j1_p7_r3",
        "items": [
          { "id": "5", "arabic": "خَ  تَ  دَ", "latin": "KHO - TA - DA" },
          { "id": "6", "arabic": "حَ  جَ  دَ", "latin": "HA - JA - DA" }
        ]
      },
      {
        "id": "j1_p7_r4",
        "items": [
          { "id": "7", "arabic": "ثَ  بَ  دَ", "latin": "TSA - BA - DA" },
          { "id": "8", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" }
        ]
      },
      {
        "id": "j1_p7_r5",
        "items": [
          { "id": "9", "arabic": "حَ  بَ  دَ", "latin": "HA - BA - DA" },
          { "id": "10", "arabic": "جَ  دَ  جَ", "latin": "JA - DA - JA" }
        ]
      },
      {
        "id": "j1_p7_r6",
        "items": [
          { "id": "11", "arabic": "حَ  جَ  تَ", "latin": "HA - JA - TA" },
          { "id": "12", "arabic": "خَ  دَ  دَ", "latin": "KHO - DA - DA" }
        ]
      },
      {
        "id": "j1_p7_r7",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ  جَ  حَ  خَ  دَ", "latin": "A s.d. DA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 8,
    "title": "Halaman 8: Huruf ذَ (DZA)",
    "subtitle": "Pengenalan Huruf ذَ (DZA Ujung Lidah)",
    "teacherNote": "Bedakan bunyi دَ (DA) dan ذَ (DZA) dengan ujung lidah.",
    "rows": [
      {
        "id": "j1_p8_r1",
        "items": [
          { "id": "1", "arabic": "دَ  أَ  ذَ", "latin": "DA - A - DZA" },
          { "id": "2", "arabic": "خَ  دَ  ذَ", "latin": "KHO - DA - DZA" }
        ]
      },
      {
        "id": "j1_p8_r2",
        "items": [
          { "id": "3", "arabic": "أَ  حَ  دَ", "latin": "A - HA - DA" },
          { "id": "4", "arabic": "جَ  حَ  ذَ", "latin": "JA - HA - DZA" }
        ]
      },
      {
        "id": "j1_p8_r3",
        "items": [
          { "id": "5", "arabic": "خَ  تَ  دَ", "latin": "KHO - TA - DA" },
          { "id": "6", "arabic": "ثَ  أَ  ذَ", "latin": "TSA - A - DZA" }
        ]
      },
      {
        "id": "j1_p8_r4",
        "items": [
          { "id": "7", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "8", "arabic": "ذَ  بَ  حَ", "latin": "DZA - BA - HA" }
        ]
      },
      {
        "id": "j1_p8_r5",
        "items": [
          { "id": "9", "arabic": "حَ  دَ  ثَ", "latin": "HA - DA - TSA" },
          { "id": "10", "arabic": "أَ  خَ  ذَ", "latin": "A - KHO - DZA" }
        ]
      },
      {
        "id": "j1_p8_r6",
        "items": [
          { "id": "11", "arabic": "دَ  أَ  ذَ", "latin": "DA - A - DZA" },
          { "id": "12", "arabic": "خَ  دَ  ذَ", "latin": "KHO - DA - DZA" }
        ]
      },
      {
        "id": "j1_p8_r7",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ  جَ  حَ  خَ  دَ  ذَ", "latin": "A s.d. DZA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 9,
    "title": "Halaman 9: Huruf رَ (RO)",
    "subtitle": "Pengenalan Huruf رَ (RO Tebal)",
    "teacherNote": "Suara رَ dibaca tebal pendek 1 ketukan.",
    "rows": [
      {
        "id": "j1_p9_r1",
        "items": [
          { "id": "1", "arabic": "دَ  ذَ  رَ", "latin": "DA - DZA - RO" },
          { "id": "2", "arabic": "خَ  ذَ  رَ", "latin": "KHO - DZA - RO" }
        ]
      },
      {
        "id": "j1_p9_r2",
        "items": [
          { "id": "3", "arabic": "رَ  حَ  دَ", "latin": "RO - HA - DA" },
          { "id": "4", "arabic": "جَ  رَ  ذَ", "latin": "JA - RO - DZA" }
        ]
      },
      {
        "id": "j1_p9_r3",
        "items": [
          { "id": "5", "arabic": "رَ  حَ  ثَ", "latin": "RO - HA - TSA" },
          { "id": "6", "arabic": "تَ  ذَ  رَ", "latin": "TA - DZA - RO" }
        ]
      },
      {
        "id": "j1_p9_r4",
        "items": [
          { "id": "7", "arabic": "بَ  رَ  دَ", "latin": "BA - RO - DA" },
          { "id": "8", "arabic": "خَ  رَ  جَ", "latin": "KHO - RO - JA" }
        ]
      },
      {
        "id": "j1_p9_r5",
        "items": [
          { "id": "9", "arabic": "حَ  ذَ  رَ", "latin": "HA - DZA - RO" },
          { "id": "10", "arabic": "بَ  رَ  ثَ", "latin": "BA - RO - TSA" }
        ]
      },
      {
        "id": "j1_p9_r6",
        "items": [
          { "id": "11", "arabic": "خَ  خَ  ذَ", "latin": "KHO - KHO - DZA" },
          { "id": "12", "arabic": "حَ  جَ  رَ", "latin": "HA - JA - RO" }
        ]
      },
      {
        "id": "j1_p9_r7",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ  جَ  حَ  خَ  دَ  ذَ  رَ", "latin": "A s.d. RO" }
        ]
      }
    ]
  },
  {
    "pageNumber": 10,
    "title": "Halaman 10: Huruf زَ (ZA)",
    "subtitle": "Pengenalan Huruf زَ (ZA Bedakan Dengan رَ)",
    "teacherNote": "Bedakan bunyi رَ (RO) dan زَ (ZA mendesis).",
    "rows": [
      {
        "id": "j1_p10_r1",
        "items": [
          { "id": "1", "arabic": "رَ  أَ  زَ", "latin": "RO - A - ZA" },
          { "id": "2", "arabic": "ذَ  رَ  زَ", "latin": "DZA - RO - ZA" }
        ]
      },
      {
        "id": "j1_p10_r2",
        "items": [
          { "id": "3", "arabic": "زَ  دَ  رَ", "latin": "ZA - DA - RO" },
          { "id": "4", "arabic": "زَ  خَ  ذَ", "latin": "ZA - KHO - DZA" }
        ]
      },
      {
        "id": "j1_p10_r3",
        "items": [
          { "id": "5", "arabic": "زَ  حَ  دَ", "latin": "ZA - HA - DA" },
          { "id": "6", "arabic": "ثَ  رَ  زَ", "latin": "TSA - RO - ZA" }
        ]
      },
      {
        "id": "j1_p10_r4",
        "items": [
          { "id": "7", "arabic": "خَ  رَ  جَ", "latin": "KHO - RO - JA" },
          { "id": "8", "arabic": "تَ  زَ  دَ", "latin": "TA - ZA - DA" }
        ]
      },
      {
        "id": "j1_p10_r5",
        "items": [
          { "id": "9", "arabic": "بَ  زَ  رَ", "latin": "BA - ZA - RO" },
          { "id": "10", "arabic": "ثَ  حَ  ذَ", "latin": "TSA - HA - DZA" }
        ]
      },
      {
        "id": "j1_p10_r6",
        "items": [
          { "id": "11", "arabic": "جَ  أَ  خَ", "latin": "JA - A - KHO" },
          { "id": "12", "arabic": "زَ  أَ  زَ", "latin": "ZA - A - ZA" }
        ]
      },
      {
        "id": "j1_p10_r7",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ  جَ  حَ  خَ  دَ  ذَ  رَ  زَ", "latin": "A s.d. ZA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 11,
    "title": "Halaman 11: Huruf سَ (SA)",
    "subtitle": "Pengenalan Huruf سَ (SA Tipis)",
    "teacherNote": "Suara سَ dibaca halus tipis dan pendek.",
    "rows": [
      {
        "id": "j1_p11_r1",
        "items": [
          { "id": "1", "arabic": "زَ  أَ  سَ", "latin": "ZA - A - SA" },
          { "id": "2", "arabic": "زَ  رَ  سَ", "latin": "ZA - RO - SA" }
        ]
      },
      {
        "id": "j1_p11_r2",
        "items": [
          { "id": "3", "arabic": "سَ  خَ  ذَ", "latin": "SA - KHO - DZA" },
          { "id": "4", "arabic": "حَ  سَ  دَ", "latin": "HA - SA - DA" }
        ]
      },
      {
        "id": "j1_p11_r3",
        "items": [
          { "id": "5", "arabic": "سَ  خَ  ثَ", "latin": "SA - KHO - TSA" },
          { "id": "6", "arabic": "جَ  زَ  رَ", "latin": "JA - ZA - RO" }
        ]
      },
      {
        "id": "j1_p11_r4",
        "items": [
          { "id": "7", "arabic": "سَ  بَ  تَ", "latin": "SA - BA - TA" },
          { "id": "8", "arabic": "ذَ  رَ  سَ", "latin": "DZA - RO - SA" }
        ]
      },
      {
        "id": "j1_p11_r5",
        "items": [
          { "id": "9", "arabic": "سَ  خَ  ذَ", "latin": "SA - KHO - DZA" },
          { "id": "10", "arabic": "زَ  حَ  دَ", "latin": "ZA - HA - DA" }
        ]
      },
      {
        "id": "j1_p11_r6",
        "items": [
          { "id": "11", "arabic": "سَ  جَ  ثَ", "latin": "SA - JA - TSA" },
          { "id": "12", "arabic": "أَ  بَ  تَ", "latin": "A - BA - TA" }
        ]
      },
      {
        "id": "j1_p11_r7",
        "items": [
          { "id": "13", "arabic": "ثَ  جَ  حَ  خَ  دَ  ذَ  رَ  زَ  سَ", "latin": "TSA s.d. SA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 12,
    "title": "Halaman 12: Huruf شَ (SYA)",
    "subtitle": "Pengenalan Huruf شَ (SYA Menyebar Bunyi)",
    "teacherNote": "Bedakan bunyi سَ (SA) dan شَ (SYA desis menyebar).",
    "rows": [
      {
        "id": "j1_p12_r1",
        "items": [
          { "id": "1", "arabic": "سَ  أَ  شَ", "latin": "SA - A - SYA" },
          { "id": "2", "arabic": "سَ  شَ  شَ", "latin": "SA - SYA - SYA" },
          { "id": "3", "arabic": "زَ  تَ  شَ", "latin": "ZA - TA - SYA" }
        ]
      },
      {
        "id": "j1_p12_r2",
        "items": [
          { "id": "4", "arabic": "شَ  ذَ  ثَ", "latin": "SYA - DZA - TSA" },
          { "id": "5", "arabic": "دَ  رَ  سَ", "latin": "DA - RO - SA" },
          { "id": "6", "arabic": "شَ  تَ  ذَ", "latin": "SYA - TA - DZA" }
        ]
      },
      {
        "id": "j1_p12_r3",
        "items": [
          { "id": "7", "arabic": "زَ  حَ  ثَ", "latin": "ZA - HA - TSA" },
          { "id": "8", "arabic": "خَ  شَ  بَ", "latin": "KHO - SYA - BA" },
          { "id": "9", "arabic": "جَ  رَ  سَ", "latin": "JA - RO - SA" }
        ]
      },
      {
        "id": "j1_p12_r4",
        "items": [
          { "id": "10", "arabic": "سَ  شَ  أَ", "latin": "SA - SYA - A" },
          { "id": "11", "arabic": "رَ  شَ  ذَ", "latin": "RO - SYA - DZA" },
          { "id": "12", "arabic": "حَ  سَ  دَ", "latin": "HA - SA - DA" }
        ]
      },
      {
        "id": "j1_p12_r5",
        "items": [
          { "id": "13", "arabic": "ذَ  خَ  زَ", "latin": "DZA - KHO - ZA" },
          { "id": "14", "arabic": "أَ  سَ  شَ", "latin": "A - SA - SYA" },
          { "id": "15", "arabic": "شَ  زَ  رَ", "latin": "SYA - ZA - RO" }
        ]
      },
      {
        "id": "j1_p12_r6",
        "items": [
          { "id": "16", "arabic": "خَ  سَ  دَ", "latin": "KHO - SA - DA" },
          { "id": "17", "arabic": "شَ  زَ  جَ", "latin": "SYA - ZA - JA" },
          { "id": "18", "arabic": "أَ  بَ  تَ", "latin": "A - BA - TA" }
        ]
      },
      {
        "id": "j1_p12_r7",
        "items": [
          { "id": "19", "arabic": "ثَ  جَ  حَ  خَ  دَ  ذَ  رَ  زَ  سَ  شَ", "latin": "TSA s.d. SYA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 13,
    "title": "Halaman 13: Huruf صَ (SO)",
    "subtitle": "Pengenalan Huruf صَ (SO Tebal)",
    "teacherNote": "Suara صَ dibaca tebal dari pangkal lidah.",
    "rows": [
      {
        "id": "j1_p13_r1",
        "items": [
          { "id": "1", "arabic": "صَ  أَ  شَ", "latin": "SO - A - SYA" },
          { "id": "2", "arabic": "صَ  شَ  زَ", "latin": "SO - SYA - ZA" },
          { "id": "3", "arabic": "سَ  رَ  صَ", "latin": "SA - RO - SO" }
        ]
      },
      {
        "id": "j1_p13_r2",
        "items": [
          { "id": "4", "arabic": "صَ  ثَ  ذَ", "latin": "SO - TSA - DZA" },
          { "id": "5", "arabic": "دَ  سَ  صَ", "latin": "DA - SA - SO" },
          { "id": "6", "arabic": "شَ  رَ  تَ", "latin": "SYA - RO - TA" }
        ]
      },
      {
        "id": "j1_p13_r3",
        "items": [
          { "id": "7", "arabic": "سَ  خَ  صَ", "latin": "SA - KHO - SO" },
          { "id": "8", "arabic": "حَ  صَ  دَ", "latin": "HA - SO - DA" },
          { "id": "9", "arabic": "ذَ  زَ  صَ", "latin": "DZA - ZA - SO" }
        ]
      },
      {
        "id": "j1_p13_r4",
        "items": [
          { "id": "10", "arabic": "حَ  ذَ  رَ", "latin": "HA - DZA - RO" },
          { "id": "11", "arabic": "شَ  بَ  صَ", "latin": "SYA - BA - SO" },
          { "id": "12", "arabic": "سَ  جَ  زَ", "latin": "SA - JA - ZA" }
        ]
      },
      {
        "id": "j1_p13_r5",
        "items": [
          { "id": "13", "arabic": "صَ  دَ  خَ", "latin": "SO - DA - KHO" },
          { "id": "14", "arabic": "صَ  جَ  ذَ", "latin": "SO - JA - DZA" },
          { "id": "15", "arabic": "شَ  رَ  زَ", "latin": "SYA - RO - ZA" }
        ]
      },
      {
        "id": "j1_p13_r6",
        "items": [
          { "id": "16", "arabic": "ثَ  خَ  صَ", "latin": "TSA - KHO - SO" },
          { "id": "17", "arabic": "أَ  بَ  تَ", "latin": "A - BA - TA" },
          { "id": "18", "arabic": "ثَ  جَ  حَ", "latin": "TSA - JA - HA" }
        ]
      },
      {
        "id": "j1_p13_r7",
        "items": [
          { "id": "19", "arabic": "خَ  دَ  ذَ  رَ  زَ  سَ  شَ  صَ", "latin": "KHO s.d. SO" }
        ]
      }
    ]
  },
  {
    "pageNumber": 14,
    "title": "Halaman 14: Huruf ضَ (DHO)",
    "subtitle": "Pengenalan Huruf ضَ (DHO Tebal)",
    "teacherNote": "Bedakan bunyi صَ (SO) dan ضَ (DHO).",
    "rows": [
      {
        "id": "j1_p14_r1",
        "items": [
          { "id": "1", "arabic": "صَ  أَ  ضَ", "latin": "SO - A - DHO" },
          { "id": "2", "arabic": "حَ  ضَ  رَ", "latin": "HA - DHO - RO" },
          { "id": "3", "arabic": "أَ  صَ  ضَ", "latin": "A - SO - DHO" }
        ]
      },
      {
        "id": "j1_p14_r2",
        "items": [
          { "id": "4", "arabic": "شَ  أَ  ضَ", "latin": "SYA - A - DHO" },
          { "id": "5", "arabic": "شَ  خَ  زَ", "latin": "SYA - KHO - ZA" },
          { "id": "6", "arabic": "ضَ  رَ  بَ", "latin": "DHO - RO - BA" }
        ]
      },
      {
        "id": "j1_p14_r3",
        "items": [
          { "id": "7", "arabic": "صَ  حَ  ثَ", "latin": "SO - HA - TSA" },
          { "id": "8", "arabic": "صَ  دَ  زَ", "latin": "SO - DA - ZA" },
          { "id": "9", "arabic": "دَ  شَ  ضَ", "latin": "DA - SYA - DHO" }
        ]
      },
      {
        "id": "j1_p14_r4",
        "items": [
          { "id": "10", "arabic": "سَ  حَ  ذَ", "latin": "SA - HA - DZA" },
          { "id": "11", "arabic": "رَ  صَ  دَ", "latin": "RO - SO - DA" },
          { "id": "12", "arabic": "ضَ  تَ  ذَ", "latin": "DHO - TA - DZA" }
        ]
      },
      {
        "id": "j1_p14_r5",
        "items": [
          { "id": "13", "arabic": "ثَ  خَ  زَ", "latin": "TSA - KHO - ZA" },
          { "id": "14", "arabic": "ضَ  جَ  ذَ", "latin": "DHO - JA - DZA" },
          { "id": "15", "arabic": "سَ  أَ  شَ", "latin": "SA - A - SYA" }
        ]
      },
      {
        "id": "j1_p14_r6",
        "items": [
          { "id": "16", "arabic": "صَ  رَ  ضَ", "latin": "SO - RO - DHO" },
          { "id": "17", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "18", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" }
        ]
      },
      {
        "id": "j1_p14_r7",
        "items": [
          { "id": "19", "arabic": "دَ  ذَ  رَ  زَ  سَ  شَ  صَ  ضَ", "latin": "DA s.d. DHO" }
        ]
      }
    ]
  },
  {
    "pageNumber": 15,
    "title": "Halaman 15: Huruf طَ (TO)",
    "subtitle": "Pengenalan Huruf طَ (TO Tebal)",
    "teacherNote": "Suara طَ dibaca tebal murni.",
    "rows": [
      {
        "id": "j1_p15_r1",
        "items": [
          { "id": "1", "arabic": "طَ  أَ  ضَ", "latin": "TO - A - DHO" },
          { "id": "2", "arabic": "زَ  طَ  شَ", "latin": "ZA - TO - SYA" },
          { "id": "3", "arabic": "حَ  جَ  طَ", "latin": "HA - JA - TO" }
        ]
      },
      {
        "id": "j1_p15_r2",
        "items": [
          { "id": "4", "arabic": "تَ  صَ  ضَ", "latin": "TA - SO - DHO" },
          { "id": "5", "arabic": "ذَ  طَ  سَ", "latin": "DZA - TO - SA" },
          { "id": "6", "arabic": "زَ  دَ  طَ", "latin": "ZA - DA - TO" }
        ]
      },
      {
        "id": "j1_p15_r3",
        "items": [
          { "id": "7", "arabic": "دَ  ضَ  صَ", "latin": "DA - DHO - SO" },
          { "id": "8", "arabic": "سَ  رَ  طَ", "latin": "SA - RO - TO" },
          { "id": "9", "arabic": "شَ  رَ  ثَ", "latin": "SYA - RO - TSA" }
        ]
      },
      {
        "id": "j1_p15_r4",
        "items": [
          { "id": "10", "arabic": "شَ  خَ  طَ", "latin": "SYA - KHO - TO" },
          { "id": "11", "arabic": "طَ  حَ  ذَ", "latin": "TO - HA - DZA" },
          { "id": "12", "arabic": "بَ  صَ  ضَ", "latin": "BA - SO - DHO" }
        ]
      },
      {
        "id": "j1_p15_r5",
        "items": [
          { "id": "13", "arabic": "ذَ  رَ  طَ", "latin": "DZA - RO - TO" },
          { "id": "14", "arabic": "جَ  زَ  ضَ", "latin": "JA - ZA - DHO" },
          { "id": "15", "arabic": "ثَ  أَ  شَ", "latin": "TSA - A - SYA" }
        ]
      },
      {
        "id": "j1_p15_r6",
        "items": [
          { "id": "16", "arabic": "سَ  خَ  طَ", "latin": "SA - KHO - TO" },
          { "id": "17", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "18", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" }
        ]
      },
      {
        "id": "j1_p15_r7",
        "items": [
          { "id": "19", "arabic": "دَ  ذَ  رَ  زَ  سَ  شَ  صَ  ضَ  طَ", "latin": "DA s.d. TO" }
        ]
      }
    ]
  },
  {
    "pageNumber": 16,
    "title": "Halaman 16: Huruf ظَ (ZHO)",
    "subtitle": "Pengenalan Huruf ظَ (ZHO Tebal Ujung Lidah)",
    "teacherNote": "Bedakan bunyi طَ (TO) dan ظَ (ZHO).",
    "rows": [
      {
        "id": "j1_p16_r1",
        "items": [
          { "id": "1", "arabic": "ظَ  أَ  طَ", "latin": "ZHO - A - TO" },
          { "id": "2", "arabic": "بَ  طَ  ظَ", "latin": "BA - TO - ZHO" },
          { "id": "3", "arabic": "ظَ  حَ  ذَ", "latin": "ZHO - HA - DZA" }
        ]
      },
      {
        "id": "j1_p16_r2",
        "items": [
          { "id": "4", "arabic": "سَ  ضَ  ظَ", "latin": "SA - DHO - ZHO" },
          { "id": "5", "arabic": "دَ  صَ  ظَ", "latin": "DA - SO - ZHO" },
          { "id": "6", "arabic": "طَ  حَ  ذَ", "latin": "TO - HA - DZA" }
        ]
      },
      {
        "id": "j1_p16_r3",
        "items": [
          { "id": "7", "arabic": "شَ  أَ  ظَ", "latin": "SYA - A - ZHO" },
          { "id": "8", "arabic": "سَ  رَ  صَ", "latin": "SA - RO - SO" },
          { "id": "9", "arabic": "زَ  خَ  طَ", "latin": "ZA - KHO - TO" }
        ]
      },
      {
        "id": "j1_p16_r4",
        "items": [
          { "id": "10", "arabic": "ثَ  رَ  ضَ", "latin": "TSA - RO - DHO" },
          { "id": "11", "arabic": "زَ  خَ  ضَ", "latin": "ZA - KHO - DHO" },
          { "id": "12", "arabic": "تَ  ضَ  ظَ", "latin": "TA - DHO - ZHO" }
        ]
      },
      {
        "id": "j1_p16_r5",
        "items": [
          { "id": "13", "arabic": "صَ  دَ  شَ", "latin": "SO - DA - SYA" },
          { "id": "14", "arabic": "جَ  طَ  ضَ", "latin": "JA - TO - DHO" },
          { "id": "15", "arabic": "شَ  طَ  ظَ", "latin": "SYA - TO - ZHO" }
        ]
      },
      {
        "id": "j1_p16_r6",
        "items": [
          { "id": "16", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "17", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "18", "arabic": "دَ  ذَ", "latin": "DA - DZA" }
        ]
      },
      {
        "id": "j1_p16_r7",
        "items": [
          { "id": "19", "arabic": "رَ  زَ  سَ  شَ  صَ  ضَ  طَ  ظَ", "latin": "RO s.d. ZHO" }
        ]
      }
    ]
  },
  {
    "pageNumber": 17,
    "title": "Halaman 17: Huruf عَ ('AIN)",
    "subtitle": "Pengenalan Huruf عَ ('AIN Dari Tengah Tenggorokan)",
    "teacherNote": "Suara عَ dibaca fasih dari tengah tenggorokan.",
    "rows": [
      {
        "id": "j1_p17_r1",
        "items": [
          { "id": "1", "arabic": "ظَ  أَ  عَ", "latin": "ZHO - A - 'A" },
          { "id": "2", "arabic": "تَ  عَ  رَ", "latin": "TA - 'A - RO" },
          { "id": "3", "arabic": "بَ  عَ  طَ", "latin": "BA - 'A - TO" }
        ]
      },
      {
        "id": "j1_p17_r2",
        "items": [
          { "id": "4", "arabic": "صَ  عَ  زَ", "latin": "SO - 'A - ZA" },
          { "id": "5", "arabic": "صَ  عَ  ضَ", "latin": "SO - 'A - DHO" },
          { "id": "6", "arabic": "دَ  حَ  ظَ", "latin": "DA - HA - ZHO" }
        ]
      },
      {
        "id": "j1_p17_r3",
        "items": [
          { "id": "7", "arabic": "بَ  عَ  ثَ", "latin": "BA - 'A - TSA" },
          { "id": "8", "arabic": "سَ  عَ  ظَ", "latin": "SA - 'A - ZHO" },
          { "id": "9", "arabic": "شَ  طَ  عَ", "latin": "SYA - TO - 'A" }
        ]
      },
      {
        "id": "j1_p17_r4",
        "items": [
          { "id": "10", "arabic": "جَ  خَ  ذَ", "latin": "JA - KHO - DZA" },
          { "id": "11", "arabic": "ضَ  عَ  شَ", "latin": "DHO - 'A - SYA" },
          { "id": "12", "arabic": "زَ  أَ  ضَ", "latin": "ZA - A - DHO" }
        ]
      },
      {
        "id": "j1_p17_r5",
        "items": [
          { "id": "13", "arabic": "عَ  جَ  ظَ", "latin": "'A - JA - ZHO" },
          { "id": "14", "arabic": "دَ  طَ  ضَ", "latin": "DA - TO - DHO" },
          { "id": "15", "arabic": "طَ  عَ  طَ", "latin": "TO - 'A - TO" }
        ]
      },
      {
        "id": "j1_p17_r6",
        "items": [
          { "id": "16", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "17", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "18", "arabic": "دَ  ذَ", "latin": "DA - DZA" }
        ]
      },
      {
        "id": "j1_p17_r7",
        "items": [
          { "id": "19", "arabic": "رَ  زَ  سَ  شَ  صَ  ضَ  طَ  ظَ  عَ", "latin": "RO s.d. 'A" }
        ]
      }
    ]
  },
  {
    "pageNumber": 18,
    "title": "Halaman 18: Huruf غَ (GHO)",
    "subtitle": "Pengenalan Huruf غَ (GHO Bedakan Dengan عَ)",
    "teacherNote": "Bedakan bunyi عَ ('AIN) dan غَ (GHO).",
    "rows": [
      {
        "id": "j1_p18_r1",
        "items": [
          { "id": "1", "arabic": "غَ  أَ  عَ", "latin": "GHO - A - 'A" },
          { "id": "2", "arabic": "دَ  غَ  ظَ", "latin": "DA - GHO - ZHO" },
          { "id": "3", "arabic": "عَ  طَ  غَ", "latin": "'A - TO - GHO" }
        ]
      },
      {
        "id": "j1_p18_r2",
        "items": [
          { "id": "4", "arabic": "ثَ  عَ  ظَ", "latin": "TSA - 'A - ZHO" },
          { "id": "5", "arabic": "جَ  غَ  ظَ", "latin": "JA - GHO - ZHO" },
          { "id": "6", "arabic": "سَ  طَ  عَ", "latin": "SA - TO - 'A" }
        ]
      },
      {
        "id": "j1_p18_r3",
        "items": [
          { "id": "7", "arabic": "حَ  رَ  ظَ", "latin": "HA - RO - ZHO" },
          { "id": "8", "arabic": "شَ  غَ  طَ", "latin": "SYA - GHO - TO" },
          { "id": "9", "arabic": "صَ  رَ  عَ", "latin": "SO - RO - 'A" }
        ]
      },
      {
        "id": "j1_p18_r4",
        "items": [
          { "id": "10", "arabic": "زَ  خَ  ظَ", "latin": "ZA - KHO - ZHO" },
          { "id": "11", "arabic": "ضَ  عَ  ذَ", "latin": "DHO - 'A - DZA" },
          { "id": "12", "arabic": "تَ  غَ  ضَ", "latin": "TA - GHO - DHO" }
        ]
      },
      {
        "id": "j1_p18_r5",
        "items": [
          { "id": "13", "arabic": "شَ  رَ  ظَ", "latin": "SYA - RO - ZHO" },
          { "id": "14", "arabic": "طَ  عَ  ظَ", "latin": "TO - 'A - ZHO" },
          { "id": "15", "arabic": "بَ  غَ  صَ", "latin": "BA - GHO - SO" }
        ]
      },
      {
        "id": "j1_p18_r6",
        "items": [
          { "id": "16", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "17", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "18", "arabic": "دَ  ذَ  رَ  زَ", "latin": "DA - DZA - RO - ZA" }
        ]
      },
      {
        "id": "j1_p18_r7",
        "items": [
          { "id": "19", "arabic": "سَ  شَ  صَ  ضَ  طَ  ظَ  عَ  غَ", "latin": "SA s.d. GHO" }
        ]
      }
    ]
  },
  {
    "pageNumber": 19,
    "title": "Halaman 19: Huruf فَ (FA)",
    "subtitle": "Pengenalan Huruf فَ (FA)",
    "teacherNote": "Suara فَ dibaca ringan dari gigi seri atas menyentuh bibir bawah.",
    "rows": [
      {
        "id": "j1_p19_r1",
        "items": [
          { "id": "1", "arabic": "فَ  أَ  غَ", "latin": "FA - A - GHO" },
          { "id": "2", "arabic": "فَ  عَ  ضَ", "latin": "FA - 'A - DHO" },
          { "id": "3", "arabic": "غَ  فَ  صَ", "latin": "GHO - FA - SO" }
        ]
      },
      {
        "id": "j1_p19_r2",
        "items": [
          { "id": "4", "arabic": "فَ  تَ  حَ", "latin": "FA - TA - HA" },
          { "id": "5", "arabic": "غَ  جَ  زَ", "latin": "GHO - JA - ZA" },
          { "id": "6", "arabic": "حَ  فَ  ظَ", "latin": "HA - FA - ZHO" }
        ]
      },
      {
        "id": "j1_p19_r3",
        "items": [
          { "id": "7", "arabic": "طَ  عَ  دَ", "latin": "TO - 'A - DA" },
          { "id": "8", "arabic": "صَ  فَ  غَ", "latin": "SO - FA - GHO" },
          { "id": "9", "arabic": "شَ  خَ  ضَ", "latin": "SYA - KHO - DHO" }
        ]
      },
      {
        "id": "j1_p19_r4",
        "items": [
          { "id": "10", "arabic": "سَ  غَ  ظَ", "latin": "SA - GHO - ZHO" },
          { "id": "11", "arabic": "خَ  فَ  ذَ", "latin": "KHO - FA - DZA" },
          { "id": "12", "arabic": "شَ  غَ  ضَ", "latin": "SYA - GHO - DHO" }
        ]
      },
      {
        "id": "j1_p19_r5",
        "items": [
          { "id": "13", "arabic": "فَ  زَ  عَ", "latin": "FA - ZA - 'A" },
          { "id": "14", "arabic": "ثَ  غَ  طَ", "latin": "TSA - GHO - TO" },
          { "id": "15", "arabic": "ظَ  فَ  رَ", "latin": "ZHO - FA - RO" }
        ]
      },
      {
        "id": "j1_p19_r6",
        "items": [
          { "id": "16", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "17", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "18", "arabic": "دَ  ذَ  رَ  زَ", "latin": "DA - DZA - RO - ZA" }
        ]
      },
      {
        "id": "j1_p19_r7",
        "items": [
          { "id": "19", "arabic": "سَ  شَ  صَ  ضَ  طَ  ظَ  عَ  غَ  فَ", "latin": "SA s.d. FA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 20,
    "title": "Halaman 20: Huruf قَ (QO)",
    "subtitle": "Pengenalan Huruf قَ (QO Pangkal Lidah Tebal)",
    "teacherNote": "Bedakan bunyi فَ (FA) dan قَ (QO tebal).",
    "rows": [
      {
        "id": "j1_p20_r1",
        "items": [
          { "id": "1", "arabic": "قَ  بَ  ضَ", "latin": "QO - BA - DHO" },
          { "id": "2", "arabic": "قَ  طَ  فَ", "latin": "QO - TO - FA" },
          { "id": "3", "arabic": "فَ  رَ  قَ", "latin": "FA - RO - QO" }
        ]
      },
      {
        "id": "j1_p20_r2",
        "items": [
          { "id": "4", "arabic": "ثَ  غَ  ظَ", "latin": "TSA - GHO - ZHO" },
          { "id": "5", "arabic": "فَ  قَ  ظَ", "latin": "FA - QO - ZHO" },
          { "id": "6", "arabic": "سَ  عَ  فَ", "latin": "SA - 'A - FA" }
        ]
      },
      {
        "id": "j1_p20_r3",
        "items": [
          { "id": "7", "arabic": "حَ  ذَ  خَ", "latin": "HA - DZA - KHO" },
          { "id": "8", "arabic": "قَ  فَ  صَ", "latin": "QO - FA - SO" },
          { "id": "9", "arabic": "عَ  قَ  دَ", "latin": "'A - QO - DA" }
        ]
      },
      {
        "id": "j1_p20_r4",
        "items": [
          { "id": "10", "arabic": "ضَ  غَ  طَ", "latin": "DHO - GHO - TO" },
          { "id": "11", "arabic": "شَ  فَ  عَ", "latin": "SYA - FA - 'A" },
          { "id": "12", "arabic": "زَ  قَ  قَ", "latin": "ZA - QO - QO" }
        ]
      },
      {
        "id": "j1_p20_r5",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "14", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "15", "arabic": "دَ  ذَ", "latin": "DA - DZA" }
        ]
      },
      {
        "id": "j1_p20_r6",
        "items": [
          { "id": "16", "arabic": "رَ  زَ", "latin": "RO - ZA" },
          { "id": "17", "arabic": "سَ  شَ", "latin": "SA - SYA" },
          { "id": "18", "arabic": "صَ  ضَ", "latin": "SO - DHO" }
        ]
      },
      {
        "id": "j1_p20_r7",
        "items": [
          { "id": "19", "arabic": "طَ  ظَ", "latin": "TO - ZHO" },
          { "id": "20", "arabic": "عَ  غَ", "latin": "'A - GHO" },
          { "id": "21", "arabic": "فَ  قَ", "latin": "FA - QO" }
        ]
      }
    ]
  },
  {
    "pageNumber": 21,
    "title": "Halaman 21: Huruf كَ (KA)",
    "subtitle": "Pengenalan Huruf كَ (KA Tipis)",
    "teacherNote": "Bedakan bunyi قَ (QO tebal) dan كَ (KA tipis).",
    "rows": [
      {
        "id": "j1_p21_r1",
        "items": [
          { "id": "1", "arabic": "كَ  حَ  قَ", "latin": "KA - HA - QO" },
          { "id": "2", "arabic": "كَ  قَ  خَ", "latin": "KA - QO - KHO" },
          { "id": "3", "arabic": "كَ  قَ", "latin": "KA - QO" }
        ]
      },
      {
        "id": "j1_p21_r2",
        "items": [
          { "id": "4", "arabic": "ضَ  حَ  كَ", "latin": "DHO - HA - KA" },
          { "id": "5", "arabic": "عَ  طَ  فَ", "latin": "'A - TO - FA" },
          { "id": "6", "arabic": "شَ  كَ  رَ", "latin": "SYA - KA - RO" }
        ]
      },
      {
        "id": "j1_p21_r3",
        "items": [
          { "id": "7", "arabic": "جَ  كَ  تَ", "latin": "JA - KA - TA" },
          { "id": "8", "arabic": "قَ  كَ  فَ", "latin": "QO - KA - FA" },
          { "id": "9", "arabic": "ذَ  غَ  سَ", "latin": "DZA - GHO - SA" }
        ]
      },
      {
        "id": "j1_p21_r4",
        "items": [
          { "id": "10", "arabic": "صَ  دَ  ثَ", "latin": "SO - DA - TSA" },
          { "id": "11", "arabic": "غَ  فَ  كَ", "latin": "GHO - FA - KA" },
          { "id": "12", "arabic": "زَ  كَ  طَ", "latin": "ZA - KA - TO" }
        ]
      },
      {
        "id": "j1_p21_r5",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "14", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "15", "arabic": "دَ  ذَ", "latin": "DA - DZA" }
        ]
      },
      {
        "id": "j1_p21_r6",
        "items": [
          { "id": "16", "arabic": "رَ  زَ  سَ  شَ", "latin": "RO - ZA - SA - SYA" },
          { "id": "17", "arabic": "صَ  ضَ", "latin": "SO - DHO" },
          { "id": "18", "arabic": "طَ  ظَ", "latin": "TO - ZHO" }
        ]
      },
      {
        "id": "j1_p21_r7",
        "items": [
          { "id": "19", "arabic": "عَ  غَ", "latin": "'A - GHO" },
          { "id": "20", "arabic": "فَ  قَ  كَ", "latin": "FA - QO - KA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 22,
    "title": "Halaman 22: Huruf لَ (LA)",
    "subtitle": "Pengenalan Huruf لَ (LA)",
    "teacherNote": "Suara لَ dibaca pendek dan jelas.",
    "rows": [
      {
        "id": "j1_p22_r1",
        "items": [
          { "id": "1", "arabic": "قَ  لَ  بَ", "latin": "QO - LA - BA" },
          { "id": "2", "arabic": "جَ  عَ  لَ", "latin": "JA - 'A - LA" },
          { "id": "3", "arabic": "خَ  لَ  طَ", "latin": "KHO - LA - TO" }
        ]
      },
      {
        "id": "j1_p22_r2",
        "items": [
          { "id": "4", "arabic": "ذَ  كَ  رَ", "latin": "DZA - KA - RO" },
          { "id": "5", "arabic": "غَ  لَ  ظَ", "latin": "GHO - LA - ZHO" },
          { "id": "6", "arabic": "قَ  فَ  صَ", "latin": "QO - FA - SO" }
        ]
      },
      {
        "id": "j1_p22_r3",
        "items": [
          { "id": "7", "arabic": "حَ  لَ  فَ", "latin": "HA - LA - FA" },
          { "id": "8", "arabic": "دَ  غَ  سَ", "latin": "DA - GHO - SA" },
          { "id": "9", "arabic": "شَ  كَ  لَ", "latin": "SYA - KA - LA" }
        ]
      },
      {
        "id": "j1_p22_r4",
        "items": [
          { "id": "10", "arabic": "ضَ  رَ  عَ", "latin": "DHO - RO - 'A" },
          { "id": "11", "arabic": "زَ  تَ  ظَ", "latin": "ZA - TA - ZHO" },
          { "id": "12", "arabic": "كَ  لَ  لَ", "latin": "KA - LA - LA" }
        ]
      },
      {
        "id": "j1_p22_r5",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "14", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "15", "arabic": "دَ  ذَ", "latin": "DA - DZA" }
        ]
      },
      {
        "id": "j1_p22_r6",
        "items": [
          { "id": "16", "arabic": "رَ  زَ  سَ  شَ", "latin": "RO - ZA - SA - SYA" },
          { "id": "17", "arabic": "صَ  ضَ", "latin": "SO - DHO" }
        ]
      },
      {
        "id": "j1_p22_r7",
        "items": [
          { "id": "18", "arabic": "طَ  ظَ  عَ  غَ", "latin": "TO - ZHO - 'A - GHO" },
          { "id": "19", "arabic": "فَ  قَ  كَ  لَ", "latin": "FA - QO - KA - LA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 23,
    "title": "Halaman 23: Huruf مَ (MA)",
    "subtitle": "Pengenalan Huruf مَ (MA Dua Bibir Rapat)",
    "teacherNote": "Suara مَ dibaca murni pendek dari dua bibir.",
    "rows": [
      {
        "id": "j1_p23_r1",
        "items": [
          { "id": "1", "arabic": "غَ  مَ  ضَ", "latin": "GHO - MA - DHO" },
          { "id": "2", "arabic": "لَ  مَ  سَ", "latin": "LA - MA - SA" },
          { "id": "3", "arabic": "جَ  مَ  عَ", "latin": "JA - MA - 'A" }
        ]
      },
      {
        "id": "j1_p23_r2",
        "items": [
          { "id": "4", "arabic": "فَ  رَ  ضَ", "latin": "FA - RO - DHO" },
          { "id": "5", "arabic": "كَ  رَ  مَ", "latin": "KA - RO - MA" },
          { "id": "6", "arabic": "خَ  لَ  طَ", "latin": "KHO - LA - TO" }
        ]
      },
      {
        "id": "j1_p23_r3",
        "items": [
          { "id": "7", "arabic": "صَ  مَ  دَ", "latin": "SO - MA - DA" },
          { "id": "8", "arabic": "ظَ  تَ  ذَ", "latin": "ZHO - TA - DZA" },
          { "id": "9", "arabic": "مَ  زَ  قَ", "latin": "MA - ZA - QO" }
        ]
      },
      {
        "id": "j1_p23_r4",
        "items": [
          { "id": "10", "arabic": "شَ  مَ  لَ", "latin": "SYA - MA - LA" },
          { "id": "11", "arabic": "فَ  كَ  حَ", "latin": "FA - KA - HA" },
          { "id": "12", "arabic": "غَ  مَ  مَ", "latin": "GHO - MA - MA" }
        ]
      },
      {
        "id": "j1_p23_r5",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "14", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "15", "arabic": "دَ  ذَ", "latin": "DA - DZA" }
        ]
      },
      {
        "id": "j1_p23_r6",
        "items": [
          { "id": "16", "arabic": "رَ  زَ  سَ  شَ", "latin": "RO - ZA - SA - SYA" },
          { "id": "17", "arabic": "صَ  ضَ", "latin": "SO - DHO" },
          { "id": "18", "arabic": "طَ  ظَ", "latin": "TO - ZHO" }
        ]
      },
      {
        "id": "j1_p23_r7",
        "items": [
          { "id": "19", "arabic": "عَ  غَ", "latin": "'A - GHO" },
          { "id": "20", "arabic": "فَ  قَ  كَ  لَ  مَ", "latin": "FA - QO - KA - LA - MA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 24,
    "title": "Halaman 24: Huruf نَ (NA)",
    "subtitle": "Pengenalan Huruf نَ (NA Ujung Lidah)",
    "teacherNote": "Suara نَ dibaca murni pendek 1 ketukan.",
    "rows": [
      {
        "id": "j1_p24_r1",
        "items": [
          { "id": "1", "arabic": "نَ  ظَ  فَ", "latin": "NA - ZHO - FA" },
          { "id": "2", "arabic": "نَ  غَ  شَ", "latin": "NA - GHO - SYA" },
          { "id": "3", "arabic": "طَ  عَ  نَ", "latin": "TO - 'A - NA" }
        ]
      },
      {
        "id": "j1_p24_r2",
        "items": [
          { "id": "4", "arabic": "صَ  مَ  ضَ", "latin": "SO - MA - DHO" },
          { "id": "5", "arabic": "قَ  رَ  نَ", "latin": "QO - RO - NA" },
          { "id": "6", "arabic": "خَ  لَ  قَ", "latin": "KHO - LA - QO" }
        ]
      },
      {
        "id": "j1_p24_r3",
        "items": [
          { "id": "7", "arabic": "زَ  مَ  نَ", "latin": "ZA - MA - NA" },
          { "id": "8", "arabic": "كَ  ذَ  بَ", "latin": "KA - DZA - BA" },
          { "id": "9", "arabic": "جَ  نَ  دَ", "latin": "JA - NA - DA" }
        ]
      },
      {
        "id": "j1_p24_r4",
        "items": [
          { "id": "10", "arabic": "كَ  نَ  سَ", "latin": "KA - NA - SA" },
          { "id": "11", "arabic": "لَ  حَ  ظَ", "latin": "LA - HA - ZHO" },
          { "id": "12", "arabic": "مَ  نَ  نَ", "latin": "MA - NA - NA" }
        ]
      },
      {
        "id": "j1_p24_r5",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "14", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "15", "arabic": "دَ  ذَ", "latin": "DA - DZA" }
        ]
      },
      {
        "id": "j1_p24_r6",
        "items": [
          { "id": "16", "arabic": "رَ  زَ  سَ  شَ", "latin": "RO - ZA - SA - SYA" },
          { "id": "17", "arabic": "صَ  ضَ", "latin": "SO - DHO" },
          { "id": "18", "arabic": "طَ  ظَ", "latin": "TO - ZHO" }
        ]
      },
      {
        "id": "j1_p24_r7",
        "items": [
          { "id": "19", "arabic": "عَ  غَ", "latin": "'A - GHO" },
          { "id": "20", "arabic": "فَ  قَ  كَ  لَ", "latin": "FA - QO - KA - LA" },
          { "id": "21", "arabic": "مَ  نَ", "latin": "MA - NA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 25,
    "title": "Halaman 25: Huruf وَ (WA)",
    "subtitle": "Pengenalan Huruf وَ (WA Membulatkan Bibir)",
    "teacherNote": "Suara وَ dibaca membulatkan bibir.",
    "rows": [
      {
        "id": "j1_p25_r1",
        "items": [
          { "id": "1", "arabic": "وَ  زَ  رَ", "latin": "WA - ZA - RO" },
          { "id": "2", "arabic": "وَ  لَ  غَ", "latin": "WA - LA - GHO" },
          { "id": "3", "arabic": "دَ  وَ  مَ", "latin": "DA - WA - MA" }
        ]
      },
      {
        "id": "j1_p25_r2",
        "items": [
          { "id": "4", "arabic": "فَ  طَ  نَ", "latin": "FA - TO - NA" },
          { "id": "5", "arabic": "قَ  وَ  مَ", "latin": "QO - WA - MA" },
          { "id": "6", "arabic": "ظَ  جَ  عَ", "latin": "ZHO - JA - 'A" }
        ]
      },
      {
        "id": "j1_p25_r3",
        "items": [
          { "id": "7", "arabic": "كَ  وَ  نَ", "latin": "KA - WA - NA" },
          { "id": "8", "arabic": "سَ  كَ  تَ", "latin": "SA - KA - TA" },
          { "id": "9", "arabic": "خَ  وَ  صَ", "latin": "KHO - WA - SO" }
        ]
      },
      {
        "id": "j1_p25_r4",
        "items": [
          { "id": "10", "arabic": "شَ  وَ  لَ", "latin": "SYA - WA - LA" },
          { "id": "11", "arabic": "ذَ  حَ  ضَ", "latin": "DZA - HA - DHO" },
          { "id": "12", "arabic": "وَ  نَ  وَ", "latin": "WA - NA - WA" }
        ]
      },
      {
        "id": "j1_p25_r5",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "14", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "15", "arabic": "دَ  ذَ", "latin": "DA - DZA" }
        ]
      },
      {
        "id": "j1_p25_r6",
        "items": [
          { "id": "16", "arabic": "رَ  زَ  سَ  شَ", "latin": "RO - ZA - SA - SYA" },
          { "id": "17", "arabic": "صَ  ضَ", "latin": "SO - DHO" },
          { "id": "18", "arabic": "طَ  ظَ", "latin": "TO - ZHO" }
        ]
      },
      {
        "id": "j1_p25_r7",
        "items": [
          { "id": "19", "arabic": "عَ  غَ", "latin": "'A - GHO" },
          { "id": "20", "arabic": "فَ  قَ  كَ  لَ", "latin": "FA - QO - KA - LA" },
          { "id": "21", "arabic": "مَ  نَ  وَ", "latin": "MA - NA - WA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 26,
    "title": "Halaman 26: Huruf هَ (HA Dada)",
    "subtitle": "Pengenalan Huruf هَ (HA Dari Pangkal Tenggorokan)",
    "teacherNote": "Bedakan bunyi حَ (HA halus) dan هَ (HA besar dari dada).",
    "rows": [
      {
        "id": "j1_p26_r1",
        "items": [
          { "id": "1", "arabic": "هَ  مَ  شَ", "latin": "HA - MA - SYA" },
          { "id": "2", "arabic": "جَ  هَ  دَ", "latin": "JA - HA - DA" },
          { "id": "3", "arabic": "دَ  وَ  هَ", "latin": "DA - WA - HA" }
        ]
      },
      {
        "id": "j1_p26_r2",
        "items": [
          { "id": "4", "arabic": "فَ  خَ  عَ", "latin": "FA - KHO - 'A" },
          { "id": "5", "arabic": "طَ  هَ  رَ", "latin": "TO - HA - RO" },
          { "id": "6", "arabic": "وَ  ضَ  حَ", "latin": "WA - DHO - HA" }
        ]
      },
      {
        "id": "j1_p26_r3",
        "items": [
          { "id": "7", "arabic": "وَ  هَ  ظَ", "latin": "WA - HA - ZHO" },
          { "id": "8", "arabic": "لَ  مَ  نَ", "latin": "LA - MA - NA" },
          { "id": "9", "arabic": "زَ  هَ  قَ", "latin": "ZA - HA - QO" }
        ]
      },
      {
        "id": "j1_p26_r4",
        "items": [
          { "id": "10", "arabic": "سَ  هَ  لَ", "latin": "SA - HA - LA" },
          { "id": "11", "arabic": "ذَ  غَ  صَ", "latin": "DZA - GHO - SO" },
          { "id": "12", "arabic": "جَ  هَ  هَ", "latin": "JA - HA - HA" }
        ]
      },
      {
        "id": "j1_p26_r5",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "14", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "15", "arabic": "دَ  ذَ", "latin": "DA - DZA" }
        ]
      },
      {
        "id": "j1_p26_r6",
        "items": [
          { "id": "16", "arabic": "رَ  زَ  سَ  شَ", "latin": "RO - ZA - SA - SYA" },
          { "id": "17", "arabic": "صَ  ضَ", "latin": "SO - DHO" },
          { "id": "18", "arabic": "طَ  ظَ", "latin": "TO - ZHO" }
        ]
      },
      {
        "id": "j1_p26_r7",
        "items": [
          { "id": "19", "arabic": "عَ  غَ  فَ  قَ", "latin": "'A - GHO - FA - QO" },
          { "id": "20", "arabic": "كَ  لَ  مَ  نَ", "latin": "KA - LA - MA - NA" },
          { "id": "21", "arabic": "وَ  هَ", "latin": "WA - HA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 27,
    "title": "Halaman 27: Huruf يَ (YA)",
    "subtitle": "Pengenalan Huruf يَ (YA)",
    "teacherNote": "Suara يَ dibaca murni pendek dari tengah lidah.",
    "rows": [
      {
        "id": "j1_p27_r1",
        "items": [
          { "id": "1", "arabic": "ضَ  يَ  رَ", "latin": "DHO - YA - RO" },
          { "id": "2", "arabic": "ضَ  حَ  يَ", "latin": "DHO - HA - YA" },
          { "id": "3", "arabic": "زَ  يَ  نَ", "latin": "ZA - YA - NA" }
        ]
      },
      {
        "id": "j1_p27_r2",
        "items": [
          { "id": "4", "arabic": "سَ  يَ  غَ", "latin": "SA - YA - GHO" },
          { "id": "5", "arabic": "وَ  كَ  لَ", "latin": "WA - KA - LA" },
          { "id": "6", "arabic": "هَ  يَ  خَ", "latin": "HA - YA - KHO" }
        ]
      },
      {
        "id": "j1_p27_r3",
        "items": [
          { "id": "7", "arabic": "طَ  هَ  ظَ", "latin": "TO - HA - ZHO" },
          { "id": "8", "arabic": "شَ  يَ  عَ", "latin": "SYA - YA - 'A" },
          { "id": "9", "arabic": "وَ  قَ  فَ", "latin": "WA - QO - FA" }
        ]
      },
      {
        "id": "j1_p27_r4",
        "items": [
          { "id": "10", "arabic": "هَ  يَ  مَ", "latin": "HA - YA - MA" },
          { "id": "11", "arabic": "جَ  ذَ  ثَ", "latin": "JA - DZA - TSA" },
          { "id": "12", "arabic": "يَ  دَ  يَ", "latin": "YA - DA - YA" }
        ]
      },
      {
        "id": "j1_p27_r5",
        "items": [
          { "id": "13", "arabic": "أَ  بَ  تَ  ثَ", "latin": "A - BA - TA - TSA" },
          { "id": "14", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "15", "arabic": "دَ  ذَ  رَ  زَ", "latin": "DA - DZA - RO - ZA" }
        ]
      },
      {
        "id": "j1_p27_r6",
        "items": [
          { "id": "16", "arabic": "سَ  شَ", "latin": "SA - SYA" },
          { "id": "17", "arabic": "صَ  ضَ", "latin": "SO - DHO" },
          { "id": "18", "arabic": "طَ  ظَ", "latin": "TO - ZHO" },
          { "id": "19", "arabic": "عَ  غَ", "latin": "'A - GHO" }
        ]
      },
      {
        "id": "j1_p27_r7",
        "items": [
          { "id": "20", "arabic": "فَ  قَ  كَ  لَ", "latin": "FA - QO - KA - LA" },
          { "id": "21", "arabic": "مَ  نَ  وَ", "latin": "MA - NA - WA" },
          { "id": "22", "arabic": "هَ  يَ", "latin": "HA - YA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 28,
    "title": "Halaman 28: Perbandingan Huruf أَ = ءَ dan ـــــر",
    "subtitle": "Pengenalan Bentuk Hamzah (ءَ) Sama Bunyi Dengan (أَ)",
    "teacherNote": "Huruf أَ dan ءَ sama bunyinya. Perhatikan tulisan sambung sederhana.",
    "rows": [
      {
        "id": "j1_p28_r1",
        "items": [
          { "id": "1", "arabic": "أَ  =  ءَ", "latin": "A = A Hamzah" }
        ]
      },
      {
        "id": "j1_p28_r2",
        "items": [
          { "id": "2", "arabic": "رَ = ـــــر", "latin": "RO" },
          { "id": "3", "arabic": "مَ = ـــــم", "latin": "MA" }
        ]
      },
      {
        "id": "j1_p28_r3",
        "items": [
          { "id": "4", "arabic": "بَ  رَ  أَ", "latin": "BA - RO - A" },
          { "id": "5", "arabic": "بَ  رَ  رَ", "latin": "BA - RO - RO" },
          { "id": "6", "arabic": "قَ  رَ  أَ", "latin": "QO - RO - A" }
        ]
      },
      {
        "id": "j1_p28_r4",
        "items": [
          { "id": "7", "arabic": "أَ  مَ  مَ", "latin": "A - MA - MA" },
          { "id": "8", "arabic": "جَ  زَ  أَ", "latin": "JA - ZA - A" },
          { "id": "9", "arabic": "سَ  ءَ  لَ", "latin": "SA - A - LA" }
        ]
      },
      {
        "id": "j1_p28_r5",
        "items": [
          { "id": "10", "arabic": "رَ  زَ  قَ", "latin": "RO - ZA - QO" },
          { "id": "11", "arabic": "مَ  دَ  حَ", "latin": "MA - DA - HA" },
          { "id": "12", "arabic": "غَ  مَ  مَ", "latin": "GHO - MA - MA" }
        ]
      },
      {
        "id": "j1_p28_r6",
        "items": [
          { "id": "13", "arabic": "لَ  ءَ  كَ", "latin": "LA - A - KA" },
          { "id": "14", "arabic": "مَ  شَ  ءَ", "latin": "MA - SYA - A" },
          { "id": "15", "arabic": "مَ  دَ  مَ", "latin": "MA - DA - MA" }
        ]
      },
      {
        "id": "j1_p28_r7",
        "items": [
          { "id": "16", "arabic": "سَ  يَ  رَ", "latin": "SA - YA - RO" },
          { "id": "17", "arabic": "جَ  زَ  مَ", "latin": "JA - ZA - MA" },
          { "id": "18", "arabic": "كَ  بَ  دَ", "latin": "KA - BA - DA" }
        ]
      },
      {
        "id": "j1_p28_r8",
        "items": [
          { "id": "19", "arabic": "مَ  قَ  تَ", "latin": "MA - QO - TA" },
          { "id": "20", "arabic": "كَ  لَ  مَ", "latin": "KA - LA - MA" },
          { "id": "21", "arabic": "حَ  سَ  نَ", "latin": "HA - SA - NA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 29,
    "title": "Halaman 29: Latihan Campuran Huruf Hijaiyah (I)",
    "subtitle": "Latihan Kelancaran Membaca Huruf Hijaiyah Berharakat Fathah",
    "teacherNote": "Baca langsung dan cepat tanpa terbata-bata. Semua dibaca pendek 1 ketukan.",
    "rows": [
      {
        "id": "j1_p29_r1",
        "items": [
          { "id": "1", "arabic": "ثَ  بَ  تَ", "latin": "TSA - BA - TA" },
          { "id": "2", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "3", "arabic": "دَ  ذَ  رَ", "latin": "DA - DZA - RO" }
        ]
      },
      {
        "id": "j1_p29_r2",
        "items": [
          { "id": "4", "arabic": "زَ  سَ  شَ", "latin": "ZA - SA - SYA" },
          { "id": "5", "arabic": "أَ  صَ  ظَ", "latin": "A - SO - ZHO" },
          { "id": "6", "arabic": "طَ  ظَ  عَ", "latin": "TO - ZHO - 'A" }
        ]
      },
      {
        "id": "j1_p29_r3",
        "items": [
          { "id": "7", "arabic": "غَ  فَ  قَ", "latin": "GHO - FA - QO" },
          { "id": "8", "arabic": "كَ  لَ  مَ", "latin": "KA - LA - MA" },
          { "id": "9", "arabic": "نَ  وَ  هَ", "latin": "NA - WA - HA" }
        ]
      },
      {
        "id": "j1_p29_r4",
        "items": [
          { "id": "10", "arabic": "حَ  هَ  لَ", "latin": "HA - HA - LA" },
          { "id": "11", "arabic": "بَ  يَ  نَ", "latin": "BA - YA - NA" },
          { "id": "12", "arabic": "ءَ  أَ  رَ", "latin": "A - A - RO" }
        ]
      },
      {
        "id": "j1_p29_r5",
        "items": [
          { "id": "13", "arabic": "بَ  عَ  ثَ", "latin": "BA - 'A - TSA" },
          { "id": "14", "arabic": "جَ  حَ  خَ", "latin": "JA - HA - KHO" },
          { "id": "15", "arabic": "دَ  ذَ  رَ", "latin": "DA - DZA - RO" }
        ]
      },
      {
        "id": "j1_p29_r6",
        "items": [
          { "id": "16", "arabic": "زَ  سَ  شَ", "latin": "ZA - SA - SYA" },
          { "id": "17", "arabic": "أَ  صَ  ضَ", "latin": "A - SO - DHO" },
          { "id": "18", "arabic": "طَ  ظَ  عَ", "latin": "TO - ZHO - 'A" }
        ]
      },
      {
        "id": "j1_p29_r7",
        "items": [
          { "id": "19", "arabic": "غَ  فَ  قَ", "latin": "GHO - FA - QO" },
          { "id": "20", "arabic": "كَ  لَ  مَ", "latin": "KA - LA - MA" },
          { "id": "21", "arabic": "نَ  وَ  هَ", "latin": "NA - WA - HA" }
        ]
      },
      {
        "id": "j1_p29_r8",
        "items": [
          { "id": "22", "arabic": "هَ  يَ  تَ", "latin": "HA - YA - TA" },
          { "id": "23", "arabic": "أَ  كَ  لَ", "latin": "A - KA - LA" },
          { "id": "24", "arabic": "مَ  نَ  وَ", "latin": "MA - NA - WA" }
        ]
      }
    ]
  },
  {
    "pageNumber": 30,
    "title": "Halaman 30: Evaluasi Total & Membedakan Bunyi Huruf Mirip",
    "subtitle": "Ujian Kelulusan Jilid 1 (Membedakan Bunyi Makhraj Mirip)",
    "teacherNote": "PERHATIAN! Bedakan dengan jelas antara bunyi huruf yang hampir mirip.",
    "rows": [
      {
        "id": "j1_p30_r1",
        "items": [
          { "id": "1", "arabic": "أَ - عَ", "latin": "A vs 'AIN" },
          { "id": "2", "arabic": "ثَ - سَ", "latin": "TSA vs SA" }
        ]
      },
      {
        "id": "j1_p30_r2",
        "items": [
          { "id": "3", "arabic": "حَ - هَ", "latin": "HA vs HA Dada" },
          { "id": "4", "arabic": "ثَ - شَ", "latin": "TSA vs SYA" }
        ]
      },
      {
        "id": "j1_p30_r3",
        "items": [
          { "id": "5", "arabic": "جَ - زَ", "latin": "JA vs ZA" },
          { "id": "6", "arabic": "سَ - شَ", "latin": "SA vs SYA" }
        ]
      },
      {
        "id": "j1_p30_r4",
        "items": [
          { "id": "7", "arabic": "ذَ - زَ", "latin": "DZA vs ZA" },
          { "id": "8", "arabic": "سَ - صَ", "latin": "SA vs SO" }
        ]
      },
      {
        "id": "j1_p30_r5",
        "items": [
          { "id": "9", "arabic": "خَ - غَ", "latin": "KHO vs GHO" },
          { "id": "10", "arabic": "تَ - طَ", "latin": "TA vs TO" }
        ]
      },
      {
        "id": "j1_p30_r6",
        "items": [
          { "id": "11", "arabic": "خَ - قَ", "latin": "KHO vs QO" },
          { "id": "12", "arabic": "ذَ - ظَ", "latin": "DZA vs ZHO" }
        ]
      },
      {
        "id": "j1_p30_r7",
        "items": [
          { "id": "13", "arabic": "كَ - قَ", "latin": "KA vs QO" },
          { "id": "14", "arabic": "ظَ - ضَ", "latin": "ZHO vs DHO" }
        ]
      }
    ],
    "quizQuestions": [
      {
        "id": "q_j1_final",
        "questionArabic": "أَ  بَ  تَ  ثَ  جَ  حَ  خَ  دَ  ذَ  رَ  زَ  سَ  شَ  صَ  ضَ  طَ  ظَ  عَ  غَ  فَ  قَ  كَ  لَ  مَ  نَ  وَ  هَ  يَ",
        "questionText": "Apakah Anda sudah hafal seluruh 28 huruf hijaiyah berharakat Fathah tanpa terbata-bata?",
        "options": [
          "Sudah sangat lancar & siap naik Iqro 2",
          "Masih perlu mengulang beberapa huruf"
        ],
        "correctIndex": 0
      }
    ]
  }
];

const startMarker = 'pages: [';
const level1Pos = code.indexOf('level: 1');
if (level1Pos === -1) {
  console.error('level: 1 not found');
  process.exit(1);
}

const pagesStart = code.indexOf(startMarker, level1Pos);
const level2Pos = code.indexOf('level: 2');

if (pagesStart === -1 || level2Pos === -1) {
  console.error('Markers not found');
  process.exit(1);
}

// Find the closing bracket before level 2
const lastClosingBracket = code.lastIndexOf('],', level2Pos);

const pagesJson = JSON.stringify(iqro1Pages, null, 2);

const newCode = code.slice(0, pagesStart) + 'pages: ' + pagesJson + code.slice(lastClosingBracket + 1);

fs.writeFileSync(filePath, newCode, 'utf8');
console.log('Successfully updated Iqro Jilid 1 with ALL 30 pages cleanly!');
