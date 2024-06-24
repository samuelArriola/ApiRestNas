import mssql from 'mssql'
import { config } from 'dotenv';
config();


const configDwh = {
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    server: process.env.DB_SERVER ,
    database: process.env.DB_DATABASE ,
    port: parseInt(process.env.DB_PORT) , // Asegúrate de que este sea el puerto correcto
    connectionTimeout: 30000, // Tiempo de espera para establecer la conexión en milisegundos (30 segundos)
    requestTimeout: 30000, // Tiempo de espera para las solicitudes en milisegundos (30 segundos)
    options: {
      encrypt: false, // Utilizar SSL si es necesario
      trustServerCertificate: true // Si el certificado del servidor no es de confianza
    }
  };

  export async function conectionDwh() {
    try {
        return await mssql.connect(configDwh)
    } catch (error) {
        console.log("Erorr!!!!   "+error)
        throw new Error(error.message)
    }

  }

export{ mssql }