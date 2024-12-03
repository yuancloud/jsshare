const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///新加坡交易所-日历计算

async function __fetch_ftse_index_futu(date = "20231108") {
    /**
     * 新加坡交易所-日历计算
     * https://wap.eastmoney.com/quote/stock/100.STI.html
     * @param {string} date - 交易日
     * @returns {number} 日期计算结果
     */
    const url = "https://push2his.eastmoney.com/api/qt/stock/kline/get";
    const params = new URLSearchParams({
        secid: "100.STI",
        klt: "101",
        fqt: "0",
        lmt: "10000",
        end: date,
        iscca: "1",
        fields1: "f1,f2,f3,f4,f5,f6,f7,f8",
        fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64",
        ut: 'f057cbcbce2a86e2866ab8877db1d059',
        forcect: '1'
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        const tempArray = dataJson.data.klines.map(item => item.split(","));
        const tempDf = tempArray.map(row => ({
            date: row[0],
            open: row[2],
            close: row[3],
            high: row[4],
            low: row[5],
            volume: row[6],
            amount: row[7]
        }));
        // 假设tempDf是一个数组对象，我们直接取最后一个元素的索引
        const num = tempDf.length - 1 + 791; // JavaScript数组索引从0开始，所以不需要+1
        return num;
    } catch (error) {
        console.error("Error fetching FTSE index futu:", error);
        throw error;
    }
}
///新加坡交易所-衍生品-历史数据-历史结算价格
const JSZip = require('jszip');
const csv = require('fast-csv');
const { Readable } = require('stream');

async function __fetch_ftse_index_futu(date) {
    // 假设这是获取num的方法，你需要根据实际情况实现
    // 这里只是一个占位符
    return "some_number";  // 需要替换为实际的逻辑
}

async function futures_settlement_price_sgx(date = "20231107") {
    /**
     * 新加坡交易所-衍生品-历史数据-历史结算价格
     * https://www.sgx.com/zh-hans/research-education/derivatives
     * @param {string} date - 交易日
     * @returns {Promise<Array>} - 所有期货品种的在指定交易日的历史结算价格
     */
    const num = await __fetch_ftse_index_futu(date);
    const url = `https://links.sgx.com/1.0.0/derivatives-daily/${num}/FUTURE.zip`;

    try {
        const response = await axios({
            method: 'GET',
            url,
            responseType: 'arraybuffer'
        });

        const zip = new JSZip();
        const content = await zip.loadAsync(response.data);

        for (let [filename, file] of Object.entries(content.files)) {
            if (!file.dir) {
                const data = await file.async("string");
                let parser;
                if (filename.endsWith(".txt")) {
                    parser = csv.parseString(data, { delimiter: '\t' });
                } else {
                    parser = csv.parseString(data, { headers: true });
                }
                
                const rows = [];
                parser.on("data", row => rows.push(row))
                      .on("end", () => {
                          console.log(rows); // 这里可以对rows进行处理
                      });
            }
        }
    } catch (error) {
        console.error(`Error fetching or processing the data: ${error.message}`);
    }
}
module.exports = {
    __fetch_ftse_index_futu : __fetch_ftse_index_futu,
    futures_settlement_price_sgx : futures_settlement_price_sgx,
};