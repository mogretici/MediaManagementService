# Media Management Service

This project is a backend service for a media management application that allows users to upload and manage their media
files such as images and videos. The service handles file uploads, stores metadata, and is deployed to AWS ECS to ensure
scalability and reliability.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Running the Service Locally](#running-the-service-locally)
- [Dockerization](#dockerization)
- [Deployment to AWS ECS](#deployment-to-aws-ecs)
- [Swagger Information](#swagger-information)

## Features

- **File Upload**: Users can upload media files (images, videos) to an AWS S3 bucket.
- **Metadata Storage**: Stores metadata (file name, upload timestamp, file type, size) in a DynamoDB table.
- **Scalable Deployment**: The service is containerized using Docker and deployed to AWS ECS.

## Technologies Used

- **Nest.js**: Backend framework used to build the service.
- **Docker**: Containerization platform.
- **Swagger**: API documentation tool.
- **AWS S3**: Storage service for uploaded media files.
- **AWS ECR**: Container registry used for storing Docker images.
- **AWS ECS**: Container orchestration service used for deployment.
- **AWS DynamoDB**: NoSQL database for storing file metadata.
- **AWS Pipeline**: CI/CD service used for automating deployments.
- **AWS CodeBuild**: Build service used for building the Docker image.
- **AWS CodeDeploy**: Deployment service used for deploying the Docker image to ECS.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher)
- **npm** (v6 or higher)
- **AWS CLI** (configured with the necessary permissions)
- **Docker** (for containerization)

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mogretici/MediaManagementService.git
   cd media-management-service
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables:

```plaintext
APP_PORT= your_app_port
APP_LOGGER_LEVEL= your_app_logger_level
NODE_ENV= your_node_env
S3_BUCKET_NAME= your_s3_bucket_name
S3_ACCESS_KEY_ID= your_aws_access_key_id
S3_SECRET_ACCESS_KEY= your_aws_secret_access_key
S3_REGION= your_aws_region
S3_SIGN_EXPIRES= your_s3_sign_expires
SWAGGER_PASSWORD= your_swagger_password
```

## Running the Service Locally

To run the service locally, use the following command:

```bash
npm run start:dev
```

The service will be available at `http://localhost:APP_PORT`.

## Dockerization

To build and run the Docker container locally:

1. **Build the Docker image**:
   ```bash
   docker build -t media-management-service .
   ```

2. **Run the Docker container**:
   ```bash
   docker run -p 3001:3001 --env-file .env media-management-service
   ```

## Swagger Information

The service provides an interactive API documentation using Swagger, which allows you to explore and test the available
endpoints.

### Accessing Swagger Documentation

To access the Swagger documentation:

1. **Run the Service**: Ensure the service is running locally or on your server.

2. **Navigate to Swagger UI**: Open your web browser and go to:

   ```
   http://localhost:APP_PORT/swagger
   ```

   Replace `APP_PORT` with the actual port number where your service is running.

### Authentication

Swagger UI is secured with password protection to ensure that only authorized users can access the API documentation.
Upon visiting the Swagger UI, you will be prompted to enter a password.

- **Username**: `admin`
- **Password**: The password required to access the Swagger documentation is set in the `.env` file under the
  variable `SWAGGER_PASSWORD`.

This setup ensures that only users with the correct credentials can view and interact with the API documentation, adding
a layer of security to your service.

## Deployment to AWS ECS

To deploy the service to AWS ECS:

1. **Create an ECS Cluster**:
   Follow the AWS documentation to create a new ECS cluster.

2. **Create a Task Definition**:
   Define a new task with your Docker image and the necessary environment variables.

3. **Deploy the Service**:
   Deploy the task to your ECS cluster and expose it via a load balancer or public IP.

4. **Verify Deployment**:
   Ensure the service is running and accessible from the public DNS or IP.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.