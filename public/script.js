const socket = io();

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    if (!username || !password) {
        alert("Please login first!");
        window.location.href = "/";
        return;
    }

    const roomName = document.getElementById("room-name");
    const chatBox = document.getElementById("chat-box");
    const messageInput = document.getElementById("message");
    const sendBtn = document.getElementById("send-btn");

    // 部屋名を表示
    roomName.textContent = password;

    // サーバーに参加を通知
    socket.emit("join", { username, password });

    // メッセージを送信
    sendBtn.addEventListener("click", () => {
        const message = messageInput.value.trim();
        if (message) {
            socket.emit("message", { username, message, password });
            displayMessage("me", message);
            messageInput.value = "";
        }
    });

    // 他のユーザーからのメッセージを受信
    socket.on("message", (data) => {
        displayMessage("you", `${data.username}: ${data.message}`);
    });

    // システム通知
    socket.on("system", (message) => {
        displayMessage("system", message);
    });

    // メッセージを表示する関数
    function displayMessage(type, text) {
        const messageElem = document.createElement("div");
        messageElem.classList.add("message", type);
        messageElem.textContent = text;
        chatBox.appendChild(messageElem);
        chatBox.scrollTop = chatBox.scrollHeight; // 最新メッセージにスクロール
    }
});
