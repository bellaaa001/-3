let currentSessionId = null;
let currentUserId = null;
let currentDocId = 'default-doc';
const API_BASE = '';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeSession();
    loadDocuments();
    setupEventListeners();
    updateShareUrl();
});

// Initialize session
async function initializeSession() {
    try {
        const userName = localStorage.getItem('userName') || `Guest-${Math.random().toString(36).slice(2, 8)}`;
        
        const response = await fetch(`${API_BASE}/api/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName })
        });
        
        const data = await response.json();
        currentSessionId = data.sessionId;
        currentUserId = data.userName;
        
        document.getElementById('userName').value = currentUserId;
        
        // Load the document
        await loadDocument(currentDocId);
    } catch (error) {
        console.error('Failed to initialize session:', error);
        showStatus('Connection error', 'error');
    }
}

// Load documents list
async function loadDocuments() {
    try {
        const response = await fetch(`${API_BASE}/api/documents`);
        const docs = await response.json();
        
        const docsList = document.getElementById('documentsList');
        docsList.innerHTML = '';
        
        docs.forEach(doc => {
            const docItem = document.createElement('div');
            docItem.className = `doc-item ${doc.id === currentDocId ? 'active' : ''}`;
            docItem.textContent = doc.title || 'Untitled';
            docItem.onclick = () => switchDocument(doc.id);
            docsList.appendChild(docItem);
        });
    } catch (error) {
        console.error('Failed to load documents:', error);
    }
}

// Load document content
async function loadDocument(docId) {
    try {
        const response = await fetch(`${API_BASE}/api/documents/${docId}`);
        const doc = await response.json();
        
        currentDocId = doc.id;
        document.getElementById('docTitle').value = doc.title;
        document.getElementById('editor').value = doc.content;
        
        // Highlight current document
        document.querySelectorAll('.doc-item').forEach(item => {
            item.classList.toggle('active', item.textContent === doc.title);
        });
        
        updateShareUrl();
    } catch (error) {
        console.error('Failed to load document:', error);
        showStatus('Failed to load document', 'error');
    }
}

// Switch to different document
async function switchDocument(docId) {
    await loadDocument(docId);
}

// Save document
let saveTimeout;
async function saveDocument() {
    clearTimeout(saveTimeout);
    
    saveTimeout = setTimeout(async () => {
        try {
            const title = document.getElementById('docTitle').value || 'Untitled';
            const content = document.getElementById('editor').value;
            
            showStatus('Saving...', 'syncing');
            
            const response = await fetch(`${API_BASE}/api/documents/${currentDocId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    sessionId: currentSessionId
                })
            });
            
            if (response.ok) {
                showStatus('Synced', 'success');
                await loadDocuments();
            } else {
                showStatus('Save failed', 'error');
            }
        } catch (error) {
            console.error('Failed to save document:', error);
            showStatus('Connection error', 'error');
        }
    }, 1000);
}

// Create new document
async function createNewDocument() {
    try {
        const title = prompt('Document title:', 'Untitled Document');
        if (title === null) return;
        
        const response = await fetch(`${API_BASE}/api/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                sessionId: currentSessionId
            })
        });
        
        const doc = await response.json();
        await loadDocuments();
        await loadDocument(doc.id);
    } catch (error) {
        console.error('Failed to create document:', error);
        showStatus('Failed to create document', 'error');
    }
}

// Update user name
async function updateUserName() {
    const newName = document.getElementById('userName').value.trim();
    if (newName) {
        localStorage.setItem('userName', newName);
        currentUserId = newName;
        showStatus('Name updated', 'success');
    }
}

// Update share URL
function updateShareUrl() {
    const url = `${window.location.origin}?doc=${currentDocId}`;
    document.getElementById('shareUrl').value = url;
}

// Copy share URL
function copyShareUrl() {
    const shareUrl = document.getElementById('shareUrl');
    shareUrl.select();
    document.execCommand('copy');
    showStatus('Link copied!', 'success');
}

// Show status message
function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('syncStatus');
    statusEl.textContent = message;
    statusEl.className = `sync-status ${type}`;
    
    if (type === 'success') {
        setTimeout(() => {
            statusEl.textContent = 'Synced';
            statusEl.className = 'sync-status';
        }, 2000);
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('editor').addEventListener('input', saveDocument);
    document.getElementById('docTitle').addEventListener('change', saveDocument);
    document.getElementById('newDocBtn').addEventListener('click', createNewDocument);
    document.getElementById('updateNameBtn').addEventListener('click', updateUserName);
    document.getElementById('copyUrlBtn').addEventListener('click', copyShareUrl);
}

// Handle URL parameters (e.g., ?doc=id)
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const docParam = params.get('doc');
    if (docParam && docParam !== currentDocId) {
        switchDocument(docParam);
    }
});
