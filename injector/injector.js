const axios = require('axios');
const parseString = require('xml2js').parseString;
const NATS = require('nats');
const { ReadableStream } = require('node:stream/web');

// Codifica los datos
function readableStreamFrom(data) {

  return new ReadableStream({
  
    start(controller) {
  
      controller.enqueue(data);
      controller.close();
  
    },
  });
}

// Envía los datos
async function storeDataInObjectStorage(data) {
  
  const natsOsUrls = ['nats://localhost:4228', 'nats://localhost:4229', 'nats://localhost:4230'];
  const ncos = await NATS.connect({ servers: natsOsUrls });
  console.log(`Conectado al servidor NATS: ${ncos.getServer()}`);
  const jsos = await ncos.jetstream();
  const os = await jsos.views.os('Tiempo_en_Altura_Castellon', { storage: NATS.StorageType.File });
  const sc = NATS.StringCodec();


  // Guardamos el timestamp antes de codificar
  const timestamp = data.timestamp;

  // Llama a la codificación de los datos
  const streamToSave = readableStreamFrom(sc.encode(JSON.stringify(data)));

  try {
  
    // Se guardan los datos
    const saveResult = await os.put({ name: timestamp }, streamToSave);
    console.log('Almacenamiento de datos del inyector:', saveResult);

  } catch (error) {
  
      console.error(`Error en el almacenamiento: ${error.message}`);
  
  }
}

// Recoge la información de la AEMET
async function getWeatherDataAndStore() {

  // Delay inicial para dejar que los NATS elijan líder
  await new Promise((resolve) => setTimeout(resolve, 5000));
  
  while (true) {

    let jsonData;

    try {

      const response = await axios.get('https://www.aemet.es/xml/municipios_h/localidad_h_12012.xml');
      const xmlData = response.data;
      
      // Se parsean los datos

      parseString(xmlData, (err, result) => {

        jsonData = result;

      });
    } catch (error) {

      console.error(`Error en la petición al AEMET: ${error.message}`);

    }
    try{
      // Extracción de la información relevante
      if (jsonData) {

        const timestamp = jsonData.root.elaborado[0];
        const temperatureData = jsonData.root.prediccion[0].dia[0].temperatura.map((temp) => ({
          
          hour: parseInt(temp.$.periodo, 10),
          temperature: parseFloat(temp._),
        
        }));
        const weatherData = { timestamp, temperatureData };

        // Llama al almacenamiento de los datos
        await storeDataInObjectStorage(weatherData);

      }
    } catch (error) {

      console.error(`Error en la inyección de datos meteorológicos: ${error.message}`);

    }

    // Intentar ejecución cada hora
    await new Promise((resolve) => setTimeout(resolve, 35995000));

  }
}

if (require.main === module) {

  console.log("Im alive")
  getWeatherDataAndStore();
  
}
