import client from 'ssh2-sftp-client';
const sftp = new client();
import { config  } from 'dotenv';
config();

const configSftp = {
    host: process.env.DB_HOST_NAS,
    port: process.env.DB_PORT_NAS  ,
    username: process.env.DB_USERNAME_NAS,
    password: process.env.DB_PASSWORD_NAS, 
    readyTimeout: 300000
  };


 export async function conectionNas(){
    try {
        return await sftp.connect(configSftp);
    } catch (error) {
        console.log("Erorr!!!!   "+error)
        throw new Error(error.message)
    }
}

export { sftp }