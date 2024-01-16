const NATS = require('nats');
const { v4: uuidv4 } = require('uuid');

const jobExample = {
  'source': 'https://github.com/apdelsm/cc_test_1.git',
  'parameters': [1, 2],
  'user': 'user1',
};

async function createJob(job, ncq, kv, sc) {
  unique_id = false;
  while(!unique_id) {
    try {
      id = uuidv4();
      await kv.create(`${job.user}.${id}`, sc.encode('Created'));
      job.id = id;
      unique_id = true;
    } catch (e) {}
  }
  await ncq.publish('jobs_executors', sc.encode(JSON.stringify(job)));
  await kv.put(`${job.user}.${job.id}`, sc.encode('Queued'));
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

  groupName  = 'infromers';
  const newJobs = ncq.subscribe('new_jobs', {queue: groupName });

  //new jobs
  (async () => {
    for await (const m of newJobs) {
      createJob(JSON.parse(sc.decode(m.data)), ncq, kv, sc);
    }
    console.log('subscription closed');
  })();

  ncq.publish('new_jobs', sc.encode(JSON.stringify(jobExample)));
    
  }

  main();