const { query } = require('./db')
const bcrypt = require('bcrypt')

// Create user table
async function createTableUser() {
  await query("create type role as enum ('admin', 'student');")
  await query(`
    create table if not exists users (
      id SERIAL,
      email varchar not null,
      password varchar not null,
      role role not null,

      unique(email)
  )`)
}

async function createAdmin() {
  // membuat hash password dari 
  const passAdmin = await bcrypt.hash('password123', 12)
  const passStudent = await bcrypt.hash('password321', 12)
  await query(`
    insert into users(email, password, role) 
      values 
      ('admin@binar.com', '${passAdmin}', 'admin'),
      ('student@binar.com', '${passStudent}', 'student');
  `)
}

(async () => {
  await createTableUser()
  await createAdmin()
  console.info('SUCCESS MIGRATE TABLE!')
  process.exit(1)
})()
