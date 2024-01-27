const express = require('express');
const app = express();
const morgan = require('morgan');
const NATS = require('nats');

// Settings
app.use(morgan('dev'));
app.use(require('./routes/index'));

// const sc = NATS.StringCodec();
// const natsQueueUrl = 'nats://localhost:4222';

// Wrap the connection in an async function
// async function connectToNats() {
//   const ncq = await NATS.connect({ servers: [natsQueueUrl] });
//   console.log(`connected to ${ncq.getServer()}`);
// }
// connectToNats().catch(err => console.error(err));
// /**
//  * 
//  */
// let kv;
// async function connectToNatsAndFetchJobs() {
//     const natskvUrl = 'nats://localhost:4225';
//     const nckv = await NATS.connect({ servers: [natskvUrl] });
//     console.log(`connected to ${nckv.getServer()}`);
//     const jskv = await nckv.jetstream();
//     const kv = await jskv.views.kv('jobs');
    
//     return kv; // You can return the kv object if you need it later
//   }
// connectToNatsAndFetchJobs().catch(err => console.error(err));
// module.exports = { kv };
// /*user y id del job para que no hayan coincidencias*/
// //doc: https://github.com/nats-io/nats.deno/blob/main/jetstream.md (al final docu de kv y os)
// //crear job, falla si la llave ya existe
// await kv.create(`${job.user}.${job.id}`, sc.encode('Created'));
// //update de la llave
// await kv.put(`${job.user}.${job.id}`, sc.encode('Running'));
// //obtener estado de un job especifico
// e = await kv.get(`${job.user}.${job.id}`);
// console.log(`value for get ${sc.decode(e.value)}`);
// //obtener todos los jobs de un usuario
// await kv.get(`${job.user}`);

// //creacion de ids
// const { v4: uuidv4 } = require('uuid');
// id = uuidv4();

// //JSON a enviar a la cola NATS llamada 'jobs_executors'
// const job = {
//     'source': 'https://github.com/apdelsm/cc_test_1.git',
//     'parameters': [1, 2],
//     'user': 'userid',
//   }
// //el mensaje debe ser el JSON como string y codificado con el string codec
// await ncq.publish('jobs_executors', sc.encode(JSON.stringify(job)));



// const natsOsUrl = 'nats://localhost:4228';
// const ncos = await NATS.connect({ servers: [natsOsUrl] });
// console.log(`connected to ${ncos.getServer()}`);
// const jsos = await ncos.jetstream();
// const os = await jsos.views.os('results', { storage: NATS.StorageType.File });





module.exports = app;
