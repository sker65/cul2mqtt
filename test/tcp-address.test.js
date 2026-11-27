import test from 'node:test';
import assert from 'node:assert/strict';
import {parseTcpAddress} from '../lib/tcp-address.js';

test('parseTcpAddress tells tcp:// from serial paths', () => {
    assert.equal(parseTcpAddress('/dev/ttyACM0'), null);
    assert.equal(parseTcpAddress('/dev/serial/by-id/usb-busware.de_CUL868-if00'), null);
    assert.deepEqual(parseTcpAddress('tcp://192.0.2.10:10001'), {host: '192.0.2.10', port: 10001});
    assert.deepEqual(parseTcpAddress('TCP://cuno.local:2323/'), {host: 'cuno.local', port: 2323});
    assert.deepEqual(parseTcpAddress('tcp://[2001:db8::1]:2323'), {host: '2001:db8::1', port: 2323});
    assert.throws(() => parseTcpAddress('tcp://192.0.2.10'), /tcp:\/\/host:port/);
    assert.throws(() => parseTcpAddress('tcp://192.0.2.10:0'), /tcp:\/\/host:port/);
    assert.throws(() => parseTcpAddress('tcp://192.0.2.10:2323/x'), /tcp:\/\/host:port/);
    assert.throws(() => parseTcpAddress('tcp://:2323'), /tcp:\/\/host:port/);
});
