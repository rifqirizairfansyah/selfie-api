# Absensi Selfie API
![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)

API untuk Absensi Selfie dan digunakan pada Website Admin dan Mobile. API ini juga digunakan untuk beberapa aplikasi frontend seperti [Sisuluh](https://github.com/pptik/sisuluh-website), dan [Kawal Desa](https://github.com/pptik/kawal-desa).

## Install

```sh
npm install
```

## Configure

1. Copy file .env.example lalu rename menjadi .env, tetapi biarkan file .env.example dan jangan direname secara langsung; atau
2. Gunakan perintah ini pada *NIX `cp .env.example .env` atau pada Windows `copy .env.example .env`.
3. Isi file `.env`. Silahkan hubungi administrator atau developer yang bersangkutan jika tidak tahu nilai apa yang harus diisi.

## Usage

```sh
npm run start
```

## Author

👤 **Rifqi Riza Irfansyah <rizairfansyahrifqi@gmail.com>**
👤 **Mohamad Radisha <pr0ph0z23@gmail.com>**

* Github: [@pr0ph0z](https://github.com/rifqirizairfansyah)

## 🤝 Contributing

Kontribusi isu, masalah, atau penambahan fitur-fitur baru dipersilahkan.<br />Silahkan cek [halaman issues](https://github.com/pptik/dishub-tracker-api/issues). Namun sebelum mencoba menyelesaikan _issue(s)_, alangkah baiknya untuk melihat detail _issue_ tersebut sudah di-*fix* atau belum. Karena seharusnya issue-issue ini akan di-_close_ secara otomatis ketika di-_merge_ ke branch master (lihat [Repository Info](#repository-info)).

## Notes
### Repository Info
README ini dibuat di branch [rds/dev/refactoring](https://github.com/pptik/absensi-selfie-api/tree/rds/dev/refactoring). Mulanya, branch [master](https://github.com/pptik/absensi-selfie-api/tree/master) digunakan di awal pengembangan Absensi Selfie, namun karena ada perubahan _response_ API yang akan _breaking change_ di client (khsususnya mobile) namun saat itu pengguna Absensi Selfie sedang tinggi-tingginya dan tidak semua pengguna bisa melakukan *update* aplikasi setiap ada release baru, maka di client mobile diputuskan untuk bermigrasi ke Flutter (yang sebelumnya masih menggunakan Java) dan sekaligus mengubah _response_ REST API-nya. Ini menyebabkan perubahan port (lihat [Deployment](#deployment)) dari 5006 ke 5026 di production (setidaknya di server saat README ini dibuat).
#### Kenapa branch *master* tidak dihapus?
Atau dimerge. Karena masih ada pengguna yang masih menggunakan custom port (lihat di [Deployment](#deployment)) (yang seharusnya kebanyakan orang hanya mengubah path dengan versi (contohnya api.com/v1, api.com/v2)) jadi branch master terkadang masih butuh di-_update_ meskipun tidak sesering branch `rds/dev/refactoring`. Yang di-_update_ pun bukanlah sesuatu yang besar seperti penambahan fitur atau yang membuat client harus melakukan update (yang mana tidak mungkin karena client yang menggunakan Java sudah tidak dilanjutkan lagi pengembangannya), melainkan hanya seperti kesalahan logika pada proses.
#### Perlukah branch *master* ~~dihapus~~ dimerge?
Saat dirasa pengguna di branch master (atau pengguna versi lama) dirasa sudah tidak ada yang memakainya lagi, silahkan merge branch `master` dengan branch `rds/dev/refactoring`.

### Deployment
Jika suatu saat server REST API ini dideploy dengan lebih baik menggunakan reverse proxy, maka ada beberapa hal
yang harus diubah di kode seperti:
- SSL
  
  SSL harus diatur di bagian reverse proxy sehingga di aplikasinya hanya perlu _listening_ ke HTTP.
- Package Helmet
  
  Helmet adalah package yang berguna untuk mengamankan aplikasi berbasis Express dengan mengatur beberapa HTTP headers.
- GZIP compression
  
  Sama seperti SSL, GZIP compression juga perlu diatir di bagian reverse proxy.
- Port
  
  Hapus penggunaan custom port dan gunakan 443 sebagai standar.
## Related links

* [Absensi Selfie Web](https://github.com/pptik/absensi-selfie-web)
* [Absensi Selfie Flutter](https://github.com/pptik/absensi-selfie-flutter)

***
_README ini dibuat oleh [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
