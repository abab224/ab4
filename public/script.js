document.addEventListener("DOMContentLoaded", () => {
    const chatBox = document.getElementById("chatBox");
    const socket = io();

    // ユーザー情報を取得
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    if (!username || !password) {
        alert("ログインが必要です");
        window.location.href = "/";
        return;
    }

    // チャットに参加
    socket.emit("joinRoom", { username, password });

    socket.on("joinSuccess", () => {
        console.log("チャットに参加しました");
    });

    socket.on("joinError", (error) => {
        alert(error);
        window.location.href = "/";
    });

    // メッセージ送信
    document.getElementById("chatForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const message = document.getElementById("message").value.trim();
        if (message) {
            socket.emit("chatMessage", { username, message });
            document.getElementById("message").value = "";
        }
    });

    // メッセージ受信
    socket.on("message", (data) => {
        const messageElement = document.createElement("div");
        if (data.username === username) {
            // 自分のメッセージ
            messageElement.classList.add("message-self");
        } else {
            // 相手のメッセージ
            messageElement.classList.add("message-other");
        }
        messageElement.textContent = `${data.username}: ${data.message}`;
        chatBox.appendChild(messageElement);

        // スクロールを最下部に移動
        chatBox.scrollTop = chatBox.scrollHeight;
    });
});
