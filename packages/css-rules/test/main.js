/* eslint-disable */
/* global describe, it */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const parseCSS = require('../index');

describe('css-rules', () => {
    it('Should return a parse tree for a CSS source', done => {
        const css = String(fs.readFileSync(path.join('test', 'fixtures', 'file.css')));
        const rules = parseCSS(css);

        assert.ok(rules);
        assert.equal(rules.length, 4);
        rules.forEach(rule => {
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

    it('Should error when passed malformed CSS', done => {
        const css = String(fs.readFileSync(path.join('test', 'fixtures', 'malformed.css')));

        try {
           parseCSS(css);
        } catch (err) {
            assert.equal(err.message, 'Unexpected } (line 3, char 1)');
        }
        done();
    });
});
