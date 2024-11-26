if (window.location.pathname === "/chat.html") {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    if (!username || !password) {
        alert("ログインが必要です");
        window.location.href = "/";
        return;
    }

    const socket = io();

    // パスワードを送信して接続確認
    socket.emit("joinRoom", { username, password });

    socket.on("joinSuccess", () => {
        console.log("チャットに参加しました");
    });

    socket.on("joinError", (error) => {
        alert(error);
        window.location.href = "/";
    });

    // メッセージ送信機能
    document.getElementById("chatForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const message = document.getElementById("message").value.trim();
        if (message) {
            socket.emit("chatMessage", { username, message });
            document.getElementById("message").value = "";
        }
    });

    // メッセージの受信機能
    socket.on("message", (data) => {
        const chatBox = document.getElementById("chatBox");
        const newMessage = document.createElement("div");

        newMessage.classList.add("message");
        if (data.username === username) {
            newMessage.classList.add("message-self");
        } else {
            newMessage.classList.add("message-other");
        }

        newMessage.innerHTML = `<strong>${data.username}</strong><br>${data.message}`;
        chatBox.appendChild(newMessage);
        chatBox.scrollTop = chatBox.scrollHeight; // 最新メッセージにスクロール
    });
}
