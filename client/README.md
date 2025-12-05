# LakeRAG Frontend

A modern Next.js 14 frontend application for the LakeRAG document processing and retrieval system.

## Features

- **Semantic Search**: Search through documents using natural language queries powered by AI embeddings
- **Document Summarization**: Generate AI-powered summaries from documents
- **File Upload**: Upload documents to S3 with drag-and-drop interface
- **File Management**: View, manage, and delete documents from S3

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Lucide React icons
- **API Client**: Axios
- **AWS SDK**: @aws-sdk/client-s3

## Setup

1. **Install dependencies**:
   ```bash
   cd client
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   S3_BUCKET_NAME=your_bucket_name
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
client/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Home page
│   ├── search/              # Semantic search page
│   ├── summarize/           # Document summarization page
│   ├── upload/              # File upload page
│   ├── files/               # File management page
│   └── api/                 # API routes
│       └── s3/              # S3 operations (list, upload, delete)
├── components/              # React components
│   ├── Navbar.tsx           # Navigation bar
│   ├── SearchBar.tsx        # Search interface
│   ├── SummarizeForm.tsx    # Summarization form
│   ├── FileUploader.tsx     # File upload component
│   └── FileManager.tsx      # File management interface
├── lib/                     # Utilities
│   └── api.ts               # API client functions
└── types/                   # TypeScript types
    └── index.ts             # Type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend connects to the FastAPI backend at `NEXT_PUBLIC_BACKEND_URL` for:
- `/search/` - Semantic search
- `/summarize/` - Document summarization

S3 operations are handled through Next.js API routes to avoid CORS issues and keep AWS credentials secure.

## Pages

### Home (`/`)
Landing page with feature overview and quick navigation

### Search (`/search`)
Semantic search interface with configurable result count

### Summarize (`/summarize`)
Generate summaries by query or document ID

### Upload (`/upload`)
Drag-and-drop file upload to S3

### Files (`/files`)
View and manage all documents in S3

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | Yes |
| `AWS_REGION` | AWS region for S3 | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes |
| `S3_BUCKET_NAME` | S3 bucket name | Yes |

## Development Notes

- All S3 operations are server-side through Next.js API routes
- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- AWS credentials are kept server-side only
- The app uses React Server Components where possible for better performance
