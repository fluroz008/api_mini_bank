#!/bin/bash

# Load environment variables from .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found."
  exit 1
fi

echo "Environment variables loaded."

# Helper script to check connection and create database
DB_CHECK_SCRIPT="
const mysql = require('mysql2/promise');

async function checkAndCreate() {
  const config = {
    host: '$DB_HOST',
    port: $DB_PORT,
    user: '$DB_USER',
    password: '$DB_PASSWORD',
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('Database connection successful.');
    
    await connection.query(\`CREATE DATABASE IF NOT EXISTS \` + '$DB_DATABASE');
    console.log(\`Database '$DB_DATABASE' checked/created.\`);
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

checkAndCreate();
"

# Execute the node script
node -e "$DB_CHECK_SCRIPT"
DB_STATUS=$?

if [ $DB_STATUS -ne 0 ]; then
  echo "Aborting setup due to database connection failure."
  exit 1
fi

# Generate App Key
echo "Generating app key..."
node ace generate:key

# Run Migrations and Seed
echo "Running fresh migrations and seeding..."
node ace migration:fresh --seed

echo "Database setup completed successfully."
