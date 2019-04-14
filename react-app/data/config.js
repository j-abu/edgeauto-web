const mysql = require('mysql');

const config = {
	host: 'localhost',
	user: 'root',
	database: 'messages'
};

const pool = mysql.createPool(config);
module.exports = pool;
