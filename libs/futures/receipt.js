const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///大连商品交易所-注册仓单数据

function getDceReceipt(date = null, varsList = cons.contract_symbols) {
    /**
     * 大连商品交易所-注册仓单数据
     *
     * @param {string} [date] - 开始日期: YYYY-MM-DD 或 YYYYMMDD 或 Date对象, 为空时为当天
     * @param {Array} [varsList] - 合约品种如 RB, AL等列表, 为空时为所有商品数据从 20060106开始，每周五更新仓单数据。直到20090407起，每交易日都更新仓单数据
     * @returns {Object[]} 注册仓单数据
     */
    if (!Array.isArray(varsList)) {
        console.warn("varsList: 必须是列表");
        return;
    }

    const today = date ? (typeof date === 'string' ? dayjs(date, ['YYYY-MM-DD', 'YYYYMMDD']) : dayjs(date)) : dayjs();
    const formattedDate = today.format('YYYYMMDD');

    if (!cons.calendar.includes(formattedDate)) {
        console.warn(`${formattedDate} 非交易日`);
        return;
    }

    const payload = {
        "weekQuotes.variety": "all",
        "year": today.year(),
        "month": today.month(), // 注意：在JavaScript中，月份是从0开始的，所以不需要减1
        "day": today.date()
    };

    axios.post(cons.DCE_RECEIPT_URL, payload, { headers: cons.dce_headers })
        .then(response => {
            let records = [];
            response.data[0].forEach(x => {
                if (typeof x.品种 === 'string') {
                    if (x.品种.slice(-2) === '小计') {
                        const varName = x.品种.slice(0, -2);
                        const tempData = {
                            var: chineseToEnglish(varName),
                            receipt: parseInt(x['今日仓单量'], 10),
                            receipt_chg: parseInt(x['增减'], 10),
                            date: formattedDate
                        };
                        records.push(tempData);
                    }
                }
            });

            if (records.length > 0) {
                const indexMap = new Map(records.map(item => [item.var, item]));
                const varsInMarket = varsList.filter(varName => indexMap.has(varName));
                records = varsInMarket.map(varName => indexMap.get(varName));
            }

            return records; // 这里返回的数据可以根据实际需求进行进一步处理或直接使用
        })
        .catch(error => {
            console.error('Error fetching DCE receipt data:', error);
        });
}

// 假设有一个函数用于中文到英文的转换
function chineseToEnglish(chinese) {
    // 实现中文到英文的映射逻辑
    return chinese; // 示例返回值
}
///上海期货交易所-注册仓单数据-类型1

// 假设 cons 和 chinese_to_english 已定义
// const cons = { ... };
// function chinese_to_english(chinese) { ... }

async function getShfeReceipt1(date = null, varsList = cons.contract_symbols) {
    if (!Array.isArray(varsList)) {
        console.warn("vars_list: 必须是列表");
        return;
    }
    const today = dayjs().format('YYYYMMDD');
    date = date ? dayjs(date).format('YYYYMMDD') : today;
    if (!cons.calendar.includes(date)) {
        console.warn(`${date} 非交易日`);
        return null;
    }
    if (date === '20100126') {
        shfe_20100126.date = date;
        return shfe_20100126;
    } else if (date === '20101029') {
        shfe_20101029.date = date;
        return shfe_20101029;
    } else if (['20100416', '20130821'].includes(date)) {
        console.warn('20100416、20130821交易所数据丢失');
        return;
    } else {
        const varList = ['天然橡胶', '沥青仓库', '沥青厂库', '热轧卷板', '燃料油', '白银', '线材', '螺纹钢', '铅', '铜', '铝', '锌', '黄金', '锡', '镍'];
        const url = cons.SHFE_RECEIPT_URL_1.replace('%s', date);
        try {
            const response = await axios.get(url);
            const data = response.data[0];  // 假设返回的数据可以直接这样访问

            let indexes = _.reduce(data, (acc, row, index) => {
                if (varList.includes(row[0])) acc.push(index);
                return acc;
            }, []);
            const lastIndex = _.findIndex(data, (row) => /注/.test(row[0])) - 1;

            let records = [];
            for (let i = 0; i < indexes.length; i++) {
                let dataCut;
                if (i !== indexes.length - 1) {
                    dataCut = data.slice(indexes[i], indexes[i + 1]);
                } else {
                    dataCut = data.slice(indexes[i], lastIndex + 1);
                    dataCut = _.fill(dataCut, _.last(_.compact(dataCut)));
                }
                const dataDict = {
                    var: chinese_to_english(dataCut[0][0]),
                    receipt: parseInt(dataCut[dataCut.length - 1][2], 10),
                    receipt_chg: parseInt(dataCut[dataCut.length - 1][3], 10),
                    date: date
                };
                records.push(dataDict);
            }

            if (records.length > 0) {
                records = _.keyBy(records, 'var');
                const varsInMarket = _.intersection(varsList, Object.keys(records));
                records = _.pick(records, varsInMarket);
                records = _.values(records);
            }
            return records;
        } catch (error) {
            console.error(`Error fetching data: ${error}`);
        }
    }
}
///上海商品交易所-注册仓单数据-类型2

async function getShfeReceipt2(date = null, varsList = cons.contract_symbols) {
    /**
     * 上海商品交易所-注册仓单数据-类型2
     * 适用 20140519(包括)-至今
     * @param {string} date - 开始日期 format：YYYY-MM-DD 或 YYYYMMDD 或 Date对象 为空时为当天
     * @param {Array} varsList - 合约品种如 RB、AL 等列表 为空时为所有商品
     * @return {Object[]} 注册仓单数据
     */
    if (!Array.isArray(varsList)) {
        console.warn("vars_list: 必须是列表");
        return;
    }
    const formattedDate = date ? dayjs(date).format('YYYYMMDD') : dayjs().format('YYYYMMDD');
    if (!cons.calendar.includes(formattedDate)) {
        console.warn(`${formattedDate} 非交易日`);
        return [];
    }

    const url = cons.SHFE_RECEIPT_URL_2.replace('%s', formattedDate);
    try {
        const response = await axios.get(url, { headers: cons.shfe_headers });
        const context = response.data;
        let data = context.o_cursor || [];

        if (data.length < 1) {
            return [];
        }

        let records = [];
        const uniqueVars = new Set(data.map(item => item.VARNAME));
        for (let varName of uniqueVars) {
            const dataCut = data.filter(item => item.VARNAME === varName);
            const isBC = varName.includes("BC");
            const englishVar = isBC ? "BC" : chinese_to_english(varName.replace(/[\W|a-zA-Z]/g, ""));
            const lastItem = dataCut[dataCut.length - 1];
            const record = {
                var: englishVar,
                receipt: parseInt(lastItem.WRTWGHTS, 10),
                receipt_chg: parseInt(lastItem.WRTCHANGE, 10),
                date: formattedDate
            };
            records.push(record);
        }

        // Group by 'var' and sum 'receipt' and 'receipt_chg'
        const groupedRecords = {};
        records.forEach(record => {
            if (!groupedRecords[record.var]) {
                groupedRecords[record.var] = { ...record, receipt: 0, receipt_chg: 0 };
            }
            groupedRecords[record.var].receipt += record.receipt;
            groupedRecords[record.var].receipt_chg += record.receipt_chg;
        });

        // Filter by varsList
        records = Object.values(groupedRecords).filter(record => varsList.includes(record.var));

        return records;
    } catch (error) {
        console.error(error);
        return [];
    }
}
///郑州商品交易所-注册仓单数据
const cheerio = require('cheerio');

// 假设这些是已定义的常量和函数
const cons = {
    contract_symbols: ['CF', 'TA'], // 示例合约品种列表
    CZCE_RECEIPT_URL_1: 'http://example.com/data/%s', // 示例URL
    shfe_headers: { 'User-Agent': 'some-user-agent' } // 示例请求头
};

function convertDate(date) {
    if (date) {
        return dayjs(date, ['YYYY-MM-DD', 'YYYYMMDD']).format('YYYYMMDD');
    }
    return dayjs().format('YYYYMMDD');
}

function chineseToEnglish(str) {
    // 这里应该有一个函数来转换中文到英文
    // 例如：'棉花' -> 'CF'
    // 这个转换逻辑需要根据实际情况编写
    return str;
}

async function get_czce_receipt_1(date = null, vars_list = cons.contract_symbols) {
    const dateStr = convertDate(date);
    // 检查是否为交易日（此处假设calendar是一个有效的交易日列表）
    if (!calendar.includes(dateStr)) {
        console.warn(`${dateStr} 非交易日`);
        return null;
    }

    if (dateStr === '20090820') {
        return [];
    }

    try {
        const url = cons.CZCE_RECEIPT_URL_1.replace('%s', dateStr);
        const response = await axios.get(url, { headers: cons.shfe_headers });
        const $ = cheerio.load(response.data);
        const data = $('table').eq(1); // 假设我们需要的是第二个表格

        let records = [];
        const indexes = [];
        const ends = [];

        // 寻找包含'品种：'和'总计'的行索引
        data.find('tr').each((i, el) => {
            const text = $(el).text();
            if (text.includes('品种：')) indexes.push(i);
            if (text.includes('总计')) ends.push(i);
        });

        for (let i = 0; i < indexes.length; i++) {
            const start = indexes[i];
            const end = i !== indexes.length - 1 ? ends[i] : data.find('tr').length;
            const dataCut = $(data).find('tr').slice(start, end + 1);

            // 填充空白值
            dataCut.each((j, row) => {
                const cells = $(row).find('td');
                cells.each((k, cell) => {
                    if ($(cell).text().trim() === '') {
                        $(cell).text($(cells[k - 1]).text());
                    }
                });
            });

            const varName = dataCut.first().text().includes('PTA') ? 'TA' : chineseToEnglish(dataCut.first().text().replace(/[A-Z]+/, '').substring(3));
            const receipt = parseInt(dataCut.last().children().eq(varName === 'CF' ? 6 : 5).text());
            const receipt_chg = parseInt(dataCut.last().children().eq(varName === 'CF' ? 7 : 6).text());

            records.push({ var: varName, receipt, receipt_chg, date: dateStr });
        }

        // 过滤出vars_list中的记录
        if (records.length > 0) {
            records = records.filter(record => vars_list.includes(record.var));
        }

        return records;
    } catch (error) {
        console.error(error);
        return null;
    }
}
///郑州商品交易所-注册仓单数据

async function get_czce_receipt_2(date = null, vars_list = cons.contract_symbols) {
    /**
     * 郑州商品交易所-注册仓单数据
     * http://www.czce.com.cn/cn/jysj/cdrb/H770310index_1.htm
     * 适用 20100825(包括) - 20151111(包括)
     * @param {string} date 开始日期 format：YYYY-MM-DD 或 YYYYMMDD 或 Date对象 为空时为当天
     * @param {Array} vars_list 合约品种如 CF、TA 等列表为空时为所有商品
     * @return {Object} 注册仓单数据
     */
    if (!Array.isArray(vars_list)) {
        console.warn("symbol_list: 必须是列表");
        return;
    }
    const today = dayjs().format('YYYYMMDD');
    date = date ? dayjs(date).format('YYYYMMDD') : today;
    if (!cons.calendar.includes(date)) {
        console.warn(`${date}非交易日`);
        return null;
    }
    const url = _.template(cons.CZCE_RECEIPT_URL_2)({ year: date.slice(0, 4), fullDate: date });
    try {
        const response = await axios.get(url);
        const data = parseHtml(response.data); // 假设这里有一个函数parseHtml用于解析HTML并返回数组
        let records = [];
        for (let data_cut of data.slice(2)) { // 跳过前两个元素
            if (data_cut.length > 3) {
                const lastIndexes = data_cut.map((row, index) => '注：' in row[0] ? index : -1).filter(index => index !== -1);
                let last_index = lastIndexes.length > 0 ? lastIndexes[0] - 1 : data_cut.length - 1;
                data_cut = data_cut.slice(0, last_index + 1);
                let varSymbol = 'TA';
                if ('PTA' in data_cut[0][0]) {
                    varSymbol = 'TA';
                } else {
                    let strings = data_cut[0][0];
                    let string = strings.split(' ')[0].slice(3);
                    varSymbol = chineseToEnglish(string.replace(/[A-Z]+/g, ''));
                }
                const headers = data_cut[1];
                const receipt = parseInt(data_cut[data_cut.length - 1][headers.indexOf('仓单数量')]);
                const receipt_chg = parseInt(data_cut[data_cut.length - 1][headers.indexOf('当日增减')]);
                records.push({ var: varSymbol, receipt, receipt_chg, date });
            }
        }
        if (records.length > 0) {
            const indexedRecords = _.keyBy(records, 'var');
            const filteredVars = vars_list.filter(varSymbol => varSymbol in indexedRecords);
            records = filteredVars.map(varSymbol => indexedRecords[varSymbol]);
        }
        return records;
    } catch (error) {
        console.error(error);
    }
}

// 注意：parseHtml和chineseToEnglish函数需要根据实际情况实现。
///郑州商品交易所-注册仓单数据

async function get_czce_receipt_3(date = null, vars_list = cons.contract_symbols) {
    if (!Array.isArray(vars_list)) {
        console.warn("vars_list: 必须是列表");
        return;
    }

    const convertDate = (d) => d ? dayjs(d).format('YYYYMMDD') : dayjs().format('YYYYMMDD');
    date = convertDate(date);

    if (!calendar.includes(date)) {
        console.warn(`${date}非交易日`);
        return null;
    }

    const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${date.slice(0, 4)}/${date}/FutureDataWhsheet.xls`;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', headers: cons.shfe_headers });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const sheet_name_list = workbook.SheetNames;
        const temp_df = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        // 过滤掉包含"非农产品"的行
        temp_df = _.filter(temp_df, (row) => !_.includes(row[0], "非农产品"));

        // 获取品种信息的索引范围
        const rangeListOne = _.map(_.filter(temp_df, (row) => _.includes(row[0], "品种")), (row, index) => index);
        const rangeListTwo = [...rangeListOne.slice(1), null];

        const symbolList = [];
        const receiptList = [];
        const receiptChgList = [];

        for (let page = 0; page < rangeListOne.length; page++) {
            const innerDf = temp_df.slice(rangeListOne[page], rangeListTwo[page]);
            const reg = /[A-Z]+/;
            let symbol = '';
            try {
                symbol = reg.exec(innerDf[0][0])[0];
            } catch (e) {
                continue;
            }
            symbolList.push(symbol);
            const columns = innerDf[1];
            const dataRows = innerDf.slice(2);
            const cleanedData = _.map(dataRows, (row) => _.pickBy(row, (v) => v !== undefined));

            if (symbol === "PTA") {
                try {
                    receiptList.push(cleanedData[cleanedData.length - 1]['仓单数量(完税)'] + parseInt(cleanedData[cleanedData.length - 1]['仓单数量(保税)']));
                } catch (e) {
                    receiptList.push(0);
                }
            } else if (symbol === "MA") {
                try {
                    receiptList.push(cleanedData[cleanedData.length - 2]['仓单数量(完税)'] + parseInt(cleanedData[cleanedData.length - 2]['仓单数量(保税)']));
                } catch (e) {
                    try {
                        receiptList.push(cleanedData[cleanedData.length - 2]['仓单数量(完税)']);
                    } catch (e) {
                        receiptList.push(0);
                    }
                }
            } else {
                try {
                    receiptList.push(cleanedData[cleanedData.length - 1]['仓单数量']);
                } catch (e) {
                    receiptList.push(0);
                }
            }

            if (symbol === "MA") {
                receiptChgList.push(cleanedData[cleanedData.length - 2]['当日增减']);
            } else {
                receiptChgList.push(cleanedData[cleanedData.length - 1]['当日增减']);
            }
        }

        const dataDf = _.zipWith(symbolList, receiptList, receiptChgList, _.times(receiptChgList.length, () => date), (a, b, c, d) => ({ var: a, receipt: b, receipt_chg: c, date: d }));
        const tempList = _.map(dataDf, 'var');
        dataDf.forEach((item, i) => item.var = tempList[i] !== "PTA" ? tempList[i] : "TA");

        if (dataDf.length > 0) {
            const indexedData = _.keyBy(dataDf, 'var');
            const varsInMarket = _.intersection(vars_list, Object.keys(indexedData));
            const records = _.at(indexedData, varsInMarket);
            return records;
        }
    } catch (error) {
        console.error(error);
    }
}

// 注意：这里假设有一个名为XLSX的库用于读取Excel文件，这在Node.js环境中可能需要额外安装。
///广州期货交易所-注册仓单数据

function getGfexReceipt(date = null, varsList = cons.contract_symbols) {
    /**
     * 广州期货交易所-注册仓单数据
     * http://www.gfex.com.cn/gfex/cdrb/hqsj_tjsj.shtml
     * @param {string} date - 开始日期 format：YYYY-MM-DD 或 YYYYMMDD 或 Date对象 为空时为当天
     * @param {Array} varsList - 合约品种如 SI 等列表为空时为所有商品
     * @return {Array} 注册仓单数据
     */
    if (!Array.isArray(varsList)) {
        console.warn("vars_list: 必须是列表");
    }
    const currentDate = date ? (typeof date === 'string' ? new Date(date.replace(/-/g, '/')) : date) : new Date();
    const formattedDate = dayjs(currentDate).format('YYYYMMDD');
    if (!calendar.includes(formattedDate)) {
        console.warn(`${formattedDate}非交易日`);
        return [];
    }

    const url = "http://www.gfex.com.cn/u/interfacesWebTdWbillWeeklyQuotes/loadList";
    const payload = {
        gen_date: dayjs(currentDate).format('YYYYMMDD')
    };
    const headers = {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Content-Length": "32",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Host": "www.gfex.com.cn",
        "Origin": "http://www.gfex.com.cn",
        "Pragma": "no-cache",
        "Proxy-Connection": "keep-alive",
        "Referer": "http://www.gfex.com.cn/gfex/rihq/hqsj_tjsj.shtml",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "content-type": "application/x-www-form-urlencoded"
    };

    return axios.post(url, new URLSearchParams(payload), { headers })
        .then(response => {
            const dataJson = response.data;
            const tempDf = dataJson.data.filter(item => item.variety.includes("小计"));
            let resultDf = tempDf.map(item => ({
                receipt: item.wbillQty,
                receipt_chg: item.diff
            }));
            if (resultDf.length === 0) {
                return [];
            }

            resultDf = resultDf.map((item, index) => ({
                ...item,
                date: formattedDate,
                var: tempDf[index].varietyOrder.toUpperCase()
            }));

            // 模拟设置索引并过滤
            resultDf = resultDf.filter(item => varsList.includes(item.var));
            if (!resultDf.some(item => item.var === 'LC')) {
                varsList = varsList.filter(varItem => varItem !== 'LC');
            }

            return resultDf;
        });
}
///大宗商品-注册仓单数据

// 假设这些是你的辅助函数和常量
const cons = {
    contract_symbols: [], // 示例值
    market_exchange_symbols: {}, // 示例值
    convert_date: (date) => dayjs(date, ["YYYY-MM-DD", "YYYYMMDD"]).toDate(),
    get_latest_data_date: (now) => now.format("YYYY-MM-DD"),
    calendar: [] // 示例值
};

// 假设这些是你需要调用的获取仓单数据的函数
const get_dce_receipt = (date, vars) => { }; // 示例实现
const get_shfe_receipt_1 = (date, vars) => { }; // 示例实现
const get_shfe_receipt_2 = (date, vars) => { }; // 示例实现
const get_gfex_receipt = (date, vars) => { }; // 示例实现
const get_czce_receipt_1 = (date, vars) => { }; // 示例实现
const get_czce_receipt_2 = (date, vars) => { }; // 示例实现
const get_czce_receipt_3 = (date, vars) => { }; // 示例实现

function getReceipt(startDateStr = null, endDateStr = null, varsList = cons.contract_symbols) {
    if (!Array.isArray(varsList)) {
        console.warn("vars_list: 必须是列表");
        return;
    }

    const startDate = startDateStr ? cons.convert_date(startDateStr) : dayjs().toDate();
    const endDate = endDateStr ? cons.convert_date(endDateStr) : cons.convert_date(cons.get_latest_data_date(dayjs()));

    let records = [];
    let currentDate = dayjs(startDate);

    while (currentDate.isSameOrBefore(endDate, 'day')) {
        if (!cons.calendar.includes(currentDate.format('YYYYMMDD'))) {
            console.warn(`${currentDate.format('YYYYMMDD')} 非交易日`);
        } else {
            console.log(currentDate.format('YYYY-MM-DD'));
            for (let [market, marketVars] of Object.entries(cons.market_exchange_symbols)) {
                let f;
                switch (market) {
                    case 'dce':
                        if (currentDate.isAfter(dayjs('2009-04-07'))) f = get_dce_receipt;
                        else console.log('20090407 起，大连商品交易所每个交易日更新仓单数据');
                        break;
                    case 'shfe':
                        if (currentDate.isBetween(dayjs('2008-10-06'), dayjs('2014-05-16'))) f = get_shfe_receipt_1;
                        else if (currentDate.isAfter(dayjs('2014-05-16'))) f = get_shfe_receipt_2;
                        else console.log('20081006 起，上海期货交易所每个交易日更新仓单数据');
                        break;
                    case 'gfex':
                        if (currentDate.isAfter(dayjs('2022-12-22'))) f = get_gfex_receipt;
                        else console.log('20081006 起，上海期货交易所每个交易日更新仓单数据');
                        break;
                    case 'czce':
                        if (currentDate.isBetween(dayjs('2008-03-03'), dayjs('2010-08-24'))) f = get_czce_receipt_1;
                        else if (currentDate.isBetween(dayjs('2010-08-24'), dayjs('2015-11-11'))) f = get_czce_receipt_2;
                        else if (currentDate.isAfter(dayjs('2015-11-11'))) f = get_czce_receipt_3;
                        else console.log('20080303 起，郑州商品交易所每个交易日更新仓单数据');
                        break;
                }
                const getVars = _.intersection(varsList, marketVars);
                if (market !== 'cffex' && getVars.length > 0 && f) {
                    records = _.concat(records, f(currentDate, getVars));
                }
            }
        }
        currentDate = currentDate.add(1, 'day');
    }

    records = _.uniqBy(records, JSON.stringify); // 确保记录唯一
    return records.length === 0 ? [] : records;
}
module.exports = {
    get_dce_receipt: get_dce_receipt,
    get_shfe_receipt_1: get_shfe_receipt_1,
    get_shfe_receipt_2: get_shfe_receipt_2,
    get_czce_receipt_1: get_czce_receipt_1,
    get_czce_receipt_2: get_czce_receipt_2,
    get_czce_receipt_3: get_czce_receipt_3,
    get_gfex_receipt: get_gfex_receipt,
    get_receipt: get_receipt,
};