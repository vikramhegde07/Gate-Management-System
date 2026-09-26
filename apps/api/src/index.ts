import app from './app';
import http from "http";
import { env } from './config/env';
// import { getIO, initSocket } from "./socket/index";

const PORT = env.PORT;

/*
========================================
CREATE HTTP SERVER
========================================
*/

const server = http.createServer(app);

/*
========================================
INIT SOCKET
========================================
*/

// initSocket(server);

/*
========================================
START SERVER
========================================
*/

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Listening: http://localhost:${PORT}`);
});

server.on("error", (err: any) => {
    if ("code" in err && err.code === "EADDRINUSE") {
        console.error(
            `Port ${process.env.PORT} is already in use.`
        );
    } else {
        console.error("Failed to start server:", err);
    }
    process.exit(1);
});
