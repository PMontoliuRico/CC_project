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
  result = shell.exec(`git clone ${job.source} .`);
  if(result.code !== 0) {
    //job can't exec bc repo
    //TODO: send to KV that it state is failed
    //TODO: send to object store the error msje
    console.log(result.stderr)
  }
  parameters = " "
  for(i in job.parameters) {
    parameters += `${job.parameters[i]} `;
  }
  result = shell.exec(`./run.sh${parameters}`);
  if(result.code == 0) {
    //job executed succesfully
    //TODO: send to KV that it state is completed
    //TODO: send the result to object store 
    console.log(result.stdout);
  }
  else {
    //job failed
    //TODO: send to KV that it state is failed
    //TODO: send to object store the error msje
    console.log(result.stderr);
  }
  
  shell.rm('-rf', path);
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
