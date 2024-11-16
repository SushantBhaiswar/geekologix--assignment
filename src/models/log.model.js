const db = require('../db');
const bcrypt = require('bcryptjs');

const Log = {};

// Initialize table if not exists
Log.init = async () => {
    const query = `
  CREATE TABLE IF NOT EXISTS api_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,             
  uri VARCHAR(255) NOT NULL,                     
  headers JSON,                                  
  method VARCHAR(10) NOT NULL,                   
  body JSON,                                     
  params  VARCHAR(45),                                   
  ip_address VARCHAR(45),                                                                                       
  status VARCHAR(10),                            
  response JSON,                                 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); `;

    await db.query(query);
};

Log.create = async (data) => {
    const query = `INSERT INTO api_logs (uri , headers, method,body,params, ip_address, status, response) VALUES(?,?,?,?,?,?,?,?)`
    await db.query(query, [data?.uri,
    JSON.stringify(data?.headers),
    data?.method,
    JSON.stringify(data?.body) || null,
    data.params || null,
    data?.ip_address,
    data?.status,
    JSON.stringify(data?.response) || null,])

}

module.exports = Log;
