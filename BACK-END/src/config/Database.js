import mysql from 'mysql2/promise';
import 'dotenv/config';

//design pattern: Singleton ---> permite  a criação de apenas uma instância da classe
class Database {
    static #instance =null;
    #pool =null;

    #createPool(){
        this.#pool = mysql.createPool({
            host: String(process.env.DB_HOST || '').trim(),
            user: String(process.env.DB_USER || '').trim(),
            password: String(process.env.DB_PASSWORD || '').trim(),
            database: String(process.env.DB_DATABASE || '').trim(),
            port: Number(process.env.DB_PORT || 3306),
            waitForConnections: true,
            connectionLimit: 100,
            queueLimit: 0
        });
    }

    static getInstance(){
        if(!Database.#instance){
            Database.#instance = new Database();
            Database.#instance.#createPool();
        }
        return Database.#instance;
    }
    getPool (){
        return this.#pool
    }
}

export const connection = Database.getInstance().getPool();
