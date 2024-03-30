# Tria Backend

A NestJS Backend of Employee Hierarchy.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Requirements

- [Docker](https://docs.docker.com/desktop/install/windows-install/)
- [Node.js](https://nodejs.org/dist/v20.12.0/node-v20.12.0-x64.msi)

### Installing

1. First clone the repository

```bash
   git clone https://github.com/abdulmunimjemal/triaplc-employee.git

   cd triaplc-employee
```

2. Install the dependencies (If you are not using docker)
   If you don't have yarn, you can install it by running `npm install -g yarn`

```bash
  yarn install
  yarn start:dev (for development)
```

3. Make sure you have docker installed on your machine.  
   If you don't have docker, you can install it by following the instructions [here](https://docs.docker.com/desktop/install/windows-install/)

```bash
    docker-compose up
```

and you are good to go.

## API Endpoints

- `GET /employees` - Get all employees
- `GET /employees/:id` - Get an employee by id
- `POST /employees` - Create an employee
  - Request Body
    ```json
    {
      "name": "CEO",
      "reportsTo": null
    }
    ```
- `PATCH /employees/:id` - Update an employee
- **Important** `GET /employees/:id/subordinates` - Get all subordinates of an employee and return a tree of it
- `DELETE /employees/:id` - Delete an employee

Notiice: The first employee should have `reportTo` as `null`, and the rest should have the `reportTo` as the id of the employee they report to.

## Authors

- **Abdulmunim Jundurahman**
