# Point: Local-First Productivity Toolkit

## Project Overview

Point is a privacy-focused, local-first software application designed to provide powerful productivity tools with a strong emphasis on data security and offline functionality. Built with modern web technologies, the application offers a seamless, performant experience across multiple domains.

![Application Preview](/assets/Preview.png)

## Technology Stack

- **Frontend**: Svelte 5
- **UI Library**: shadcn-svelte
- **Data Storage**: Pglite
- **Desktop Runtime**: Tauri
- **Build Tool**: Vite

## Philosophy

### 1. Local-First Architecture

- **PgLite Integration**: Secure, performant local data storage
- **Offline Functionality**: Full application usability without internet connection
- **Data Privacy**: User data remains entirely on the local device

### 2. Small Tools

- **Morse Code Translator**: Encode and decode Morse code
- **Todo Management**: Structured task tracking with advanced filtering
- **Trip Planning**: Interactive mapping and annotation tools

Local-first software is an approach that prioritizes storing data on users' local devices, enhancing privacy, security, and offline accessibility. This model ensures users maintain control over their data while still enabling seamless collaboration and synchronization across multiple devices. For a comprehensive exploration of this concept, you can refer to the article ["Local-first software: You own your data, in spite of the cloud" by Ink & Switch](https://www.inkandswitch.com/local-first/).

## Contribute

### Prerequisites

- Node.js 20+
- pnpm package manager
- Rust (for Tauri desktop build) following [this documents](https://v2.tauri.app/start/prerequisites/)

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/datnguyennnx/point.git

# Navigate to project directory
cd point

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Running the Application

```bash
# Start development server
pnpm dev

# Start desktop app
pnpm tauri

# Build for production
pnpm build
```

### Reporting Issues

Encounter a bug or have a suggestion? Please open an issue on our [GitHub Issues](https://github.com/datnguyennnx/toolkits/issues) page.

### Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
