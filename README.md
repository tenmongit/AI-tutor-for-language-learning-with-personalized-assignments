# AI Language Tutor

A comprehensive web application for learning languages with AI-powered exercises, personalized assignments, and detailed progress tracking. The platform offers an interactive learning experience with difficulty-based lessons and real-time feedback.

## Project Structure

This project consists of two main parts:

- **Client**: React frontend built with Vite and Tailwind CSS
- **Server**: Node.js/TypeScript backend with Express and SQLite

## Features

- **User Authentication**: Secure register, login, and logout functionality with JWT
- **Multiple Language Support**: Learn various languages with tailored content
- **Progressive Lesson Structure**: Organized by difficulty levels (Beginner, Intermediate, Advanced)
- **Interactive Exercises**: Various types including translation, multiple choice, and fill-in-the-blank
- **AI-Powered Learning**: Intelligent explanations and feedback for exercises
- **Comprehensive Progress Tracking**: Detailed metrics on completed lessons and performance
- **Lesson Completion System**: Track completed lessons with timestamps and performance metrics
- **Badge System**: Visual indicators for lesson difficulty levels
- **Modern Dashboard**: User-friendly interface showing progress and recommended lessons
- **Chat with AI**: Direct interaction with AI for language learning assistance

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/ai-language-tutor.git
cd ai-language-tutor
```

2. Install dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### Environment Setup

1. Create `.env` file in the server directory with the following variables:
```
PORT=5000
JWT_SECRET=your_secret_key_here
DATABASE_PATH=./data/database.sqlite
```

2. Create `.env` file in the client directory:
```
VITE_APP_API_URL=http://localhost:5000/api
```

### Running the Application

#### Development Mode

From the root directory:

```bash
# Start the server
cd server && npm run dev

# In a separate terminal, start the client
cd client && npm run dev
```

This will start both the client and server in development mode.

- Client: http://localhost:5173 (Vite default)
- Server: http://localhost:5000

#### Production Build

```bash
# Build the client
cd client && npm run build

# Build the server
cd ../server && npm run build

# Start the production server
cd ../server && npm start
```

## Technologies Used

### Frontend
- **React 19**: Modern UI library for building interactive interfaces
- **Vite**: Next-generation frontend tooling for faster development
- **React Router v6**: For client-side routing
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: Promise-based HTTP client for API requests
- **Headless UI & Heroicons**: For accessible UI components and icons

### Backend
- **Node.js**: JavaScript runtime for server-side code
- **Express**: Web framework for Node.js
- **TypeScript**: Typed superset of JavaScript for better code quality
- **SQLite**: Lightweight, file-based relational database
- **JWT (JSON Web Tokens)**: For secure authentication
- **bcrypt**: For password hashing

### Development Tools
- **ESLint**: For code linting
- **ts-node-dev**: For TypeScript development with hot reloading
- **Nodemon**: For automatic server restarts during development
