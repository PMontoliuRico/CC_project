const NATS = require('nats');
const shell = require('shelljs')

const jobExample = {
  "source": "https://github.com/apdelsm/cc_test_1.git",
  "parameters": [1, 2]
};

async function executeJob(job) {
  const path = __dirname + "/job";
  shell.mkdir(path);
  shell.cd(path);
  shell.exec(`git clone ${job.source} .`);
  //shell.rm('-rf', path);
}

async function main() {
  const natsUrl = 'nats://localhost:4222';

  const nc = await NATS.connect({ url: natsUrl });
  console.log(`connected to ${nc.getServer()}`);
  const sc = NATS.StringCodec();
  groupName  = "group1"
  const sub = nc.subscribe("jobs_executors", {queue: groupName });
  (async () => {
    for await (const m of sub) {
      executeJob(JSON.parse(sc.decode(m.data)));
    }
    console.log("subscription closed");
  })();

  nc.publish("jobs_executors", sc.encode(JSON.stringify(jobExample)));
}

main();
