const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 全ユーザーの接続情報を管理
const activeRooms = {};

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("新しいユーザーが接続しました");

    socket.on("joinRoom", ({ username, password }) => {
        if (!username || !password) {
            socket.emit("joinError", "ユーザー名とパスワードを入力してください。");
            return;
        }

        // パスワードで部屋を管理
        if (!activeRooms[password]) {
            activeRooms[password] = [];
        }

        // ユーザーを部屋に追加
        if (activeRooms[password].some((user) => user.username === username)) {
            socket.emit("joinError", "同じ名前のユーザーがすでに存在します。");
        } else {
            activeRooms[password].push({ username, socketId: socket.id });
            socket.join(password); // 部屋に参加
            socket.emit("joinSuccess");
            console.log(`${username} が部屋 ${password} に参加しました`);
        }
    });

    socket.on("chatMessage", ({ username, message }) => {
        // ユーザーが属する部屋を確認
        const userRoom = Object.keys(activeRooms).find((room) =>
            activeRooms[room].some((user) => user.socketId === socket.id)
        );

        if (userRoom) {
            io.to(userRoom).emit("message", { username, message });
        }
    });

    socket.on("disconnect", () => {
        // ユーザーを部屋から削除
        for (const room in activeRooms) {
            activeRooms[room] = activeRooms[room].filter(
                (user) => user.socketId !== socket.id
            );

            if (activeRooms[room].length === 0) {
                delete activeRooms[room]; // 部屋が空なら削除
            }
        }
        console.log("ユーザーが切断されました");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`サーバーがポート ${PORT} で起動しました`);
});
