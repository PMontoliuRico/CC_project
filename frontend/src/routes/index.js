const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
const NATS = require('nats');

const { v4: uuidv4 } = require('uuid');
const sc = NATS.StringCodec();

const session = require('express-session');
const crypto = require('crypto');

const {
  ReadableStream,
} = require('node:stream/web');


global.kv;
global.ncq;
global.os;

// Generate a 64-byte random string
const secret = crypto.randomBytes(64).toString('hex');
router.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Note: secure should be set to true when in production and using HTTPS
}));
console.log(secret);


// Route that requires authentication and validates the access token
const express = require('express');
const e = require('express');
//const app = express();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false} // Note: secure should be set to true when in production and using HTTPS
}));

async function connections() {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const natsQueueUrls = ['nats://natsq-0:4222', 'nats://natsq-1:4223', 'nats://natsq-2:4224'];
  global.ncq = await NATS.connect({ servers: natsQueueUrls });
  console.log(`connected to ${global.ncq.getServer()}`);
 
  const natskvUrls = ['nats://natskv-0:4225', 'nats://natskv-1:4226', 'nats://natskv-2:4227'];
  const nckv = await NATS.connect({ servers: natskvUrls });
  console.log(`connected to ${nckv.getServer()}`);
  const jskv = await nckv.jetstream();
  global.kv = await jskv.views.kv('jobs');
 
  const natsOsUrls = ['nats://natsos-0:4228', 'nats://natsos-1:4229', 'nats://natsos-2:4230'];
  const ncos = await NATS.connect({ servers: natsOsUrls });
  console.log(`connected to ${ncos.getServer()}`);
  const jsos = await ncos.jetstream();
  global.os = await jsos.views.os('results', { storage: NATS.StorageType.File });
}
connections().catch(err => console.error(err));

async function fromReadableStream(rs, sc) {
  result = ""
  const reader = rs.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value && value.length) {
      result += sc.decode(value);
    }
  }
  return result;
}
 
module.exports = router;
router.get('/', async (req, res) => {
  const user = req.get('x-forwarded-user');
  const email = req.get('x-forwarded-email');
  req.session.user = user;
  req.session.save(err => { console.log(err) });
  console.log(user);  
  if(!user){
    console.log("no authorized")
    res.status(401).send('Not authorized');
  }
  else{
    const userExists = await global.kv.get(user);
    
    if (!userExists) {
     await global.kv.create(user, sc.encode('Basic User'));
  }

  res.send(`User: ${user}, Email: ${email}`);
  }
});

router.post('/sendjob', async (req, res) => {
  try {
    const inputUser = req.get('x-forwarded-user');
    // comprobar si ese user está en el kv
    console.log(inputUser);
    const id = uuidv4();
    const body = req.body;
    const parameters = body.parameters;
    const source = body.source;
    const user = inputUser;
    const job = { user: user, id: id, parameters: parameters, source: source}; 
    const userExists = await global.kv.get(inputUser);
    console.log('userExists:', userExists);
    if (userExists) {

        await global.kv.create(`${job.user}.${job.id}`, sc.encode('Created'));
        

        await global.kv.put(`${job.user}.${job.id}`, sc.encode('Queued'));

        if (!global.ncq) {
          console.error('NATS connection not established');
          res.status(500).send('Internal server error');
          return;
        }
        await global.ncq.publish('jobs_executors', sc.encode(JSON.stringify(job)));
      res.status(200).send({ message: 'Job created successfully', jobId: id, user: user/*, email: email*/});
    }
    else{
      res.status(401).send('Not authorized');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred');
  }

});

router.post('/getajobstate', async (req, res) => {
  const inputUser = req.get('x-forwarded-user');
  try {

    const id = req.body.jobId; // Get the id from the request body
    const user = inputUser;
    const job = { user: user, id: id}; 
    const userExists = await global.kv.get(inputUser);
    console.log('userExists:', userExists);
    if (userExists) {
    let e = await global.kv.get(`${job.user}.${job.id}`);
    console.log(`value for get ${sc.decode(e.value)}`);
    res.status(200).send('Job state: ' + sc.decode(e.value));
    }
    else{
      res.status(401).send('Not authorized');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred');
  }
});


router.get('/getalljobsfromuser', async (req, res) => {  
  try {
    const user = req.get('x-forwarded-user');
    // Get all keys that match the user's name followed by a dot
    const keysIterator = await global.kv.keys(`${user}.*`);

    if(user) {
      const keys = [];
      for await (const key of keysIterator) {
        keys.push(key);
      }
      const jobs = await Promise.all(keys.map(async key => {
        const entry = await global.kv.get(key);
        const jobId = key.split('.')[1];
        return { key, jobId, value: sc.decode(entry.value) };
      }));

      res.status(200).send(jobs);
    }
    else{
      res.status(401).send('Not authorized');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred');
  }
});

router.post('/getjobresult', async (req, res) => {  
  try {
    const user = req.get('x-forwarded-user');
    const jobId = req.body.jobId;
    const userExists = await global.kv.get(user);
    if (userExists) {
      console.log(jobId);
      let e = await global.os.get(jobId);
      console.log(e);
      result = await fromReadableStream(e.data, sc);
      res.status(200).send(JSON.parse(result));
    }
    else{
      res.status(401).send('Not authorized');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred');
  }
});


module.exports = router;
