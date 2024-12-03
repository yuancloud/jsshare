const express = require('express');
const path = require('path');
const fs = require('fs');
const cache = new Map();

const app = express();
const port = 3000;
let functions = {}

load_path(path.join(__dirname, '../libs/stock'));
load_path(path.join(__dirname, '../libs/stock_feature'));

function mergeDocsFromFiles() {
    return new Promise((resolve, reject) => {
        const docsDir = path.join(__dirname, '../libs');
        let mergedDocs = [];

        // 读取 libs 目录下的所有子目录
        fs.readdir(docsDir, (err, dirs) => {
            if (err) {
                return reject(err);
            }

            // 遍历所有子目录
            const jsonFiles = dirs.map(dir => {
                const jsonFilePath = path.join(docsDir, dir, 'docs.json');
                if (fs.existsSync(jsonFilePath)) {
                    // 读取每个 docs.json 文件并合并内容
                    return new Promise((resolveJson, rejectJson) => {
                        fs.readFile(jsonFilePath, 'utf-8', (readErr, data) => {
                            if (readErr) {
                                return rejectJson(readErr);
                            }

                            try {
                                const jsonData = JSON.parse(data);
                                mergedDocs = mergedDocs.concat(jsonData);  // 合并 JSON 数据
                                resolveJson();
                            } catch (parseErr) {
                                rejectJson(parseErr);
                            }
                        });
                    });
                }
            });

            // 等待所有文件读取完毕
            Promise.all(jsonFiles)
                .then(() => resolve(mergedDocs))
                .catch(reject);
        });
    });
}
// 创建 docs.json 接口
app.get('/docs.html', async (req, res) => {
    try {
        const docs = await mergeDocsFromFiles();
        const htmlTable = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>JsShare Docs</title>
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                        font-size: 20px;
                        text-align: left;
                    }
                    th, td {
                        padding: 12px;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #f4f4f4;
                    }
                </style>
            </head>
            <body>
                <h1>JsShare Docs</h1>
                <table>
                    <thead>
                        <tr>
                          <th>Name</th>
                            <th>Desc</th>
                            <th>HTML</th>
                            <th>API</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${docs
                .map(doc => {
                    const lines = (doc.doc || '').split('\n');
                    let link = '';
                    if (lines.length > 1 && lines[1].startsWith('http')) {
                        link = `<a href="${lines[1]}" target="_blank">${lines[0]}</a>`;
                        lines.splice(0, 1); // Remove the link line after processing
                    }
                    let formattedDoc = lines.splice(1)
                        .join(' ')
                        //.replace(/:param/g, '参数')
                        .replace(/:return:/g, '<br>返回')
                        .replace(/:type/g, '类型');
                    formattedDoc = (formattedDoc.includes(':param') ? "参数:" : "") + formattedDoc.split(':param').join('<br>')
                    return `
                                    <tr>
                                        <td>${link}<br>${doc.name}</td>
                                        <td>${formattedDoc}</td>
                                        <td><a href="/table/${doc.name}" target="_blank">html</a></td>
                                        <td><a href="/api/${doc.name}" target="_blank">api</a></td>
                                    </tr>`;
                })
                .join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
        res.send(htmlTable); // 返回 HTML
    } catch (error) {
        console.error('Error reading docs:', error);
        res.status(500).json({ error: 'Failed to read docs' });
    }
});
app.get('/api/:functionName', async (req, res) => {
    const { functionName } = req.params;
    const params = req.query;

    const cacheKey = JSON.stringify({ functionName, params });

    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 60 * 1000 * 1) { // 1-minute cache expiry
            return res.json(cached.result); // Return cached result
        } else {
            cache.delete(cacheKey); // Remove expired cache
        }
    }

    if (functions[functionName]) {
        try {
            const result = await functions[functionName](...Object.values(params));

            cache.set(cacheKey, { result, timestamp: Date.now() });

            res.json(result);
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    } else {
        res.status(404).json({ success: false, error: 'Function not found' });
    }
});

app.get('/table/:functionName', async (req, res) => {
    const { functionName } = req.params;
    const params = req.query;

    const cacheKey = JSON.stringify({ functionName, params });

    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 60 * 1000 * 5) { // 5-minute cache expiry
            return res.send(cached.result); // Return cached HTML table
        } else {
            cache.delete(cacheKey); // Remove expired cache
        }
    }

    if (functions[functionName]) {
        try {
            const result = await functions[functionName](...Object.values(params));

            // Convert result into an HTML table
            const headers = Object.keys(result[0] || {});
            let htmlTable = `<table border="1"><thead><tr>`;
            headers.forEach(header => {
                htmlTable += `<th>${header}</th>`;
            });
            htmlTable += `</tr></thead><tbody>`;

            result.forEach(row => {
                htmlTable += `<tr>`;
                headers.forEach(header => {
                    htmlTable += `<td>${row[header]}</td>`;
                });
                htmlTable += `</tr>`;
            });

            htmlTable += `</tbody></table>`;

            // Cache the HTML table
            cache.set(cacheKey, { result, timestamp: Date.now() });

            // Send HTML table as the response
            res.send(htmlTable);
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    } else {
        res.status(404).json({ success: false, error: 'Function not found' });
    }
});

app.use(express.static(path.join(__dirname, './../public')));

app.get('/public/:fileName', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/', req.params.fileName));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
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

