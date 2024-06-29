import { getContrato, getRiesgo, dowloadRiesgo, CargarRiesgoDwh, dowloadRiesgoContrato, CargarRiesgoDwhMasivo } from "../controller/controllerNas.js"
import express from "express";
const app = express();

app.get("/", getContrato);
app.post("/", getRiesgo);
app.post("/Dowload", dowloadRiesgo);
app.post("/DowloadMasivo", dowloadRiesgoContrato);
app.post("/loadMasivo", CargarRiesgoDwhMasivo);

app.post("/xlsx", CargarRiesgoDwh);
export default app;