# Changelog
Semua perubahan penting pada repositori ini akan didokumentasikan pada file ini.

Format yang digunakan pada pendokumentasian ini berdasarkan kepada [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan repository ini mengadopsi sistem [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## FAQ
### Q: Kenapa versi lanjutan dari 0.2.x adalah 2.0.0? Di mana 1.0.0?
A: Sebagai author dari [API Absensi Selfie], saya menyadari bahwa versi 0.x.x bertahan terlalu lama dan dipakai juga di
production sehingga sulit untuk membedakan antara versi development dan production. 

## [2.0.0] - UNRELEASED
### Added
- Penggunaan bearer token di endpoint-endpoint admin
- Informasi logging
- Dukungan HTTPS
- Konfigurasi CORS
- Penggunaan konsep `guard`
- JSDoc
- Swagger

### Updated
- Refaktorisasi kode dari versi 0.x.x agar lebih terstruktur
- Penggunaan [Formidable] sebagai pengganti [Multer]
- Penggunaan [date-fns] sebagai pengganti [moment]
- Desain dari report yang di-_export_

## [0.2.23] - 2020-05-06
### Added
- Fitur `export report` untuk role selain `company`

## [0.2.22] - 2020-04-28
### Added
- Registrasi v2 sebagai alternatif

### Removed
- Dukungan HTTPS

## [0.2.21] - 2020-04-27
### Added
- Dukungan HTTPS

### Updated
- Metode untuk membuat koneksi ke database

## [0.2.20] - 2020-04-20
### Added
- Role `partial-supervisor`

## [0.2.19] - 2020-04-18
### Added
- Fitur ubah password

## [0.2.18] - 2020-04-17
### Added
- Endpoint login v2 sebagai alternatif

### [0.2.17] - 2020-04-13
### Added
- Fitur `export report` untuk role `company`

### [0.2.16] - 2020-04-13
### Added
- Fitur `get app version`

## [0.2.15] - 2020-04-01
### Added
- Fitur `get hierarchical reports`

## [0.2.14] - 2020-04-01
### Added
- Fitur `get company reports`

## [0.2.13] - 2020-04-01
### Added
- Fitur `get companies` dan `get units`

## [0.2.12] - 2020-04-01
### Added
- Parser untuk JWT
- Morgan
- Fitur `get area`

### Updated
- Case insensitive pada kode registrasi

## [0.2.11] - 2020-03-31
### Added
- Fitur `update company` untuk pengguna
- Admin login

## [0.2.10] - 2020-03-31
### Added
- Dukungan untuk `get reports` hingga level unit

## [0.2.9] - 2020-03-30
### Added
- Fitur `minified report`

## [0.2.8] - 2020-03-30
### Added
- Fitur `update unit` untuk pengguna

## [0.2.7] - 2020-03-30
### Added
- Fitur untuk `get units`

## [0.2.6] - 2020-03-27
### Added
- Penambahan nilai untuk total hadir pada semua endpoint `get report` (yang sebelumnya hanya di KCD7 dan SIM saja)
- Konstanta `request response`

### Updated
- Pemanfaatan fungsi regex pada route dengan _behavior_ yang sama
- Metode `get report` menjadi lebih dinamis (mengikuti parameter yang dikirimkan)


## [0.2.5] - 2020-03-26
### Updated
- Metode untuk `get report` (sebelumnya dari JSON diubah ke database)

## [0.2.4] - 2020-03-24
### Added
- Fitur dasar untuk KCD7 (`get companies, get report`)

## [0.2.3] - 2020-03-19
### Added
- Pengecekan pada email pengguna ketika registrasi
- Fitur `get report` SIM

### Updated
- Refactoring source code
- Format pada morgan
- Tipe data TIMESTAMP pada model
- Fitur `get companies` SIM

## [0.2.2] - 2020-01-30
### Updated
- Nilai return dari endpoint `create report`

## [0.2.1] - 2020-01-28
### Added
- Fitur total kehadiran

## [0.2.0] - 2020-01-27
### Added
- Fitur `register user`
- Fitur `create report`
- Fitur `get companies` untuk Sekolah Indonesia Malaysia (SIM)

## [0.1.3] - 2019-08-20
### Updated
- File web.config
- Nilai return dari endpoint `get report`
- Nomor port

## [0.1.2] - 2019-05-23
### Fixed
- Fix issue [#2]

## [0.1.1] - 2019-05-21
### Added
- Fitur `get report`

### Fixed
- Fix issue [#1]

## [0.1.0] - 2019-05-06
### Added
- Repositori dibuat dengan fitur login
- File web.config dengan ide untuk menggunakan [iisnode]
- Fitur untuk `get company`

[iisnode]: https://github.com/Azure/iisnode
[Formidable]: https://www.npmjs.com/package/formidable
[Multer]: https://www.npmjs.com/package/multer
[date-fns]: https://www.npmjs.com/package/date-fns
[moment]: https://www.npmjs.com/package/moment
[Absensi Selfie]: https://github.com/pptik/absensi-selfie-api
[#1]: https://github.com/pptik/absensi-selfie-api/issues/1
[#2]: https://github.com/pptik/absensi-selfie-api/issues/2
