const Chat = require("../models/Chat");
const Message = require("../models/Message");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins their personal room
    socket.on("setup", (userId) => {
      socket.join(userId);
      console.log("User joined personal room:", userId);
      socket.emit("connected"); // confirm setup
    });

    
    socket.on("oneToOneChat", async ({ senderId, receiverId }) => {
      try {
        // Find existing chat or create a new one
        let chat = await Chat.findOne({
          isGroup: false,
          users: { $all: [senderId, receiverId] },
        });

        if (!chat) {
          chat = await Chat.create({ users: [senderId, receiverId] });
        }

        const chatId = chat._id.toString();

        // Sender joins chat room
        socket.join(chatId);

        // Ensure receiver also joins the chat room automatically
        io.to(receiverId).socketsJoin(chatId);

        // Notify both users
        socket.emit("chatReady", chat);           // sender
        io.to(receiverId).emit("chatReady", chat); // receiver

      } catch (error) {
        console.error("One-to-one chat error:", error);
        socket.emit("errorMessage", "Failed to start chat");
      }
    });

    // ✅ SEND MESSAGE (1-1 & GROUP)
    socket.on("sendMessage", async ({ chatId, senderId, content }) => {
      try {
        if (!chatId) return socket.emit("errorMessage", "Start a chat first!");

        // Ensure sender is in the chat room
        socket.join(chatId);

        const message = await Message.create({
          sender: senderId,
          chat: chatId,
          content,
        });

        // Send message to all users in the chat room
        io.to(chatId).emit("receiveMessage", message);

      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("errorMessage", "Failed to send message");
      }
    });

    // ✅ GROUP CHAT
    socket.on("createGroup", async ({ groupName, users, admin }) => {
      try {
        const group = await Chat.create({
          isGroup: true,
          groupName,
          users,
          admin,
        });

        const groupId = group._id.toString();

        // Make all users join group room
        users.forEach((userId) => {
          io.to(userId).socketsJoin(groupId);
          io.to(userId).emit("chatReady", group);
        });

      } catch (error) {
        console.error("Group chat error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

