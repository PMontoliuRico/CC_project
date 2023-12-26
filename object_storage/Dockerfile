FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy object storage code
COPY object_storage.py requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port on which the service will run
EXPOSE 8585

# Specify the command to run on container start
CMD ["python", "object_storage.py"]
