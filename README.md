# Point: Local-First Productivity Toolkit

## Project Overview

Point is a privacy-focused, local-first software application designed to provide powerful productivity tools with a strong emphasis on data security and offline functionality. Built with modern web technologies, the application offers a seamless, performant experience across multiple domains.

![Application Preview](/assets/Preview.png)

## Technology Stack

- **Frontend**: Svelte 5
- **UI Library**: shadcn-svelte
- **Data Storage**: PgLite
- **Desktop Runtime**: Tauri
- **Build Tool**: Vite

## Key Features

### 1. Local-First Architecture

- **PgLite Integration**: Secure, performant local data storage
- **Offline Functionality**: Full application usability without internet connection
- **Data Privacy**: User data remains entirely on the local device

### 2. Productivity Tools

- **Morse Code Translator**: Encode and decode Morse code
- **Todo Management**: Structured task tracking with advanced filtering
- **Trip Planning**: Interactive mapping and annotation tools

## Installation

### Prerequisites

- Node.js 18+
- pnpm package manager
- Rust (for Tauri desktop build)

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/datnguyennnx/toolkits.git

# Navigate to project directory
cd toolkits

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

## Development

### Project Structure

- `src/`: Main application source code
- `src/lib/`: Shared libraries and utilities
- `src/routes/`: Application routing
- `src-tauri/`: Rust backend for desktop integration

### Running the Application

```bash
# Start development server
pnpm dev

# Build for production
pnpm build
```

## Contributing

### Reporting Issues

Encounter a bug or have a suggestion? Please open an issue on our [GitHub Issues](https://github.com/datnguyennnx/toolkits/issues) page.

### Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
