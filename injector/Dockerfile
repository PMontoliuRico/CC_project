FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy injector code
COPY injector.py requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port on which the service will run
EXPOSE 8080

# Specify the command to run on container start
CMD ["python", "injector.py"]
