---
module-name: 'IdeatoolsApp'
description: 'A multi-feature Svelte desktop application with Tauri integration, offering tools for morse code, todo management, and trip planning'
related-modules:
  - name: Morse Code Module
    path: ./src/lib/app/morse
  - name: Todo Management Module
    path: ./src/lib/app/todos
  - name: Trip Planning Module
    path: ./src/lib/app/trip
architecture:
  style: 'Modular Monolith with Micro-Frontends'
  components:
    - name: 'Morse Code App'
      description: 'Encoder and decoder for Morse code translations'
    - name: 'Todo Management App'
      description: 'Task tracking and management system'
    - name: 'Trip Planning App'
      description: 'Interactive trip planning and mapping tool'
  patterns:
    - name: 'Component-Based Architecture'
      usage: 'Svelte components with clear separation of concerns'
    - name: 'Utility-First Design'
      usage: 'Leveraging utility functions and shared components across modules'
---

# IdeatoolsApp Project Overview

## Project Structure

The application is a multi-feature desktop tool built with:

- Svelte for frontend
- Tauri for desktop application packaging
- TypeScript for type safety
- Shadcn-Svelte UI component library
- Vite as build tool
- Pglite for local data persistence

## Key Features

1. **Morse Code Translator**

   - Encode text to Morse code
   - Decode Morse code to text
   - Supports international Morse code standards

2. **Todo Management**

   - Create, edit, and track tasks
   - Local storage with PgLite
   - Task filtering and management

3. **Trip Planning**
   - Interactive map integration
   - Location mentions and annotations
   - Geocoding services

## Technical Highlights

- Modular architecture allowing easy feature addition
- Cross-platform desktop application
- Responsive UI with utility-first design
- Type-safe implementation with TypeScript
- Local-first data storage

## Development Philosophy

- Prioritize code readability
- Maintain clear separation of concerns
- Leverage modern web technologies
- Focus on user experience and performance
