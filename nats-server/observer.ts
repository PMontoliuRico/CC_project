import { connect, Payload, Subscription } from 'ts-nats';

async function messageHandler(msg: Payload, subject: string, subscription: Subscription): Promise<void> {
  const data = msg.data ? msg.data.toString() : '';
  console.log(`Recibido mensaje en '${subject}': ${data}`);
}

async function observeQueue(): Promise<void> {
  const nc = await connect({ servers: ['nats://localhost:4222'] });

  const subscription = await nc.subscribe('observer', { callback: messageHandler });

  console.log('Observador esperando mensajes. Presiona CTRL+C para salir.');

  process.on('SIGINT', async () => {
    console.log('Desconectando...');
    await subscription.unsubscribe();
    await nc.close();
    process.exit();
  });
}

observeQueue().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
