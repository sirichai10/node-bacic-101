# Jenkins Docker Compose Setup

A simple, robust Docker Compose setup to run Jenkins LTS locally.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) installed and running.
- Docker Compose installed (comes bundled with Docker Desktop).

## Getting Started

1. **Navigate to this directory**:
   ```bash
   cd pipeline/jenskins
   ```

2. **Start the Jenkins service in detached mode**:
   ```bash
   docker compose up -d
   ```

3. **Access the Jenkins Web UI**:
   Open your browser and go to:
   - **URL**: [http://localhost:8080](http://localhost:8080)

4. **Retrieve the Initial Admin Password**:
   Run the following command to retrieve the temporary password required to unlock Jenkins:
   ```bash
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```

## Managing Jenkins

- **To view logs in real-time**:
  ```bash
  docker compose logs -f
  ```

- **To stop the Jenkins container**:
  ```bash
  docker compose down
  ```

- **To stop Jenkins and remove its volumes (WARNING: deletes all data)**:
  ```bash
  docker compose down -v
  ```
