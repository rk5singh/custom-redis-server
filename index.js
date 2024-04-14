const net = require('net');
const Parser = require('redis-parser');

const store = {};

function handleCommands(reply, connection) {
    const command = reply[0];
    let key;
    let value;
    switch (command) {
        case 'set':
            key = reply[1];
            value = reply[2];
            store[key] = value;

            connection.write('+OK\r\n');

            break;
        case 'get':
            key = reply[1];
            value = store[key];

            if (!value) {
                connection.write('$-1\r\n');
            } else {
                connection.write(`$${value.length}\r\n${value}\r\n`);
            }

            break;
        default:
            connection.write('+OK\r\n');
    }
    console.log('=>', reply);
}

const server = net.createServer(connection => {
    console.log('Client connected...');

    connection.on('data', data => {
        const parser = new Parser({
            returnReply: (reply) => {
                handleCommands(reply, connection);
            },
            returnError: (err) => {

                console.log('=>', err);
            }
        });
        parser.execute(data);
    });
});
    
server.listen(8000, () => {
    console.log('Custom Redis server started at 8000');
});

