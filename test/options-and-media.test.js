/* eslint-disable */
const assert=require('node:assert/strict');
const cheerio=require('cheerio');
const inline=require('../');
const {protect}=require('inline-css-template-blocks');
const list=require('list-stylesheets');
const styles=require('style-data');
const run=(html,opts={})=>inline(html,{url:'https://example.test/email',...opts});
describe('5.0 option and media combinations',()=>{
    for(const media of ['', 'all', ' ALL ']){
        it(`inlines unconditional media ${JSON.stringify(media)}`,async()=>{
            const $=cheerio.load(await run(`<style media="${media}">p{color:red}</style><p>x</p>`));
            assert.equal($('p').css('color'),'red');
        });
    }
    for(const media of ['print','screen','(max-width:600px)']){
        it(`omits removed conditional ${media} without preservation`,async()=>{
            const $=cheerio.load(await run(`<style media="${media}">p{color:red}</style><p>x</p>`));
            assert.equal($('p').attr('style'),undefined);
            assert.equal($('style').length,0);
        });
    }
    for(const html of ['<style data-embed>.x{color:red}</style><p class="x">x</p>','<link rel="stylesheet" href="https://cdn.test/x"><p class="x">x</p>']){
        it('rejects cleanup for retained CSS even with fetching disabled',async()=>{
            await assert.rejects(run(html,{removeHtmlSelectors:true,applyLinkTags:false,removeLinkTags:false}),{code:'ERR_INLINE_CSS_SELECTOR_RETENTION_CONFLICT'});
        });
    }
    it('allows cleanup with retained empty styles',async()=>{
        assert.match(await run('<style></style><p class="x">x</p>',{removeStyleTags:false,removeHtmlSelectors:true}),/<p class="x">x/);
    });
    it('does not duplicate preserved media from a retained style tag',async()=>{
        const $=cheerio.load(await run('<style>@media print{p{color:red}}</style><p>x</p>',{removeStyleTags:false,preserveMediaQueries:true}));
        assert.equal($('style').length,1);
        assert.equal(($('style').text().match(/@media/g)||[]).length,1);
    });
    it('keeps both media attribute and contained media conditions',async()=>{
        const $=cheerio.load(await run('<style media="print">@media(min-width:1px){p{color:red}}</style><p>x</p>',{preserveMediaQueries:true}));
        assert.match($('style').text(),/@media print/);
        assert.match($('style').text(),/@media\s*\(min-width:1px\)/);
        assert.equal($('p').attr('style'),undefined);
    });
    it('preserves existing embedded media even when style application is disabled', async () => {
        const $=cheerio.load(await run('<style>@media print{p{color:red}}</style><p>x</p>', {applyStyleTags:false,preserveMediaQueries:true}));
        assert.match($('style').text(), /@media print/);
        assert.equal($('p').attr('style'), undefined);
    });
    it('keeps template attribute blocks and literal token text across stages',async()=>{
        const result=await run('<p {{#if x}}class="a"{{/if}}>EXCS_CODE_BLOCK_0_ [[v]]</p>',{codeBlocks:{X:{start:'[[',end:']]'}}});
        assert.match(result,/\{\{#if x\}\}/);
        assert.match(result,/EXCS_CODE_BLOCK_0_ \[\[v\]\]/);
    });
    it('tolerates unknown keys but rejects invalid recognized keys',async()=>{
        assert.match(await run('<p>x</p>',{wrapperMetadata:'test'}),/<p>x/);
        await assert.rejects(run('<p>x</p>',{applyLinkTags:'false'}),{code:'ERR_INLINE_CSS_INVALID_OPTIONS'});
        await assert.rejects(inline('<p>x</p>',{}),{code:'ERR_INLINE_CSS_INVALID_OPTIONS'});
    });
    for (const selector of ['p:nth-child(foo)', 'p:nth-child()', 'p:nth-of-type(2n+)']) {
        it(`skips known invalid selector ${selector} without hiding valid rules`, async () => {
            const $ = cheerio.load(await run(`<style>${selector}{color:red}p{color:blue}</style><p>x</p>`));
            assert.equal($('p').css('color'), 'blue');
        });
    }
    it('propagates inline CSS parse failures instead of treating them as selectors', async () => {
        await assert.rejects(run('<style>p{color:red}</style><p style="color:blue}}">x</p>'), { name: 'CssSyntaxError' });
    });
    it('standalone list extraction uses literal template protection',()=>{
        const result=list('<p>EXCS_CODE_BLOCK_0_ [[v]]</p>',{codeBlocks:{X:{start:'[[',end:']]'}}});
        assert.match(result.html,/EXCS_CODE_BLOCK_0_ \[\[v\]\]/);
    });
    it('standalone style extraction settles once for empty styles',async()=>{
        let calls=0;
        await new Promise((resolve,reject)=>styles('<style></style><p>x</p>',{removeStyleTags:true},(err,result)=>{
            calls++;
            if(err) reject(err);else {try{assert.match(result.html,/<p>x/);resolve();}catch(e){reject(e);}}
        }));
        assert.equal(calls,1);
    });
});
