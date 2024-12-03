const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///利用 requests 请求网站, 爬取网站内容, 如网站链接失败, 可重复爬取 20 次

function requests_link(url, encoding = "utf-8", method = "get", data = null, headers = null) {
    /**
     * 使用 axios 请求网站，抓取网站内容。如果请求失败，最多尝试 20 次。
     * @param {string} url - 网站地址
     * @param {string} encoding - 编码类型: "utf-8", "gbk", "gb2312"
     * @param {string} method - 访问方法: "get", "post"
     * @param {Object} data - 上传数据: 键值对
     * @param {Object} headers - 浏览器请求头: 键值对
     * @return {Promise<AxiosResponse>} 抓取返回的内容
     */
    let i = 0;
    const request = async () => {
        try {
            let response;
            if (method.toLowerCase() === "get") {
                response = await axios.get(url, { timeout: 20000, headers: headers });
            } else if (method.toLowerCase() === "post") {
                response = await axios.post(url, data, { timeout: 20000, headers: headers });
            } else {
                throw new Error("请提供正确的请求方式");
            }
            // 注意：axios 的响应对象没有直接设置编码的方法，通常服务器会正确设置Content-Type头部，
            // 如果需要手动解码，可能需要在接收到的数据上进行额外处理。
            return response;
        } catch (error) {
            i++;
            console.log(`第${i}次链接失败, 最多尝试 20 次`);
            if (i > 20) {
                return null; // 或者抛出错误，取决于你的需求
            } else {
                setTimeout(request, 5000); // 等待5秒后重试
            }
        }
    };

    return request(); // 开始执行请求
}

// 注意：这个函数返回一个Promise，所以调用时需要通过.then或async/await处理结果。
///利用 pandas 提供的 read_html 函数来直接提取网页中的表格内容, 如网站链接失败, 可重复爬取 20 次
const cheerio = require('cheerio');
const dayjs = require('dayjs');  // 假设需要处理日期，这里导入了dayjs
// 如果需要处理复杂的日期操作，可以考虑额外引入dayjs插件

async function pandas_read_html_link(url, encoding = "utf-8", method = "get", data = null, headers = null) {
    /**
     * 使用类似pandas的read_html功能从网页中提取表格内容。
     * 如果网站链接失败，将重试20次。
     *
     * @param {string} url - 网站地址
     * @param {string} encoding - 编码类型: "utf-8", "gbk", "gb2312"
     * @param {string} method - 访问方法: "get", "post"
     * @param {Object} data - POST请求时的数据
     * @param {Object} headers - 请求头信息
     * @return {Promise<Array>} - 解析后的表格数组
     */
    let i = 0;
    while (true) {
        try {
            const response = method === "get" ?
                await axios.get(url, { timeout: 20000 }) :
                await axios.post(url, data, { headers, timeout: 20000 });

            if (response.status !== 200) throw new Error(`Unexpected status code: ${response.status}`);

            const $ = cheerio.load(response.data);
            const tables = [];
            $('table').each((index, element) => {
                const tableData = [];
                $(element).find('tr').each((rowIndex, row) => {
                    const rowData = [];
                    $(row).find('th, td').each((colIndex, col) => {
                        rowData.push($(col).text().trim());
                    });
                    tableData.push(rowData);
                });
                tables.push(tableData);
            });
            return tables;  // 返回解析出的所有表格
        } catch (e) {
            if (e.code === 'ECONNABORTED' || e.message.includes('timeout')) {
                i += 1;
                console.log(`第${i}次连接失败, 最多尝试20次`, e);
                await new Promise(resolve => setTimeout(resolve, 5000));  // 等待5秒后重试
                if (i > 20) {
                    return null;  // 超过最大尝试次数则返回null
                }
            } else {
                throw e;  // 非超时错误抛出
            }
        }
    }
}
module.exports = {
    requests_link: requests_link,
    pandas_read_html_link: pandas_read_html_link,
};