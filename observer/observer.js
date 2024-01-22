const nats = require('nats');
const axios = require('axios');


(async () =>{
    try{
      const nc = await nats.connect({
        servers: ['localhost:4222'],
      })
      console.log("Establecemos conexion con el monitor del servidor nats");


      // Utilizando axios para hacer la solicitud HTTP para obtener datos de la cola de mensajes
      const data_connz = await axios.get("http://localhost:8222/connz");
      const data_varz = await axios.get("http://localhost:8222/varz");
      if(data_connz.data != undefined){
        data = data_connz.data;
        datos = "";
        //Comprobamos el numero de conexiones que hay en el servidor
        if(data.num_connections != undefined & data.limit != undefined & data.num_connections < data.limit){
          datos  = datos +"Estado del servidor: "+ data_varz.status + " " + data_varz.statusText + ".";

          conexiones = data.num_connections;
          datos  = datos +"\nNúmero de conexiones: "+ conexiones + ".";
          //añadimos un aviso para cuando se este acercando al limite de conexiones definidas
          if(conexiones == (data.limit*0.75)){console.log("El número de conexiones está llegando a su límite " + data.limit + ".");}
        }else{
          console.log("El número de conexiones ha llegado a su limite.");
        }

        if(data_varz != undefined){
          //console.log(data_varz.data);
          data = data_varz.data;
          datos = datos + "\nMemoria del servidor NATS: " + data.mem + ".";

          retrasos = data.slow_consumers;
          if(retrasos > 0 ){
            datos = datos + "\nCuidado!!! Hay " + retrasos + " consumidores con retrasos en la cola de mensajes.";
          }else if(retrasos == 0){
            datos = datos + "\nNo hay ningun consumidor con retrasos en la cola de mensajes.";
          }

        }




        //Habría que ver el numero de workers y clientes si publican en una cola un numero de mensaje
      }

      console.log("---------------------\nDATOS DE LA COLA DE MENSAJES\n" + datos);

      /*$.getJSON("http://localhost:8222/connz", function (data) {
        console.log(data);
      });*/
      await nc.close();
    }catch(err){
      console.log(err.message);
    }
  })();
