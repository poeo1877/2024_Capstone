const { Server } = require('socket.io');

const initSocket = (server, models) => {
    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log('New client connected');

        // 클라이언트가 연결 종료할 때
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        // 여기에 다른 이벤트 리스너 추가 가능
    });

    return { io };
};

module.exports = initSocket;
