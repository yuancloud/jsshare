const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///openctp 期货交易费用参照表
const cheerio = require('cheerio');

async function futuresFeesInfo() {
    /**
     * 获取openctp期货交易费用参照表
     * @returns {Promise<Array>} 期货交易费用参照表
     */
    const url = "http://openctp.cn/fees.html";

    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer' // 以二进制形式获取响应
        });

        // 将二进制数据转换为字符串，并指定编码格式
        const html = Buffer.from(response.data, 'binary').toString('gb2312');
        const $ = cheerio.load(html);

        // 提取并解析生成时间
        const datetimeStr = $('p').text().replace("Generated at ", "").replace(".", "");
        const datetimeRaw = dayjs(datetimeStr, "YYYY-MM-DD HH:mm:ss");

        // 使用正则表达式从HTML中提取表格内容
        const tableRegexp = /<table[^>]*>([\s\S]*?)<\/table>/;
        const tableMatch = html.match(tableRegexp);
        if (!tableMatch) {
            throw new Error("无法找到表格数据");
        }

        // 解析表格数据
        let tempData = [];
        const tableHtml = tableMatch[0];
        const $table = cheerio.load(tableHtml);
        $table('tr').each((index, element) => {
            if (index === 0) return; // 跳过标题行
            const row = $(element).find('td').map((i, el) => $(el).text()).get();
            row.push(datetimeRaw.format("YYYY-MM-DD HH:mm:ss")); // 添加更新时间
            tempData.push(row);
        });

        return tempData;
    } catch (error) {
        console.error(`请求或解析错误: ${error.message}`);
        throw error;
    }
}
module.exports = {
    futures_fees_info: futures_fees_info,
};