# Development Guidelines and Technical Documentation

## Project Setup

### Prerequisites

- Node.js 20+
- pnpm package manager
- Rust (for Tauri)
- Pglite for local data persistence

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ideatools.git

# Install dependencies
pnpm install

# Run development server
pnpm dev

```

## Code Organization

### Directory Structure

- `src/`: Main application source code
- `src/lib/`: Shared libraries and utilities
- `src/routes/`: Page routing
- `src-tauri/`: Rust backend for Tauri
- `src/lib/components/`: Reusable UI components

### Module Development

Each feature module follows a consistent structure:

- `components/`: Svelte components
- `utils/`: Utility functions
- `constants/`: Constant values and enums
- `services/`: External service integrations

## Database Management

### PgLite Integration

- Uses local PgLite database via `src/lib/database/`
- Migrations managed in `src/lib/database/migrate/`
- Type-safe database interactions with PgLite

## Performance Considerations

- Lazy loading of modules
- Minimal external dependencies
- Efficient state management with Svelte stores
- Responsive design principles
- Lightweight PgLite for local data storage

## Contribution Guidelines

1. Follow existing code style
2. Write comprehensive tests
3. Update documentation
4. Use meaningful commit messages
5. Create pull requests with clear descriptions
6. Ensure PgLite database schema compatibility

## PgLite Specific Considerations

- Use type-safe migrations
- Implement proper connection management
- Handle database versioning
- Optimize queries for local storage performance
