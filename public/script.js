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
                socket.emit("chatMessage", { username, message });
                document.getElementById("message").value = "";
            }
        });

        socket.on("message", (data) => {
            const chatBox = document.getElementById("chatBox");
            const newMessage = document.createElement("div");
            newMessage.textContent = `${data.username}: ${data.message}`;
            chatBox.appendChild(newMessage);
            chatBox.scrollTop = chatBox.scrollHeight;
        });
    }
});
