const cheerio = require('cheerio');
const postcss = require('postcss');
const { protect } = require('./lib/internal/template-blocks');
const { normalizePolicy, createContext, CONTEXT, error } = require('./lib/internal/resource-policy');
const getHrefContent = require('href-content');

const conditional = media => media && media.trim() && media.trim().toLowerCase() !== 'all';
const mediaRules = css => postcss.parse(css).nodes.filter(node => node.type === 'atrule' && node.name.toLowerCase() === 'media').map(node => node.toString()).join('\n');
const stylesheet = el => (el.attr('rel') || '').toLowerCase().split(/\s+/).includes('stylesheet');

const collectSources = ($, options) => {
    const sources = [];

    $('style,link').each((order, element) => {
        const el = $(element);

        if (element.name === 'style') {
            if (el.attr('data-embed') === undefined) {
                sources.push({ kind: 'embedded', el, order, css: el.html() || '', apply: options.applyStyleTags, remove: options.removeStyleTags, media: el.attr('media') });
            }
        } else if (stylesheet(el)) {
            sources.push({ kind: 'linked', el, order, href: el.attr('href'), apply: options.applyLinkTags, remove: options.removeLinkTags, media: el.attr('media') });
        }
    });
    return sources;
};
const loadSources = async (sources, options, context) => {
    const policy = context.policy;
    const loads = sources.filter(source => source.kind === 'linked' && source.apply);

    if (loads.length > policy.maxStylesheets) {
        throw error('RESOURCE_LIMIT', 'Stylesheet load count exceeded');
    }
    let next = 0;
    const worker = async () => {
        while (next < loads.length) {
            context.check();
            const source = loads[next++];

            try {
                if (!source.href) {
                    throw error('RESOURCE_DENIED', 'Stylesheet link requires href');
                }
                source.css = await new Promise((resolve, reject) => getHrefContent(source.href, options.url, { ...options, [CONTEXT]: context }, (err, value) => err ? reject(err) : resolve(value)));
            } catch (cause) {
                context.abort(cause);
                throw cause;
            }
        }
    };
    const workers = await Promise.allSettled(Array.from({ length: Math.min(policy.concurrency, loads.length) }, worker));
    const failure = workers.find(result => result.status === 'rejected');

    if (failure) {
        throw failure.reason;
    }
    context.check();
};
const shouldRetain = (source, options) => source.remove && options.preserveMediaQueries && (source.kind === 'embedded' || source.apply);
const retainedCss = (source, options) => {
    if (shouldRetain(source, options)) {
        const text = source.css || '';

        return conditional(source.media) ? `@media ${source.media} {\n${text}\n}` : mediaRules(text);
    }
    return '';
};
const replaceSource = (source, retained, $) => {
    if (retained.trim()) {
        if (source.kind === 'embedded') {
            source.el.removeAttr('media').text(retained);
        } else {
            source.el.replaceWith($('<style></style>').text(retained));
        }
    } else {
        source.el.remove();
    }
};
const serializeSource = (source, { $, options, css }) => {
    let retained = '';

    if (source.apply) {
        const text = source.css || '';

        if (!conditional(source.media)) {
            css.push(text);
        }
    }
    retained = retainedCss(source, options);
    if (source.remove) {
        replaceSource(source, retained, $);
    }
};

const appendExtraMedia = ($, options, extraCss) => {
    if (options.preserveMediaQueries && extraCss.trim()) {
        const retained = mediaRules(extraCss);

        if (retained) {
            const parent = options.xmlMode ? $.root().children().first() : $('head');

            parent.append($('<style></style>').text(retained));
        }
    }
};
const appendExtraCss = ($, options, css) => {
    const extraCss = options.extraCss || '';

    if (extraCss) {
        css.push(extraCss);
    }
    appendExtraMedia($, options, extraCss);
};

module.exports = (html, options, callback) => {
    const run = async () => {
        const policy = normalizePolicy(options.resourcePolicy);
        const protectedHtml = protect(html, options.codeBlocks);
        const $ = cheerio.load(protectedHtml.html, options);
        const context = createContext(policy);

        try {
            const sources = collectSources($, options);

            await loadSources(sources, options, context);
            const css = [];

            for (const source of sources) {
                serializeSource(source, { $, options, css });
            }
            appendExtraCss($, options, css);
            const hasRetainedCss = $('style').toArray().some(el => ($(el).html() || '').trim()) || $('link').toArray().some(el => stylesheet($(el)));

            return { html: protectedHtml.restore($.html()), css: protectedHtml.restore(css.join('\n')), metadata: { hasRetainedCss } };
        } finally {
            context.close();
        }
    };

    Promise.resolve().then(run).then(result => callback(null, result.html, result.css, result.metadata), cause => callback(cause));
};
