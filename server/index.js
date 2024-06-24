import express from 'express'
const app = express();
import { config } from 'dotenv';
config();
import ssqldwhc from './router/dwh.js'


app.use(express.json());
app.use('/ruta', ssqldwhc);

app.listen( process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})