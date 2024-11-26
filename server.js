const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const users = {}; // パスワードごとにユーザーを管理

io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, password }) => {
        if (!users[password]) {
            users[password] = [];
        }

        if (users[password].includes(username)) {
            socket.emit("joinError", "同じユーザ名は使用できません");
        } else {
            users[password].push(username);
            socket.join(password);
            socket.emit("joinSuccess");
            io.to(password).emit("message", { username: "システム", message: `${username}さんが参加しました` });
        }
    });

    socket.on("chatMessage", ({ username, message }) => {
        const userRoom = Object.keys(users).find((room) => users[room].includes(username));
        if (userRoom) {
            io.to(userRoom).emit("message", { username, message });
        }
    });

    socket.on("disconnect", () => {
        for (const room in users) {
            users[room] = users[room].filter((name) => name !== username);
            if (users[room].length === 0) delete users[room];
        }
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
