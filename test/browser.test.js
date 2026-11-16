/* eslint-disable */
const inline=require('../');
const browser=require('./helpers/browser');
describe('browser cascade semantics',function(){
    this.timeout(15000);
    before(()=>browser.start());
    after(()=>browser.close());
    for(const css of [
        'p{margin-left:10px;margin:0}',
        'p{padding-bottom:10px;padding:0}',
        'p{border-left:10px solid red;border:0}',
        '#x{margin-left:10px}p{margin:0}',
        'p{margin:0!important;margin-left:10px}',
        'p{font-family:"A\'B"}',
        'p{display:-webkit-box;display:flex}',
        'p{--color:red;color:var(--color)}',
        ':where(#x){color:red}p{color:blue}',
        ':is(#x,.a){color:red}p{color:blue}',
        'p{background-color:red;background:blue}',
        'p{font-size:30px;font:12px sans-serif}'
    ]){
        it(`matches browser cascade for ${css}`,async()=>{
            const html=`<style>${css}</style><p id="x">hello</p>`;
            await browser.compare(await inline(html,{url:'https://example.test/'}),html);
        });
    }
});
