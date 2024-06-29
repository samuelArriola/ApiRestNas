import express from 'express'
const app = express();
import { config } from 'dotenv';
config();
import ssqldwhc from './router/dwh.js'
import sftpNas from './router/nas.js'


app.use(express.json());
app.use('/ruta', ssqldwhc);
app.use('/nas', sftpNas);

app.listen( process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})