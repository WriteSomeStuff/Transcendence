import Fastify from 'fastify'
import fastifyStatic from '@fastify/static';
import path from 'path';
// import { fileURLToPath } from 'url';

const fastify = Fastify({
    // logger: true
});

// Register the static file plugin
fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    // prefix: '/public/', // optional: default '/'
});

// Serve the index.html file
fastify.get('/', async (request, reply) => {
    try {
        return reply.sendFile('index.html');
    } catch (err) {
        console.error('Error serving index.html:', err);
        reply.code(500).send('Internal Server Error');
    }
});

// Start the server
fastify.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error('Error starting server:', err);
        process.exit(1); // Exit the process on error
    }
    console.log(`bappity boopity Server listening on ${address}`);
});
