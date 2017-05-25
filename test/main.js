/* eslint-disable */
/* global describe, it */

'use strict';

var should = require('should'),
    fs = require('fs'),
    path = require('path'),
    gutil = require('gulp-util'),
    inlineCss = require('../index');

function getFile(filePath) {
    return new gutil.File({
        path: path.resolve(filePath),
        cwd: './test/',
        base: path.dirname(filePath),
        contents: new Buffer(String(fs.readFileSync(filePath)))
    });
}

function compare(fixturePath, expectedPath, options, done) {
    var file = getFile(fixturePath);

    options.url = 'file://' + file.path;

    inlineCss(file.contents.toString('utf8'), options)
        .then(function(html){
            html.should.be.equal(String(fs.readFileSync(expectedPath)));
        })
        .then(function(){
            done()
        })
        .catch(function(err){
            done(err)
        });
}

describe('inline-css', function() {
    it('Should convert linked css to inline css', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'in.html'), path.join('test', 'expected', 'out.html'), options, done);
    });

    it('Should inline css in multiple HTML files', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'multiple', 'one', 'in.html'), path.join('test', 'expected', 'multiple', 'one', 'out.html'), options, function () {});
        compare(path.join('test', 'fixtures', 'multiple', 'two', 'in.html'), path.join('test', 'expected', 'multiple', 'two', 'out.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'alpha.html'), path.join('test', 'expected', 'alpha.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'cascading.html'), path.join('test', 'expected', 'cascading.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'class.html'), path.join('test', 'expected', 'class.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'class+id.html'), path.join('test', 'expected', 'class+id.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'css-quotes.html'), path.join('test', 'expected', 'css-quotes.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'direct-descendents.html'), path.join('test', 'expected', 'direct-descendents.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'empty.html'), path.join('test', 'expected', 'empty.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'id.html'), path.join('test', 'expected', 'id.html'), options, done);
        });

    it('Should inline last rule if identical rules use important', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'identical-important.html'), path.join('test', 'expected', 'identical-important.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'ignore-pseudos.html'), path.join('test', 'expected', 'ignore-pseudos.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'important.html'), path.join('test', 'expected', 'important.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'media.html'), path.join('test', 'expected', 'media.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'normalize.html'), path.join('test', 'expected', 'normalize.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'preserve-events.html'), path.join('test', 'expected', 'preserve-events.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'regression-media.html'), path.join('test', 'expected', 'regression-media.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'regression-selector-newline.html'), path.join('test', 'expected', 'regression-selector-newline.html'), options, done);
    });

    it('Should compare properties and inline the most specific', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'specificity.html'), path.join('test', 'expected', 'specificity.html'), options, done);
    });

    it('Should preserve existing inline styles ', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'style-preservation.html'), path.join('test', 'expected', 'style-preservation.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'tag.html'), path.join('test', 'expected', 'tag.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'yui-reset.html'), path.join('test', 'expected', 'yui-reset.html'), options, done);
    });

    it('Should inline css with doctype', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'doctype.html'), path.join('test', 'expected', 'doctype.html'), options, done);
    });

    it('Should inline css with no css', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'no_css.html'), path.join('test', 'expected', 'no_css.html'), options, done);
    });

    it('Should inline css with remote url', function(done) {
        this.timeout(10000);
        var options = {};
        compare(path.join('test', 'fixtures', 'remote_url.html'), path.join('test', 'expected', 'remote_url.html'), options, done);
    });

    it('Should inline css in with spaces in path', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'spaces_in_path.html'), path.join('test', 'expected', 'spaces_in_path.html'), options, done);
    });

    it('Should inline css with two styles', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'two_styles.html'), path.join('test', 'expected', 'two_styles.html'), options, done);
    });

    it('Should inline css with font quotes', function(done) {
        var options = {
            url: './',
            removeStyleTags: true
        };
        compare(path.join('test', 'fixtures', 'font-quotes.html'), path.join('test', 'expected', 'font-quotes.html'), options, done);
    });

    it('Should inline css with two styles', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'two_styles.html'), path.join('test', 'expected', 'two_styles.html'), options, done);
    });

    it('Should inline css and preserve media queries', function(done) {
        var options = {
            url: './',
            removeStyleTags: true,
            preserveMediaQueries: true
        };
        compare(path.join('test', 'fixtures', 'media-preserve.html'), path.join('test', 'expected', 'media-preserve.html'), options, done);
    });

    it('Should inline css and create width attributes on elements', function(done) {
        var options = {
            url: './',
            removeStyleTags: true,
            applyWidthAttributes: true
        };
        compare(path.join('test', 'fixtures', 'width-attr.html'), path.join('test', 'expected', 'width-attr.html'), options, done);
    });

    it('Should inline css and create table attributes on table elements', function(done) {
        var options = {
            url: './',
            removeStyleTags: true,
            applyTableAttributes: true
        };
        compare(path.join('test', 'fixtures', 'table-attr.html'), path.join('test', 'expected', 'table-attr.html'), options, done);
    });

    it('Should inline css and create attributes on table elements based on a series of maps', function(done) {
        var options = {
            url: './',
            removeStyleTags: true,
            applyAttributesTo: {
              table: {
                float: 'align',
                'background-color': 'bgcolor',
                width: 'width',
                height: 'height',
                padding: 'cellpadding',
                border: 'border',
                'border-spacing': 'cellspacing'
              },
              tr: {
                'background-color': 'bgcolor',
                'vertical-align': 'valign',
                'text-align': 'align'
              },
              'td,th': {
                'background-color': 'bgcolor',
                width: 'width',
                height: 'height',
                'vertical-align': 'valign',
                'text-align': 'align',
                'white-space': 'nowrap'
              },
              'tbody,thead,tfoot': {
                'vertical-align': 'valign',
                'text-align': 'align'
              }
            }
        };
        compare(path.join('test', 'fixtures', 'table-attr-manual.html'), path.join('test', 'expected', 'table-attr-manual.html'), options, done);
    });

    it('Should inline css and create attributes on custom tags based on map', function(done) {
        var options = {
            url: './',
            removeStyleTags: true,
            applyAttributesTo: {
              'mj-section': {
                'full-width': 'full-width',
                'text-align': 'text-align',
                'background-color': 'background-color'
              },
              'mj-section,mj-text': {
                'font-family': 'font-family',
                'color': 'color'
              }
            }
        };
        compare(path.join('test', 'fixtures', 'mjml-attr.html'), path.join('test', 'expected', 'mjml-attr.html'), options, done);
    });

    it('Should inline css in HTML templates', function(done) {
        var options = {
            url: './'
        };
        compare(path.join('test', 'fixtures', 'template.ejs'), path.join('test', 'fixtures', 'template.ejs'), options, done);
    });

    it('Should inline css and create 1:1 attributes on custom tags', function(done) {
        var options = {
            url: './',
            removeStyleTags: true,
            applyAttributesTo: {
              'mj-section': [
                'full-width',
                'text-align',
                'background-color'
              ],
              'mj-section,mj-text': [
                'font-family',
                'color'
              ]
            }
        };
        compare(path.join('test', 'fixtures', 'mjml-attr.html'), path.join('test', 'expected', 'mjml-attr.html'), options, done);
    });

    it('Should inline css in HTML templates', function(done) {
        var options = {
            url: './'
        };
        compare(path.join('test', 'fixtures', 'template.ejs'), path.join('test', 'fixtures', 'template.ejs'), options, done);
    });

    it('Should inline css in edge case and remove html selectors', function(done) {
      var options = {
        removeHtmlSelectors: true
      };
      compare(path.join('test', 'fixtures', 'remove-html-selectors.html'), path.join('test', 'expected', 'remove-html-selectors.html'), options, done);
    });

    it('Should error when passed malformed CSS', function(done) {
        var file = getFile(path.join('test', 'fixtures', 'malformed.html'));
        var options = {
            url: 'file://' + file.path
        };
        inlineCss(file.contents.toString('utf8'), options)
            .then(function(html) {
                done(new Error('test should error when passed malformed CSS'));
            })
            .catch(function(err){
                err.message.should.be.equal('Error: Unexpected } (line 3, char 1)');
                done();
            });
    });

    it('Should handle html character entities correctly', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'character-entities.html'), path.join('test', 'expected', 'character-entities.html'), options, done);
    });

    it('Should error when options.url is not set', function(done) {
        var options = {}
        var file = getFile(path.join('test', 'fixtures', 'template.ejs'));
        inlineCss(file.contents.toString('utf8'), options)
            .then(function(html) {
                done(new Error('test should error when options.url is not set'));
            })
            .catch(function(err){
                done();
            });
    });

    it('Should handle xhtml documents correctly', function(done) {
        var options = {
           xmlMode: true
        };
        compare(path.join('test', 'fixtures', 'xhtml.html'), path.join('test', 'expected', 'xhtml.html'), options, done);
    });
});
