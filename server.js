const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage
const documents = new Map();
const sessions = new Map();

// Initialize with a default document
const defaultDocId = 'default-doc';
documents.set(defaultDocId, {
  id: defaultDocId,
  title: 'Untitled Document',
  content: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  collaborators: []
});

// Routes

// Get or create session (no authentication needed)
app.post('/api/session', (req, res) => {
  const sessionId = uuidv4();
  const userName = req.body.userName || `User-${sessionId.slice(0, 8)}`;
  
  sessions.set(sessionId, {
    id: sessionId,
    userName: userName,
    createdAt: new Date(),
    documentId: defaultDocId
  });
  
  res.json({
    sessionId,
    userName,
    documentId: defaultDocId
  });
});

// Get document content
app.get('/api/documents/:docId', (req, res) => {
  const doc = documents.get(req.params.docId);
  if (doc) {
    res.json(doc);
  } else {
    res.status(404).json({ error: 'Document not found' });
  }
});

// Save document content (collaborative update)
app.put('/api/documents/:docId', (req, res) => {
  const { docId } = req.params;
  const { content, title, sessionId } = req.body;
  
  let doc = documents.get(docId);
  if (!doc) {
    doc = {
      id: docId,
      title: title || 'Untitled Document',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      collaborators: []
    };
    documents.set(docId, doc);
  }
  
  if (content !== undefined) doc.content = content;
  if (title !== undefined) doc.title = title;
  doc.updatedAt = new Date();
  
  // Track collaborator
  if (sessionId && !doc.collaborators.includes(sessionId)) {
    doc.collaborators.push(sessionId);
  }
  
  res.json(doc);
});

// Get all documents
app.get('/api/documents', (req, res) => {
  const docList = Array.from(documents.values());
  res.json(docList);
});

// Create new document
app.post('/api/documents', (req, res) => {
  const docId = uuidv4();
  const { title = 'Untitled Document', sessionId } = req.body;
  
  const doc = {
    id: docId,
    title,
    content: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    collaborators: sessionId ? [sessionId] : []
  };
  
  documents.set(docId, doc);
  res.status(201).json(doc);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', documentsCount: documents.size });
});

app.listen(PORT, () => {
  console.log(`Collaborative Writing Platform running on http://localhost:${PORT}`);
  console.log(`No authentication required - just share the link!`);
});
