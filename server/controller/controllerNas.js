import { conectionNas, sftp } from "../database/connas.js"
import {conectionDwh, mssql } from "../database/condwh.js"

import { config } from "dotenv";
config();
import path from 'path';
import xlsx from 'xlsx';

import fs from 'fs';




const __filename = new URL(import.meta.url).pathname;
let localPath =  path.resolve(path.dirname(__filename), '../uploads/').replace(/\\/g, '/').slice(3);
let localPath_csv =  path.resolve(path.dirname(__filename), '../uploads_csv/').replace(/\\/g, '/').slice(3);

const formatDate = (dateStr) => {
    var parts = dateStr.slice("/")
        var dateStr = new Date(parts[0], parts[1] - 1, parts[2]); 
     return dateStr.toDateString()

};

//Obtener el listado de carpetas de contratos
const getContrato = async (req, res)=>{
    try {
        await  conectionNas();
        const result = await sftp.list(process.env.RUTA_NAS);
        const names = result.map(file => file.name);

        return  res.status(200).json({
            ok: true,
            count : names.length,
            names
        }); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            error
        });  
    }finally{
        sftp.end();
    }
}

//Obtener el lisatado de excel para luego ser Derdargado y subido 
const getRiesgo = async (req, res)=>{
    const { Nombrecontrato } = req.body;
    const urlNas = `${process.env.RUTA_NAS}/${Nombrecontrato}/`
    
    try {
        await conectionNas()
        const result = await sftp.list(urlNas);
        const names = result.map(file => file.name);
        return res.status(500).json({
            ok: false,
            names
        })

    }catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            error
        });  
    }finally{
        sftp.end();
    }
}

//Descaragar riesgo 
const dowloadRiesgo = async ( req, res )=>{
    const { Nombrecontrato, NombreXls } = req.body;
    let urlNas =  `${process.env.RUTA_NAS}/${Nombrecontrato}/${NombreXls}`
    let urllocal = `${localPath}/${NombreXls}`

    try {
         await conectionNas();
         console.log(urlNas, urllocal);
         await sftp.get(urlNas, urllocal);

        return  res.status(200).json({
            ok: true,
            message: "Archivo Descargados  Exitosamente!"
        }); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            error
        })
    }finally{
        sftp.end();
    } 
}


const listaXls = function () {
      fs.readdir(localPath, (err , files)=>{
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
    
        // Lista todos los archivos de la carpeta
        files.forEach(file => {
            console.log(file);
        });
      })
}

const CargarRiesgoDwhMasivo = async (req, res)=>{

    let pool = await conectionDwh();
    fs.readdir(localPath, async(err , files)=>{
        if (err) {
            sftp.end()
            return console.log('Unable to scan directory: ' + err);
        }
        
        let urllocal = `${localPath}/${files}`
        let workbook = xlsx.readFile(urllocal, { cellText:false, cellDates:true }); //lee el archivo
        let sheet_name_list = workbook.SheetNames[0]; //obtiene la primero hoja
        let worksheet = workbook.Sheets[sheet_name_list]; //almceno la hoja
        let data = xlsx.utils.sheet_to_json(worksheet, { defval: 'NA', raw: false , dateNF: 'yyyy"/"mm"/"dd'	 }) // leo los datos de la hoja
    
        try {  
           

            //Insertar datos 
            for (let item of data) {
            await pool.request()
                .input ("EPS", mssql.NVarChar, String( item["EPS"] ==  "SIN INFORMACION" ? "NA": item["EPS"]  ))
                .input ("TIPO_DOCUMENTO", mssql.NVarChar, String( item["TIPO_DOCUMENTO"] ==  "SIN INFORMACION" ? "NA": item["TIPO_DOCUMENTO"]  ))
                .input ("NUM_DOCUMENTO", mssql.NVarChar, String (item["NUM_DOCUMENTO"]  ==  "SIN INFORMACION" ? "NA": item["NUM_DOCUMENTO"] ) )
                .input ("APELLIDO_1", mssql.NVarChar, String( item["APELLIDO_1"] ==  "SIN INFORMACION" ? "NA": item["APELLIDO_1"]  ) )
                .input ("APELLIDO_2", mssql.NVarChar, String( item["APELLIDO_2"] ==  "SIN INFORMACION" ? "NA": item["APELLIDO_2"]  ) )
                .input ("NOMBRE_1", mssql.NVarChar, String( item["NOMBRE_1"] ==  "SIN INFORMACION" ? "NA": item["NOMBRE_1"]  ) )
                .input ("NOMBRE_2", mssql.NVarChar, String( item["NOMBRE_2"] ==  "SIN INFORMACION" ? "NA": item["NOMBRE_2"]  ) )
                .input ("FECHA_NACIMIENTO", mssql.Date,  ( item["FECHA_NACIMIENTO"] ==  "SIN INFORMACION" ? "1900-01-01": item["FECHA_NACIMIENTO"] ) )
                .input ("SEXO", mssql.NVarChar, String( item["SEXO"] ==  "SIN INFORMACION" ? "NA": item["SEXO"]  ) ) 
                .input ("DPTO", mssql.NVarChar, String( item["DPTO"] ==  "SIN INFORMACION" ? "NA": item["DPTO"]  ) ) 
                .input ("MPIO", mssql.NVarChar, String( item["MPIO"] ==  "SIN INFORMACION" ? "NA": item["MPIO"]  ) ) 
                .input ("ZONA", mssql.NVarChar, String( item["ZONA"] ==  "SIN INFORMACION" ? "NA": item["ZONA"]  ) ) 
                .input ("F_AFILIACION_EPS", mssql.Date,  ( item["F_AFILIACION_EPS"] ==  "SIN INFORMACION" ? "1900-01-01": item["F_AFILIACION_EPS"] ) )
                .input  ("ESTADO", mssql.NVarChar , String( item["ESTADO"] ==  "SIN INFORMACION" ? "NA": item["ESTADO"] ))
                .input ("F_CONTRATO", mssql.Date, ( item["F_CONTRATO"] ==  "SIN INFORMACION" ? "1900-01-01": item["F_CONTRATO"] ) )
                .input ("CONTRATO", mssql.NVarChar, String( item["CONTRATO"] ==  "SIN INFORMACION" ? "NA": item["CONTRATO"]  ) )
                .input ("CELULAR", mssql.NVarChar, String( item["CELULAR"] ==  "SIN INFORMACION" ? "NA": item["CELULAR"]  ) )
                .input ("TELEFONO", mssql.NVarChar, String(item["TELEFONO"] ==  "SIN INFORMACION" ? "NA": item["TELEFONO"]  )) 
                .input ("NIT_ENTIDAD", mssql.NVarChar, String( item["NIT_ENTIDAD"] ==  "SIN INFORMACION" ? "NA": item["NIT_ENTIDAD"]  ) )
                .input ("RUTA", mssql.NVarChar, String( item["RUTA"] ==  "SIN INFORMACION" ? "NA": item["RUTA"]  ) )
                .input ("PERIODO", mssql.NVarChar, String( item["PERIODO"] ==  "SIN INFORMACION" ? "NA": item["PERIODO"]  ) )
                .input ("NOMBRE_ARCHIVO", mssql.NVarChar, String( item["NOMBRE_ARCHIVO"] ==  "SIN INFORMACION" ? "NA": item["NOMBRE_ARCHIVO"]  ) )
                .input ("TIPO_CONTRATO", mssql.NVarChar, String( item["TIPO_CONTRATO"] ==  "SIN INFORMACION" ? "NA": item["TIPO_CONTRATO"]  ) )
                .query( "INSERT INTO DETALLE_BASES_POBLACIONALES ( EPS ,TIPO_DOCUMENTO ,NUM_DOCUMENTO ,APELLIDO_1 ,APELLIDO_2 ,NOMBRE_1 ,NOMBRE_2 ,FECHA_NACIMIENTO ,SEXO ,DPTO ,MPIO ,ZONA ,F_AFILIACION_EPS ,ESTADO ,F_CONTRATO ,CONTRATO ,CELULAR ,TELEFONO ,NIT_ENTIDAD ,RUTA ,PERIODO ,NOMBRE_ARCHIVO ,TIPO_CONTRATO ) " +
                        "VALUES ( @EPS ,@TIPO_DOCUMENTO ,@NUM_DOCUMENTO ,@APELLIDO_1 ,@APELLIDO_2 ,@NOMBRE_1 ,@NOMBRE_2 ,@FECHA_NACIMIENTO ,@SEXO ,@DPTO ,@MPIO ,@ZONA ,@F_AFILIACION_EPS ,@ESTADO ,@F_CONTRATO ,@CONTRATO ,@CELULAR ,@TELEFONO ,@NIT_ENTIDAD ,@RUTA ,@PERIODO ,@NOMBRE_ARCHIVO ,@TIPO_CONTRATO)" );

                }
            
            fs.unlinkSync(urllocal);
            console.log(`Cargado ${files}`);
            return res.status(200).json({
                ok: true,
                mesage: "datos cargados"
            })
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                ok: false,
                error
            })        
        }
    });


    }



//Cargar el xls a Dwh
const CargarRiesgoDwh = async (req, res)=>{

    const {  NombreXls } = req.body;
    let urllocal = `${localPath}/${NombreXls}`
    const workbook = xlsx.readFile(urllocal, { cellText:false, cellDates:true }); //lee el archivo

    const sheet_name_list = workbook.SheetNames[0]; //obtiene la primero hoja
    const worksheet = workbook.Sheets[sheet_name_list]; //almceno la hoja
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: 'NA', raw: false , dateNF: 'yyyy"/"mm"/"dd'	 }) // leo los datos de la hoja

    try {  
          const pool = await conectionDwh();

        //Insertar datos 
        for (let item of data) {
           await pool.request()
            .input ("EPS", mssql.NVarChar, String( item["EPS"] ==  "SIN INFORMACION" ? "NA": item["EPS"]  ))
            .input ("TIPO_DOCUMENTO", mssql.NVarChar, String( item["TIPO_DOCUMENTO"] ==  "SIN INFORMACION" ? "NA": item["TIPO_DOCUMENTO"]  ))
            .input ("NUM_DOCUMENTO", mssql.NVarChar, String (item["NUM_DOCUMENTO"]  ==  "SIN INFORMACION" ? "NA": item["NUM_DOCUMENTO"] ) )
            .input ("APELLIDO_1", mssql.NVarChar, String( item["APELLIDO_1"] ==  "SIN INFORMACION" ? "NA": item["APELLIDO_1"]  ) )
            .input ("APELLIDO_2", mssql.NVarChar, String( item["APELLIDO_2"] ==  "SIN INFORMACION" ? "NA": item["APELLIDO_2"]  ) )
            .input ("NOMBRE_1", mssql.NVarChar, String( item["NOMBRE_1"] ==  "SIN INFORMACION" ? "NA": item["NOMBRE_1"]  ) )
            .input ("NOMBRE_2", mssql.NVarChar, String( item["NOMBRE_2"] ==  "SIN INFORMACION" ? "NA": item["NOMBRE_2"]  ) )
            .input ("FECHA_NACIMIENTO", mssql.Date,  ( item["FECHA_NACIMIENTO"] ==  "SIN INFORMACION" ? "1900-01-01": item["FECHA_NACIMIENTO"] ) )
            .input ("SEXO", mssql.NVarChar, String( item["SEXO"] ==  "SIN INFORMACION" ? "NA": item["SEXO"]  ) ) 
            .input ("DPTO", mssql.NVarChar, String( item["DPTO"] ==  "SIN INFORMACION" ? "NA": item["DPTO"]  ) ) 
            .input ("MPIO", mssql.NVarChar, String( item["MPIO"] ==  "SIN INFORMACION" ? "NA": item["MPIO"]  ) ) 
            .input ("ZONA", mssql.NVarChar, String( item["ZONA"] ==  "SIN INFORMACION" ? "NA": item["ZONA"]  ) ) 
            .input ("F_AFILIACION_EPS", mssql.Date,  ( item["F_AFILIACION_EPS"] ==  "SIN INFORMACION" ? "1900-01-01": item["F_AFILIACION_EPS"] ) )
            .input  ("ESTADO", mssql.NVarChar , String( item["ESTADO"] ==  "SIN INFORMACION" ? "NA": item["ESTADO"] ))
            .input ("F_CONTRATO", mssql.Date, ( item["F_CONTRATO"] ==  "SIN INFORMACION" ? "1900-01-01": item["F_CONTRATO"] ) )
            .input ("CONTRATO", mssql.NVarChar, String( item["CONTRATO"] ==  "SIN INFORMACION" ? "NA": item["CONTRATO"]  ) )
            .input ("CELULAR", mssql.NVarChar, String( item["CELULAR"] ==  "SIN INFORMACION" ? "NA": item["CELULAR"]  ) )
            .input ("TELEFONO", mssql.NVarChar, String(item["TELEFONO"] ==  "SIN INFORMACION" ? "NA": item["TELEFONO"]  )) 
            .input ("NIT_ENTIDAD", mssql.NVarChar, String( item["NIT_ENTIDAD"] ==  "SIN INFORMACION" ? "NA": item["NIT_ENTIDAD"]  ) )
            .input ("RUTA", mssql.NVarChar, String( item["RUTA"] ==  "SIN INFORMACION" ? "NA": item["RUTA"]  ) )
            .input ("PERIODO", mssql.NVarChar, String( item["PERIODO"] ==  "SIN INFORMACION" ? "NA": item["PERIODO"]  ) )
            .input ("NOMBRE_ARCHIVO", mssql.NVarChar, String( item["NOMBRE_ARCHIVO"] ==  "SIN INFORMACION" ? "NA": item["NOMBRE_ARCHIVO"]  ) )
            .input ("TIPO_CONTRATO", mssql.NVarChar, String( item["TIPO_CONTRATO"] ==  "SIN INFORMACION" ? "NA": item["TIPO_CONTRATO"]  ) )
            .query( "INSERT INTO DETALLE_BASES_POBLACIONALES ( EPS ,TIPO_DOCUMENTO ,NUM_DOCUMENTO ,APELLIDO_1 ,APELLIDO_2 ,NOMBRE_1 ,NOMBRE_2 ,FECHA_NACIMIENTO ,SEXO ,DPTO ,MPIO ,ZONA ,F_AFILIACION_EPS ,ESTADO ,F_CONTRATO ,CONTRATO ,CELULAR ,TELEFONO ,NIT_ENTIDAD ,RUTA ,PERIODO ,NOMBRE_ARCHIVO ,TIPO_CONTRATO ) " +
                    "VALUES ( @EPS ,@TIPO_DOCUMENTO ,@NUM_DOCUMENTO ,@APELLIDO_1 ,@APELLIDO_2 ,@NOMBRE_1 ,@NOMBRE_2 ,@FECHA_NACIMIENTO ,@SEXO ,@DPTO ,@MPIO ,@ZONA ,@F_AFILIACION_EPS ,@ESTADO ,@F_CONTRATO ,@CONTRATO ,@CELULAR ,@TELEFONO ,@NIT_ENTIDAD ,@RUTA ,@PERIODO ,@NOMBRE_ARCHIVO ,@TIPO_CONTRATO)" );

            }
        
        fs.unlinkSync(urllocal);
        console.log(`Cargado ${urllocal}`);
        return res.status(200).json({
            ok: true,
            mesage: "datos cargados"
        })
          
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            error
        })        
    }finally{
        sftp.end()
    }
}

//Descaragar riesgo por contrato de forma masiva 
const dowloadRiesgoContrato = async ( req, res )=>{
    const { Nombrecontrato } = req.body;
    const urlNas = `${process.env.RUTA_NAS}/${Nombrecontrato}/`
  
     try {

         await conectionNas();
           const result = await sftp.list(urlNas);
           const listadoXls = result.map(file => file.name)
        for (const a_xlsx of listadoXls) {
            await sftp.get(`${urlNas}/${a_xlsx}`, `${localPath}/${a_xlsx}`);
            console.log("xlsx: "+a_xlsx);

            const workbook = xlsx.readFile( `${localPath}/${a_xlsx}`, { cellText:false, cellDates:true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName]
            const csvData = xlsx.utils.sheet_to_csv(worksheet, { defval: 'NA', raw: false , dateNF: 'yyyy"/"mm"/"dd'	 })
            fs.writeFileSync(`${localPath_csv}/${path.parse(a_xlsx).name}.csv`, csvData);
            console.log("csv: "+a_xlsx);

            
            
            fs.unlinkSync(`${localPath}/${a_xlsx}`);
        }

        return  res.status(200).json({
            ok: true,
            message: "Archivo cargado Exitosamente!"
        }); 
    } catch (error) {
        throw new Error(error.message)
        console.log(error);
        return res.status(500).json({
            ok: false,
            error
        })
    }finally{
        sftp.end();
    } 
  
}



export {getContrato,
        getRiesgo ,
        dowloadRiesgo,
        CargarRiesgoDwh,
        dowloadRiesgoContrato,
        CargarRiesgoDwhMasivo
}