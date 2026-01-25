# API Mini Wallet

Aplikasi backend sistem yang sederhana untuk melakukan aktifitas simpan pinjam yang dibuat menggunakan:

- AdonisJS v6
- MySQL (Lucid ORM)

## Persyaratan Sistem

Sebelum menjalankan aplikasi, pastikan komputer anda telah terinstall:

1.  **Node.js** (Versi LTS direkomendasikan)
2.  **MySQL Database**

## Panduan Instalasi Database (Jika belum ada)

### Windows
1.  Download **MySQL Installer for Windows** dari situs resmi MySQL.
2.  Jalankan installer dan pilih **"Custom"** atau **"Developer Default"**.
3.  Ikuti langkah-langkah instalasi.
4.  Pada tahap configuration, set **root password** dan ingat password tersebut (misal: `root`).
5.  Setelah selesai, pastikan service MySQL berjalan.

### Mac OS
Disarankan menggunakan **Homebrew**:
1.  Buka Terminal.
2.  Install MySQL:
    ```bash
    brew install mysql
    ```
3.  Jalankan service MySQL:
    ```bash
    brew services start mysql
    ```
4.  Lakukan konfigurasi keamanan (opsional tapi disarankan):
    ```bash
    mysql_secure_installation
    ```

### Linux (Ubuntu/Debian)
1.  Buka Terminal.
2.  Update package index:
    ```bash
    sudo apt update
    ```
3.  Install MySQL Server:
    ```bash
    sudo apt install mysql-server
    ```
4.  Jalankan script keamanan:
    ```bash
    sudo mysql_secure_installation
    ```

## Setup Project

Ikuti langkah-langkah berikut untuk menjalankan project ini di komputer lokal anda:

### 1. Clone Repository & Install Dependencies
Download source code dan install library yang dibutuhkan.

```bash
git clone <repository_url>
cd <folder_repository>
npm install
```

### 2. Konfigurasi Environment Variable
Salin file konfigurasi contoh `.env.example` ke file baru `.env`.

```bash
cp .env.example .env
```

Buka file `.env` dan sesuaikan konfigurasi database dengan setup lokal anda.

**Penting:** Perangkat lunak ini tidak akan berjalan jika koneksi database salah.

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306        # Default MySQL port
DB_USER=root        # User database anda
DB_PASSWORD=root    # Password database anda
DB_DATABASE=db_mini_wallet
```

### 3. Setup Project (Database & Migrations)
Kami telah menyediakan perintah mudah untuk melakukan cek koneksi, membuat database, generate key, dan menjalankan migrasi data.

Jalankan perintah berikut:

```bash
npm run setup
```

Script ini akan:
- Cek koneksi ke database.
- Membuat database `db_mini_wallet` jika belum ada.
- Generate `APP_KEY`.
- Menjalankan migrasi database (membuat tabel) dan seeding (mengisi data awal).

### 4. Menjalankan Aplikasi

**Mode Development:**
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3333`.

## Feature

- User login, logout dan token refresh
- Customer CRUD (untuk admin)
- Deposit dan Withdraw menggunakan transaction untuk keamanan proses operasi (hanya bisa diakses oleh customer)
- Reports transaksi yang terdiri dari:
  - Real-time balance
  - Customer transaction history (filter dengan range date)
  - Global transaction history (filter dengan range date)
  - Total untuk deposit dan withdraw

## Akun Demo

Berikut adalah akun default yang dapat digunakan untuk testing:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `password123` |
| **Customer** | `johndoe` | `password123` |
| **Customer** | `janesmith` | `password123` |

## Dokumentasi API & Cara Penggunaan

Kami menyediakan koleksi Postman untuk mempermudah pengujian API dan alur aplikasi.

### Cara Import Postman Collection & Environment
1.  Buka aplikasi **Postman**.
2.  Klik tombol **Import** di pojok kiri atas (atau `Ctrl + O` / `Cmd + O`).
3.  Pilih file `postman/Mini_Bank_API_Postman_Collection.json`.
4.  Pilih juga file `postman/Mini_Bank_API_Environment.json` untuk mengimport variabel environment.
5.  Pastikan memilih environment **Mini Bank Local Environment** di pojok kanan atas Postman.

### Cara Akses & Testing
1.  Pastikan aplikasi berjalan (`npm run dev`) dan dapat diakses di `http://localhost:3333`.
2.  Buka Collection **Mini Bank API** di Postman.
3.  Gunakan request **Auth > Login** untuk masuk.
    - Gunakan salah satu **Username** dan **Password** dari tabel [Akun Demo](#akun-demo) di atas.
4.  Setelah login berhasil, copy **token** yang didapatkan dari response.
5.  Untuk request selanjutnya (yang membutuhkan login), masukkan token tersebut ke tab **Authorization** -> pilih Type **Bearer Token** (jika belum otomatis terseting di collection).

