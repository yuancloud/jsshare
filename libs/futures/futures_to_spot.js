const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///上海期货交易所-期转现

async function futuresToSpotShfe(date = "202312") {
    /**
     * 上海期货交易所-期转现
     * https://tsite.shfe.com.cn/statements/dataview.html?paramid=kx
     * 1、铜、铜(BC)、铝、锌、铅、镍、锡、螺纹钢、线材、热轧卷板、天然橡胶、20号胶、低硫燃料油、燃料油、石油沥青、纸浆、不锈钢的数量单位为：吨；
     * 黄金的数量单位为：克；白银的数量单位为：千克；原油的数量单位为：桶。
     * 2、交割量、期转现量为单向计算。
     * @param {string} date - 年月
     * @return {Promise<Array>} 返回上海期货交易所期转现数据
     */
    const url = `https://tsite.shfe.com.cn/data/instrument/ExchangeDelivery${date}.dat`;
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
    };

    try {
        const response = await axios.get(url, { headers });
        const dataJson = response.data;
        let tempData = dataJson.ExchangeDelivery.map(item => ({
            日期: item[1],
            合约: item[5],
            交割量: parseFloat(item[2]) || 0,
            期转现量: parseFloat(item[4]) || 0
        }));

        // 转换日期格式
        tempData = tempData.map(row => ({
            ...row,
            日期: dayjs(row.日期, 'YYYYMMDD').toDate()
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        throw error;
    }
}
///大连商品交易所-交割统计
const cheerio = require('cheerio');

async function futuresDeliveryDce(date = "202312") {
    const url = "http://www.dce.com.cn/publicweb/quotesdata/delivery.html";
    const params = {
        "deliveryQuotes.variety": "all",
        "year": "",
        "month": "",
        "deliveryQuotes.begin_month": date,
        "deliveryQuotes.end_month": (parseInt(date) + 1).toString(),
    };
    const headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Pragma": "no-cache",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
    };

    try {
        const response = await axios.post(url, null, { params, headers });
        const $ = cheerio.load(response.data);
        const table = $('table').first();
        const rows = [];
        table.find('tr').each((index, row) => {
            if (index > 0) { // Skip header
                const columns = $(row).find('td');
                const deliveryDate = $(columns[0]).text().split('.')[0];
                const variety = $(columns[1]).text();
                const deliveryQuantity = parseFloat($(columns[2]).text().replace(/,/g, ''));
                const deliveryAmount = parseFloat($(columns[3]).text().replace(/,/g, ''));

                if (!variety.includes('小计') && !variety.includes('总计')) {
                    rows.push({
                        交割日期: dayjs(deliveryDate, 'YYYYMMDD').toDate(),
                        品种: variety,
                        交割量: _.isNaN(deliveryQuantity) ? null : deliveryQuantity,
                        交割金额: _.isNaN(deliveryAmount) ? null : deliveryAmount
                    });
                }
            }
        });

        return rows;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;
    }
}
///大连商品交易所-期转现
const cheerio = require('cheerio');

async function futuresToSpotDce(date = "202312") {
    /**
     * 大连商品交易所-期转现
     * @param {string} date - 期转现日期
     * @returns {Array<Object>} - 大连商品交易所-期转现数据
     */
    const url = "http://www.dce.com.cn/publicweb/quotesdata/ftsDeal.html";
    const params = new URLSearchParams({
        "ftsDealQuotes.variety": "all",
        "year": "",
        "month": "",
        "ftsDealQuotes.begin_month": date,
        "ftsDealQuotes.end_month": date,
    });

    try {
        const response = await axios.post(url, params);
        const $ = cheerio.load(response.data);
        const tempTable = $('table').eq(0); // 假设我们需要的第一个表格
        let tempData = [];

        tempTable.find('tr').each((index, tr) => {
            if (index > 0) { // 跳过表头
                const tds = $(tr).find('td');
                const rowData = {
                    '期转现发生日期': $(tds[0]).text(),
                    '合约代码': $(tds[1]).text(),
                    '期转现数量': $(tds[2]).text() // 假设期转现数量在第三列
                    // 其他列可以根据实际情况添加
                };
                tempData.push(rowData);
            }
        });

        // 数据清理
        tempData = tempData.filter(item => !item['合约代码'].includes('小计') && !item['合约代码'].includes('总计'));
        tempData.forEach(item => {
            item['期转现发生日期'] = dayjs(item['期转现发生日期'].split('.')[0], 'YYYYMMDD').toDate();
            item['期转现数量'] = Number(item['期转现数量']) || 0; // 如果转换失败则默认为0
        });

        return tempData;
    } catch (error) {
        console.error("Error fetching data: ", error);
        throw error;
    }
}
///大连商品交易所-交割配对表
const { readHTMLTable } = require('html-table-to-json'); // 假设有一个库可以将HTML表格转为JSON对象

async function futuresDeliveryMatchDce(symbol = "a") {
    /**
     * 大连商品交易所-交割配对表
     * http://www.dce.com.cn/dalianshangpin/xqsj/tjsj26/jgtj/jgsj/index.html
     * @param {string} symbol - 交割品种
     * @returns {Array<Object>} - 大连商品交易所-交割配对表
     */
    const url = "http://www.dce.com.cn/publicweb/quotesdata/deliveryMatch.html";
    const params = new URLSearchParams({
        'deliveryMatchQuotes.variety': symbol,
        'contract.contract_id': 'all',
        'contract.variety_id': symbol,
    });

    try {
        const response = await axios.post(url, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const tempData = readHTMLTable(response.data)[0]; // 假设返回的数据是HTML格式的，并且我们只关心第一个表格

        // 处理配对日期
        tempData.forEach(row => {
            row['配对日期'] = _.split(_.toString(row['配对日期']), '.', 1)[0];
        });

        // 移除最后一行
        tempData.pop();

        // 转换日期
        tempData.forEach(row => {
            row['配对日期'] = dayjs(row['配对日期'], 'YYYYMMDD', true).toDate();
        });

        // 转换数字
        tempData.forEach(row => {
            row['配对手数'] = _.toNumber(row['配对手数']);
            row['交割结算价'] = _.toNumber(row['交割结算价']);
        });

        return tempData;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        throw error;
    }
}
///郑州商品交易所-期转现统计
const XLSX = require('xlsx');

async function futuresToSpotCzce(date = '20231228') {
    const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${date.slice(0, 4)}/${date}/FutureDataTrdtrades.xls`;
    const headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Host": "www.czce.com.cn",
        "Pragma": "no-cache",
        "Referer": "http://www.czce.com.cn/",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
    };

    try {
        const response = await axios.get(url, { headers, responseType: 'arraybuffer' });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const tempData = XLSX.utils.sheet_to_json(worksheet, { header: 1, skipRows: 1 });

        // 设置列名
        const columns = ["合约代码", "合约数量"];
        const data = tempData.map(row => _.zipObject(columns, row));

        // 数据清洗
        data.forEach(item => {
            item["合约数量"] = item["合约数量"].toString().replace(/,/g, '');
            item["合约数量"] = parseFloat(item["合约数量"]) || null;
        });

        // 过滤掉包含“小计”或“合计”的行
        const filteredData = _.filter(data, item => !_.includes(item["合约代码"], "小计") && !_.includes(item["合约代码"], "合计"));

        return filteredData;
    } catch (error) {
        console.error(`Error fetching or processing the data: ${error.message}`);
        throw error;
    }
}
///郑州商品交易所-交割配对
const XLSX = require('xlsx');

async function futuresDeliveryMatchCzce(date = "20210106") {
    const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${date.slice(0, 4)}/${date}/FutureDataDelsettle.xls`;
    try {
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const temp_df = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        let indexFlag = [];
        for (let i = 0; i < temp_df.length; i++) {
            if (temp_df[i][0] && temp_df[i][0].includes("配对日期")) {
                indexFlag.push(i);
            }
        }

        let big_df = [];

        for (let i = 0; i < indexFlag.length; i++) {
            let end = (i + 1 < indexFlag.length) ? indexFlag[i + 1] : temp_df.length;
            let tempInnerDf = temp_df.slice(indexFlag[i] + 1, end - 1);

            // Set the header as the first row of the current block
            let headers = tempInnerDf.shift();
            tempInnerDf = tempInnerDf.map(row => Object.fromEntries(headers.map((h, j) => [h, row[j]])));

            // Extract date and symbol from the header line
            let dateContractStr = temp_df[indexFlag[i]][0];
            let innerDate = dateContractStr.split("：")[1].split(" ")[0];
            let symbol = dateContractStr.split("：").pop();

            // Add date and symbol to each record
            tempInnerDf.forEach(record => {
                record['配对日期'] = innerDate;
                record['合约代码'] = symbol;
            });

            big_df = big_df.concat(tempInnerDf);
        }

        // Adjust column names and format
        big_df = big_df.map(row => ({
            '卖方会员': row['卖方会员'],
            '卖方会员-会员简称': row['卖方会员-会员简称'],
            '买方会员': row['买方会员'],
            '买方会员-会员简称': row['买方会员-会员简称'],
            '交割量': parseInt(row['交割量'].replace(',', ''), 10),
            '配对日期': row['配对日期'],
            '合约代码': row['合约代码']
        }));

        return big_df;

    } catch (error) {
        console.error(`Error fetching or processing data: ${error}`);
        throw error;
    }
}
///郑州商品交易所-月度交割查询
const XLSX = require('xlsx');

async function futuresDeliveryCzce(date = "20210112") {
    /**
     * 郑州商品交易所-月度交割查询
     * @param {string} date - 年月日
     * @returns {Promise<Array>} 返回包含交割信息的对象数组
     */
    const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${date.slice(0, 4)}/${date}/FutureDataSettlematched.xls`;

    try {
        const response = await axios({
            url,
            responseType: 'arraybuffer' // 确保以二进制格式接收响应
        });

        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        let tempData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // 假设第一行是标题行，跳过它
        const headers = tempData.shift();
        // 将列名映射到中文
        const columnMapping = ["品种", "交割数量", "交割额"];
        headers.forEach((_, index) => {
            if (index < columnMapping.length) {
                headers[index] = columnMapping[index];
            }
        });

        // 清洗数据
        const cleanedData = _.map(tempData, row => {
            return _.zipObject(headers, row.map(cell => {
                if (typeof cell === 'string') {
                    return cell.replace(/,/g, '');
                }
                return cell;
            }));
        });

        // 转换数值类型
        return cleanedData.map(item => ({
            ...item,
            "交割数量": parseFloat(item["交割数量"]),
            "交割额": parseFloat(item["交割额"])
        }));

    } catch (error) {
        console.error("Error fetching or processing data:", error);
        throw error; // 或者根据需要处理错误
    }
}
///上海期货交易所-交割情况表

async function futuresDeliveryShfe(date = "202312") {
    /**
     * 上海期货交易所-交割情况表
     * https://tsite.shfe.com.cn/statements/dataview.html?paramid=kx
     * 注意: 日期 -> 月度统计 -> 下拉到交割情况表
     * @param {string} date - 年月日
     * @returns {Promise<Array>} - 上海期货交易所-交割情况表
     */
    const url = `https://tsite.shfe.com.cn/data/dailydata/${date}monthvarietystatistics.dat`;
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
    };

    try {
        const response = await axios.get(url, { headers });
        const dataJson = response.data;
        let tempData = dataJson.o_curdelivery;

        // 重命名列
        const columns = [
            "品种",
            "品种代码",
            "_",
            "交割量-本月",
            "交割量-比重",
            "交割量-本年累计",
            "交割量-累计同比",
        ];
        tempData = _.map(tempData, (item) => {
            return _.zipObject(columns, item);
        });

        // 选择需要的列
        tempData = _.map(tempData, (item) => {
            return _.pick(item, ["品种", "交割量-本月", "交割量-比重", "交割量-本年累计", "交割量-累计同比"]);
        });

        // 将字符串转换为数值
        tempData = _.map(tempData, (item) => {
            return _.mapValues(item, (value, key) => {
                if (key !== "品种") {
                    return _.toNumber(value);
                }
                return value;
            });
        });

        return tempData;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        throw error;
    }
}

// 不生成调用该方法的示例
module.exports = {
    futures_to_spot_shfe: futures_to_spot_shfe,
    futures_delivery_dce: futures_delivery_dce,
    futures_to_spot_dce: futures_to_spot_dce,
    futures_delivery_match_dce: futures_delivery_match_dce,
    futures_to_spot_czce: futures_to_spot_czce,
    futures_delivery_match_czce: futures_delivery_match_czce,
    futures_delivery_czce: futures_delivery_czce,
    futures_delivery_shfe: futures_delivery_shfe,
};