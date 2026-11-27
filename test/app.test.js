import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import pkg from '../package.json' with {type: 'json'};

// The Home Assistant app builds the GitHub tag v<config.yaml version>: both must match.
test('the Home Assistant app version matches package.json', () => {
    const config = readFileSync(new URL('../cul2mqtt/config.yaml', import.meta.url), 'utf8');
    const version = config.match(/^version:\s*['"]?([^'"\s]+)/m)?.[1];
    assert.equal(version, pkg.version);
});
