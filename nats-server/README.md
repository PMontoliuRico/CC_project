# Construye la imagen utilizando el Dockerfile en el directorio actual
docker build -t nats-container .

# Ejecuta el contenedor exponiendo el puerto 4222
docker run -p 4222:4222 nats-container

# Puedes verificar que el servidor NATS está en ejecución utilizando herramientas como telnet o un cliente NATS. Por ejemplo, usando telnet
telnet localhost 4222
