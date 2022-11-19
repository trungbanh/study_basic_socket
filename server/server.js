import { createServer } from 'http';
import staticHandler from 'serve-handler';
import ws, { WebSocketServer } from 'ws';
//serve static folder
const server=createServer((req,res)=>{  
    return staticHandler(req,res,{public: 'public'})
});
const wss=new WebSocketServer({server})
wss.on('connection',(client)=>{
    console.log('Client connected !')
    client.on('message',(msg, isBinary)=>{   
        const message = isBinary ? msg : JSON.parse(msg);
        console.log(`Message: =>`, message);
        
        broadcast(msg, isBinary)
    })
})
function broadcast(msg, isBinary) {      
    for(const client of wss.clients){
        if(client.readyState === ws.OPEN){
            client.send(msg, { binary: isBinary })
        }
    }
}
server.listen(process.argv[2] || 8080,()=>{
    console.log(`server listening...`);
})


// Generates unique userid for every user.
const generateUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);   
    return s4() + '-' + s4() + '-' + s4();
};

wss.on('request', function(request) {
    var userID = generateUniqueID();
    console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
    // You can rewrite this part of the code to accept only the requests from allowed origin
    const connection = request.accept(null, request.origin);
    clients[userID] = connection;
    console.log('connected: ' + userID)
});