const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
// El puerto será definido por Vercel, debemos usar process.env.PORT
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // sirve todos los archivos en la misma ruta que el server

// Usa process.env.API_KEY para obtener la clave de API
const API_KEY = "AIzaSyD6Pvo7xwMvhPwl3zrUfWe91lavdSvyTrk";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });


app.post('/chat', async (req, res) => {
  console.log("Se llamó a /chat"); // <---- log para verificar que la ruta es llamada
  const { message } = req.body;
  try {
    const result = await model.generateContent(message);
    const response = result.response;
    const text = response.text();
    res.json({ response: text });
  } catch (error) {
    console.error("Error en /chat:", error);
    res.status(500).json({ error: "Error al obtener respuesta de Gemini" });
  }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});