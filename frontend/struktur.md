.
├── public              # Menyimpan aset statis
│   ├── images
│   └── files
│
└── src                 # Direktori utama kode sumber aplikasi
    ├── api             # Konfigurasi koneksi ke server (Axios Instance)
    ├── assets          # Aset yang dikompilasi oleh Vite
    ├── components      # Komponen UI yang dapat digunakan kembali (Reusable)
    │   ├── auth        # Komponen khusus autentikasi
    │   ├── clearance   # Komponen spesifik fitur clearance
    │   ├── common      # Komponen umum (Searchbar, Filter)
    │   ├── dashboard   # Widget visualisasi data dashboard
    │   ├── form        # Elemen input form (Select, InputField)
    │   ├── layout      # Tata letak utama (Sidebar, Header)
    │   ├── modal       # Pop-up formulir input/edit data
    │   ├── table       # Komponen tabel data dinamis
    │   └── ui          # Elemen dasar antarmuka (Button, Badge)
    ├── context         # Manajemen state global (AuthContext)
    ├── hooks           # Custom hooks (logika react yang dipisahkan)
    └── pages           # Halaman utama (Views) yang diakses melalui routing
        ├── AuthPages
        ├── Clearance
        ├── master
        └── profile