# Selangor Affordable Housing Intelligence — SUO

Dashboard Perumahan Mampu Milik Negeri Selangor untuk Selangor Urban Observatory (SUO).

## Version
**v1.1 — Verified-data build**

Perubahan utama berbanding v1.0:
- Semua angka demo daerah dibuang.
- KPI negeri dipautkan kepada sumber rasmi 2026.
- 9 projek Rumah Idaman dalam pembinaan dimasukkan dengan jumlah unit, daerah dan jangka siap.
- 6 projek Rumah Idaman siap dimasukkan sebagai rekod nama/status rasmi; unit individu dibiarkan kosong sehingga sumber rasmi project-level diperoleh.
- `source_id` diwujudkan untuk audit trail.
- Masterlist tersedia dalam JSON dan CSV.
- Peta menunjukkan **agregat daerah** untuk pipeline; ia tidak mendakwa sebagai lokasi tepat projek.
- Koordinat projek kekal `null` sehingga disahkan.

## Repository structure

```text
/
├── index.html
├── assets/
│   ├── css/styles.css
│   └── js/app.js
├── data/
│   ├── state_summary.json
│   ├── projects.json
│   ├── projects.csv
│   ├── district_stats.json
│   ├── sources.json
│   └── data_dictionary.csv
└── README.md
```

## GitHub Pages
1. Upload semua fail/folder ke branch `main`.
2. GitHub → **Settings → Pages**
3. **Deploy from a branch**
4. Branch: `main`
5. Folder: `/ (root)`
6. Save.

URL repository pengguna:
`https://faeiruzrusman.github.io/Selangor-Affordable-Housing/`

## Data principles
1. Jangan isi angka berdasarkan anggaran jika dashboard memaparkannya sebagai data rasmi.
2. Gunakan `null` jika maklumat belum dapat disahkan.
3. Setiap rekod projek perlu mempunyai `source_id`.
4. Koordinat projek perlu mempunyai catatan `location_precision`.
5. Jangan campur aggregate state-level dengan project-level unit counts jika pecahan projek tidak tersedia.

## Current verified sources
- Dewan Negeri Selangor — Prestasi PKNS (2026)
- Dewan Negeri Selangor — Perumahan PPR / Smart Sewa / Rumah Selangorku (2026)
- Dewan Negeri Selangor — Rumah Idaman Selangor (2026)
- Lampiran No. 3(a), projek Rumah Idaman dalam pembinaan (2026)
- LPHS — Senarai Projek Rumah Selangorku 15 Januari 2026
- LPHS portal — notis senarai projek terkini dikemas kini sehingga Jun 2026
- Dewan Negeri Selangor — harga Rumah Selangorku 3.0 (2026)
- Dewan Negeri Selangor — snapshot Daerah Kuala Selangor (2026)

Lihat `data/sources.json` untuk URL dan kegunaan setiap sumber.

## Next data upgrade
- Masterlist penuh Rumah Selangorku terkini sehingga Jun 2026.
- Koordinat/geometry projek yang disahkan.
- PBT, mukim, DUN dan parcel.
- Progress % tapak.
- Harga / kategori / unit split setiap projek.
- Waiting list mengikut daerah/PBT.
- Household income + population + transit + jobs untuk Housing Need / Affordability Gap Index.
