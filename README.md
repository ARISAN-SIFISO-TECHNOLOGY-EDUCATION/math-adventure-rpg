# Math Monsters

A gamified, AdaptedMind-style math learning app powered by React, Tailwind CSS, and Anthropic's Claude AI.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

You will also need an **Anthropic API Key** to generate the dynamic math questions.

## Local Setup Instructions

Follow these steps to get the project up and running locally:

### 1. Clone the repository
Clone this project to your local machine and navigate into the directory.

### 2. Install dependencies
Run the following command to install all required packages:
\`\`\`bash
npm install
\`\`\`

### 3. Set up environment variables
The app requires environment variables to function correctly. 
1. Copy the example environment file to create your own local `.env` file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
2. Open the newly created `.env` file in your code editor.
3. Add your Anthropic API key:
   \`\`\`env
   ANTHROPIC_API_KEY="your-actual-api-key-here"
   \`\`\`

### 4. Start the development server
Start the full-stack development server (which runs both the Express backend and the Vite frontend):
\`\`\`bash
npm run dev
\`\`\`

### 5. Open the app
Once the server starts, open your browser and navigate to:
\`\`\`
http://localhost:3000
\`\`\`

## Available Scripts

- \`npm run dev\`: Starts the development server using \`tsx\`.
- \`npm run build\`: Builds the app for production.
- \`npm start\`: Starts the production server (run \`npm run build\` first).
- \`npm run lint\`: Runs TypeScript type checking.
