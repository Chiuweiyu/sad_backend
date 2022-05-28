const pg = require("pg");
const { newDb } = require("pg-mem");
const { Pool } = newDb().adapters.createPg();

require('dotenv').config();

const pool = process.env.NODE_ENV === 'test' ? new Pool() : new pg.Pool({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.RDS_PORT
});

const init = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS public.users(
    user_name TEXT NOT NULL,
    pwd TEXT NOT NULL,
    account_level INT,
    record INT,
    PRIMARY KEY(user_name)
  )`)
  await pool.query(`CREATE TABLE IF NOT EXISTS public.sheets(
      sheet_id SERIAL NOT NULL,
      title text COLLATE pg_catalog."default" NOT NULL,
      sheet_type text COLLATE pg_catalog."default",
      left_value text COLLATE pg_catalog."default",
      right_value text COLLATE pg_catalog."default",
      belongs_to text COLLATE pg_catalog."default",
      CONSTRAINT sheets_pkey PRIMARY KEY (sheet_id),
      CONSTRAINT sheet_fkey FOREIGN KEY (belongs_to)
          REFERENCES public.users (user_name) MATCH SIMPLE
          ON UPDATE NO ACTION
          ON DELETE NO ACTION
          NOT VALID
  )`)
  await pool.query(`CREATE TABLE IF NOT EXISTS public.records(
      record_id SERIAL NOT NULL,
      user_name text COLLATE pg_catalog."default",
      record_date date,
      record_time time without time zone,
      photo text COLLATE pg_catalog."default",
      restaurant_name text COLLATE pg_catalog."default",
      food_name text COLLATE pg_catalog."default",
      likeval integer,
      spicyval integer,
      tag text COLLATE pg_catalog."default",
      reminder text COLLATE pg_catalog."default",
      sheet_value text COLLATE pg_catalog."default",
      price integer,
      place text COLLATE pg_catalog."default",
      CONSTRAINT records_pkey PRIMARY KEY (record_id),
      CONSTRAINT records_user_name_fkey FOREIGN KEY (user_name)
          REFERENCES public.users (user_name) MATCH SIMPLE
          ON UPDATE NO ACTION
          ON DELETE NO ACTION
  )`)
}
init()

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

