import app from './app';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import './workers/optimization.worker';

dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('subscribe_job', (jobId) => {
    socket.join(`job_${jobId}`);
    console.log(`Socket ${socket.id} subscribed to job_${jobId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
