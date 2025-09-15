# Overview

This is a full-stack AI-powered coding assistant and chat application built with React frontend and Express.js backend. The application provides real-time chat capabilities with the Claude Sonnet 4 AI model, code analysis tools, file upload functionality, and project management features. It's designed as an interactive development environment where users can chat with AI assistants, upload code files for analysis, and manage coding projects with real-time collaboration features.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and data fetching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting dark mode
- **Real-time Communication**: WebSocket integration for live chat functionality
- **Code Editing**: Custom code editor component with syntax highlighting and file management

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless database provider
- **Session Management**: Express sessions with PostgreSQL session store
- **Real-time Features**: WebSocket server for chat functionality
- **File Processing**: Multer for handling file uploads with memory storage
- **API Design**: RESTful API with real-time WebSocket endpoints

## Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon serverless platform
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Session Storage**: PostgreSQL-backed session storage using connect-pg-simple
- **File Storage**: In-memory processing for uploaded files with code analysis capabilities
- **Data Models**: Users, conversations, messages, code projects, and code analysis entities

## Authentication and Authorization
- **Session-based Authentication**: Express sessions with secure cookie configuration
- **User Management**: User registration and login with password-based authentication
- **Authorization**: Session-based access control for API endpoints and WebSocket connections

## External Dependencies
 codex/remove-openai-package-and-references
  - **AI Services**:
    - Anthropic Claude API integration (Claude Sonnet 4 as default
- **Database**: Neon PostgreSQL serverless database
- **Development Tools**: 
  - Replit-specific development plugins for enhanced development experience
  - TypeScript for type safety across the entire stack
- **Build and Deployment**:
  - Vite for frontend bundling and development server
  - ESBuild for backend compilation
  - PostCSS with Autoprefixer for CSS processing
