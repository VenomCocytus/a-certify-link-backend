# A-CertifyLink - Digital Certificate Management Backend

A comprehensive TypeScript backend application for managing digital certifications for insured parties, integrating with Orass and IvoryAttestation systems.

## Features

- 🏗️ **Clean Architecture**: Well-structured, modular, and scalable codebase
- 🛡️ **Security**: JWT authentication, rate limiting, input validation
- 🌐 **i18n Support**: Multi-language support (English, French, Spanish)
- 📊 **Database**: MSSQL with Sequelize ORM
- 🔄 **External APIs**: Integration with Orass and IvoryAttestation
- 📚 **API Documentation**: Swagger/OpenAPI documentation
- ✅ **Testing**: Comprehensive unit and integration tests
- 🚨 **Error Handling**: Global exception handling with RFC 7807 compliance
- 📈 **Monitoring**: Health checks and audit logging
- 🔄 **Circuit Breaker**: Resilient external API calls
- 📄 **Pagination**: Efficient data retrieval
- 🔒 **Idempotency**: Duplicate operation prevention

## Quick Start

### Prerequisites

- Node.js 18+ 
- SQL Server or SQL Server Express
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd digital-certificate-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run db:migrate
npm run db:seed
```

5. Start development server:
```bash
npm run dev
```

### API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3000/api-docs`
- Health Check: `http://localhost:3000/api/v1/health`

## API Endpoints

### Certificates
- `POST /api/v1/certificates/create` - Create digital certificate
- `GET /api/v1/certificates/:id/status` - Check certificate status
- `PUT /api/v1/certificates/:id/cancel` - Cancel certificate
- `PUT /api/v1/certificates/:id/suspend` - Suspend certificate
- `GET /api/v1/certificates/:id/download` - Download certificate
- `GET /api/v1/certificates` - List certificates (paginated)

### Health & Monitoring
- `GET /api/v1/health` - Application health check
- `GET /api/v1/health/detailed` - Detailed health check
- `GET /api/v1/audit` - Audit logs (paginated)

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app
```

## Architecture

The application follows clean architecture principles with clear separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Data access layer
- **Models**: Database entities
- **DTOs**: Data transfer objects
- **Validators**: Input validation
- **Middlewares**: Cross-cutting concerns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.