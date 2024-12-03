const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///郑州商品交易所-交易数据-仓单日报
const XLSX = require('xlsx');

async function futuresCzceWarehouseReceipt(date = "20200702") {
    /**
     * 郑州商品交易所-交易数据-仓单日报
     * http://www.czce.com.cn/cn/jysj/cdrb/H770310index_1.htm
     * @param {string} date - 交易日, e.g., "20200702"
     * @returns {Promise<Object>} 指定日期的仓单日报数据
     */
    const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${date.slice(0, 4)}/${date}/FutureDataWhsheet.xls`;
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
    };

    try {
        const response = await axios.get(url, { headers, responseType: 'arraybuffer' });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const tempSheet = workbook.Sheets[sheetName];
        const tempJson = XLSX.utils.sheet_to_json(tempSheet, { header: 1 });

        // 查找包含“品种”的行索引
        const indexList = _.reduce(tempJson, (acc, row, i) => {
            if (_.isString(row[0]) && row[0].indexOf("品种") === 0) acc.push(i);
            return acc;
        }, []);
        indexList.push(tempJson.length);

        const bigDict = {};
        for (let innerIndex = 0; innerIndex < indexList.length - 1; innerIndex++) {
            const innerJson = tempJson.slice(indexList[innerIndex], indexList[innerIndex + 1]);
            const innerKey = innerJson[0][0].match(/[a-zA-Z]+/)[0];
            const innerArray = innerJson.slice(1).filter(row => !_.every(row, _.isNil));
            const headers = innerArray.shift();
            const innerDataFrame = innerArray.map(row => _.zipObject(headers, row));

            bigDict[innerKey] = innerDataFrame;
        }

        return bigDict;
    } catch (error) {
        console.error(`Error fetching or processing data: ${error.message}`);
        throw error;
    }
}
///大连商品交易所-行情数据-统计数据-日统计-仓单日报
const cheerio = require('cheerio');

async function futuresDceWarehouseReceipt(date = "20200702") {
    /**
     * 大连商品交易所-行情数据-统计数据-日统计-仓单日报
     * http://www.dce.com.cn/dalianshangpin/xqsj/tjsj26/rtj/cdrb/index.html
     * @param {string} date - 交易日, e.g., "20200702"
     * @returns {Promise<Object>} 指定日期的仓单日报数据
     */
    const url = "http://www.dce.com.cn/publicweb/quotesdata/wbillWeeklyQuotes.html";
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
    };
    const params = new URLSearchParams({
        "wbillWeeklyQuotes.variety": "all",
        "year": date.slice(0, 4),
        "month": String(parseInt(date.slice(4, 6)) - 1),
        "day": date.slice(6)
    });

    try {
        const response = await axios.get(url, {params, headers});
        const $ = cheerio.load(response.data);
        const tables = $('table');
        if (tables.length === 0) throw new Error('No table found in the HTML.');
        
        const temp_df = [];
        $(tables[0]).find('tr').each((i, el) => {
            let row = [];
            $(el).find('td, th').each((j, cell) => {
                row.push($(cell).text().trim());
            });
            temp_df.push(row);
        });

        // Find indexes where rows contain '小计'
        const indexList = _.reduce(temp_df, (acc, row, i) => row[0].includes('小计') ? acc.concat(i) : acc, [0]);
        const bigDict = {};

        for (let innerIndex = 0; innerIndex < indexList.length - 1; innerIndex++) {
            const start = innerIndex === 0 ? 0 : indexList[innerIndex] + 1;
            const end = indexList[innerIndex + 1];
            let innerDf = temp_df.slice(start, end + 1);
            let innerKey = innerDf[0][0];

            // Forward fill missing values
            for (let col = 0; col < innerDf[0].length; col++) {
                let lastValue = null;
                for (let row of innerDf) {
                    if (row[col]) lastValue = row[col];
                    else row[col] = lastValue;
                }
            }

            // Special handling for 20240401
            if (date === "20240401" && !innerDf[0][1]) {
                innerDf = innerDf.map(row => [row[0], row[1] || '玉米', ...row.slice(2)]);
                innerKey = innerDf[0][0];
            }

            bigDict[innerKey] = innerDf;
        }

        return bigDict;

    } catch (error) {
        console.error(error);
        throw error;
    }
}
///上海期货交易所指定交割仓库期货仓单日报
const cheerio = require('cheerio');

async function futuresShfeWarehouseReceipt(date = "20200702") {
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
    };
    let url;
    if (date >= "20140519") {
        url = `https://tsite.shfe.com.cn/data/dailydata/${date}dailystock.dat`;
        const response = await axios.get(url, { headers });
        const dataJson = response.data;
        const tempDf = dataJson.o_cursor.map(row => ({
            ...row,
            VARNAME: row.VARNAME.split('$')[0],
            REGNAME: row.REGNAME.split('$')[0],
            WHABBRNAME: row.WHABBRNAME.split('$')[0]
        }));
        const bigDict = _.groupBy(tempDf, 'VARNAME');
        return bigDict;
    } else {
        url = `https://tsite.shfe.com.cn/data/dailydata/${date}dailystock.html`;
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        const tables = $('table');
        const tempDf = [];
        tables.eq(0).find('tr').each((index, tr) => {
            const tds = $(tr).find('td');
            if (tds.length > 3 && tds.eq(3).text().includes('单位：')) {
                // Start of a new table section
                tempDf.push({ header: tds.eq(0).text(), rows: [] });
            } else if (tempDf.length > 0) {
                // Add the row to the current table section
                tempDf[tempDf.length - 1].rows.push(tds.map((i, td) => $(td).text()).get());
            }
        });

        const bigDict = {};
        for (const item of tempDf) {
            const [header, ...rows] = item.rows;
            bigDict[item.header] = rows.map(row => _.zipObject(header, row));
        }
        return bigDict;
    }
}
///广州期货交易所-行情数据-仓单日报

async function futuresGfexWarehouseReceipt(date = "20240122") {
    /**
     * 广州期货交易所-行情数据-仓单日报
     * http://www.gfex.com.cn/gfex/cdrb/hqsj_tjsj.shtml
     * @param {string} date - 交易日, e.g., "20240122"
     * @return {object} - 指定日期的仓单日报数据
     */
    const url = "http://www.gfex.com.cn/u/interfacesWebTdWbillWeeklyQuotes/loadList";
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
    };
    const payload = { gen_date: date };

    try {
        const response = await axios.post(url, payload, { headers });
        const dataJson = response.data;
        let tempData = dataJson.data;

        // 使用lodash来处理数据
        const symbolList = _.uniq(_.map(tempData, 'varietyOrder').filter(item => item !== "").map(item => item.toUpperCase()));

        // 重命名列
        tempData = _.map(tempData, row => ({
            symbol: row.varietyOrder,
            whType: row.whType,
            品种: row.variety,
            仓库_分库: row.whAbbr,
            昨日仓单量: row.lastWbillQty,
            今日仓单量: row.wbillQty,
            增减: row.regWbillQty
        }));

        // 筛选并转换数据类型
        tempData = _.filter(tempData, row => !isNaN(Number(row.whType)));
        tempData = _.map(tempData, row => ({
            ...row,
            昨日仓单量: Number(row.昨日仓单量),
            今日仓单量: Number(row.今日仓单量),
            增减: Number(row.增减)
        }));

        // 构建最终的数据结构
        const bigDict = {};
        for (const symbol of symbolList) {
            const innerTempData = _.filter(tempData, row => row.symbol === symbol.toLowerCase());
            bigDict[symbol] = innerTempData;
        }

        return bigDict;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
module.exports = {
    futures_czce_warehouse_receipt : futures_czce_warehouse_receipt,
    futures_dce_warehouse_receipt : futures_dce_warehouse_receipt,
    futures_shfe_warehouse_receipt : futures_shfe_warehouse_receipt,
    futures_gfex_warehouse_receipt : futures_gfex_warehouse_receipt,
};