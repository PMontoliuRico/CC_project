const nats = require('nats');
const axios = require('axios');
const cron = require('node-cron');
const http = require('http');
const socketIo = require('socket.io');

async function obtenerDatosCola() {
  try {
    setInterval(async () => {
      try {
        // Utilizando axios para hacer la solicitud HTTP para obtener datos de la cola de mensajes
        const data_connz = await axios.get("http://127.0.0.0:8222/connz");
        const data_varz = await axios.get("http://127.0.0.0:8222/varz");
        console.log("Establecemos conexión con el monitor del servidor NATS");
    

        if (data_connz.data != undefined) {
          const datos = [];

          // Comprobamos el número de conexiones que hay en el servidor
          if (data_connz.data.num_connections != undefined &&
              data_connz.data.limit != undefined &&
              data_connz.data.num_connections < data_connz.data.limit) {

            datos.push("Estado del servidor: " + data_varz.status + " " + data_varz.statusText + ".");
            const conexiones = data_connz.data.num_connections;
            datos.push("Número de conexiones: " + conexiones + ".");

            // Añadimos un aviso para cuando se esté acercando al límite de conexiones definidas
            if (conexiones > Math.floor(data_connz.data.limit * 0.75)) {
              console.log("El número de conexiones está llegando a su límite " + data_connz.data.limit + ".");
            }else if(conexiones === Math.floor(data_connz.data.limit)) {
              console.log("El número de conexiones ha llegado a su límite.");
            }else if(conexiones < Math.floor(data_connz.data.limit * 0.1)){
              console.log("El número de conexiones es muy bajo. Se podría reducir el número de workers");
            }

          }

          if (data_varz.data != undefined) {
            datos.push("Memoria del servidor NATS: " + data_varz.data.mem + ".");

            const retrasos = data_varz.data.slow_consumers;
            if (retrasos > 0) {
              datos.push("¡Cuidado! Hay " + retrasos + " consumidores con retrasos en la cola de mensajes.");
              console.log("Sería necesario el despliegue de otro worker");
            } else if (retrasos === 0) {
              datos.push("No hay ningún consumidor con retrasos en la cola de mensajes.");
            }
          }

          console.log("---------------------\nDATOS DE LA COLA DE MENSAJES\n" + datos.join("\n"));

        }
      } catch (error) {
        console.log(error.message);
      }
    }, 5000); // Ejecutar cada 5 segundos

    // Esperar a que el programa se detenga
    await new Promise(resolve => setInterval(resolve, 2147483647));
    await nc.close();

  } catch (err) {
    console.log(err.message);
  }
}

obtenerDatosCola();
