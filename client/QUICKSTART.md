# LakeRAG Frontend - Quick Start Guide

## 🚀 Complete Setup Instructions

### Prerequisites
- Node.js 20+ installed
- npm or yarn
- AWS account with S3 access
- Backend API running (FastAPI)

### Step 1: Install Dependencies

```bash
cd client
npm install
```

### Step 2: Configure Environment

Create a `.env.local` file (or modify the existing `.env`):

```bash
cp .env.local.example .env.local
```

Update with your actual credentials:

```env
# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_access_key
AWS_SECRET_ACCESS_KEY=your_actual_secret_key
S3_BUCKET_NAME=your_actual_bucket_name
BUCKET_NAME=your_actual_bucket_name
```

### Step 3: Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Local**: http://localhost:3000
- **Network**: http://YOUR_IP:3000

### Step 4: Access the Application

Open your browser and navigate to http://localhost:3000

## 📱 Application Features

### 1. **Home Page** (`/`)
- Overview of all features
- Quick navigation links
- Technology highlights

### 2. **Search** (`/search`)
- Enter natural language queries
- Adjust number of results (k parameter)
- View ranked results with scores
- See document IDs and chunk indices

### 3. **Summarize** (`/summarize`)
- Option 1: Search by query to find and summarize documents
- Option 2: Summarize specific document by ID
- Adjust number of chunks to consider
- View generated summaries

### 4. **Upload** (`/upload`)
- Drag and drop files
- Or click to browse
- Files uploaded directly to S3 `raw/` folder
- Supports various document formats

### 5. **Files** (`/files`)
- View all files in S3 bucket
- See file sizes and last modified dates
- Delete files with confirmation
- Refresh to see latest changes

## 🔧 Troubleshooting

### Backend Connection Issues
If search/summarize features don't work:
1. Verify backend is running: `curl http://localhost:8000`
2. Check `NEXT_PUBLIC_BACKEND_URL` in `.env`
3. Ensure CORS is configured in backend

### S3 Connection Issues
If upload/file management doesn't work:
1. Verify AWS credentials in `.env`
2. Check S3 bucket exists and is accessible
3. Verify IAM permissions for S3 operations
4. Check AWS region is correct

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## 🏗️ Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm run start
```

## 📊 API Integration

### Backend Endpoints Used
- `POST /search/` - Semantic search
  ```json
  { "query": "search text", "k": 5 }
  ```

- `POST /summarize/` - Document summarization
  ```json
  {
    "query": "optional query",
    "doc_id": "optional doc id",
    "k": 5
  }
  ```

### S3 Operations (via Next.js API Routes)
- `GET /api/s3/list` - List files in bucket
- `POST /api/s3/upload` - Upload file (multipart/form-data)
- `DELETE /api/s3/delete` - Delete file
  ```json
  { "key": "raw/filename.txt" }
  ```

## 🎨 Customization

### Modify Colors/Styling
Edit Tailwind classes in components:
- `components/Navbar.tsx` - Navigation styling
- `app/page.tsx` - Home page design
- Individual page files for specific sections

### Adjust API Behavior
Modify `lib/api.ts` to change:
- Request/response handling
- Error messages
- Default parameters

### Change S3 Prefix
Edit API routes in `app/api/s3/*/route.ts`:
```typescript
Prefix: "raw/" // Change to your preferred prefix
```

## 📝 Development Tips

### Hot Reload
Changes to components and pages will hot-reload automatically.

### TypeScript
Type definitions in `types/index.ts` help with autocomplete and error checking.

### Debugging
- Check browser console for errors
- Check terminal for server-side errors
- Use React DevTools for component inspection

## 🔐 Security Notes

- Never commit `.env` or `.env.local` to git
- AWS credentials are server-side only (not exposed to browser)
- Use IAM roles with minimal permissions for S3
- Consider using presigned URLs for direct S3 uploads in production

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [AWS S3 SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [Lucide Icons](https://lucide.dev/)

## 🐛 Common Issues

1. **Port 3000 already in use**: Kill the process or use different port
   ```bash
   PORT=3001 npm run dev
   ```

2. **Module not found**: Reinstall dependencies
   ```bash
   rm -rf node_modules && npm install
   ```

3. **AWS SDK errors**: Check credentials and permissions

4. **CORS errors**: Configure backend CORS settings

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Backend API running
- [ ] S3 bucket accessible
- [ ] Development server started
- [ ] Application accessible in browser
- [ ] Search functionality working
- [ ] Summarize functionality working
- [ ] File upload working
- [ ] File management working

---

**Need help?** Check the logs in the terminal for detailed error messages.
