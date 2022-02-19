const { Pool } = require('pg')

const pool = new Pool({
  // isi dengan password, username, dan detail database kalian sendiri
  host: 'localhost',
  user: 'lazuandi',
  password: '',
  database: 'synrgy',
  // ignore below configuration for now, 
  // this are pooling connection settings
  max: 20, // connection pool ignore for now
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

module.exports = {
  query: (text, params) => pool.query(text, params)
}
