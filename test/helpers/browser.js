/* eslint-disable */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
let browser;
exports.start = async () => {
    const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const executablePath = process.env.INLINE_CSS_BROWSER || (fs.existsSync(localChrome) ? localChrome : undefined);
    browser = await chromium.launch({ executablePath, headless: true });
};
exports.close = async () => { if (browser) await browser.close(); };
exports.compare = async (actual, expected) => {
    const page = await browser.newPage();
    try {
        await page.route('**/*', route => route.abort());
        async function snapshot(html) {
            await page.setContent(html);
            return page.evaluate(() => {
                const elements = [...document.querySelectorAll('*')].filter(el => !['STYLE','HEAD','HTML','SCRIPT','META','LINK','TITLE'].includes(el.tagName));
                return elements.map(el => ({
                    tag: el.tagName,
                    attributes: [...el.attributes].filter(a=>a.name!=='style').map(a=>[a.name,a.value]).sort(),
                    text: el.childElementCount ? '' : el.textContent.replace(/\s+/g,' ').trim(),
                    styles: Object.fromEntries([...getComputedStyle(el)].filter(p=>!p.startsWith('animation')&&!p.startsWith('transition')).map(p=>[p,getComputedStyle(el).getPropertyValue(p)]))
                }));
            });
        }
        const want=await snapshot(expected), got=await snapshot(actual);
        assert.equal(got.length,want.length,'rendered element count differs');
        for(let i=0;i<want.length;i++) {
            assert.equal(got[i].tag,want[i].tag,`element ${i} tag`);
            assert.deepEqual(got[i].attributes,want[i].attributes,`element ${i} attributes`);
            assert.equal(got[i].text,want[i].text,`element ${i} text`);
            for(const [property,value]of Object.entries(want[i].styles)) assert.equal(got[i].styles[property],value,`element ${i} ${got[i].tag} computed ${property}`);
        }
    } finally { await page.close(); }
};
exports.style = async (html, selector, property) => {
    const page=await browser.newPage();
    try { await page.route('**/*',r=>r.abort()); await page.setContent(html); return await page.locator(selector).evaluate((el,p)=>getComputedStyle(el).getPropertyValue(p),property); }
    finally { await page.close(); }
};
