const mysql = require('mysql2');
const fs = require('fs');
const { rejects } = require('assert');

class classDB {
    constructor(dbFile) {
        const dataDB = fs.readFileSync(dbFile, 'utf8');
        // Parse the JSON data
        const jsonData = JSON.parse(dataDB);

        this.hostDB = jsonData.host;
        this.userDB = jsonData.user;
        this.passwordDB = jsonData.password;
        this.portDB = jsonData.port;

        this.tableUsers = 'user';

        this.databaseName = 'demo';

        this.connection = this.connectToMySQL(this.databaseName);
    }

    getConnectInfo() {
        return JSON.stringify({ host: this.hostDB, user: this.userDB, password: this.passwordDB, port: this.portDB });
    }

    /**
     * Connects to a MySQL database.
     * @param {string} dbNAME The name of the database to connect to.
     * @param {Object} res The *response* from server query. Need for response error 
     * @returns {Object} The MySQL connection object.
     */
    connectToMySQL(dbNAME, res) {
        try {
            const connection = mysql.createConnection({
                host: this.hostDB,
                user: this.userDB,
                password: this.passwordDB,
                database: dbNAME,
                port: this.portDB
            });
            connection.connect((err) => {
                if (err) { 
                    console.dir(err); 
                    if (res) {
                        res.json({ response:'Error connection to DB' }); 
                        return null;
                    }
                }
            });
            return connection;
        } 
        catch(err) {
            console.log(err);
            if (res) {
                res.json({ response:'Error connection to DB' }); 
            }
            return null;
        }
    }

    register(userData) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO user(login, password, fio, phone, email, role_id) VALUES('${userData.login}', 
                '${userData.password}', '${userData.fio}', '${userData.phone}', '${userData.email}', '${userData.role_id}')`;
            this.connection.query(query, userData, (error, result) => {
                if (error) {
                    console.log(error);
                    return reject({ status: 'error', response: 'Error in userData' });
                }
                console.log(result);
                return resolve({ status: 'success', response: `Registered new user: ${result[0]}!` })
            })
        })
    }

    login(userData) {
        return new Promise((resolve, reject) => {
            console.log(userData);
            const query = `SELECT id FROM user WHERE login = '${userData.login}' AND password = '${userData.password}'`;
            this.connection.query(query, (error, result) => {
                if (error) {
                    console.log(error);
                    return reject({ status: 'error', response: 'Error in userData' });
                }
                if (result.length > 0) {
                    return resolve({ status: 'success', response: `Logged!` })
                } 
                else {
                    return resolve({ status: 'success', response: 'Такой пользователь не найден' });
                }
            })  
        }) 
    }

}

module.exports = {
    classDB
};