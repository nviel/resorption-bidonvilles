const path = require('path');
const { execSync } = require('child_process');
const watch = require('node-watch');

watch(path.join(path.dirname(__dirname), 'src', 'js'), { recursive: true }, () => {
    execSync('yarn test/run', { stdio: 'inherit' });
});
