const nats = require('nats');

async function conectarNATS() {
    // Retornar la conexión NATS directamente
    return nats.connect({ url: 'nats://127.0.0.1:4222' });
}

async function run() {
    try {
        // Conectar de manera asíncrona
        const nc = await conectarNATS();

        // Verificar si la conexión se ha establecido correctamente
        if (nc) {
            console.log("Connected to nats server");

            // Enviar mensajes tipo pub
            setInterval(() => {
                const mensaje = 'Hola, mundo!';
                nc.publish('mi_canal', mensaje);
                console.log(`Mensaje enviado: ${mensaje}`);
            }, 1000);
        } else {
            console.error('No se pudo conectar a NATS');
        }

        // Cerrar la conexión cuando hayas terminado
        // nc.close();

    } catch (error) {
        console.error(`Error en la ejecución: ${error}`);
    }
}

// Ejecutar la función principal
run();
