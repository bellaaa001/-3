// Simple two-person chat using Firebase Realtime Database
const auth = firebase.auth();
const db = firebase.database();

const setupEl = document.getElementById('setup');
const chatWrap = document.getElementById('chatWrap');
const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');
const roomInput = document.getElementById('roomId');
const nameInput = document.getElementById('displayName');
const roomLabel = document.getElementById('roomLabel');
const messagesEl = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const msgInput = document.getElementById('msgInput');

let currentRoom = null;
let myUid = null;
let messagesRef = null;
let childListener = null;

auth.signInAnonymously().then(() => {
  myUid = auth.currentUser.uid;
}).catch(console.error);

function scrollBottom(){
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderMessage(data){
  const { senderId, name, text, ts } = data;
  const el = document.createElement('div');
  el.classList.add('msg');
  el.classList.add(senderId === myUid ? 'you' : 'other');
  el.innerHTML = `<div><strong>${name || 'Someone'}</strong></div><div style="margin-top:6px">${escapeHtml(text)}</div>
    <div class="smallmeta">${new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>`;
  messagesEl.appendChild(el);
  scrollBottom();
}

function escapeHtml(str){
  return str.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

joinBtn.addEventListener('click', () => {
  const room = roomInput.value.trim();
  if (!room) return alert('Enter a room id and share it with the other person.');
  currentRoom = room;
  setupEl.classList.add('hidden');
  chatWrap.classList.remove('hidden');
  roomLabel.textContent = `Room: ${room} ❤️`;
  startListening(room);
});

leaveBtn.addEventListener('click', () => {
  stopListening();
  setupEl.classList.remove('hidden');
  chatWrap.classList.add('hidden');
  messagesEl.innerHTML = '';
  roomInput.value = '';
  currentRoom = null;
});

function startListening(room){
  messagesRef = db.ref(`rooms/${room}/messages`);
  messagesEl.innerHTML = '';
  // load last 200 messages
  childListener = messagesRef.limitToLast(200).on('child_added', snap => {
    const data = snap.val();
    renderMessage(data);
  });
}

function stopListening(){
  if (messagesRef && childListener) {
    messagesRef.off('child_added', childListener);
  }
  messagesRef = null;
  childListener = null;
}

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = msgInput.value.trim();
  if (!text || !currentRoom) return;
  const name = nameInput.value.trim() || 'You';
  const payload = {
    senderId: myUid,
    name,
    text,
    ts: Date.now()
  };
  db.ref(`rooms/${currentRoom}/messages`).push(payload)
    .then(() => {
      msgInput.value = '';
    }).catch((err) => {
      console.error(err);
      alert('Failed to send message.');
    });
});
