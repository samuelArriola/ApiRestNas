import {conectionDwh, mssql } from "../database/condwh.js"

const getRutas = async (req, res)=>{
    try {
        const pool = await conectionDwh();
        const result = await pool.request().query("SELECT * FROM RutasPrueba");
        return res.status(200).json({
            ok: true,
            result
        })
    } catch (error) {
         return res.status(500).json({
            estado: false,
            error
        })
    }
}

const postRuta = async (req, res)=>{
    const {nombre, ruta} = req.body;
    try {
        const pool = await conectionDwh();
        const result = await pool
            .request()
            .input("nombre", mssql.NVarChar, nombre)
            .input("ruta", mssql.NVarChar, ruta)
            .query("INSERT INTO RutasPrueba (nombre, ruta)"
                + "VALUES (@nombre, @ruta)");

        return res.status(200).json({
            ok: true,
            mesage: "Ruta Creada Exitosamente",
            result
        })
    } catch (error) {
         return res.status(500).json({
            estado: false,
            error
        })
    }
}

export {getRutas, postRuta} 