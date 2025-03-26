const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize({
    host: process.env.BD_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? process.env.DB_PORT : 5432,
    dialect: 'mysql'
});

sequelize.authenticate()
    .then(() => {
        console.log('Connected successfully DB!');
    })
    .catch(err => {
        console.error('Impossible to connect:', err);
    });

module.exports = sequelize;