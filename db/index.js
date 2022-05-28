const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
  host: process.env.RDS_HOSTNAME 
  user: process.env.RDS_USERNAME 
  password: process.env.RDS_PASSWORD  
  database: process.env.DB_NAME 
  port: process.env.RDS_PORT
});



async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    throw err;
  }
}
module.exports = {
  query,
};

