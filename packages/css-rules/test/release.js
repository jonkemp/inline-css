/* eslint-disable */
const assert=require('node:assert/strict');
const parse=require('../');
describe('ordered CSS rules',()=>{
    it('splits selector AST lists and keeps declaration fallbacks',()=>{
        const rules=parse(':is(.a,.b),[data-x="a,b"]{display:-webkit-box;display:flex!important}');
        assert.equal(rules.length,2);
        assert.equal(rules[0].selector,':is(.a,.b)');
        assert.equal(rules[1].selector,'[data-x="a,b"]');
        assert.deepEqual(rules[0].declarations.map(d=>[d.property,d.value,d.important]),[['display','-webkit-box',false],['display','flex',true]]);
    });
    for (const selector of [':is(:not(.a,.b),.c),.d', '.a\\,b,.c', '[data-x="a,b"],p']) {
        it(`keeps nested or escaped selector delimiters in ${selector}`, () => {
            assert.equal(parse(`${selector}{color:red}`).length, 2);
        });
    }
    it('does not inline media rules unconditionally',()=>assert.equal(parse('@media print{p{color:red}}').length,0));
    it('rejects malformed CSS',()=>assert.throws(()=>parse('p{color:red}}')));
});
