import mysql from 'mysql'
import dotenv from 'dotenv'

dotenv.config()

const DB_CONNECTION_LIMIT = (process.env
  .DB_CONNECTION_LIMIT as unknown) as number
const DB_HOST = process.env.DB_HOST
const DB_PORT = (process.env.DB_PORT as unknown) as number
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME

const pool = mysql.createPool({
  connectionLimit: DB_CONNECTION_LIMIT,
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
})

const query = <T>(query: string): Promise<mysql.MysqlError | T[]> => {
  return new Promise((resolve, reject) => {
    return pool.query(query, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

const transaction = <T>(
  options: mysql.QueryOptions
): Promise<mysql.MysqlError | T[]> => {
  return new Promise((resolve, reject) => {
    return pool.getConnection(
      (err: mysql.MysqlError, connection: mysql.PoolConnection) => {
        if (err) {
          reject(err)
        } else {
          connection.beginTransaction(options, (err: mysql.MysqlError) => {
            if (err) {
              reject(err)
            } else {
              connection.query(options, (err: mysql.MysqlError, rows: []) => {
                if (err) {
                  connection.rollback(options, (err: mysql.MysqlError) => {
                    if (err) {
                      reject(err)
                    } else {
                      reject(err)
                    }
                  })
                } else {
                  connection.commit(options, (err: mysql.MysqlError) => {
                    if (err) {
                      reject(err)
                    } else {
                      connection.release()
                      resolve(rows)
                    }
                  })
                }
              })
            }
          })
        }
      }
    )
  })
}

export default {
  query,
  transaction,
}
