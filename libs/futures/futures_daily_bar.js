const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///郑州商品交易所-交易数据-历史行情下载
const JSZip = require('jszip');
const { readFileSync, writeFileSync } = require('fs');

async function _futures_daily_czce(date = "20100824", dataset = "datahistory2010") {
    const url = `http://www.czce.com.cn/cn/exchange/${dataset}.zip`;

    try {
        const response = await axios({
            method: 'GET',
            url,
            responseType: 'arraybuffer'
        });

        const zip = new JSZip();
        const content = await zip.loadAsync(response.data);

        const textFile = content.files[`${dataset}.txt`];
        if (!textFile) throw new Error(`File ${dataset}.txt not found in the archive.`);

        const data = await textFile.async("string");
        const rows = data.split('\n').map(row => row.split('|'));

        // 假设第一行是标题
        const headers = rows.shift().map(item => item.trim());

        const data_df = rows.map(row => _.zipObject(headers, row));

        // 清理数据
        data_df.forEach(row => {
            Object.keys(row).forEach(key => {
                if (typeof row[key] === 'string') {
                    row[key] = row[key].trim().replace(/\t/g, '').replace(/,/g, '');
                }
            });
        });

        // 将特定列转换为数值类型
        const numericColumns = [
            "昨结算", "今开盘", "最高价", "最低价", "今收盘", "今结算",
            "涨跌1", "涨跌2", "成交量(手)", "空盘量", "增减量", "成交额(万元)", "交割结算价"
        ];

        numericColumns.forEach(column => {
            data_df.forEach(row => {
                if (row[column]) {
                    row[column] = parseFloat(row[column]);
                }
            });
        });

        // 处理日期
        data_df.forEach(row => {
            row["交易日期"] = dayjs(row["交易日期"], "YYYYMMDD").toDate();
        });

        // 重命名列
        data_df.forEach(row => {
            row.date = row["交易日期"];
            row.symbol = row.品种;
            row.pre_settle = row["昨结算"];
            row.open = row["今开盘"];
            row.high = row["最高价"];
            row.low = row["最低价"];
            row.close = row["今收盘"];
            row.settle = row["今结算"];
            row.volume = row["成交量(手)"];
            row.open_interest = row["空盘量"];
            row.turnover = row["成交额(万元)"];
            delete row.品种;
            delete row.["昨结算"];
            delete row.["今开盘"];
            delete row.["最高价"];
            delete row.["最低价"];
            delete row.["今收盘"];
            delete row.["今结算"];
            delete row.["涨跌1"];
            delete row.["涨跌2"];
            delete row.["成交量(手)"];
            delete row.["空盘量"];
            delete row.["增减量"];
            delete row.["成交额(万元)"];
            delete row.["交割结算价"];
            delete row.["交易日期"];
        });

        // 提取variety
        data_df.forEach(row => {
            const match = row.symbol.match(/[a-zA-Z_]+/);
            row.variety = match ? match[0] : null;
        });

        // 选择指定日期的数据
        const temp_df = data_df.filter(row => dayjs(row.date).format('YYYYMMDD') === date);

        // 设置date为传入的字符串格式
        temp_df.forEach(row => {
            row.date = date;
        });

        return temp_df;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
///中国金融期货交易所-日频率交易数据
const { JSZip } = require('jszip');
const Papa = require('papaparse'); // 用于CSV解析

// 假设cons.convert_date和calendar是已定义的函数/对象
// const cons = { convert_date: (date) => /* 转换逻辑 */ };
// const calendar = [/* 交易日列表 */];

async function get_cffex_daily(date = "20100416") {
    let day = date ? cons.convert_date(date) : dayjs().format('YYYYMMDD');
    if (!calendar.includes(day)) {
        // warnings.warn(`${day}非交易日`);
        return [];
    }

    const url = `http://www.cffex.com.cn/sj/historysj/${date.slice(0, -2)}/zip/${date.slice(0, -2)}.zip`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    };

    try {
        const response = await axios.get(url, { headers, responseType: 'arraybuffer' });
        const zip = new JSZip();
        const content = await zip.loadAsync(response.data);
        const fileContent = await content.file(`${date}_1.csv`).async("string");

        const data = Papa.parse(fileContent, { header: true }).data;
        const filteredData = _.filter(data, item => item['合约代码'] !== '小计' && item['合约代码'] !== '合计' &&
            !item['合约代码'].includes('IO') && !item['合约代码'].includes('MO') && !item['合约代码'].includes('HO'));

        const symbolList = filteredData.map(item => item['合约代码'].trim());
        const varietyList = symbolList.map(symbol => symbol.match(/[a-zA-Z_]+/)[0]);

        const cleanedData = filteredData.map((item, index) => ({
            symbol: item['合约代码'],
            date,
            open: item['开盘价'],
            high: item['最高价'],
            low: item['最低价'],
            close: item['收盘价'],
            volume: item['成交量'],
            open_interest: item['持仓量'],
            turnover: item['成交额'],
            settle: item['结算价'],
            pre_settle: item['前结算'],
            variety: varietyList[index]
        }));

        return cleanedData;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// 注意：在实际使用时，需要确保已经安装了所需的npm包（如axios, lodash, dayjs, jszip, papaparse）。
///广州期货交易所-日频率-量价数据

// 假设 cons.convert_date 和 calendar 是已经定义好的函数和对象
// const { convert_date, calendar } = require('./someUtilityModule');

function getGfexDaily(date = '20221223') {
    let day;
    if (date) {
        // 如果提供了date参数，则尝试转换为正确的格式
        day = convert_date(date);
    } else {
        // 如果没有提供date参数，则默认为当天
        day = dayjs().format('YYYYMMDD');
    }

    if (!calendar.includes(day)) {
        // 如果不是交易日，则返回空数组
        return [];
    }

    const url = "http://www.gfex.com.cn/u/interfacesWebTiDayQuotes/loadList";
    const payload = new URLSearchParams({
        trade_date: date,
        trade_type: '0'
    });

    const headers = {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Content-Length": payload.toString().length.toString(),
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Host": "www.gfex.com.cn",
        "Origin": "http://www.gfex.com.cn",
        "Pragma": "no-cache",
        "Proxy-Connection": "keep-alive",
        "Referer": "http://www.gfex.com.cn/gfex/rihq/hqsj_tjsj.shtml",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
    };

    return axios.post(url, payload.toString(), { headers })
        .then(response => {
            const dataJson = response.data;
            const resultArray = dataJson.data.filter(item =>
                !item.variety.includes("小计") && !item.variety.includes("总计")
            ).map(item => ({
                symbol: item.varietyOrder.toUpperCase() + item.delivMonth,
                date: date,
                open: Number(item.open),
                high: Number(item.high),
                low: Number(item.low),
                close: Number(item.close),
                volume: Number(item.volumn),
                open_interest: Number(item.openInterest),
                turnover: Number(item.turnover),
                settle: Number(item.clearPrice),
                pre_settle: Number(item.lastClear),
                variety: item.varietyOrder.toUpperCase()
            }));

            return resultArray.map(item => ({
                symbol: item.symbol,
                date: item.date,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                volume: item.volume,
                open_interest: item.open_interest,
                turnover: item.turnover,
                settle: item.settle,
                pre_settle: item.pre_settle,
                variety: item.variety
            }));
        })
        .catch(() => []);
}

// 注意：上面的代码假设了convert_date和calendar是已经存在的函数和对象。
// 在实际应用中，你需要根据实际情况实现或导入这些依赖。
///上海国际能源交易中心-日频率-量价数据

async function getINEDaily(date = "20220208") {
    /**
     * 上海国际能源交易中心-日频率-量价数据
     * 上海国际能源交易中心: 原油期货(上市时间: 20180326); 20号胶期货(上市时间: 20190812)
     * trade_price: http://www.ine.cn/statements/daily/?paramid=kx
     * trade_note: http://www.ine.cn/data/datanote.dat
     * @param {string|Date} date - 日期 format：YYYY-MM-DD 或 YYYYMMDD 或 Date对象，默认为当前交易日
     * @returns {Array<Object>} - 上海国际能源交易中心-日频率-量价数据
     */
    const day = convertDate(date) || dayjs().toDate();
    if (!calendar.includes(day.format("YYYYMMDD"))) {
        // 非交易日警告
        return [];
    }
    const url = `http://www.ine.cn/data/dailydata/kx/kx${day.format("YYYYMMDD")}.dat`;
    try {
        const response = await axios.get(url, { headers: shfeHeaders });
        const dataJson = response.data;
        const tempData = dataJson.o_curinstrument.slice(0, -1);
        const resultData = [];

        for (let item of tempData) {
            if (item.DELIVERYMONTH !== "小计" && !item.PRODUCTNAME.includes("总计")) {
                let symbol = (item.PRODUCTGROUPID || item.PRODUCTID).toUpperCase().trim() + item.DELIVERYMONTH;
                if (symbol === "总计" || symbol.includes("efp")) continue;

                resultData.push({
                    symbol,
                    date: day.format("YYYYMMDD"),
                    open: item.OPENPRICE,
                    high: item.HIGHESTPRICE,
                    low: item.LOWESTPRICE,
                    close: item.CLOSEPRICE,
                    volume: item.VOLUME,
                    open_interest: item.OPENINTEREST,
                    turnover: item.TURNOVER || 0,
                    settle: item.SETTLEMENTPRICE,
                    pre_settle: item.PRESETTLEMENTPRICE,
                    variety: (item.PRODUCTGROUPID || item.PRODUCTID).toUpperCase().trim().split("_")[0]
                });
            }
        }

        return resultData;
    } catch (error) {
        console.error(error);
        return [];
    }
}

function convertDate(date) {
    if (typeof date === 'string') {
        return dayjs(date, ["YYYY-MM-DD", "YYYYMMDD"]);
    } else if (date instanceof Date) {
        return dayjs(date);
    }
    return null;
}
///郑州商品交易所-日频率-量价数据
const cons = require('./constants'); // 假设 constants 文件中包含了所有需要的常量

function get_czce_daily(date = '20050525') {
    const day = (date !== undefined) ? dayjs(date, ["YYYY-MM-DD", "YYYYMMDD"]).toDate() : new Date();
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    };
    let url = "";

    if (!cons.calendar.includes(day.format("YYYYMMDD"))) {
        return [];
    }

    if (day > dayjs('2010-08-24')) {
        if (day > dayjs('2015-11-11')) {
            url = cons.CZCE_DAILY_URL_3.replace(/{year}/g, day.format("YYYY")).replace(/{date}/g, day.format("YYYYMMDD"));
        } else {
            url = cons.CZCE_DAILY_URL_2.replace(/{year}/g, day.format("YYYY")).replace(/{date}/g, day.format("YYYYMMDD"));
        }
        const listedColumns = cons.CZCE_COLUMNS;
        const outputColumns = cons.OUTPUT_COLUMNS;

        axios.get(url, { headers })
            .then(response => {
                let html = response.data;
                if (day >= dayjs('2015-11-12') && day <= dayjs('2017-12-27')) {
                    html = Buffer.from(html, 'latin1').toString('gbk');
                }

                if (html.indexOf("您的访问出错了") >= 0 || html.indexOf("无期权每日行情交易记录") >= 0) {
                    return [];
                }

                const lines = html.split("\n").slice(0, -3).map(line => line.replace(/\s/g, '').split("|"));
                const dictData = [];

                if (day > dayjs('2015-11-11')) {
                    if (['品种月份', '品种代码', '合约代码'].includes(lines[1][0])) {
                        for (let row of lines.slice(2)) {
                            const m = row[0].match(cons.FUTURES_SYMBOL_PATTERN);
                            if (!m) continue;
                            const rowDict = { date: parseInt(day.format("YYYYMMDD")), symbol: row[0], variety: m[1] };
                            for (let i = 0; i < listedColumns.length; i++) {
                                if (row[i + 1] === "\r" || row[i + 1] === "") {
                                    rowDict[listedColumns[i]] = 0.0;
                                } else if (["volume", "open_interest", "oi_chg", "exercise_volume"].includes(listedColumns[i])) {
                                    rowDict[listedColumns[i]] = parseInt(row[i + 1].replace(',', ''));
                                } else {
                                    rowDict[listedColumns[i]] = parseFloat(row[i + 1].replace(',', ''));
                                }
                            }
                            dictData.push(rowDict);
                        }
                    }
                } else {
                    for (let row of lines.slice(1)) {
                        const m = row[0].match(cons.FUTURES_SYMBOL_PATTERN);
                        if (!m) continue;
                        const rowDict = { date: parseInt(day.format("YYYYMMDD")), symbol: row[0], variety: m[1] };
                        for (let i = 0; i < listedColumns.length; i++) {
                            if (row[i + 1] === "\r") {
                                rowDict[listedColumns[i]] = 0.0;
                            } else if (["volume", "open_interest", "oi_chg", "exercise_volume"].includes(listedColumns[i])) {
                                rowDict[listedColumns[i]] = parseInt(parseFloat(row[i + 1]));
                            } else {
                                rowDict[listedColumns[i]] = parseFloat(row[i + 1]);
                            }
                        }
                        dictData.push(rowDict);
                    }
                }
                return dictData.filter(item => outputColumns.includes(Object.keys(item))).map(item => outputColumns.reduce((acc, key) => ({ ...acc, [key]: item[key] }), {}));
            })
            .catch(error => {
                if (error.response && error.response.status !== 404) {
                    console.log(url, error);
                }
                return [];
            });
    } else if (day <= dayjs('2010-08-24')) {
        return _futures_daily_czce(date); // 假设这个函数已经定义好
    }
}
///上海期货交易所-日频率-量价数据

// 假设这些是您的常量配置
const cons = {
  SHFE_DAILY_URL: "https://tsite.shfe.com.cn/data/dailydata/kx/pm%s.dat",
  shfe_headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    // 其他可能需要的headers
  },
  SHFE_COLUMNS: {
    'VOLUME': 'volume',
    'TURNOVER': 'turnover',
    // 其他列名映射
  },
  OUTPUT_COLUMNS: [
    'symbol', 'date', 'open', 'high', 'low', 'close', 'volume', 'open_interest', 'turnover', 'settle', 'pre_settle', 'variety'
  ],
  calendar: new Set(['20220415', /* ...其他交易日 */])
};

function convertDate(date) {
  if (date instanceof Date) return dayjs(date).format('YYYYMMDD');
  const d = dayjs(date, ['YYYY-MM-DD', 'YYYYMMDD']);
  return d.isValid() ? d.format('YYYYMMDD') : null;
}

async function getShfeDaily(date = dayjs().format('YYYYMMDD')) {
  const day = convertDate(date);
  if (!cons.calendar.has(day)) {
    // console.warn(`${day} 非交易日`);
    return [];
  }

  try {
    const response = await axios.get(cons.SHFE_DAILY_URL.replace('%s', day), { headers: cons.shfe_headers });
    const jsonData = response.data;

    if (!jsonData.o_curinstrument || jsonData.o_curinstrument.length === 0) {
      return [];
    }

    const df = jsonData.o_curinstrument.filter(row => !['小计', '合计'].includes(row.DELIVERYMONTH) && row.DELIVERYMONTH !== '');
    df.forEach(row => {
      row.variety = (row.PRODUCTGROUPID || row.PRODUCTID).toUpperCase().trim();
      row.symbol = `${row.variety}${row.DELIVERYMONTH}`;
      row.date = day;
      row.VOLUME = row.VOLUME === '' ? 0 : +row.VOLUME;
      row.turnover = row.TURNOVER === '' ? 0 : +row.TURNOVER;
    });

    // 重命名列
    for (const [oldName, newName] of Object.entries(cons.SHFE_COLUMNS)) {
      df.forEach(row => {
        if (row[oldName]) {
          row[newName] = row[oldName];
          delete row[oldName];
        }
      });
    }

    // 过滤并排序输出列
    return df.map(row => cons.OUTPUT_COLUMNS.reduce((acc, col) => ({ ...acc, [col]: row[col] }), {}));
  } catch (error) {
    if (error.response.status !== 404) {
      console.error(cons.SHFE_DAILY_URL.replace('%s', day), error);
    }
    return [];
  }
}
///大连商品交易所日交易数据
const customParseFormat = require('dayjs/plugin/customParseFormat'); // 用于自定义格式解析
dayjs.extend(customParseFormat);

// 假设我们有一个类似于Python中cons的日历对象
const calendar = {}; // 这里应该填充有效的交易日数据
// 假设DCE_MAP是一个映射商品名称到variety的对象
const DCE_MAP = {}; // 这里应该填充有效的映射数据

async function get_dce_daily(date = "20220308") {
    const day = date ? dayjs(date, 'YYYYMMDD') : dayjs();
    if (!calendar[day.format('YYYYMMDD')]) {
        return [];
    }

    const url = "http://www.dce.com.cn/publicweb/quotesdata/exportDayQuotesChData.html";
    const headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Content-Length": "86",
        "Content-Type": "application/x-www-form-urlencoded",
        "Host": "www.dce.com.cn",
        "Origin": "http://www.dce.com.cn",
        "Pragma": "no-cache",
        "Referer": "http://www.dce.com.cn/publicweb/quotesdata/dayQuotesCh.html",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36"
    };

    const params = new URLSearchParams({
        "dayQuotes.variety": "all",
        "dayQuotes.trade_type": "0",
        "year": date.slice(0, 4),
        "month": String(parseInt(date.slice(4, 6), 10) - 1),
        "day": date.slice(6),
        "exportFlag": "excel"
    });

    try {
        const response = await axios.post(url, params.toString(), { headers });
        const workbook = XLSX.read(response.data, { type: 'buffer' }); // 假设XLSX是用于读取Excel文件的库
        const sheet_name_list = workbook.SheetNames;
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { header: 1 });

        // 处理数据
        let data_df = _.filter(data, row => !row[0].includes("小计") && !row[0].includes("总计"));
        data_df = data_df.map(row => {
            return {
                open: row[1],
                high: row[2],
                low: row[3],
                close: row[4],
                pre_settle: row[5],
                settle: row[6],
                volume: row[9],
                open_interest: row[10],
                turnover: row[12],
                variety: DCE_MAP[row[0]],
                symbol: row[13],
                date: date
            };
        });

        // 转换数据类型
        data_df = data_df.map(row => _.mapValues(row, value => {
            if (typeof value === 'string') {
                value = value.replace(/,/g, '');
            }
            return parseFloat(value);
        }));

        return data_df;
    } catch (error) {
        console.error(error);
        return [];
    }
}
///交易所日交易数据

function getFuturesDaily(start_date = "20220208", end_date = "20220208", market = "CFFEX") {
    /**
     * 交易所日交易数据
     * @param {string} start_date - 开始日期 format：YYYY-MM-DD 或 YYYYMMDD 或 Date对象 为空时为当天
     * @param {string} end_date - 结束数据 format：YYYY-MM-DD 或 YYYYMMDD 或 Date对象 为空时为当天
     * @param {string} market - 'CFFEX' 中金所, 'CZCE' 郑商所, 'SHFE' 上期所, 'DCE' 大商所之一, 'INE' 上海国际能源交易中心, "GFEX" 广州期货交易所。默认为中金所
     * @return {Array} 交易所日交易数据
     */
    
    let f;
    switch (market.toUpperCase()) {
        case "CFFEX":
            f = getCffexDaily;
            break;
        case "CZCE":
            f = getCzceDaily;
            break;
        case "SHFE":
            f = getShfeDaily;
            break;
        case "DCE":
            f = getDceDaily;
            break;
        case "INE":
            f = getIneDaily;
            break;
        case "GFEX":
            f = getGfexDaily;
            break;
        default:
            console.log("Invalid Market Symbol");
            return [];
    }

    const startDate = convertDate(start_date) || dayjs().toDate();
    const endDate = convertDate(end_date) || convertDate(getLatestDataDate(new Date()));

    const dfList = [];
    while (dayjs(startDate).isSameOrBefore(endDate)) {
        const dateStr = dayjs(startDate).format('YYYYMMDD');
        const df = f(date: dateStr);
        if (df) {
            dfList.push(...df);
        }
        startDate.setDate(startDate.getDate() + 1);
    }

    if (dfList.length > 0) {
        // 假设symbol是每个元素中的一个属性
        const tempDf = _.filter(dfList, item => !item.symbol.includes('efp'));
        return tempDf;
    }
    return [];
}

// 辅助函数定义
function convertDate(date) {
    if (!date) return null;
    return dayjs(date, ["YYYYMMDD", "YYYY-MM-DD"]).isValid() ? dayjs(date).toDate() : null;
}

function getLatestDataDate(date) {
    // 这里应该实现根据当前时间获取最新的数据日期
    return dayjs(date).format('YYYYMMDD'); // 简化版，实际应根据业务逻辑调整
}

// 其他具体的市场数据获取函数需要根据实际情况实现
module.exports = {
    _futures_daily_czce : _futures_daily_czce,
    get_cffex_daily : get_cffex_daily,
    get_gfex_daily : get_gfex_daily,
    get_ine_daily : get_ine_daily,
    get_czce_daily : get_czce_daily,
    get_shfe_daily : get_shfe_daily,
    get_dce_daily : get_dce_daily,
    get_futures_daily : get_futures_daily,
};