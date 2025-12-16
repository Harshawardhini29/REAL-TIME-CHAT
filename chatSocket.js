const Message = require("../models/Message");

const chatSocket = (io) => {
  io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);

    // 🔹 Send old messages
    const messages = await Message.find().sort({ createdAt: 1 });
    socket.emit("loadMessages", messages);

    // 🔹 Receive message
    socket.on("sendMessage", async (data) => {
      try {
        const newMessage = new Message({
          sender: data.sender,
          message: data.message,
        });

        await newMessage.save();

        io.emit("receiveMessage", newMessage);
      } catch (err) {
        console.error("Message error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = chatSocket;
