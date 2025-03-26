const pgp = require("pg-promise")();

const config = {
    host: "localhost",
    port: 5432,
    database: "medcare-db",
    user: "postgres",
    password: "anamika",
};

const db = pgp(config);

module.exports = db;