/* eslint-disable */
const assert = require('node:assert/strict');
const http = require('node:http');
const getRemoteContent = require('../');
describe('remote-content', () => {
    it('loads authorized text from a local server', async () => {
        const server = http.createServer((req,res)=>res.end('p{color:red}'));
        await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
        const origin=`http://127.0.0.1:${server.address().port}`;
        try {
            const css=await new Promise((resolve,reject)=>getRemoteContent(`${origin}/style.css`,{resourcePolicy:{allowedOrigins:[origin],allowPrivateNetworks:true}},(err,value)=>err?reject(err):resolve(value)));
            assert.equal(css,'p{color:red}');
        } finally { server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); }
    });
});
