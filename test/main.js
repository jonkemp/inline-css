/* eslint-disable */
/* global describe, it */

const should = require('should');
const fs = require('fs');
const path = require('path');
const Vinyl = require('vinyl');
const beautify = require('js-beautify').html;
const inlineCss = require('../index');

function getFile(filePath) {
    return new Vinyl({
        path: path.resolve(filePath),
        cwd: './test/',
        base: path.dirname(filePath),
        contents: Buffer.from(String(fs.readFileSync(filePath)))
    });
}

function compare(fixturePath, expectedPath, options, done) {
    const file = getFile(fixturePath);

    options.url = `file://${file.path}`;

    inlineCss(file.contents.toString('utf8'), options)
        .then(html => {
            const expected = beautify(String(fs.readFileSync(expectedPath)), {
                "preserve-newlines": false
            });
            beautify(html, {
                "preserve-newlines": false
            }).should.be.equal(expected);
        })
        .then(() => {
            done()
        })
        .catch(err => {
            done(err)
        });
}

describe('inline-css', () => {
    it('Should convert linked css to inline css', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'in.html'), path.join('test', 'expected', 'out.html'), options, done);
    });

    it('Should inline css in multiple HTML files', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'multiple', 'one', 'in.html'), path.join('test', 'expected', 'multiple', 'one', 'out.html'), options, () => {});
        compare(path.join('test', 'fixtures', 'multiple', 'two', 'in.html'), path.join('test', 'expected', 'multiple', 'two', 'out.html'), options, done);
    });

    it('Should inline css in edge case (alpha)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'alpha.html'), path.join('test', 'expected', 'alpha.html'), options, done);
        });

    it('Should inline css in edge case (cascading)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'cascading.html'), path.join('test', 'expected', 'cascading.html'), options, done);
        });

    it('Should inline css in edge case (class)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'class.html'), path.join('test', 'expected', 'class.html'), options, done);
        });

    it('Should inline css in edge case (class+id)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'class+id.html'), path.join('test', 'expected', 'class+id.html'), options, done);
        });

    it('Should inline css in edge case (css-quotes)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'css-quotes.html'), path.join('test', 'expected', 'css-quotes.html'), options, done);
    });

    it('Should inline css in edge case (direct-descendents)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'direct-descendents.html'), path.join('test', 'expected', 'direct-descendents.html'), options, done);
        });

    it('Should inline css in edge case (empty)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'empty.html'), path.join('test', 'expected', 'empty.html'), options, done);
    });

    it('Should inline css in edge case (id)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'id.html'), path.join('test', 'expected', 'id.html'), options, done);
        });

    it('Should inline last rule if identical rules use important', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'identical-important.html'), path.join('test', 'expected', 'identical-important.html'), options, done);
    });

    it('Should ignore pseudo selectors', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'ignore-pseudos.html'), path.join('test', 'expected', 'ignore-pseudos.html'), options, done);
    });

    it('Should inline css in edge case (important)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'important.html'), path.join('test', 'expected', 'important.html'), options, done);
    });

    it('Should inline css in edge case (media)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'media.html'), path.join('test', 'expected', 'media.html'), options, done);
    });

    it('Should inline css in edge case (normalize)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'normalize.html'), path.join('test', 'expected', 'normalize.html'), options, done);
        });

    it('Should inline css in edge case (preserve-events)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'preserve-events.html'), path.join('test', 'expected', 'preserve-events.html'), options, done);
    });

    it('Should inline css in edge case (media)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'regression-media.html'), path.join('test', 'expected', 'regression-media.html'), options, done);
    });

    it('Should inline css in edge case (selector-newline)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'regression-selector-newline.html'), path.join('test', 'expected', 'regression-selector-newline.html'), options, done);
    });

    it('Should compare properties and inline the most specific', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'specificity.html'), path.join('test', 'expected', 'specificity.html'), options, done);
    });

    it('Should preserve existing inline styles ', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'style-preservation.html'), path.join('test', 'expected', 'style-preservation.html'), options, done);
    });

    it('Should inline css in edge case (tag)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'tag.html'), path.join('test', 'expected', 'tag.html'), options, done);
    });

    it('Should inline css in edge case (yui-reset)', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'yui-reset.html'), path.join('test', 'expected', 'yui-reset.html'), options, done);
    });

    it('Should inline css with doctype', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'doctype.html'), path.join('test', 'expected', 'doctype.html'), options, done);
    });

    it('Should inline css with no css', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'no_css.html'), path.join('test', 'expected', 'no_css.html'), options, done);
    });

    it('Should inline css with remote url', function(done) {
        this.timeout(10000);
        const options = {};
        compare(path.join('test', 'fixtures', 'remote_url.html'), path.join('test', 'expected', 'remote_url.html'), options, done);
    });

    it('Should inline css in with spaces in path', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'spaces_in_path.html'), path.join('test', 'expected', 'spaces_in_path.html'), options, done);
    });

    it('Should inline css with two styles', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'two_styles.html'), path.join('test', 'expected', 'two_styles.html'), options, done);
    });

    it('Should inline css with font quotes', done => {
        const options = {
            url: './',
            removeStyleTags: true
        };
        compare(path.join('test', 'fixtures', 'font-quotes.html'), path.join('test', 'expected', 'font-quotes.html'), options, done);
    });

    it('Should inline css with two styles', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'two_styles.html'), path.join('test', 'expected', 'two_styles.html'), options, done);
    });

    it('Should inline css and preserve media queries', done => {
        const options = {
            url: './',
            removeStyleTags: true,
            preserveMediaQueries: true
        };
        compare(
            path.join('test', 'fixtures', 'media-preserve.html'),
            path.join('test', 'expected', 'media-preserve.html'),
            options,
            done
        );
    });

    it('Should inline css and create width attributes on elements', done => {
        const options = {
            url: './',
            removeStyleTags: true,
            applyWidthAttributes: true
        };
        compare(path.join('test', 'fixtures', 'width-attr.html'), path.join('test', 'expected', 'width-attr.html'), options, done);
    });

    it('Should inline css and create table attributes on table elements', done => {
        const options = {
            url: './',
            removeStyleTags: true,
            applyTableAttributes: true
        };
        compare(path.join('test', 'fixtures', 'table-attr.html'), path.join('test', 'expected', 'table-attr.html'), options, done);
    });

    it('Should inline css in HTML templates', done => {
        const options = {
            url: './'
        };
        compare(path.join('test', 'fixtures', 'template.ejs'), path.join('test', 'fixtures', 'template.ejs'), options, done);
    });

    it('Should inline css in edge case and remove html selectors', done => {
      const options = {
        removeHtmlSelectors: true
      };
      compare(path.join('test', 'fixtures', 'remove-html-selectors.html'), path.join('test', 'expected', 'remove-html-selectors.html'), options, done);
    });

    it('Should error when passed malformed CSS', done => {
        const file = getFile(path.join('test', 'fixtures', 'malformed.html'));
        const options = {
            url: `file://${file.path}`
        };
        inlineCss(file.contents.toString('utf8'), options)
            .then(html => {
                done(new Error('test should error when passed malformed CSS'));
            })
            .catch(({message}) => {
                message.should.be.equal('Error: Unexpected } (line 3, char 1)');
                done();
            });
    });

    it('Should handle html character entities correctly', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'character-entities.html'), path.join('test', 'expected', 'character-entities.html'), options, done);
    });

    it('Should error when options.url is not set', done => {
        const options = {};
        const file = getFile(path.join('test', 'fixtures', 'template.ejs'));
        inlineCss(file.contents.toString('utf8'), options)
            .then(html => {
                done(new Error('test should error when options.url is not set'));
            })
            .catch(err => {
                done();
            });
    });

    it('Should handle xhtml documents correctly', done => {
        const options = {
           xmlMode: true
        };
        compare(path.join('test', 'fixtures', 'xhtml.html'), path.join('test', 'expected', 'xhtml.html'), options, done);
    });

    it('Should ignore hbs code blocks', done => {
        const options = {
           xmlMode: true
        };
        compare(path.join('test', 'fixtures', 'codeblocks.html'), path.join('test', 'expected', 'codeblocks.html'), options, done);
    });

    it('Should ignore ejs code blocks', done => {
        const options = {
           xmlMode: false
        };
        compare(path.join('test', 'fixtures', 'ejs.html'), path.join('test', 'expected', 'ejs.html'), options, done);
    });

    it('Should ignore user defined code blocks', done => {
        const options = {
            xmlMode: true,
            codeBlocks: {
                craze: { start: '<<', end: '>>' }
            }
        };
        compare(path.join('test', 'fixtures', 'codeblocks-external.html'), path.join('test', 'expected', 'codeblocks-external.html'), options, done);
    });
});
