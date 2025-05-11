# AI Language Tutor

A web application for learning languages with AI-powered exercises and explanations.

## Project Structure

This project consists of two main parts:

- **Client**: React frontend built with Vite
- **Server**: Node.js backend with Express and SQLite

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
npm install
cd client && npm install
cd ../server && npm install
```

### Running the Application

#### Development Mode

From the root directory:

```bash
npm run dev
```

This will start both the client and server in development mode.

- Client: http://localhost:3000
- Server: http://localhost:5000

#### Production Build

```bash
cd client && npm run build
cd ../server && npm run build
```

Then to start the production server:

```bash
cd server && npm start
```

## Features

- User authentication (register, login, logout)
- Multiple language selection
- Progressive lesson structure
- Various exercise types (translation, multiple choice)
- AI-powered explanations for exercises
- Progress tracking

## Technologies Used

- **Frontend**: React, React Router, Tailwind CSS, Axios
- **Backend**: Node.js, Express, SQLite
- **Authentication**: JWT
