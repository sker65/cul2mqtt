import assert from 'node:assert/strict';
import test from 'node:test';
import {coverAction, coverError, normaliseCover, trackCoverCommand} from '../lib/fs20-cover.js';

const shutter = normaliseCover({});
const awning = normaliseCover({open: 'off', close: 'on', device_class: 'Awning', run_time: 30});

test('cover options default to on = open, off = close, shutter, unknown run time', () => {
    assert.deepEqual(shutter, {open: 'on', close: 'off', deviceClass: 'shutter', runTime: 0});
    assert.deepEqual(awning, {open: 'off', close: 'on', deviceClass: 'awning', runTime: 30});
    assert.equal(coverError(shutter), undefined);
    assert.equal(coverError(awning), undefined);
});

test('invalid cover options are reported', () => {
    assert.match(coverError(normaliseCover({open: 'up'})), /FS20 commands/);
    assert.match(coverError(normaliseCover({open: 'on', close: 'on'})), /different/);
    assert.match(coverError(normaliseCover({device_class: 'roof'})), /device_class/);
    assert.match(coverError(normaliseCover({run_time: -5})), /run_time/);
});

test('open and close send the direction command', () => {
    assert.deepEqual(coverAction(awning, 'open', null), {cmd: 'off'});
    assert.deepEqual(coverAction(awning, 'close', null), {cmd: 'on'});
});

test('stop resends the running movement and does nothing when idle', () => {
    const motion = trackCoverCommand(shutter, 'on', null, 0);
    assert.deepEqual(coverAction(shutter, 'stop', motion, 1000), {cmd: 'on'});
    assert.equal(coverAction(shutter, 'stop', null, 1000).cmd, null);
});

test('the same direction is not resent while it runs, the other one is', () => {
    const motion = trackCoverCommand(shutter, 'on', null, 0);
    assert.equal(coverAction(shutter, 'open', motion, 1000).cmd, null);
    assert.deepEqual(coverAction(shutter, 'close', motion, 1000), {cmd: 'off'});
});

test('sending the running command again stops the movement', () => {
    const motion = trackCoverCommand(shutter, 'on', null, 0);
    assert.equal(trackCoverCommand(shutter, 'on', motion, 1000), null);
    assert.deepEqual(trackCoverCommand(shutter, 'off', motion, 1000), {cmd: 'off', until: Infinity});
    assert.equal(trackCoverCommand(shutter, 'toggle', motion, 1000), null);
});

test('with a run time the movement ends on its own', () => {
    const motion = trackCoverCommand(awning, 'off', null, 0);
    assert.deepEqual(motion, {cmd: 'off', until: 30_000});
    assert.equal(coverAction(awning, 'stop', motion, 29_000).cmd, 'off');
    assert.equal(coverAction(awning, 'stop', motion, 31_000).cmd, null);
    assert.equal(coverAction(awning, 'open', motion, 31_000).cmd, 'off');
    assert.deepEqual(trackCoverCommand(awning, 'off', motion, 31_000), {cmd: 'off', until: 61_000});
});
