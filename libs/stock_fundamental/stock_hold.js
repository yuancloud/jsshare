const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///新浪财经-股票-机构持股一览表
const cheerio = require('cheerio');

async function stockInstituteHold(symbol = "20051") {
    /**
     * 新浪财经-股票-机构持股一览表
     * @param {string} symbol 从 2005 年开始, {"一季报":1, "中报":2, "三季报":3, "年报":4}, e.g., "20191", 其中的 1 表示一季报; "20193", 其中的 3 表示三季报;
     * @returns {Promise<Array>} 机构持股一览表
     */
    const url = "https://vip.stock.finance.sina.com.cn/q/go.php/vComStockHold/kind/jgcg/index.phtml";
    const params = {
        p: "1",
        num: "10000",
        reportdate: symbol.slice(0, -1),
        quarter: symbol.slice(-1)
    };

    try {
        const response = await axios.get(url, { params });
        const $ = cheerio.load(response.data);
        const table = $('table').eq(0); // Assuming the first table is the one we need
        const headers = [];
        const rows = [];

        // Parse headers
        $(table).find('tr').first().find('th, td').each(function() {
            headers.push($(this).text());
        });

        // Parse rows
        $(table).find('tr').slice(1).each(function() {
            const cells = $(this).find('td');
            const row = {};
            for (let i = 0; i < cells.length; i++) {
                row[headers[i]] = cells.eq(i).text();
            }
            rows.push(row);
        });

        // Data processing
        const processedRows = rows.map(row => {
            return {
                '证券代码': _.padStart(row['证券代码'], 6, '0'),
                '证券简称': row['证券简称'],
                '机构数': parseFloat(row['机构数']) || null,
                '机构数变化': parseFloat(row['机构数变化']) || null,
                '持股比例': parseFloat(row['持股比例']) || null,
                '持股比例增幅': parseFloat(row['持股比例增幅']) || null,
                '占流通股比例': parseFloat(row['占流通股比例']) || null,
                '占流通股比例增幅': parseFloat(row['占流通股比例增幅']) || null
            };
        });

        // Remove unnecessary column
        const finalData = processedRows.map(row => {
            delete row['明细'];
            return row;
        });

        return finalData;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch data");
    }
}
///新浪财经-股票-机构持股详情

async function stockInstituteHoldDetail(stock = "600433", quarter = "20201") {
    /**
     * 新浪财经-股票-机构持股详情
     * @param {string} stock - 股票代码
     * @param {string} quarter - 从 2005 年开始, {"一季报":1, "中报":2 "三季报":3 "年报":4}, e.g., "20191", 其中的 1 表示一季报; "20193", 其中的 3 表示三季报;
     * @returns {Array} - 指定股票和财报时间的机构持股数据
     */
    const url = "https://vip.stock.finance.sina.com.cn/q/api/jsonp.php/var%20details=/ComStockHoldService.getJGCGDetail";
    const params = {
        symbol: stock,
        quarter: quarter,
    };

    try {
        const response = await axios.get(url, { params });
        let textData = response.data;
        let jsonData = JSON.parse(textData.substring(textData.indexOf("{"), textData.lastIndexOf("}") + 1));

        let bigDf = [];
        for (let item in jsonData.data) {
            let innerTempDf = _.values(jsonData.data[item]).slice(0, -1).map((row, index) => ({ ...row, index }));
            bigDf = bigDf.concat(innerTempDf);
        }

        if (bigDf.length > 0) {
            bigDf = bigDf.map(row => ({
                ...row,
                index: row.index.split("_")[0],
                '持股机构类型': row['index'].replace("fund", "基金").replace("socialSecurity", "全国社保").replace("qfii", "QFII").replace("insurance", "保险")
            }));

            // 截取前12列
            bigDf = bigDf.map(row => _.pick(row, Object.keys(row).slice(0, 12)));

            // 重命名列
            bigDf = bigDf.map(row => ({
                '持股机构类型': row['index'],
                '持股机构代码': row[0],
                '持股机构简称': row[1],
                '持股机构全称': row[2],
                '持股数': parseFloat(row[3]) || 0,
                '最新持股数': parseFloat(row[4]) || 0,
                '持股比例': parseFloat(row[5]) || 0,
                '最新持股比例': parseFloat(row[6]) || 0,
                '占流通股比例': parseFloat(row[7]) || 0,
                '最新占流通股比例': parseFloat(row[8]) || 0,
                '持股比例增幅': parseFloat(row[9]) || 0,
                '占流通股比例增幅': parseFloat(row[10]) || 0,
            }));

            return bigDf;
        } else {
            return [];
        }
    } catch (error) {
        console.error(error);
        return [];
    }
}
module.exports = {
    stock_institute_hold : stock_institute_hold,
    stock_institute_hold_detail : stock_institute_hold_detail,
};