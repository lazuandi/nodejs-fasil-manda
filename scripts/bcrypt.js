// Lakukan install terlebih dahulu jika belum
// npm install bcrypt
// https://www.npmjs.com/package/bcrypt
const bcrypt = require("bcrypt")


/**
 * Digunakan untuk hashing password kita
 * {mypassword} - Berisi text password kita
 */
async function hashPassword(mypassword) {
    // angka 12 disini bisa dirubah, ini dinamakan round, yaitu seberapa banyakkah kita nanti 
    // akan mengulangi proses hashing, semakin banyak akan semakin lama proses hashing dilakukan
    // biasanya di rekomendasikan 10 - 20
    const hash = await bcrypt.hash(mypassword, 12)
    console.log('Password berhasil di hash : \n', hash)
    return hash
}

/**
 * Mengecek apakah input text yang kita berikan sama dengan hash atau tidak
 * {inputText} - input text password
 */
async function decryptPassword(inputText, hash) {
    const sudahBenar = await bcrypt.compare(inputText, hash)
    if (sudahBenar) {
        console.log('Password sama, user berhasil login')
    } else {
        console.log('Password berbeda, silahkan ulagi lagi')
    }
}

// menjalankan program, fungsi berikut akan langsung berjalan saat program di eksekusi
// baca lebih lanjut disini https://developer.mozilla.org/en-US/docs/Glossary/IIFE
(async () => {
  const passwordSaya = 'password-bagus-123'
  const hashed = await hashPassword(passwordSaya)
   
  console.log('-----------BERHASIL-------------')
  await decryptPassword(passwordSaya, hashed) // berhasil

  console.log('-----------GAGAL----------------')
  await decryptPassword('bukan-password-saya', hashed) // tidak berhasil

})()
