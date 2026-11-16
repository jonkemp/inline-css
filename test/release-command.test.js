/* eslint-disable */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {spawnSync}=require('node:child_process');
describe('release publication orchestration',function(){
    this.timeout(10000);
    (process.platform==='win32'?it.skip:it)('publishes workspaces using prerelease state, then the root under next',()=>{
        const dir=fs.mkdtempSync(path.join(os.tmpdir(),'inline-publish-'));
        try{
            const log=path.join(dir,'commands.jsonl');
            const fakeNpm=path.join(dir,'npm');
            fs.writeFileSync(fakeNpm,'#!/usr/bin/env node\nrequire("node:fs").appendFileSync(process.env.INLINE_PUBLISH_LOG,JSON.stringify(process.argv.slice(2))+"\\n");\n',{mode:0o755});
            const result=spawnSync(process.execPath,['scripts/publish-release.js'],{cwd:path.resolve(__dirname,'..'),encoding:'utf8',env:{...process.env,PATH:dir+path.delimiter+process.env.PATH,INLINE_PUBLISH_LOG:log}});
            assert.equal(result.status,0,result.stderr);
            assert.deepEqual(fs.readFileSync(log,'utf8').trim().split('\n').map(line=>JSON.parse(line)),[['exec','--','changeset','publish'],['publish','--tag','next']]);
        }finally{fs.rmSync(dir,{recursive:true,force:true});}
    });
});
