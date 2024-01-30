const NATS = require('nats');
const shell = require('shelljs')
const { ReadableStream } = require('node:stream/web');

function readableStreamFrom(data) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });
}

async function saveJob(job, state, sc, os, kv) {
  saved = false;
  while(!saved) {
    try {
      await os.put({
        name: job.id,
      }, readableStreamFrom(sc.encode(JSON.stringify(job))));
      await kv.put(`${job.user}.${job.id}`, sc.encode(state));
      saved = true;
    } catch(e) {console.log(e)}
  }
}

async function executeJob(job, kv, sc, os) {
  await kv.put(`${job.user}.${job.id}`, sc.encode('Running'));
  const path = __dirname + `/${job.id}`;
  shell.mkdir(path);
  shell.cd(path);
  result = shell.exec(`git clone ${job.source} .`);
  if(result.code !== 0) {
    //job can't exec bc repo
    job.error = result.stderr;
    await saveJob(job, 'Failed', sc, os, kv);
    shell.rm('-rf', path);
    return;
  }
  parameters = ''
  for(i in job.parameters) {
    parameters += `${job.parameters[i]} `;
  }
  start = performance.now();
  result = shell.exec(`python3 ./main.py ${parameters}`);
  end = performance.now();
  if(result.code == 0) {
    //job executed succesfully
    job.elapsedTime = (end-start)/1000;
    job.result = result.stdout;
    await saveJob(job, 'Completed', sc, os, kv);
  }
  else {
    //job failed
    job.error = result.stderr;
    await saveJob(job, 'Failed', sc, os, kv)
  }
  
  shell.rm('-rf', path);
}

async function main() {
  //le da tiempo a los jetstream de elegir lider
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const natsQueueUrls = ['nats://localhost:4222', 'nats://localhost:4223', 'nats://localhost:4224'];
  const ncq = await NATS.connect({ servers: natsQueueUrls });
  console.log(`connected to ${ncq.getServer()}`);

  const natskvUrls = ['nats://localhost:4225', 'nats://localhost:4226', 'nats://localhost:4227'];
  const nckv = await NATS.connect({ servers: natskvUrls });
  console.log(`connected to ${nckv.getServer()}`);
  const jskv = await nckv.jetstream();
  const kv = await jskv.views.kv('jobs');
  
  const natsOsUrls = ['nats://localhost:4228', 'nats://localhost:4229', 'nats://localhost:4230'];
  const ncos = await NATS.connect({ servers: natsOsUrls });
  console.log(`connected to ${ncos.getServer()}`);
  const jsos = await ncos.jetstream();
  const os = await jsos.views.os('results', { storage: NATS.StorageType.File });

  const sc = NATS.StringCodec();
  
  groupName  = 'group1'
  const sub = ncq.subscribe('jobs_executors', {queue: groupName });
  (async () => {
    for await (const m of sub) {
      executeJob(JSON.parse(sc.decode(m.data)), kv, sc, os);
    }
    console.log('subscription closed');
  })();
}

main();