const nats = require('nats');
const http = require('http');

global.inc_jobs=0;
global.inc_jobsprocessed=0;
global.contador=0;

async function obtenerDatosCola() {
  try {
    setInterval(async () => {
      try {
        const temp_inc_jobs = global.inc_jobs;
        const temp_inc_jobsprocessed = global.inc_jobsprocessed;
        const diff = temp_inc_jobs - temp_inc_jobsprocessed;
        forget = false;
        if(diff > 5 && (temp_inc_jobs * 0.25) > temp_inc_jobsprocessed){
          console.log("Hay una diferencia significativa de trabajos procesados y número de trabajos totales.\nEs necesario el incremento de un worker.");
          global.contador = 0;
          forget = true;
        }
        else if ((temp_inc_jobs * 0.9) <= temp_inc_jobsprocessed) {
          global.contador++;
          forget = false;
          if (global.contador > 10) {
            console.log("Hay poca carga en el sistema, se puede desactivar un worker.");
            global.contador = 0;
            forget = true;
          } else {
            console.log('Carga baja, analizando si es posible disminuir un worker');
          }
        } else {
          console.log("los workers estan bien");
          global.contador = 0;
          forget = true;
        }
        if (forget) {
          global.inc_jobs -= temp_inc_jobsprocessed;
          global.inc_jobsprocessed -= temp_inc_jobsprocessed;
        }
        
      } catch (error) {
        console.log(error.message);
      }

    }, 5000); // Ejecutar cada 5 segundos

  } catch (err) {
    console.log(err.message);
  }
}

async function main(){
  const natsQueueUrls = ['nats://natsq-0:4222', 'nats://natsq-1:4223', 'nats://natsq-2:4224'];
  const ncq = await nats.connect({ servers: natsQueueUrls });
  console.log(`connected to ${ncq.getServer()}`);

  const sub1 = ncq.subscribe('jobs_executors');
  const sub2 =  ncq.subscribe('worker_monitor');

  (async () => {
    for await (const m of sub1) {
      global.inc_jobs++;
    }
    console.log('subscription closed');
  })();

  (async () => {
    for await (const m of sub2) {
      global.inc_jobsprocessed++;
    }
    console.log('subscription closed');
  })();
  
  obtenerDatosCola();
}

main()