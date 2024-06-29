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
    const {nombre2, ruta2} = req.body;
    try {
        const pool = await conectionDwh();
        const result = await pool
            .request()
            .input("nombre", mssql.NVarChar, nombre2)
            .input("ruta", mssql.NVarChar, ruta2)
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