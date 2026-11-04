// One-time provisioning helper. Pipe to a trusted secret store; never commit its output.
const {createECDH,randomBytes} = require('node:crypto');
const pair=createECDH('prime256v1');pair.generateKeys();
process.stdout.write(JSON.stringify({publicKey:pair.getPublicKey().toString('base64url'),privateKey:pair.getPrivateKey().toString('base64url'),dispatchSecret:randomBytes(32).toString('hex')}));
