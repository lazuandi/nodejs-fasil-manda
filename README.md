
# Autentikasi

Folder `script` berisi script yang saya gunakan pada saat mengajar materi, folder `app` adalah contoh sederhana yang dibuat untuk materi ini.

Setiap kode saya berikan komentar untuk mempermudah membacanya.

## Syarat Proyek

- Database, saya menggunakan postgres
- Node.js & NPM

## Menjalankan

```bash
$ npm install 
$ node app/index.js
```

## Tutorial

Kali ini saya akan menjelaskan tentang bagaimana cara program bekerja. Sebelum ke kode ada baiknya kita mengetahui fungsionalitas program terlebih dahulu, sebaik - baiknya program adalah kejelasan tetang penggunaannya.

1. Halaman Login, untuk login
2. Dapat login dengan 2 akun yaitu, email dan password :

```
admin@binar.com - password123
student@binar.com - password321
```

3. Login dengan akun admin, akan menuju ke halaman admin `/admin` dan juga bisa membuka halaman `/student`
4. Login degan akun student, akan menuju ke halaman student `/student` tapi student tidak bisa menuju ke halaman admin, jika mengakses halaman admin maka akan di munculkan tulisan bahwa akses tidak dibuka

Oke sekarang ke kode ~

### Kode

Pustaka yang digunakan untuk masalah autentikasi dan otorisasi adalah **passport, passport-local, express-session**, pustaka berikut akan digunakan untuk mengirimkan `cookies` kepada user dan menyimpan data user pada `session` di server.

Implementasinya seperti berikut :

```js
const passport = require('passport')
const LocalStrategy = require('passport-local')
const session = require('express-session')
const bcrypt = require('bcrypt')
const path = require('path')

// passport local strategy
passport.use(new LocalStrategy(
  async function (username, password, done) {
    const getUser = await query(`select * from users where email = '${username}'`)
    const user = getUser.rows[0]
    if (!user) return done(null, false, { message: 'Password and username invalid!'})
    if (!(await bcrypt.compare(password, user.password))) {
      return done(null, false, { message: 'Password and username invalid!'})
    }
    return done(null, user)
  }
))

// buat inject req.session object dengan user
passport.serializeUser((user, done) => {
  done(null, user);
});  

// buat inject req object dengan user
passport.deserializeUser((user, done) => {
  done(null, user)
})


// inisiasi penggunaan passport
app.use(session())
app.use(passport.initialize())
app.use(passport.session({
  secret: 'yang=penting=aman',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}))
```

Pada kode diatas kita mendaftarkan strategi autentikasi kita, strategi berikut adalah dinamakan `local`, kenapa? Karena kita akan memverifikasi user dari data yang kita punya (yaitu database), bukan data yang ada pada akun mereka yang lain semisal Google, Facebook, dan beberapa layanan lain yang menyediakan fitur satu gerbang untuk login.

Setelah kita tulis kode tersebut (ingat di daftarkan sebagai middleware di expressjs yah) kita bisa pakai autentikasi dari passport pada api login.

```js
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/' }), 
  (req, res) => login(req, res)
)
```

Setelah itu coba test API dengan Postman, atau HTTP testing tool lainnya dengan mengirimkan _body_ sebgai berikut.

```json
{
  "username": "admin@admin.com",
  "password": "password123"
}
```

Saat kita mengakses `POST /login` maka kita akan menuju kode _local-strategy_ yang kita tulis tadi : 

```js
  async function (username, password, done) {
    const getUser = await query(`select * from users where email = '${username}'`)
    const user = getUser.rows[0]
    if (!user) return done(null, false, { message: 'Password and username invalid!'})
    if (!(await bcrypt.compare(password, user.password))) {
      return done(null, false, { message: 'Password and username invalid!'})
    }
    return done(null, user)
  }

  // lalu ke sini ...


  passport.serializeUser((user, done) => {
    done(null, user);
  });  

  passport.deserializeUser((user, done) => {
    done(null, user)
  })
```

Pada baris `return done(null, user)` ini berarti user kita berhasil login!. Lalu passport akan menambahkan object user pada request expressjs, sehingga kita bisa mengakses data user melalui `req.user` dimanapun kita mengaksesnya. 

Tidak hanya itu, passport juga sudah membuat session user kita di dalam server lalu menyematkan cookies pada tiap `res.send` yang kita lakuin. Jadi setiap request dan response yang kita lakukan ke dalam server akan beserta session user tersebut.

Jadi kita hanya tinggal mengerjakan fitur ke 3 dan ke 4. Cukup mudah kita hanya tinggal ambil saja object `req.user` lalu gunakan pada function router `/admin` kita.

```js
function adminPage(req, res) {
  if (req.user.role === 'admin') {
    res.render('admin.ejs')
  } else {
    res.render('limited_access.ejs')
  }
}
```

Untuk pada saat login kita juga perlu _redirect_ (melempar) user ke halaman yang di tentukan, kita bisa memanfaatkan `req.user` lagi

```js
async function login(req, res) {
  const user = req.user
  if (user.role === 'admin') {
    return res.redirect('/admin')
  } else {
    return res.redirect('/student')
  }
}
```
