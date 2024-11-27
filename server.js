const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// パスワードごとのユーザー情報を保存
const rooms = {};

// 静的ファイルを提供
app.use(express.static("public"));

// Socket.IOの設定
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // ユーザーが部屋に参加
    socket.on("join", ({ username, password }) => {
        if (!rooms[password]) {
            rooms[password] = [];
        }

        rooms[password].push({ username, socketId: socket.id });
        socket.join(password);

        // 部屋の全員に通知
        io.to(password).emit("system", `${username} has joined the room.`);
        console.log(`${username} joined room: ${password}`);
    });

    // メッセージを受信し、部屋の全員に送信
    socket.on("message", ({ username, message, password }) => {
        io.to(password).emit("message", { username, message });
        console.log(`[Room: ${password}] ${username}: ${message}`);
    });

    // ユーザーが切断
    socket.on("disconnect", () => {
        for (const [room, userList] of Object.entries(rooms)) {
            const userIndex = userList.findIndex((user) => user.socketId === socket.id);
            if (userIndex !== -1) {
                const [user] = rooms[room].splice(userIndex, 1);
                io.to(room).emit("system", `${user.username} has left the room.`);
                console.log(`${user.username} left room: ${room}`);
                break;
            }
        }
    });
});

// サーバーを起動
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
