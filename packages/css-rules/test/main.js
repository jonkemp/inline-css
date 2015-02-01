/* jshint node: true */
/* global describe, it */

'use strict';

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    parseCSS = require('../index');

describe('css-rules', function() {
    it('Should return a parse tree for a CSS source', function(done) {
        var css = String(fs.readFileSync(path.join('test', 'fixtures', 'file.css')));
        var rules = parseCSS(css);

        assert.ok(rules);
        assert.equal(rules.length, 4);
        rules.forEach(function (rule) {
            assert.ok(rule);
            assert.equal(rule.length, 2);

            assert.equal(typeof rule[0], 'string');

            assert.ok(rule[1].hasOwnProperty('0'));
            assert.ok(rule[1].hasOwnProperty('length'));
            assert.ok(rule[1].hasOwnProperty('parentRule'));
            assert.ok(rule[1].hasOwnProperty('_importants'));
            assert.ok(rule[1].hasOwnProperty('__starts'));
            assert.ok(rule[1].hasOwnProperty(rule[1]['0']));

            assert.equal(typeof rule[1]['0'], 'string');
            assert.equal(typeof rule[1].length, 'number');
            assert.equal(typeof rule[1].parentRule, 'object');
            assert.equal(typeof rule[1]._importants, 'object');
            assert.equal(typeof rule[1].__starts, 'number');
            assert.equal(typeof rule[1][rule[1]['0']], 'string');
        });
        done();
    });
});
