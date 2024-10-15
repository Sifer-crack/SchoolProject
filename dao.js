import util from "util";
import mysql from "mysql";

const createPool = (
    host = "localhost",
    user = "root",
    database = "lbccc_users"
) => {
    const connectionLimit = 10;
    const db = mysql.createPool({ host, user, database, connectionLimit });
    db.query = util.promisify(db.query);
    return db;
};

module.exports.createPool = createPool;