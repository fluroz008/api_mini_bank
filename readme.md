# API Mini E-Wallet

Aplikasi backend sistem yang sederhana untuk melakukan aktifitas simpan pinjam yang dibuat menggunakan:

- AdonisJS v6
- MySQL (Lucid ORM)

## Setup

Setelah melakukan clone repo, jalankan comment dibawah:

```
npm i
```
```
node ace migration:run
```
```
node ace db:seed
```

## Feature

- User login, logout dan token refresh
- Customer CRUD (untuk admin)
- Deposit dan Withdraw menggunakan transaction untuk keamanan proses operasi (hanya bisa diakses oleh customer)
- Reports transaksi yang terdiri dari:
  - Real-time balance
  - Customer transaction history (filter dengan range date)
  - Global transaction history (filter dengan range date)
  - Total untuk deposit dan withdraw
 
## Dokumentasi API Postman

Untuk dokumentasi API Postman dapat dilihat pada folder postman.
