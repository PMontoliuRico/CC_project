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

async function executeJob(job, kv, sc, os) {
  await kv.put(`${job.user}.${job.id}`, sc.encode('Running'));
  const path = __dirname + '/job';
  shell.mkdir(path);
  shell.cd(path);
  result = shell.exec(`git clone ${job.source} .`);
  if(result.code !== 0) {
    //job can't exec bc repo
    await os.put({
      name: job.id,
    }, readableStreamFrom(sc.encode(result.stderr)));
    await kv.put(`${job.user}.${job.id}`, sc.encode('Failed'));
    shell.rm('-rf', path);
    return;
  }
  parameters = ' '
  for(i in job.parameters) {
    parameters += `${job.parameters[i]} `;
  }
  result = shell.exec(`./run.sh${parameters}`);
  if(result.code == 0) {
    console.log(`${job.user}.${job.id}`)
    //job executed succesfully
    await os.put({
      name: job.id,
    }, readableStreamFrom(sc.encode(result.stdout)));
    await kv.put(`${job.user}.${job.id}`, sc.encode('Completed')); 
  }
  else {
    //job failed
    await os.put({
      name: job.id,
    }, readableStreamFrom(sc.encode(result.stderr)));
    await kv.put(`${job.user}.${job.id}`, sc.encode('Failed'));
  }
  
  shell.rm('-rf', path);
}

async function main() {
  const natsQueueUrl = 'nats://localhost:4222';
  const ncq = await NATS.connect({ servers: [natsQueueUrl] });
  console.log(`connected to ${ncq.getServer()}`);

  const natskvUrl = 'nats://localhost:4225';
  const nckv = await NATS.connect({ servers: [natskvUrl] });
  console.log(`connected to ${nckv.getServer()}`);
  const jskv = await nckv.jetstream();
  const kv = await jskv.views.kv('jobs');
  
  const natsOsUrl = 'nats://localhost:4228';
  const ncos = await NATS.connect({ servers: [natsOsUrl] });
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
