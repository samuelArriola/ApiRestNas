import { getRutas, postRuta} from "../controller/controllerDwh.js"
import express from "express";
const app = express();

app.get("/", getRutas);
app.post("/", postRuta);

export default app;