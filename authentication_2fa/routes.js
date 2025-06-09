import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

const userSecrets = new Map(); // temporary

async function routes(fastify, options) {
	//Root path
  fastify.get('/', async (request, reply) => {
	reply.type('text/html').send('<h1>Hello, World!</h1>\n');
  });

  //API endpoint
  fastify.get('/2fa/api', async (request, reply) => {
	reply.type('application/json').send({ message: 'Hello, API!' });
  });

  // Generate TOTP secret and QR code endpoint
  fastify.post('/generate', async (request, reply) => {
	const { email } = request.body;

	if (!email) {
	  return reply.status(400).send({ error: 'Email is required' });
	}

	const totp = new OTPAuth.TOTP({
	  issuer: 'Transendence',
	  label: email,
	  algorithm: 'SHA1',
	  digits: 6,
	  period: 30,
	});

	const secret = totp.secret.base32;
	const otpauthUrl = totp.toString();

	userSecrets.set(email, secret);

	try {
	  const qrCode = await QRCode.toDataURL(otpauthUrl);
	  return reply.status(200).send({ qrCode, secret });
	}
	catch (error) {
	  fastify.log.error(error);
	  return reply.status(500).send({ error: 'Failed to generate QR code' });
	}
  });

  // Verify TOTP token endpoint
  fastify.post('/verify', async (request, reply) => {
	const { email, token } = request.body;
	if (!email || !token) {
	  return reply.status(400).send({ error: 'Email and token are required' });
	}
	const secret = userSecrets.get(email);
	if (!secret) {
	  return reply.status(400).send({ error: 'No secret found for this email' });
	}
	const totp = new OTPAuth.TOTP({
	  issuer: 'Transendence',
	  label: email,
	  algorithm: 'SHA1',
	  digits: 6,
	  period: 30,
	  secret: OTPAuth.Secret.fromBase32(secret),
	});

	const isValid = totp.validate({ token, window: 1 }) !== null;
	const response = {
	  valid: isValid,
	  message: isValid ? 'Token is valid' : 'Token is invalid',
	};
	return reply.status(200).send(response);
  });
}

export default routes;
