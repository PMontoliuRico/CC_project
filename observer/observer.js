const nats = require('nats');
const axios = require('axios');


(async () =>{
    try{
      const nc = await nats.connect({
        servers: ['localhost:4222'],
      })
      console.log("Establecemos conexion con el monitor del servidor nats");


      // Utilizando axios para hacer la solicitud HTTP
      const response = await axios.get("http://localhost:8222/connz");
      const data = response.data;
      console.log(data);

      /*$.getJSON("http://localhost:8222/connz", function (data) {
        console.log(data);
      });*/
      await nc.close();
    }catch(err){
      console.log(err.message);
    }
  })();
