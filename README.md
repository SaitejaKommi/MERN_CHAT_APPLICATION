# MERN Stack Real-Time Chat Application

A full-stack WhatsApp-like chat application built with MongoDB, Express, React, Node.js, and Socket.io featuring real-time messaging, image sharing, and a beautiful dark theme UI.

## Features

- 🔐 **User Authentication** - JWT-based signup/login/logout
- 💬 **Real-Time Messaging** - Instant message delivery with Socket.io
- 📷 **Image Sharing** - Send and receive images
- 👥 **Private Messaging** - One-on-one conversations
- 🏘️ **Chat Rooms** - Group messaging support
- ✅ **Read Receipts** - See when messages are read
- ⌨️ **Typing Indicators** - Real-time typing status
- 🟢 **Online Status** - See who's online
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌙 **Dark Theme** - Beautiful dark UI with smooth animations

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Multer** - File upload handling

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Socket.io-client** - Real-time client
- **Axios** - HTTP client
- **CSS3** - Styling with custom dark theme

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **MongoDB** - Either local installation or MongoDB Atlas account
- **npm** or **yarn**

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd mern-chat-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file and add your configuration:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: A secure random string for JWT signing
# - PORT: 5000 (or your preferred port)
# - CLIENT_URL: http://localhost:5173 (frontend URL)
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# The default values should work, but you can customize:
# - VITE_API_URL: http://localhost:5000/api
# - VITE_SOCKET_URL: http://localhost:5000
```

## Running the Application

### Start Backend Server

```bash
# From backend directory
npm run dev
```

The backend server will start on `http://localhost:5000`

### Start Frontend Development Server

```bash
# From frontend directory (in a new terminal)
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. **Sign Up**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials
3. **Start Chatting**: 
   - Select a user from the list to start a private conversation
   - Type your message and hit Send
   - Click the 📎 icon to send images
   - See real-time online status and typing indicators
4. **Logout**: Click the logout button when done

## Project Structure

```
mern-chat-app/
├── backend/
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Auth & error handling
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── utils/                # Helper functions
│   ├── uploads/              # Uploaded images
│   ├── socket.js             # Socket.io configuration
│   ├── server.js             # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── context/          # React Context (Auth, Socket)
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── App.jsx           # Main App component
│   │   └── main.jsx          # Entry point
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/search/:query` - Search users
- `PUT /api/users/profile` - Update profile

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get recent conversations
- `GET /api/messages/conversation/:userId` - Get conversation with user
- `GET /api/messages/room/:roomName` - Get room messages
- `PUT /api/messages/:messageId/read` - Mark message as read

## Socket.io Events

### Client → Server
- `joinRoom` - Join a chat room
- `leaveRoom` - Leave a chat room
- `privateMessage` - Send private message
- `roomMessage` - Send room message
- `typing` - Send typing indicator
- `messageRead` - Mark message as read

### Server → Client
- `onlineUsers` - List of online users
- `receivePrivateMessage` - Receive private message
- `receiveRoomMessage` - Receive room message
- `userTyping` - User typing notification
- `messageReadReceipt` - Message read confirmation

## Environment Variables

### Backend (.env)
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Features in Detail

### Authentication
- JWT token-based authentication
- Secure password hashing with bcryptjs
- Protected routes on both frontend and backend
- Automatic logout on token expiration

### Real-Time Communication
- Instant message delivery
- Online/offline status updates
- Typing indicators
- Read receipts
- Connection state management

### File Upload
- Image upload with multer
- File size limits (5MB)
- Image type validation
- Secure file storage

### UI/UX
- Dark theme optimized for readability
- Smooth animations and transitions
- Responsive design for all screen sizes
- Message grouping by sender
- Timestamps and status indicators

## Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Ensure port 5000 is not in use
- Verify all environment variables are set

### Frontend won't connect
- Ensure backend is running
- Check CORS settings
- Verify API URL in frontend .env

### Socket connection issues
- Check firewall settings
- Verify Socket.io server URL
- Check browser console for errors

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## License

This project is open source and available under the MIT License.

## Author

Built as a demonstration of full-stack real-time chat application development.
