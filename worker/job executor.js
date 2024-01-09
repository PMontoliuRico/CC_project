const NATS = require('nats');

async function main() {
  const natsUrl = 'nats://localhost:4222';

  const nc = await NATS.connect({ url: natsUrl });
  console.log(`connected to ${nc.getServer()}`);
  const sc = NATS.StringCodec();
  groupName  = "group1"
  const sub = nc.subscribe("jobs_executors", {queue: groupName });
  (async () => {
    for await (const m of sub) {
      console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
    }
    console.log("subscription closed");
  })();

  nc.publish("jobs_executors", sc.encode("world"));
  nc.publish("jobs_executors", sc.encode({"again":1}));
}

main();
