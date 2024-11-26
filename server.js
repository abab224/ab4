const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// サーバーポート
const PORT = process.env.PORT || 3000;

// 静的ファイル提供
app.use(express.static(path.join(__dirname, "public")));

// パスワードごとのユーザを管理
const rooms = {};

// ソケット接続
io.on("connection", (socket) => {
    console.log("新しいクライアントが接続しました");

    socket.on("joinRoom", ({ username, password }) => {
        if (!rooms[password]) {
            rooms[password] = [];
        }

        // ユーザ名の重複チェック
        if (rooms[password].includes(username)) {
            socket.emit("joinError", "このユーザ名はすでに使用されています");
            return;
        }

        rooms[password].push(username);
        socket.join(password);
        socket.username = username;
        socket.password = password;

        // 参加通知
        socket.emit("joinSuccess");
        io.to(password).emit("message", { username: "システム", message: `${username}さんが参加しました` });
    });

    socket.on("chatMessage", ({ username, message }) => {
        const room = socket.password;
        if (room) {
            io.to(room).emit("message", { username, message });
        }
    });

    socket.on("disconnect", () => {
        const room = socket.password;
        if (room && rooms[room]) {
            rooms[room] = rooms[room].filter((name) => name !== socket.username);
            if (rooms[room].length === 0) delete rooms[room];
            io.to(room).emit("message", { username: "システム", message: `${socket.username}さんが退出しました` });
        }
        console.log("クライアントが切断しました");
    });
});

// サーバー起動
server.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
