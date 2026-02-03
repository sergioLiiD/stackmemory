const Conf = require('conf');
const config = new Conf({ projectName: 'stackmemory-cli' });

console.log('Config Path:', config.path);
console.log('Current Token:', config.get('token'));

if (process.argv[2] === 'set') {
    config.set('test-key', 'test-value-' + Date.now());
    console.log('Set test-key');
}

console.log('Test Key:', config.get('test-key'));
