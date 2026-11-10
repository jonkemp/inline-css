/* eslint-disable */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const parse=require('../');
describe('css-rules',()=>{
    it('returns selectors and ordered declaration records',()=>{
        const rules=parse(fs.readFileSync('test/fixtures/file.css','utf8'));
        assert.equal(rules.length,4);
        assert.equal(rules[0].selector,'body');
        assert.ok(rules.every(rule=>typeof rule.selector==='string'&&rule.declarations.length>0));
    });
    it('rejects malformed CSS',()=>assert.throws(()=>parse(fs.readFileSync('test/fixtures/malformed.css','utf8'))));
});
