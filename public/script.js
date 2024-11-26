document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;

    if (currentPath === "/") {
        document.getElementById("loginForm").addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!username || !password) {
                alert("ユーザ名とパスワードを入力してください");
                return;
            }

            localStorage.setItem("username", username);
            localStorage.setItem("password", password);
            window.location.href = "/chat.html";
        });
    } else if (currentPath === "/chat.html") {
        const username = localStorage.getItem("username");
        const password = localStorage.getItem("password");

        if (!username || !password) {
            alert("ログインしてください");
            window.location.href = "/";
            return;
        }

        const socket = io();

        socket.emit("joinRoom", { username, password });

        socket.on("joinSuccess", () => {
            console.log("チャットに参加しました");
        });

        socket.on("joinError", (error) => {
            alert(error);
            window.location.href = "/";
        });

        document.getElementById("chatForm").addEventListener("submit", (e) => {
            e.preventDefault();
            const message = document.getElementById("message").value.trim();
            if (message) {
                addMessage("self", message); // 自分のメッセージを追加
                socket.emit("chatMessage", { username, message });
                document.getElementById("message").value = "";
            }
        });

        socket.on("message", (data) => {
            const sender = data.username === username ? "self" : "other";
            addMessage(sender, data.message, data.username);
        });

        function addMessage(sender, message, senderName = "") {
            const chatBox = document.getElementById("chatBox");
            const newMessage = document.createElement("div");
            newMessage.classList.add(sender === "self" ? "message-self" : "message-other");

            // ユーザー名を表示する（必要であれば）
            if (sender === "other" && senderName) {
                const nameTag = document.createElement("div");
                nameTag.style.fontSize = "12px";
                nameTag.style.color = "#666";
                nameTag.textContent = senderName;
                chatBox.appendChild(nameTag);
            }

            newMessage.textContent = message;
            chatBox.appendChild(newMessage);
            chatBox.scrollTop = chatBox.scrollHeight; // チャットボックスをスクロール
        }
    }
});
