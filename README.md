# Gate Entry System

A full-stack property gate entry management system designed to manage visitors, properties, gates, hosts, and access permissions.

The project is currently under active development.

## Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

### Frontend

- React
- TypeScript

### Authentication

- JWT-based authentication
- HTTP-only cookies

## Project Structure

```text
gate-entry-system/
├── apps/
│   ├── api/        # Backend API
│   └── web/        # Frontend application
│
├── docs/            # Project documentation
└── README.md
```

## Current Features

- User authentication
- JWT-based authorization
- Property-based access control
- Property roles and permissions
- Visitor entry management
- Gate management
- Host and visitor association
- API versioning

More features are currently being developed.

## Development

Clone the repository:

```bash
git clone <repository-url>
cd gate-entry-system
```

Install dependencies:

```bash
npm install
```

Create your environment configuration based on the provided `.env.example` file.

Start the development environment:

```bash
npm run dev
```

> Development commands and setup instructions will be expanded as the project evolves.

## Project Status

🚧 **Under active development**

This project is being developed as a production-oriented full-stack application while exploring backend architecture, authentication, authorization, database design, testing, and deployment.

## License

MIT
