# 📝 Collaborative Writing Platform

A simple, no-authentication collaborative writing platform for 2 people. No email, no accounts, no complicated setup.

## Features

✨ **Zero Authentication** - No email, Gmail, or iCloud required  
📱 **Real-time Sync** - Changes auto-save as you type  
👥 **Share with Anyone** - Just copy and share a link  
📄 **Multiple Documents** - Create and manage multiple documents  
💾 **Persistent Storage** - Your documents are saved on the server  
🎨 **Clean UI** - Simple, distraction-free writing interface  

## Getting Started

### Installation

1. Clone or download this repository
2. Install dependencies:
```bash
npm install
```

### Running the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## How It Works

1. **Open the app** - Just visit the URL, no login needed
2. **Enter your name** - Identifies you to your collaborator
3. **Start writing** - Content saves automatically every second
4. **Share the link** - Click "Copy Link" to share with your collaborator
5. **Collaborate** - Both people can edit the same document in real-time

## API Endpoints

### Sessions
- `POST /api/session` - Create a new session (no auth required)

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:docId` - Get specific document
- `POST /api/documents` - Create new document
- `PUT /api/documents/:docId` - Update document content

## Deployment

### Deploy to Heroku

```bash
heroku create your-app-name
git push heroku main
```

### Deploy to Railway/Render

Both platforms support Node.js apps. Simply connect your GitHub repo.

## Technical Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript + HTML/CSS
- **Storage**: In-memory (can be upgraded to database)
- **Architecture**: RESTful API

## Roadmap

- [ ] Database persistence (MongoDB/PostgreSQL)
- [ ] Real-time WebSocket updates
- [ ] Markdown support
- [ ] Export to PDF
- [ ] Undo/Redo history
- [ ] Rich text editor
- [ ] User presence indicators

## Notes

- Currently uses in-memory storage (resets on server restart)
- To persist data, upgrade to a database
- Maximum 2 concurrent collaborators recommended
- No data encryption (use HTTPS in production)

## License

MIT
