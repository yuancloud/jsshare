const fs = require('fs');
const path = require('path');
const functions = {};
function load_path(libsDir) {
    let dirs = fs.readdirSync(libsDir);
    for (let i = 0; i < dirs.length; i++) {
        const file = dirs[i];
        // Only process .js files
        if (file.endsWith('.js')) {
            const filePath = path.join(libsDir, file);

            // Dynamically require the module
            const module = require(filePath);

            // Check if module has exported functions
            if (typeof module === 'object') {
                let modules = Object.keys(module);
                for (let j = 0; j < modules.length; j++) {
                    let funcName = modules[j];

                    const func = module[funcName];
                    if (typeof func === 'function') {
                        functions[funcName] = module[funcName];
                    }
                }
            }
        }
    }
}
load_path(path.join(__dirname, './libs/stock'));
load_path(path.join(__dirname, './libs/index'));
load_path(path.join(__dirname, './libs/tool'));
load_path(path.join(__dirname, './libs/stock_feature'));

module.exports = functions;
