const NATS = require('nats');
const shell = require('shelljs')

async function executeJob(job, kv, sc) {
  await kv.put(`${job.user}.${job.id}`, sc.encode('Running'));
  const path = __dirname + '/job';
  shell.mkdir(path);
  shell.cd(path);
  result = shell.exec(`git clone ${job.source} .`);
  if(result.code !== 0) {
    //job can't exec bc repo
    //TODO: send to object store the error msje
    await kv.put(`${job.user}.${job.id}`, sc.encode('Failed'));
    console.log(result.stderr)
  }
  parameters = ' '
  for(i in job.parameters) {
    parameters += `${job.parameters[i]} `;
  }
  result = shell.exec(`./run.sh${parameters}`);
  if(result.code == 0) {
    console.log(`${job.user}.${job.id}`)
    //job executed succesfully
    //TODO: send the result to object store
    await kv.put(`${job.user}.${job.id}`, sc.encode('Completed')); 
    console.log(result.stdout);
  }
  else {
    //job failed
    //TODO: send to object store the error msje
    await kv.put(`${job.user}.${job.id}`, sc.encode('Failed'));
    console.log(result.stderr);
  }
  
  shell.rm('-rf', path);
}

async function main() {
  const natskvUrl = 'nats://localhost:4225';
  const natsQueueUrl = 'nats://localhost:4222';
  const ncjs = await NATS.connect({ servers: [natskvUrl] });
  console.log(`connected to ${ncjs.getServer()}`);
  const ncq = await NATS.connect({ url: natsQueueUrl });
  console.log(`connected to ${ncq.getServer()}`);
  const js = await ncjs.jetstream();
  const kv = await js.views.kv('testing', { history: 5 });
  const sc = NATS.StringCodec();

  
  groupName  = 'group1'
  const sub = ncq.subscribe('jobs_executors', {queue: groupName });
  (async () => {
    for await (const m of sub) {
      executeJob(JSON.parse(sc.decode(m.data)), kv, sc);
    }
    console.log('subscription closed');
  })();

}

main();
