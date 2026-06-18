// setup the connection for socket io

export const getSocketIOConnection = (io : any) => {
    io.on("connection", (socket : any) => {
            console.log(`Socket connected ${socket.id}`);
            
            socket.on("disconnect", () => {
                console.log(`Socket disconnected!`);
                
            })
    })
}