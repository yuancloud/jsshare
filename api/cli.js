const fs = require('fs');
const path = require('path');

async function main() {
    // Specify the directory containing the JS files
    const libsDir = path.join(__dirname, '../libs/stock_feature');  // Adjust the path if necessary
    let dirs = fs.readdirSync(libsDir)
    for (let i = 5; i < dirs.length; i++) {
        const file = dirs[i];
        // Only process .js files
        if (file.endsWith('.js')) {
            const filePath = path.join(libsDir, file);

            // Dynamically require the module
            const module = require(filePath);

            // Check if module has exported functions
            if (typeof module === 'object') {
                let modules = Object.keys(module)
                for (let j = 0; j < modules.length; j++) {
                    let funcName = modules[j]

                    const func = module[funcName];
                    if (typeof func === 'function') {
                        console.log(`[${i}/${j}]Invoking ${funcName} from ${file}`);

                        // Call the function and await its result
                        try {
                            let result = await func();  // Assuming func is an async function that returns an array-like result

                            // Log the result as a table
                            if (Array.isArray(result)) {
                                console.table(result);  // This will print the array as a table in the console
                            } else {
                                console.log(result);  // If the result isn't an array, just log it
                            }
                        } catch (error) {
                            console.error(`Error invoking ${funcName}:`, error);
                        }
                    }
                }
            }
        }
    }
}

(async () => {
    await main();
})();
