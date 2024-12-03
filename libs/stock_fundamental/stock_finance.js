const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///新浪财经-财务报表-三大报表

async function stockFinancialReportSina(stock = "sh600600", symbol = "资产负债表") {
    /**
     * 新浪财经-财务报表-三大报表
     * https://vip.stock.finance.sina.com.cn/corp/go.php/vFD_FinanceSummary/stockid/600600/displaytype/4.phtml?source=fzb&qq-pf-to=pcqq.group
     * @param {string} stock - 股票代码
     * @param {string} symbol - 选择{"资产负债表", "利润表", "现金流量表"}
     * @return {Object} 新浪财经-财务报表-三大报表
     */
    const symbolMap = {"资产负债表": "fzb", "利润表": "lrb", "现金流量表": "llb"};
    const url = "https://quotes.sina.cn/cn/api/openapi.php/CompanyFinanceService.getFinanceReport2022";
    const params = {
        paperCode: stock,
        source: symbolMap[symbol],
        type: "0",
        page: "1",
        num: "100"
    };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        const dfColumns = dataJson.result.data.report_date.map(item => item.date_value);
        let bigDf = {};
        for (const dateStr of dfColumns) {
            let tempDf = dataJson.result.data.report_list[dateStr].data.reduce((acc, curr) => {
                acc[curr.item_title] = parseFloat(curr.item_value) || null;
                return acc;
            }, {});
            const metaData = {
                '数据源': dataJson.result.data.report_list[dateStr].data_source,
                '是否审计': dataJson.result.data.report_list[dateStr].is_audit,
                '公告日期': dataJson.result.data.report_list[dateStr].publish_date,
                '币种': dataJson.result.data.report_list[dateStr].rCurrency,
                '类型': dataJson.result.data.report_list[dateStr].rType,
                '更新日期': dayjs.unix(dataJson.result.data.report_list[dateStr].update_time).toISOString()
            };
            Object.assign(tempDf, metaData);
            bigDf[dateStr] = tempDf;
        }

        // 将bigDf转换为DataFrame格式
        const columns = Object.keys(bigDf[dfColumns[0]]);
        const rows = dfColumns.map(date => [date, ...columns.map(col => bigDf[date][col])]);
        const result = [columns, ...rows];

        // 移除重复的列
        const uniqueColumns = [...new Set(columns)];
        const filteredResult = [uniqueColumns, ...rows.map(row => uniqueColumns.map(col => row[columns.indexOf(col) + 1]))];

        return filteredResult;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
///新浪财经-财务报表-关键指标

async function stockFinancialAbstract(symbol = '600004') {
    const url = "https://quotes.sina.cn/cn/api/openapi.php/CompanyFinanceService.getFinanceReport2022";
    const params = {
        paperCode: `sh${symbol}`,
        source: "gjzb",
        type: "0",
        page: "1",
        num: "100",
    };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data;
        const keyList = Object.keys(dataJson.result.data.report_list);

        let bigDf = _.map(dataJson.result.data.report_list[keyList[0]].data, 'item_title');
        for (let item of keyList) {
            const tempDf = _.map(dataJson.result.data.report_list[item].data, 'item_value');
            bigDf = _.zip(bigDf, tempDf);
        }

        // 转换为二维数组
        bigDf = bigDf.map(row => Array.from(row));

        // 处理数据
        const processSection = (start, end, label) => {
            const section = _.slice(bigDf, _.findIndex(bigDf, row => row[0] === start) + 1,
                _.findIndex(bigDf, row => row[0] === end));
            return section.map(row => [label, ...row]);
        };

        const bigOneDf = processSection('常用指标', '每股指标', '常用指标');
        const bigTwoDf = processSection('每股指标', '盈利能力', '每股指标');
        const bigThreeDf = processSection('盈利能力', '成长能力', '盈利能力');
        const bigFourDf = processSection('成长能力', '收益质量', '成长能力');
        const bigFiveDf = processSection('收益质量', '财务风险', '收益质量');
        const bigSixDf = processSection('财务风险', '营运能力', '财务风险');
        const bigSevenDf = processSection('营运能力', undefined, '营运能力');

        bigDf = _.concat(bigOneDf, bigTwoDf, bigThreeDf, bigFourDf, bigFiveDf, bigSixDf, bigSevenDf);
        keyList.unshift('选项');
        keyList.unshift('指标');
        bigDf = [keyList, ...bigDf];

        // 将非数值转换为NaN
        for (let i = 2; i < bigDf[0].length; i++) {
            for (let j = 1; j < bigDf.length; j++) {
                bigDf[j][i] = Number(bigDf[j][i]) || NaN;
            }
        }

        return bigDf;
    } catch (error) {
        console.error(error);
    }
}
///新浪财经-财务分析-财务指标
const cheerio = require('cheerio');

async function stockFinancialAnalysisIndicator(symbol = '600004', startYear = '1900') {
    const url = `https://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/${symbol}/ctrl/2020/displaytype/4.phtml`;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const yearContext = $('#con02-1 table a');
        let yearList = _.map(yearContext, (item) => $(item).text());

        if (yearList.includes(startYear)) {
            yearList = yearList.slice(0, yearList.indexOf(startYear) + 1);
        }

        let outDF = [];
        for (const yearItem of yearList) {
            const url = `https://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/${symbol}/ctrl/${yearItem}/displaytype/4.phtml`;
            const response = await axios.get(url);
            const tempDF = parseTableFromHTML(response.data, 12);

            // 处理表格数据
            const bigDF = processTableData(tempDF, [
                "每股指标",
                "盈利能力",
                "成长能力",
                "营运能力",
                "偿债及资本结构",
                "现金流量",
                "其他指标"
            ]);

            outDF = outDF.concat(bigDF);
        }

        // 数据清洗
        outDF = _.filter(outDF, row => !_.every(row, _.isNaN));
        outDF = _.map(outDF, (row, index) => {
            return { 日期: tempDF.columns[1], ...(_.fromPairs(_.zip(tempDF.columns.slice(1), row))) };
        });

        // 排序
        outDF.sort((a, b) => dayjs(a.日期).isBefore(dayjs(b.日期)) ? -1 : 1);

        // 转换日期和数值
        outDF = _.map(outDF, row => ({
            日期: dayjs(row.日期, 'YYYY-MM-DD').toDate(),
            ...(_.mapValues(_.omit(row, ['日期']), value => _.toNumber(value)))
        }));

        return outDF;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function parseTableFromHTML(html, tableIndex) {
    // 这里应该实现从HTML中解析表格的功能
    // 使用cheerio或其他方法提取表格并转换为二维数组
    // 由于JavaScript没有内置的类似pandas.read_html的方法，这部分需要自定义
    // 本示例中省略具体实现
}

function processTableData(data, indicators) {
    // 实现对数据的处理逻辑
    // 本示例中省略具体实现
}

// 注意：parseTableFromHTML 和 processTableData 函数需要根据实际情况来实现。
///新浪财经-发行与分配-历史分红
const cheerio = require('cheerio');

async function stockHistoryDividend() {
    const url = "https://vip.stock.finance.sina.com.cn/q/go.php/vInvestConsult/kind/lsfh/index.phtml";
    const params = { p: "1", num: "50000" };
    
    try {
        const response = await axios.get(url, { params });
        const $ = cheerio.load(response.data);
        
        // 假设我们需要的数据在表格中，且该表格是页面上唯一的表格。
        const table = $('table').first();
        const rows = [];
        table.find('tr').each((i, row) => {
            if (i === 0) return; // 跳过表头
            const cells = $(row).find('td');
            const code = _.padStart(cells.eq(0).text(), 6, '0'); // 确保代码长度为6位
            const name = cells.eq(1).text();
            const listingDate = dayjs(cells.eq(2).text(), 'YYYY-MM-DD', true).toDate(); // 尝试转为日期
            const cumulativeDividend = parseFloat(cells.eq(3).text()) || null;
            const averageAnnualDividend = parseFloat(cells.eq(4).text()) || null;
            const dividendCount = parseInt(cells.eq(5).text()) || null;
            const totalFinancing = parseFloat(cells.eq(6).text()) || null;
            const financingCount = parseInt(cells.eq(7).text()) || null;
            
            rows.push({
                代码: code,
                名称: name,
                上市日期: listingDate,
                累计股息: cumulativeDividend,
                年均股息: averageAnnualDividend,
                分红次数: dividendCount,
                融资总额: totalFinancing,
                融资次数: financingCount
            });
        });

        // 删除不需要的列
        const result = rows.map(row => _.omit(row, ['详细']));
        return result;
    } catch (error) {
        console.error("Error fetching or parsing data:", error);
        throw error;
    }
}

// 注意：此函数返回的是一个Promise对象，需要通过异步方式调用。
///新浪财经-发行与分配-分红配股详情
const cheerio = require('cheerio');

async function stockHistoryDividendDetail(symbol = '000002', indicator = '分红', date = '') {
    const base_url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vISSUE_ShareBonus/stockid/${symbol}.phtml`;

    let url, params;
    if (indicator === "分红") {
        url = base_url;
        if (date) {
            url = "https://vip.stock.finance.sina.com.cn/corp/view/vISSUE_ShareBonusDetail.php";
            params = { stockid: symbol, type: "1", end_date: date };
        }
    } else {
        url = base_url;
        if (date) {
            url = "https://vip.stock.finance.sina.com.cn/corp/view/vISSUE_ShareBonusDetail.php";
            params = { stockid: symbol, type: "1", end_date: date };
        }
    }

    try {
        const response = await axios.get(url, { params });
        const $ = cheerio.load(response.data);
        let tableIndex = 12; // 分红情况下
        if (indicator !== "分红") tableIndex = 13; // 配股情况下

        const rows = $(`table:eq(${tableIndex - 1}) tr`);
        const headers = $(rows[0]).find('th').map((i, el) => $(el).text().trim()).get();
        const data = [];
        
        for (let i = 1; i < rows.length; i++) {
            const row = $(rows[i]);
            const cells = row.find('td').map((i, el) => $(el).text().trim()).get();
            if (cells[0] === "暂时没有数据！") return []; // 如果没有数据，返回空数组
            const record = {};
            headers.forEach((header, index) => {
                record[header] = cells[index];
            });
            data.push(record);
        }

        // 处理日期和数值转换
        data.forEach(item => {
            item['公告日期'] = dayjs(item['公告日期']).toDate();
            if (indicator === "分红") {
                ['送股', '转增', '派息'].forEach(key => item[key] = parseFloat(item[key]));
                ['除权除息日', '股权登记日', '红股上市日'].forEach(key => item[key] = dayjs(item[key], 'YYYY-MM-DD').toDate());
            } else {
                ['配股方案', '配股价格', '基准股本', '募集资金合计'].forEach(key => item[key] = parseFloat(item[key]));
                ['除权日', '股权登记日', '缴款起始日', '缴款终止日', '配股上市日'].forEach(key => item[key] = dayjs(item[key], 'YYYY-MM-DD').toDate());
            }
        });

        return data;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        return [];
    }
}

// 注意：此函数返回的是一个对象数组，而不是DataFrame。
///新浪财经-发行与分配-新股发行
const cheerio = require('cheerio');

async function stock_ipo_info(stock = "600004") {
    /**
     * 获取新浪财经-发行与分配-新股发行信息
     * @param {string} stock - 股票代码，默认为"600004"
     * @returns {Promise<Array>} 返回一个包含新股发行详情的对象数组，每个对象都有item和value属性
     */
    const url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vISSUE_NewStock/stockid/${stock}.phtml`;
    
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        // 假设我们需要的是页面中的第13个表格
        const table = $('table').eq(12);  // 注意：索引从0开始，因此第13个是12
        let data = [];
        
        table.find('tr').each((index, element) => {
            if (index > 0) {  // 跳过表头
                const tds = $(element).find('td');
                const item = $(tds[0]).text().trim();
                const value = $(tds[1]).text().trim();
                data.push({ item, value });
            }
        });

        return data;
    } catch (error) {
        console.error(`Error fetching or parsing data: ${error}`);
        throw error;  // 或者返回一个空数组或错误信息
    }
}

// 导出函数以便在其他地方使用
module.exports = stock_ipo_info;
///新浪财经-发行与分配-增发

async function stock_add_stock(symbol = "688166") {
    /**
     * 新浪财经-发行与分配-增发
     * @param {string} symbol - 股票代码
     * @returns {Promise<Array>} 增发详情
     */
    const url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vISSUE_AddStock/stockid/${symbol}.phtml`;
    
    try {
        const response = await axios.get(url);
        // 假设我们已经有了一个函数parseHtmlTables，它能解析HTML并返回表格数组
        const tables = parseHtmlTables(response.data);  // 这里需要实现或导入一个函数来模拟pd.read_html的行为
        let temp_df = tables[12];
        
        if (temp_df[0][0] === "对不起，暂时没有相关增发记录") {
            throw new Error(`股票 ${symbol} 无增发记录`);
        }

        let big_df = [];
        for (let i = 0; i < Math.floor(temp_df[0][1].length / 10); i++) {
            let currentTable = tables[13 + i].slice(1).map(row => row[1]);
            big_df.push({
                [currentTable.name.split(" ")[1].split("：")[1].substring(0, 10)]: currentTable
            });
        }

        big_df = _.flatMap(big_df, obj => Object.entries(obj));
        big_df = _.fromPairs(big_df).map((value, key) => ({ "公告日期": key, ...value }));
        big_df.forEach(item => item["公告日期"] = dayjs(item["公告日期"]).toDate());

        return big_df;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// 注意：上述代码中的parseHtmlTables函数是一个假设的函数，你需要根据实际情况实现或找到合适的库来解析HTML表格。
///新浪财经-发行分配-限售解禁
const cheerio = require('cheerio');

async function stockRestrictedReleaseQueueSina(symbol = "600000") {
    /**
     * 新浪财经-发行分配-限售解禁
     * @param {string} symbol - 股票代码
     * @returns {Promise<Array>} 返回限售解禁数据
     */
    const url = `https://vip.stock.finance.sina.com.cn/q/go.php/vInvestConsult/kind/xsjj/index.phtml?symbol=${symbol}`;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const table = $('table').eq(0); // 假设我们要的数据是页面中的第一个表格

        let tempData = [];
        table.find('tr').each((i, el) => {
            if (i === 0) return; // 跳过标题行
            const tds = $(el).find('td');
            tempData.push({
                代码: $(tds[0]).text(),
                名称: $(tds[1]).text(),
                解禁日期: dayjs($(tds[2]).text(), 'YYYY-MM-DD', true).toDate(),
                解禁数量: parseFloat($(tds[3]).text().replace(/,/g, '')) || null,
                解禁股流通市值: parseFloat($(tds[4]).text().replace(/,/g, '')) || null,
                上市批次: parseInt($(tds[5]).text()) || null,
                公告日期: dayjs($(tds[6]).text(), 'YYYY-MM-DD', true).toDate()
            });
        });

        return tempData;
    } catch (error) {
        console.error(`Error fetching data for symbol ${symbol}:`, error);
        throw error;
    }
}

// 注意：此函数返回的是一个Promise，需要通过.then()或await来获取结果。
///新浪财经-股东股本-流通股东
const cheerio = require('cheerio');

async function stockCirculateStockHolder(symbol = "600000") {
    const url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vCI_CirculateStockHolder/stockid/${symbol}.phtml`;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        let tempDf = [];
        // 假设第14个表格是我们需要的（因为Python中的索引是从0开始的）
        $('table').eq(13).find('tr').each((index, row) => {
            const cells = $(row).find('td').slice(0, 5).map((_, cell) => $(cell).text().trim()).get();
            if (cells.length > 0) tempDf.push(cells);
        });

        const bigDf = [];
        const needRange = tempDf
            .map((row, index) => (row[0].indexOf("截止日期") === 0 ? index : -1))
            .filter(index => index !== -1)
            .concat([tempDf.length]);

        for (let i = 0; i < needRange.length - 1; i++) {
            const truncatedDf = tempDf.slice(needRange[i], needRange[i + 1]);
            const cleanTruncatedDf = truncatedDf.filter(row => !row.every(cell => cell === ''));

            const headerRow = cleanTruncatedDf[0];
            const dataRows = cleanTruncatedDf.slice(2).map(row => ({
                ...Object.fromEntries(headerRow.map((key, index) => [key, row[index]])),
                ...cleanTruncatedDf[1]
            }));

            dataRows.forEach(row => {
                row['截止日期'] = row['截止日期'] || dataRows[dataRows.indexOf(row) - 1]['截止日期'];
                row['公告日期'] = row['公告日期'] || dataRows[dataRows.indexOf(row) - 1]['公告日期'];
            });

            bigDf.push(...dataRows);
        }

        const finalDf = bigDf.map(row => ({
            '截止日期': dayjs(row['截止日期'], 'YYYY-MM-DD').toDate(),
            '公告日期': dayjs(row['公告日期'], 'YYYY-MM-DD').toDate(),
            '编号': parseInt(row['编号']) || null,
            '股东名称': row['股东名称'],
            '持股数量': parseInt(row['持股数量(股)'].replace(/,/g, '')) || null,
            '占流通股比例': parseFloat(row['占流通股比例(%)']) || null,
            '股本性质': row['股本性质']
        }));

        return finalDf;
    } catch (error) {
        console.error(`Error fetching or parsing data: ${error.message}`);
        throw error;
    }
}

// 注意：在实际使用中，你需要安装所需的npm包，并且可能需要调整一些细节以适应你的环境。
///新浪财经-股本股东-基金持股
const cheerio = require('cheerio');

async function stockFundStockHolder(symbol = "600004") {
    const url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vCI_FundStockHolder/stockid/${symbol}.phtml`;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const tables = $('table');
        let temp_df = [];
        // Assuming the 14th table (index 13) is the one we need, as in the Python code.
        $(tables[13]).find('tr').each((i, tr) => {
            const row = [];
            $(tr).find('td').slice(0, 6).each((j, td) => {
                row.push($(td).text().trim());
            });
            temp_df.push(row);
        });

        // Remove the header and prepare for further processing
        temp_df = _.drop(temp_df, 2); // Drop the first two rows which are headers
        const big_df = [];

        // Find the indices of '截止日期' rows
        const needRange = temp_df.reduce((acc, row, i) => {
            if (row[0].includes('截止日期')) acc.push(i);
            return acc;
        }, []).concat([temp_df.length]);

        for (let i = 0; i < needRange.length - 1; i++) {
            const truncatedDf = _.slice(temp_df, needRange[i], needRange[i + 1]);
            const nonEmptyRows = _.filter(truncatedDf, row => !_.every(row, _.isEmpty));
            const tempTruncated = _.drop(nonEmptyRows, 2); // Skip the next two rows
            const concatDf = tempTruncated.map(row => [...row, nonEmptyRows[0][1]]);

            // Add the '截止日期' to each row
            for (let j = 0; j < concatDf.length; j++) {
                concatDf[j] = [...concatDf[j], nonEmptyRows[0][0]];
            }

            // Forward fill '截止日期'
            for (let j = 1; j < concatDf.length; j++) {
                if (!concatDf[j][6]) concatDf[j][6] = concatDf[j - 1][6];
            }

            big_df.push(...concatDf);
        }

        // Clean up the data
        big_df.forEach(row => {
            row[2] = parseFloat(row[2]) || null;
            row[3] = parseFloat(row[3]) || null;
            row[4] = parseFloat(row[4]) || null;
            row[5] = parseFloat(row[5]) || null;
            row[6] = dayjs(row[6]).toDate();
        });

        // Define columns
        const columns = [
            "基金名称",
            "基金代码",
            "持仓数量",
            "占流通股比例",
            "持股市值",
            "占净值比例",
            "截止日期"
        ];

        // Filter out invalid rows
        const cleanedBigDf = _.filter(big_df, row => !_.some(row, _.isNull));

        // Return the result
        return { columns, data: cleanedBigDf };
    } catch (error) {
        console.error("Error fetching or parsing data:", error);
        throw error;
    }
}
///新浪财经-股本股东-主要股东
const cheerio = require('cheerio');

async function stock_main_stock_holder(stock = "600004") {
    const url = `https://vip.stock.finance.sina.com.cn/corp/go.php/vCI_StockHolder/stockid/${stock}.phtml`;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const temp_df = [];
        // Assuming the table we need is the 14th one (index 13 in Python)
        $('table').eq(13).find('tr').each((i, el) => {
            const tds = $(el).find('td').slice(0, 5);
            if (tds.length) {
                temp_df.push(tds.map((_, td) => $(td).text().trim()).get());
            }
        });

        const big_df = [];
        const need_range = temp_df.reduce((acc, row, i) => {
            if (row[0].indexOf('截至日期') === 0) acc.push(i);
            return acc;
        }, []).concat([temp_df.length]);

        for (let i = 0; i < need_range.length - 1; i++) {
            let truncated_df = temp_df.slice(need_range[i], need_range[i + 1]);
            truncated_df = truncated_df.filter(row => row.some(cell => cell));
            const header = truncated_df.splice(0, 5).flat();
            const data = truncated_df.map(row => [row, ...header]);
            const concat_df = data.map(row => Object.fromEntries(header.map((key, index) => [key, row[index]])));

            // Fill forward for specific columns
            ['截至日期', '公告日期', '股东总数', '平均持股数'].forEach(col => {
                let lastValue = null;
                concat_df.forEach(row => {
                    if (row[col]) lastValue = row[col];
                    else row[col] = lastValue;
                });
            });

            concat_df.forEach(row => {
                row['股东总数'] = row['股东总数'].replace('查看变化趋势', '');
                row['平均持股数'] = row['平均持股数'].replace('(按总股本计算) 查看变化趋势', '');
            });

            big_df.push(...concat_df);
        }

        // Clean up and format the final DataFrame
        big_df.forEach(row => {
            row['持股数量'] = Number(row['持股数量(股)']);
            row['持股比例'] = Number(row['持股比例(%)'].replace('↓', ''));
            row['截至日期'] = dayjs(row['截至日期'], 'YYYY-MM-DD').toDate();
            row['公告日期'] = dayjs(row['公告日期'], 'YYYY-MM-DD').toDate();
            row['股东总数'] = Number(row['股东总数']);
            row['平均持股数'] = Number(row['平均持股数']);
            delete row['持股数量(股)'];
            delete row['持股比例(%)'];
        });

        return big_df.filter(row => Object.values(row).some(val => val !== undefined && val !== null));
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
module.exports = {
    stock_financial_report_sina : stock_financial_report_sina,
    stock_financial_abstract : stock_financial_abstract,
    stock_financial_analysis_indicator : stock_financial_analysis_indicator,
    stock_history_dividend : stock_history_dividend,
    stock_history_dividend_detail : stock_history_dividend_detail,
    stock_ipo_info : stock_ipo_info,
    stock_add_stock : stock_add_stock,
    stock_restricted_release_queue_sina : stock_restricted_release_queue_sina,
    stock_circulate_stock_holder : stock_circulate_stock_holder,
    stock_fund_stock_holder : stock_fund_stock_holder,
    stock_main_stock_holder : stock_main_stock_holder,
};