const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///同花顺-财务指标-主要指标
const cheerio = require('cheerio');

async function stockFinancialAbstractThs(symbol = '000063', indicator = '按报告期') {
    const url = `https://basic.10jqka.com.cn/new/${symbol}/finance.html`;
    try {
        const response = await axios.get(url, { headers: {} });
        const $ = cheerio.load(response.data);
        const dataText = $('#main').text();
        const dataJson = JSON.parse(dataText);

        const dfIndex = dataJson.title.map(item => Array.isArray(item) ? item[0] : item);

        let tempData, columns;
        if (indicator === '按报告期') {
            tempData = dataJson.report.slice(1);
            columns = dataJson.report[0];
        } else if (indicator === '按单季度') {
            tempData = dataJson.simple.slice(1);
            columns = dataJson.simple[0];
        } else {
            tempData = dataJson.year.slice(1);
            columns = dataJson.year[0];
        }

        // 转换数据格式
        const tempDf = _.zipObject(columns, _.unzip(tempData));
        const transposed = _.mapValues(tempDf, value => ({ ..._.zipObject(dfIndex.slice(1), value) }));
        const result = [{ 报告期: '指标' }, ...columns.map(col => ({ 报告期: col, ...transposed[col] }))];

        return result;
    } catch (error) {
        console.error(`Error fetching or processing data: ${error.message}`);
        throw error;
    }
}

// 注意：此函数返回一个Promise对象，因此需要通过.then()或await来获取结果。
///同花顺-财务指标-资产负债表

async function stockFinancialDebtTHS(symbol = "000063", indicator = "按报告期") {
    /**
     * 同花顺-财务指标-资产负债表
     * @param {string} symbol - 股票代码
     * @param {string} indicator - 指标; choice of {"按报告期", "按年度"}
     * @returns {Promise<Array>} - 返回一个包含同花顺-财务指标-资产负债表数据的数组
     */
    const url = `https://basic.10jqka.com.cn/api/stock/finance/${symbol}_debt.json`;
    try {
        const response = await axios.get(url, { headers: {} });
        const dataJson = JSON.parse(response.data.flashData);

        const dfIndex = _.map(dataJson.title, item => Array.isArray(item) ? item[0] : item);
        let tempData;
        if (indicator === "按报告期") {
            tempData = [dataJson.report[0], ...dataJson.report.slice(1)].map((row, index) => {
                return index > 0 ? { ..._.zipObject(dataJson.report[0], row), 报告期: dfIndex[index] } : row;
            }).slice(1);
        } else {
            tempData = [dataJson.year[0], ...dataJson.year.slice(1)].map((row, index) => {
                return index > 0 ? { ..._.zipObject(dataJson.year[0], row), 报告期: dfIndex[index] } : row;
            }).slice(1);
        }

        // 将数据转换为适合的格式
        const transposedData = _.unzipWith(tempData, (obj, key) => obj[key]);
        transposedData[0].unshift('报告期'); // 添加列名
        return transposedData;
    } catch (error) {
        console.error(error);
        throw new Error(`Error fetching financial debt data for ${symbol}: ${error.message}`);
    }
}
///同花顺-财务指标-利润表

async function stockFinancialBenefitThs(symbol = "000063", indicator = "按报告期") {
    /**
     * 同花顺-财务指标-利润表
     * @param {string} symbol - 股票代码
     * @param {string} indicator - 指标; choice of {"按报告期","按单季度", "按年度"}
     * @returns {Promise<Object>} - 返回同花顺-财务指标-利润表的数据
     */
    const url = `https://basic.10jqka.com.cn/api/stock/finance/${symbol}_benefit.json`;
    try {
        const response = await axios.get(url, { headers: {} });
        const dataJson = JSON.parse(response.data.flashData);
        const dfIndex = dataJson.title.map(item => Array.isArray(item) ? item[0] : item);

        let tempData, columns;
        if (indicator === "按报告期") {
            tempData = dataJson.report.slice(1);
            columns = dataJson.report[0];
        } else if (indicator === "按单季度") {
            tempData = dataJson.simple.slice(1);
            columns = dataJson.simple[0];
        } else {
            tempData = dataJson.year.slice(1);
            columns = dataJson.year[0];
        }

        // Transpose and reformat the data
        const transposedData = [columns, ...tempData].reduce((acc, row, i) => {
            if (i === 0) {
                return acc;
            }
            row.forEach((value, j) => {
                if (!acc[j]) {
                    acc[j] = { "报告期": columns[j] };
                }
                acc[j][dfIndex[i]] = value;
            });
            return acc;
        }, []);

        // Adding the period column to each object
        for (let i = 0; i < transposedData.length; i++) {
            transposedData[i]["报告期"] = columns[i];
        }

        return transposedData;
    } catch (error) {
        console.error(`Error fetching or processing data: ${error}`);
        throw error;
    }
}
///同花顺-财务指标-现金流量表
// 如果需要处理日期，可以解注下面一行
// 
async function stockFinancialCashThs(symbol = "000063", indicator = "按报告期") {
    /**
     * 同花顺-财务指标-现金流量表
     * @param {string} symbol 股票代码
     * @param {string} indicator 指标; choice of {"按报告期","按单季度", "按年度"}
     * @returns {Promise<Array>} 返回一个包含财务数据的数组
     */
    const url = `https://basic.10jqka.com.cn/api/stock/finance/${symbol}_cash.json`;
    try {
        const response = await axios.get(url, { headers: headers });
        const dataJson = JSON.parse(response.data.flashData);
        
        const dfIndex = dataJson.title.map(item => Array.isArray(item) ? item[0] : item);

        let tempData;
        if (indicator === "按报告期") {
            tempData = [dataJson.report[0], ...dataJson.report.slice(1)].map((row, i) => ({...Object.fromEntries(row), 报告期: i > 0 ? dfIndex[i] : '报告期'}));
        } else if (indicator === "按单季度") {
            tempData = [dataJson.simple[0], ...dataJson.simple.slice(1)].map((row, i) => ({...Object.fromEntries(row), 报告期: i > 0 ? dfIndex[i] : '报告期'}));
        } else {
            tempData = [dataJson.year[0], ...dataJson.year.slice(1)].map((row, i) => ({...Object.fromEntries(row), 报告期: i > 0 ? dfIndex[i] : '报告期'}));
        }

        // 将列转为行
        const transposedData = tempData[0].map((_, colIndex) => tempData.map(row => row[colIndex]));

        return transposedData.slice(1).map(row => ({...Object.fromEntries(row), 报告期: row[0]}));
    } catch (error) {
        console.error(`Error fetching financial data: ${error.message}`);
        throw error;
    }
}
///同花顺-公司大事-高管持股变动
const cheerio = require('cheerio');

async function stock_management_change_ths(symbol = "688981") {
    /**
     * 同花顺-公司大事-高管持股变动
     * https://basic.10jqka.com.cn/new/688981/event.html
     * @param {string} symbol - 股票代码
     * @return {Array} - 高管持股变动数据
     */
    const url = `https://basic.10jqka.com.cn/new/${symbol}/event.html`;
    try {
        const response = await axios.get(url, { responseType: 'text', headers: { 'Accept-Encoding': 'gzip, deflate, br' } });
        const html = response.data;
        const $ = cheerio.load(html, { decodeEntities: false });

        const table = $('table.data_table_1.m_table.m_hl');
        if (table.length > 0) {
            const contentList = table.text().trim().split('\n').map(item => item.trim());
            const columnNames = contentList[1].split(/\s+/);
            let row = contentList[3]
                .replace(/ /g, '')
                .replace(/\t/g, '')
                .replace(/\n\n/g, '')
                .replace(/   /g, '\n')
                .replace(/\n\n/g, '\n')
                .split('\n')
                .filter(item => item !== '');
            
            const step = columnNames.length;
            const newRows = [];
            for (let i = 0; i < row.length; i += step) {
                newRows.push(row.slice(i, i + step));
            }

            // 将数组转换为对象数组
            const tempData = newRows.map(items => {
                const obj = {};
                items.forEach((item, index) => {
                    obj[columnNames[index]] = item;
                });
                return obj;
            });

            // 对数据进行排序
            tempData.sort((a, b) => dayjs(a['变动日期']).valueOf() - dayjs(b['变动日期']).valueOf());

            // 格式化日期
            tempData.forEach(item => {
                item['变动日期'] = dayjs(item['变动日期'], 'YYYY-MM-DD').format('YYYY-MM-DD');
            });

            // 重命名列
            const renamedData = tempData.map(item => ({
                ...item,
                '变动数量': item['变动数量（股）'],
                '交易均价': item['交易均价（元）'],
                '剩余股数': item['剩余股数（股）'],
            }));

            return renamedData;
        }
    } catch (error) {
        console.error(error);
    }
    return [];
}
///同花顺-公司大事-股东持股变动
const cheerio = require('cheerio');

async function stockShareholderChangeThs(symbol = "688981") {
    const url = `https://basic.10jqka.com.cn/new/${symbol}/event.html`;
    try {
        const response = await axios.get(url, { responseType: 'text', headers: {} });
        const html = response.data;
        const $ = cheerio.load(html, { decodeEntities: false });

        const table = $('table.m_table.data_table_1.m_hl');
        if (table.length > 0) {
            let contentList = $(table).text().trim().split('\n').map(item => item.trim());
            let columnNames = contentList[1].split(/\s+/);
            let rowContent = contentList[3]
                .replace(/\t/g, "")
                .replace(/\n\n/g, "")
                .replace(/   /g, "\n")
                .replace(/ /g, "")
                .replace(/\n\n/g, "\n")
                .split("\n")
                .filter(item => item !== "");
            
            let newRows = [];
            let step = columnNames.length;
            for (let i = 0; i < rowContent.length; i += step) {
                newRows.push(rowContent.slice(i, i + step));
            }

            // 使用lodash来创建DataFrame类似的结构
            let tempDf = _.fromPairs(_.zip(columnNames, _.transpose(newRows)));
            // 对象数组形式存储
            let rows = _.map(tempDf, (value, key) => ({ [key]: value }));
            // 排序
            rows.sort((a, b) => dayjs(a['公告日期']).diff(dayjs(b['公告日期'])));
            // 转换日期格式
            rows.forEach(row => {
                row['公告日期'] = dayjs(row['公告日期']).toDate();
            });
            // 重命名列
            rows.forEach(row => {
                row['变动数量'] = row['变动数量(股)'];
                row['交易均价'] = row['交易均价(元)'];
                row['剩余股份总数'] = row['剩余股份总数(股)'];
                delete row['变动数量(股)'];
                delete row['交易均价(元)'];
                delete row['剩余股份总数(股)'];
            });

            return rows;
        }
    } catch (error) {
        console.error(error);
    }
    return [];
}
module.exports = {
    stock_financial_abstract_ths : stock_financial_abstract_ths,
    stock_financial_debt_ths : stock_financial_debt_ths,
    stock_financial_benefit_ths : stock_financial_benefit_ths,
    stock_financial_cash_ths : stock_financial_cash_ths,
    stock_management_change_ths : stock_management_change_ths,
    stock_shareholder_change_ths : stock_shareholder_change_ths,
};