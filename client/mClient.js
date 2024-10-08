const io = require("socket.io-client");
const readline = require('readline');
const { exec } = require('child_process');
const { exit } = require("process");
const socket = io("http://192.168.1.107:3000");

var nickname = null;

console.log("Connecting to the server...");

socket.on("connect", () => {
  nickname = process.argv[2];
  console.log("[INFO]: Welcome %s", nickname);
  socket.emit("join", {"sender": nickname, "action": "join"});
});

socket.on("disconnect", (reason) => {
  console.log("[INFO]: Client disconnected: reason: %s", reason);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on("line", (input) => {
  if (true === input.startsWith("b;")) {
    var str = input.slice(2);
    socket.emit("broadcast", {"sender": nickname, "action": "broadcast", "msg": str});
  } else if ("ls;" === input) {
    socket.emit("list", {"sender": nickname, "action": "list"});
  } else if ("q;" === input) {
    socket.emit("quit", {"sender": nickname, "action": "quit"});
  }
});

socket.on("broadcast", (data) => {
  console.log(data.sender + ": " + data.msg);
  exec("termux-notification -c " + data.sender + ":" + data.msg);
});

socket.on("join", (data) => {
  console.log("[INFO]: %s has joined the chat", data.sender);
});

socket.on("list", (data) => {
  console.log("[INFO]: List of nicknames:");
  for (var i = 0; i < data.users.length; i++) {
    console.log(data.users[i]);
  }
});

socket.on("quit", (data) => {
  console.log("[INFO]: %s quit the chat", data.sender);
  process.exit()
});
