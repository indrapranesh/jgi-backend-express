'use strict';
import { createConnection } from 'mysql';
//local mysql db connection
const dbConn = createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'node_mysql_crud_db'
});
dbConn.connect(function(err) {
  if (err) throw err;
  console.log("Database Connected!");
});
export default dbConn;