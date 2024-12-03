const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///采集四个期货交易所前 5、前 10、前 15、前 20 会员持仓排名数据

// 假设 cons 和 get_rank_sum 是已经定义好的模块或函数
const cons = require('./cons'); // 请确保此路径正确指向您的cons模块
const calendar = require('./calendar'); // 请确保此路径正确指向您的交易日历

async function getRankSumDaily(startDay = "20210510", endDay = "20210510", varsList = cons.contractSymbols) {
    /**
     * 采集四个期货交易所前 5、前 10、前 15、前 20 会员持仓排名数据
     * 注1：由于上期所和中金所只公布每个品种内部的标的排名，没有公布品种的总排名;
     * 所以函数输出的品种排名是由品种中的每个标的加总获得，并不是真实的品种排名列表
     * 注2：大商所只公布了品种排名，未公布标的排名
     * @param {string} startDay - 开始日期 format：YYYY-MM-DD 或 YYYYMMDD 或 Date对象 为空时为当天
     * @param {string} endDay - 结束数据 format：YYYY-MM-DD 或 YYYYMMDD 或 Date对象 为空时为当天
     * @param {Array<string>} varsList - 合约品种如 ['RB', 'AL'] 等列表为空时为所有商品
     * @return {Promise<Array<Object>>}
     */
    let records = [];
    let currentStartDay = startDay ? dayjs(cons.convertDate(startDay)) : dayjs();
    let currentEndDay = endDay ? dayjs(cons.convertDate(endDay)) : dayjs(cons.getLatestDataDate(new Date()));

    while (currentStartDay.isSameOrBefore(currentEndDay, 'day')) {
        console.log(currentStartDay.format('YYYY-MM-DD'));
        if (calendar.includes(currentStartDay.format('YYYYMMDD'))) {
            try {
                const data = await getRankSum(currentStartDay, varsList);
                if (!data) {
                    console.error(`${currentStartDay.format('YYYY-MM-DD')}日交易所数据连接失败，已超过20次，您的地址被网站墙了，请保存好返回数据，稍后从该日期起重试`);
                    return _.uniqBy(records, 'symbol').map(record => ({...record}));
                }
                records = [...records, ...data];
            } catch (error) {
                console.error(`获取${currentStartDay.format('YYYY-MM-DD')}数据时发生错误:`, error);
            }
        } else {
            console.warn(`${currentStartDay.format('YYYYMMDD')}非交易日`);
        }
        currentStartDay = currentStartDay.add(1, 'day');
    }

    return _.uniqBy(records, 'symbol').map(record => ({...record}));
}

// 注意：getRankSum 函数需要根据实际情况实现。
///采集五个期货交易所前5、前10、前15、前20会员持仓排名数据

// 假设这些是预先定义好的函数和常量
const cons = {
  contract_symbols: [], // 合约品种列表
  market_exchange_symbols: {}, // 交易所符号映射
  convert_date: (date) => { /* 转换日期的函数 */ },
  calendar: [] // 交易日历
};

// 模拟的外部函数
const futures_dce_position_rank = (date, vars) => {}; // 大商所持仓排名
const get_shfe_rank_table = (date, vars) => {}; // 上期所排名表
const get_czce_rank_table = (date) => {}; // 郑商所排名表
const get_cffex_rank_table = (date, vars) => {}; // 中金所排名表
const futures_gfex_position_rank = (date, vars) => {}; // 广期所持仓排名
const symbol_varieties = (symbol) => {}; // 获取合约品种

function getRankSum(date = '20210525', varsList = cons.contract_symbols) {
  date = cons.convert_date(date) || dayjs().format('YYYYMMDD');
  if (!cons.calendar.includes(dayjs(date, 'YYYYMMDD').format('YYYYMMDD'))) {
    console.warn(`${date}非交易日`);
    return null;
  }

  const dceVar = varsList.filter(i => cons.market_exchange_symbols.dce.includes(i));
  const shfeVar = varsList.filter(i => cons.market_exchange_symbols.shfe.includes(i));
  const czceVar = varsList.filter(i => cons.market_exchange_symbols.czce.includes(i));
  const cffexVar = varsList.filter(i => cons.market_exchange_symbols.cffex.includes(i));
  const gfexVar = varsList.filter(i => cons.market_exchange_symbols.gfex.includes(i));

  let bigDict = {};

  if (dceVar.length > 0) {
    const data = futures_dce_position_rank(date, dceVar);
    if (data === false) return false;
    _.merge(bigDict, data);
  }
  // ... 对其他交易所类似处理

  const records = [];

  for (const [symbol, table] of Object.entries(bigDict)) {
    table.forEach(row => Object.keys(row).forEach(key => row[key] = row[key] === "" ? 0 : row[key]));
    const symbols = _.uniq(table.map(t => t.symbol));
    symbols.forEach(symbolInner => {
      const varSymbol = symbol_varieties(symbolInner);
      if (varsList.includes(varSymbol)) {
        // 对czce的数据进行特殊处理
        if (czceVar.includes(varSymbol)) {
          ['vol', 'vol_chg', ...table.columns.filter(col => col.includes('open_interest'))].forEach(col => {
            table[col] = table[col].map(value => value === '-' ? 0.0 : parseFloat(value.replace(/,/g, '')));
          });
        }

        const tableCut = table.filter(t => t.symbol === symbolInner);
        tableCut.forEach(row => row.rank = parseFloat(row.rank));
        const tableCutTop5 = tableCut.filter(t => t.rank <= 5);
        const tableCutTop10 = tableCut.filter(t => t.rank <= 10);
        const tableCutTop15 = tableCut.filter(t => t.rank <= 15);
        const tableCutTop20 = tableCut.filter(t => t.rank <= 20);

        const record = {
          symbol: symbolInner,
          variety: varSymbol,
          vol_top5: _.sumBy(tableCutTop5, 'vol'),
          vol_chg_top5: _.sumBy(tableCutTop5, 'vol_chg'),
          // ... 其他字段
          date: dayjs(date, 'YYYYMMDD').format('YYYYMMDD')
        };
        records.push(record);
      }
    });
  }

  // 如果bigDict有数据，则添加额外的品种记录
  if (Object.keys(bigDict).length > 0) {
    const addVars = _.uniq(_.concat(
      cons.market_exchange_symbols.dce,
      cons.market_exchange_symbols.shfe,
      cons.market_exchange_symbols.cffex
    ).filter(v => records.some(r => r.variety === v)));

    addVars.forEach(varSymbol => {
      const recordsCut = records.filter(r => r.variety === varSymbol);
      const varRecord = _.reduce(recordsCut, (acc, n) => _.assign(acc, n), {});
      varRecord.date = dayjs(date, 'YYYYMMDD').format('YYYYMMDD');
      varRecord.variety = varSymbol;
      varRecord.symbol = varSymbol;
      records.push(varRecord);
    });
  }

  return records;
}
///上海期货交易所会员成交及持仓排名表

async function get_shfe_rank_table(date = null, vars_list = cons.contract_symbols) {
    /**
     * 上海期货交易所会员成交及持仓排名表
     * https://www.shfe.com.cn/
     * https://tsite.shfe.com.cn/statements/dataview.html?paramid=kx
     * 注：该交易所只公布每个品种内部的标的排名，没有公布品种的总排名
     * 数据从 20020107 开始，每交易日 16:30 左右更新数据
     * @param {string} date - 交易日
     * @param {Array<string>} vars_list - 合约品种如 RB、AL等列表; 为空时为所有商品
     * @return {Object} - 上海期货交易所会员成交及持仓排名表
     */
    let d = date ? cons.convert_date(date) : dayjs().format('YYYYMMDD');
    if (d < '20020107') {
        console.log("shfe数据源开始日期为 20020107，跳过");
        return {};
    }
    if (!calendar.includes(d)) {
        console.warn(`${d} 非交易日`);
        return {};
    }
    const url = cons.SHFE_VOL_RANK_URL.replace('%s', d);
    try {
        const response = await axios.get(url, { headers: cons.shfe_headers });
        const context = response.data;
        const df = _.map(context.o_cursor, row => ({
            vol: row.CJ1,
            vol_chg: row.CJ1_CHG,
            long_open_interest: row.CJ2,
            long_open_interest_chg: row.CJ2_CHG,
            short_open_interest: row.CJ3,
            short_open_interest_chg: row.CJ3_CHG,
            vol_party_name: row.PARTICIPANTABBR1,
            long_party_name: row.PARTICIPANTABBR2,
            short_party_name: row.PARTICIPANTABBR3,
            product1: row.PRODUCTNAME,
            rank: row.RANK,
            symbol: row.INSTRUMENTID,
            product2: row.PRODUCTSORTNO,
        }));

        // 过滤并处理数据
        df.forEach(row => {
            _.forOwn(row, (value, key) => {
                if (_.isString(value)) {
                    row[key] = value.trim();
                }
                if (value === "") {
                    row[key] = null;
                }
            });
            row.variety = symbol_varieties(row.symbol);
        });

        df = _.filter(df, row => row.rank > 0);

        // 删除不需要的列
        _.forEach(['PARTICIPANTID1', 'PARTICIPANTID2', 'PARTICIPANTID3', 'product1', 'product2'], col => {
            _.forEach(df, row => delete row[col]);
        });

        const get_vars = _.intersection(vars_list, _.map(df, 'variety'));
        const big_dict = {};
        _.forEach(get_vars, varName => {
            const df_var = _.filter(df, row => row.variety === varName);
            _.forEach(_.uniqBy(df_var, 'symbol'), symbolRow => {
                const symbol = symbolRow.symbol.toUpperCase();
                const df_symbol = _.filter(df_var, row => row.symbol === symbol);
                big_dict[symbol] = df_symbol;
            });
        });
        return big_dict;
    } catch (error) {
        console.error(error);
        return {};
    }
}
///郑州商品交易所的网页数据
const cheerio = require('cheerio');

async function _czce_df_read(url, skipRows, encoding = "utf-8", header = 0) {
    /**
     * 郑州商品交易所的网页数据
     * @param {string} url - 网站
     * @param {number} skipRows - 去掉前几行
     * @param {string} encoding - 编码方式，默认为utf-8
     * @param {number} header - 表头所在行
     * @returns {Array<Array>} - 类似于DataFrame的数据结构
     */
    const headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
        "Host": "www.czce.com.cn",
        "Cookie": "XquW6dFMPxV380S=CAaD3sMkdXv3fUoaJlICIEv0MVegGq5EoMyBcxkOjCgSjmpuovYFuTLtYFcxTZGw; XquW6dFMPxV380T=5QTTjUlA6f6WiDO7fMGmqNxHBWz.hKIc8lb_tc1o4nHrJM4nsXCAI9VHaKyV_jkHh4cIVvD25kGQAh.MvLL1SHRA20HCG9mVVHPhAzktNdPK3evjm0NYbTg2Gu_XGGtPhecxLvdFQ0.JlAxy_z0C15_KdO8kOI18i4K0rFERNPxjXq5qG1Gs.QiOm976wODY.pe8XCQtAsuLYJ.N4DpTgNfHJp04jhMl0SntHhr.jhh3dFjMXBx.JEHngXBzY6gQAhER7uSKAeSktruxFeuKlebse.vrPghHqWvJm4WPTEvDQ8q"
    };

    try {
        const response = await axios.get(url, { headers, responseType: 'text' });
        const $ = cheerio.load(response.data);
        const tables = $('table').toArray();
        const tableData = [];

        for (let table of tables) {
            let rows = $(table).find('tr').slice(skipRows).toArray();
            if (header >= 0) {
                // 获取表头
                const headersRow = $(rows.shift()).find('th, td').map((i, el) => $(el).text().trim()).get();
                // 跳过指定数量的表头行
                for (let i = 1; i < header; i++) {
                    rows.shift();
                }
                // 将每一行数据与表头结合
                for (let row of rows) {
                    const rowData = $(row).find('td').map((i, el) => $(el).text().trim()).get();
                    tableData.push(_.zipObject(headersRow, rowData));
                }
            } else {
                // 如果没有指定表头，则直接读取所有行
                for (let row of rows) {
                    tableData.push($(row).find('td').map((i, el) => $(el).text().trim()).get());
                }
            }
        }

        return tableData;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
}
///郑州商品交易所前 20 会员持仓排名数据明细
const XLSX = require('xlsx');

async function get_czce_rank_table(date = dayjs().format('YYYYMMDD')) {
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    };

    // 转换日期格式
    date = dayjs(date, ["YYYY-MM-DD", "YYYYMMDD"]).format("YYYYMMDD");
    if (date < '20151008') {
        console.log("CZCE可获取的数据源开始日期为 20151008, 请输入合适的日期参数");
        return {};
    }

    // 检查是否为交易日（此处假设calendar是一个包含所有交易日的数组）
    const calendar = []; // 这里需要提供一个实际的交易日历数据
    if (!calendar.includes(date)) {
        console.warn(`${date} 非交易日`);
        return {};
    }

    const url = `http://www.czce.com.cn/cn/DFSStaticFiles/Future/${date.slice(0, 4)}/${date}/FutureDataHolding.xls`;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', headers });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const temp_df = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // 处理数据...
        // 由于JavaScript与Python在处理DataFrame上的差异，这里需要手动重构上述逻辑
        // 以下是简化后的处理逻辑，具体细节可能需要根据实际情况调整

        let big_dict = {};
        for (let i = 0; i < temp_df.length; i++) {
            if (temp_df[i][0] && temp_df[i][0].includes('合计')) {
                // 根据条件分割数据并构建big_dict
                // 注意：这里需要根据实际数据结构和需求进行调整
            }
        }

        // 添加symbol和variety字段
        for (let key in big_dict) {
            big_dict[key] = big_dict[key].map(row => ({
                ...row,
                symbol: key,
                variety: key.match(/[a-zA-Z_]+/)[0]
            }));
        }

        return big_dict;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        return {};
    }
}

// 注意：上面的代码片段需要根据实际数据结构调整。
///大连商品交易所取消了品种排名，只提供标的合约排名，需要获取标的合约列表
const cheerio = require('cheerio');

async function _getDceContractList(date, var) {
    /**
     * 大连商品交易所取消了品种排名，只提供标的合约排名，需要获取标的合约列表
     * @param {dayjs.Dayjs} date 日期对象, 如果为空则默认为当天
     * @param {string} var 合约品种
     * @return {Promise<Array<string>>} 公布了持仓排名的合约列表
     */
    const url = "http://www.dce.com.cn/publicweb/quotesdata/memberDealPosiQuotes.html";
    const headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Connection": "close",
        "Host": "www.dce.com.cn",
        "Origin": "http://www.dce.com.cn",
        "Pragma": "no-cache",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36"
    };
    const params = new URLSearchParams({
        "memberDealPosiQuotes.variety": var.toLowerCase(),
        "memberDealPosiQuotes.trade_type": "0",
        "year": date.year,
        "month": date.month() - 1,
        "day": date.date(),
        "contract.contract_id": "all",
        "contract.variety_id": var.toLowerCase(),
        "contract": ""
    });

    while (true) {
        try {
            const response = await axios.post(url, params, { headers: headers });
            const $ = cheerio.load(response.data);
            const contractList = $('input[name="contract"]').map((index, element) => {
                const match = $(element).attr('onclick').match(/setContract_id\('(\d+)'\)/);
                return match ? var.toLowerCase() + match[1] : null;
            }).get().filter(Boolean); // 过滤掉所有非真值元素

            return contractList;
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒后重试
        }
    }
}
///大连商品交易所前 20 会员持仓排名数据明细, 由于交易所网站问题, 需要 20200720 之后才有数据

// 假设这些是预先定义好的常量和函数
const cons = {
    contract_symbols: [], // 合约品种列表
    market_exchange_symbols: { dce: [] }, // 交易所符号映射
    DCE_VOL_RANK_URL_1: 'http://example.com/%s/%s_%s_%d_%d_%d.xls', // 示例URL模板
    convert_date: (date) => new Date(date), // 转换日期函数
};

// 假设这是一个预定义的日历对象，用于检查交易日
const calendar = {};

async function get_dce_rank_table(date = "20230706", vars_list = cons.contract_symbols) {
    console.log("如果本接口不可用，请使用 ak.futures_dce_position_rank() 接口");
    const dateString = date;
    const dateObj = date ? cons.convert_date(date) : new Date();
    if (dateObj < new Date(2006, 0, 4)) {
        console.error("大连商品交易所数据源开始日期为 20060104，跳过");
        return {};
    }
    if (!calendar[dayjs(dateObj).format('YYYYMMDD')]) {
        console.warn(`${dayjs(dateObj).format('YYYYMMDD')}非交易日`);
        return {};
    }
    vars_list = vars_list.filter(i => cons.market_exchange_symbols.dce.includes(i));
    let bigDict = {};

    for (let varSymbol of vars_list) {
        const symbolList = _get_dce_contract_list(dateObj, varSymbol); // 假设这是获取合约列表的函数
        for (let symbol of symbolList) {
            const url = cons.DCE_VOL_RANK_URL_1.replace(/%s/g, varSymbol.toLowerCase())
                .replace('%d', dateObj.getFullYear())
                .replace('%d', dateObj.getMonth()) // 注意：月份从0开始
                .replace('%d', dateObj.getDate());

            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                const workbook = XLSX.read(response.data, { type: 'buffer' }); // 需要安装xlsx库解析Excel
                const sheetName = workbook.SheetNames[0];
                const temp_df = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                // 处理数据...
                // ... 省略中间的数据处理部分，因为这需要更详细的逻辑转换
                bigDict[symbol] = temp_df; // 存储处理后的数据
            } catch (error) {
                const tempUrl = "http://www.dce.com.cn/publicweb/quotesdata/memberDealPosiQuotes.html";
                const payload = {
                    "memberDealPosiQuotes.variety": varSymbol.toLowerCase(),
                    "memberDealPosiQuotes.trade_type": "0",
                    "year": dateObj.getFullYear(),
                    "month": dateObj.getMonth(), // 注意：月份从0开始
                    "day": String(dateObj.getDate()).padStart(2, '0'),
                    "contract.contract_id": symbol,
                    "contract.variety_id": varSymbol.toLowerCase(),
                    "contract": "",
                };
                const r = await axios.post(tempUrl, payload);
                if (r.status !== 200) {
                    bigDict[symbol] = {};
                } else {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(r.data, "text/html");
                    const temp_df = parseHtmlTable(doc.getElementsByTagName('table')[1]); // 假设这是解析HTML表格的函数
                    // 处理数据...
                    // ... 省略中间的数据处理部分
                    bigDict[symbol] = temp_df; // 存储处理后的数据
                }
            }
        }
    }
    return bigDict;
}

// 这里可能需要实现一个函数来解析HTML表格，例如parseHtmlTable
function parseHtmlTable(table) {
    // 实现解析HTML表格的逻辑
    // ...
}
///中国金融期货交易所前 20 会员持仓排名数据明细

// 假设 cons 和 _table_cut_cal 已经定义好
// const cons = { ... };
// function _table_cut_cal(table, symbol) { ... }

async function get_cffex_rank_table(date = "20190805", vars_list = cons.contract_symbols) {
    /**
     * 中国金融期货交易所前 20 会员持仓排名数据明细
     * http://www.cffex.com.cn/ccpm/
     * 注：该交易所既公布品种排名，也公布标的排名
     * @param {string} date - 日期 format：YYYY-MM-DD 或 YYYYMMDD 或 datetime.date对象 为空时为当天
     * @param {Array} vars_list - 合约品种如RB、AL等列表 为空时为所有商品, 数据从20100416开始，每交易日16:30左右更新数据
     * @return {Object} - 返回一个对象，键是合约符号，值是对应的排名数据
     */
    vars_list = vars_list.filter(i => cons.market_exchange_symbols["cffex"].includes(i));
    date = date ? cons.convert_date(date) : dayjs().format('YYYYMMDD');
    if (date < '20100416') {
        console.error(new Error("CFFEX 数据源开始日期为 20100416，跳过"));
        return {};
    }
    if (!cons.calendar.includes(dayjs(date, 'YYYYMMDD').format('YYYYMMDD'))) {
        console.warn(`${date} 非交易日`);
        return {};
    }

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
    };

    const big_dict = {};
    for (const var_ of vars_list) {
        const url = cons.CFFEX_VOL_RANK_URL.replace('%s', dayjs(date, 'YYYYMMDD').format('YYYYMM')).replace('%s', dayjs(date, 'YYYYMMDD').format('DD')).replace('%s', var_);
        try {
            const response = await axios.get(url, { headers });
            if (response.status === 200) {
                let table;
                try {
                    // 当所需要的合约没有数据时
                    const temp_df = parseCsv(response.data);
                    const needIndex = temp_df[0].indexOf("交易日");
                    if (needIndex > -1 && temp_df.filter(row => row[needIndex] === "交易日").length > 2) {
                        table = temp_df.slice(temp_df.findIndex(row => row[needIndex] === "交易日") + 1).map(row => row.join(','));
                        table = parseCsv(table);
                    } else {
                        table = temp_df;
                    }
                } catch (error) {
                    continue;
                }

                table = table.filter(row => !row.some(cell => cell === null || cell === undefined || (typeof cell === 'string' && cell.trim() === '')));
                table = table.map(row => row.map(cell => typeof cell === 'string' ? cell.trim() : cell));
                const index = table[0].indexOf("交易日");
                if (index > -1) table = table.map(row => [row.slice(0, index), row.slice(index + 1)].flat());

                for (const symbol of new Set(table.map(row => row[table[0].indexOf("合约")]))) {
                    const tableCut = table.filter(row => row[table[0].indexOf("合约")] === symbol);
                    const header = ["symbol", "rank", ...rank_columns];
                    const tableCutWithHeader = tableCut.map((row, i) => i === 0 ? header : row);
                    const processedTable = _table_cut_cal(tableCutWithHeader, symbol);
                    big_dict[symbol] = processedTable;
                }
            }
        } catch (error) {
            console.error(error);
            return;
        }
    }
    return big_dict;
}

function parseCsv(csv) {
    // 这里应该实现 CSV 解析逻辑，或者使用第三方库如 'papaparse'
    // 为了简化示例，这里假设返回一个二维数组
    return csv.split('\n').map(line => line.split(','));
}
///表格切分
// 假设intColumns是一个已定义的数组，包含需要转换为整数类型的列名
// 以及symbol_varieties是一个已经定义好的函数，用于从symbol获取var

function _table_cut_cal(tableCut, symbol) {
    // 获取品种
    const varVariety = symbol_varieties(symbol);

    // 将特定列转换为整数类型
    tableCut.forEach(row => {
        intColumns.concat("rank").forEach(col => {
            if (row.hasOwnProperty(col)) {
                row[col] = parseInt(row[col], 10);
            }
        });
    });

    // 计算表格总和
    const tableCutSum = _.reduce(tableCut, (sums, n) => _.mapValues(n, (value, key) => sums[key] ? sums[key] + value : value), {});

    // 设置rank为999
    tableCutSum["rank"] = 999;

    // 对于vol_party_name, long_party_name, short_party_name设置为null
    ["vol_party_name", "long_party_name", "short_party_name"].forEach(col => {
        tableCutSum[col] = null;
    });

    // 合并原始数据和总和行
    tableCut.push(tableCutSum);

    // 添加symbol和variety字段
    tableCut.forEach(row => {
        row["symbol"] = symbol;
        row["variety"] = varVariety;
    });

    // 再次确保特定列为整数类型
    tableCut.forEach(row => {
        intColumns.concat("rank").forEach(col => {
            if (row.hasOwnProperty(col)) {
                row[col] = parseInt(row[col], 10);
            }
        });
    });

    return tableCut;
}
///大连商品交易所-每日持仓排名-具体合约
const { unzip, strFromU8 } = require('fflate'); // 用于解压zip文件

// 假设 cons.contract_symbols 是一个预定义的变量
const contractSymbols = cons.contract_symbols; // 需要根据实际情况定义这个变量

async function futuresDcePositionRank(date = "20160919", varsList = contractSymbols) {
    const convertDate = (dateStr) => dayjs(dateStr, 'YYYYMMDD').toDate();
    const isTradingDay = (date) => {
        // 这里需要实现一个函数来检查给定日期是否为交易日
        // 示例中返回true，实际应用时需要替换为真实的逻辑
        return true;
    };

    date = date ? convertDate(date) : new Date();
    if (!isTradingDay(date)) {
        console.warn(`${dayjs(date).format('YYYYMMDD')}非交易日`);
        return {};
    }

    const url = "http://www.dce.com.cn/publicweb/quotesdata/exportMemberDealPosiQuotesBatchData.html";
    const headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Content-Length": "160",
        "Content-Type": "application/x-www-form-urlencoded",
        "Host": "www.dce.com.cn",
        "Origin": "http://www.dce.com.cn",
        "Pragma": "no-cache",
        "Referer": "http://www.dce.com.cn/publicweb/quotesdata/memberDealPosiQuotes.html",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36"
    };
    const payload = new URLSearchParams({
        "memberDealPosiQuotes.variety": "a",
        "memberDealPosiQuotes.trade_type": "0",
        "contract.contract_id": "a2009",
        "contract.variety_id": "a",
        "year": date.getFullYear(),
        "month": date.getMonth(), // 注意月份是从0开始计数的
        "day": _.padStart(String(date.getDate()), 2, '0'),
        "batchExportFlag": "batch"
    });

    try {
        const response = await axios.post(url, payload.toString(), { headers });
        const zipData = new Uint8Array(response.data);
        let bigDict = {};

        await unzip(zipData, (error, files) => {
            if (error) throw error;

            for (let [filename, content] of Object.entries(files)) {
                filename = decodeURIComponent(escape(strFromU8(content)));
                if (!filename.startsWith(dayjs(date).format('YYYYMMDD'))) continue;

                // 解析文本内容
                // 这里我们需要实现解析逻辑，类似于Python中的pd.read_table
                // 由于JavaScript缺乏直接的替代品，这部分需要手动编写或使用其他库
                // 为了简化示例，这里不提供完整的解析逻辑
                // ...
                
                // 处理数据并存储到bigDict
                // ...

                // 删除不符合条件的条目
                bigDict = _.pickBy(bigDict, (value, key) => _.includes(varsList, key.replace(/\d/g, '').toUpperCase()));
                bigDict = _.pickBy(bigDict, (value) => value.length > 1);
            }
        });

        return bigDict;
    } catch (error) {
        console.error(error);
        return {};
    }
}
///大连商品交易所-每日持仓排名-具体合约-补充
const cheerio = require('cheerio');

async function futuresDcePositionRankOther(date = "20160104") {
    const convertDate = (date) => {
        if (date === null) return dayjs();
        return dayjs(date, 'YYYYMMDD').toDate();
    };

    const dateObj = convertDate(date);
    const formattedDate = dayjs(dateObj).format('YYYYMMDD');
    // 假设calendar是一个有效的交易日列表
    if (!calendar.includes(formattedDate)) {
        console.warn(`${formattedDate}非交易日`);
        return {};
    }

    const url = "http://www.dce.com.cn/publicweb/quotesdata/memberDealPosiQuotes.html";
    const payload = {
        "memberDealPosiQuotes.variety": "c",
        "memberDealPosiQuotes.trade_type": "0",
        "year": dateObj.getFullYear(),
        "month": dateObj.getMonth(),  // JavaScript中的月份是从0开始的
        "day": dateObj.getDate(),
        "contract.contract_id": "all",
        "contract.variety_id": "c",
        "contract": "",
    };

    try {
        const response = await axios.post(url, new URLSearchParams(payload));
        const $ = cheerio.load(response.data);
        const symbolList = $('.selBox').last().find('input')
            .map((i, el) => $(el).attr('onclick').replace("javascript:setVariety('", '').replace("');", '')).get();

        const bigDf = {};

        for (const symbol of symbolList) {
            const symbolPayload = { ...payload, "memberDealPosiQuotes.variety": symbol, "contract.variety_id": symbol };
            const symbolResponse = await axios.post(url, new URLSearchParams(symbolPayload));
            const $$ = cheerio.load(symbolResponse.data);
            const contractList = $$('input[name="contract"]')
                .map((i, el) => $(el).attr('onclick').replace("javascript:setContract_id('", '').replace("');", '')).get();

            if (contractList && contractList[0].length === 4) {
                contractList.forEach(contract => {
                    const fullContract = symbol + contract;
                    const contractPayload = { ...symbolPayload, "contract.contract_id": fullContract };
                    axios.post(url, new URLSearchParams(contractPayload))
                        .then(response => {
                            const $$$$ = cheerio.load(response.data);
                            const table = $$$$('table').eq(1); // 假设表格是页面上的第二个表格
                            const tempDf = [];
                            table.find('tr:lt(-1)').each((i, row) => {
                                const cells = $(row).find('td');
                                tempDf.push({
                                    rank: cells.eq(0).text(),
                                    vol_party_name: cells.eq(1).text(),
                                    vol: cells.eq(2).text(),
                                    vol_chg: cells.eq(3).text(),
                                    long_party_name: cells.eq(5).text(),
                                    long_open_interest: cells.eq(6).text(),
                                    long_open_interest_chg: cells.eq(7).text(),
                                    short_party_name: cells.eq(9).text(),
                                    short_open_interest: cells.eq(10).text(),
                                    short_open_interest_chg: cells.eq(11).text(),
                                    symbol: fullContract,
                                    variety: symbol.toUpperCase()
                                });
                            });
                            bigDf[fullContract] = tempDf;
                        });
                });
            }
        }
        return bigDf;
    } catch (error) {
        console.error(error);
        return {};
    }
}
///广州期货交易所-合约品种名称列表

async function __futures_gfex_vars_list() {
    /**
     * 广州期货交易所-合约品种名称列表
     * http://www.gfex.com.cn/gfex/rcjccpm/hqsj_tjsj.shtml
     * @return {Array} 合约品种名称列表
     */
    const url = "http://www.gfex.com.cn/u/interfacesWebVariety/loadList";
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    };

    try {
        const response = await axios.post(url, null, { headers: headers });
        const dataJson = response.data;
        const tempData = dataJson.data;
        const varList = _.map(tempData, 'varietyId');
        return varList;
    } catch (error) {
        console.error("Error fetching data from GFEX:", error);
        throw error; // 或者你可以选择返回一个空数组或其他默认值
    }
}
///广州期货交易所-合约具体名称列表

async function __futures_gfex_contract_list(symbol = "si", date = "20231113") {
    /**
     * 广州期货交易所-合约具体名称列表
     * http://www.gfex.com.cn/gfex/rcjccpm/hqsj_tjsj.shtml
     * @param {string} symbol - 品种
     * @param {string} date - 交易日
     * @returns {Promise<Array>} 合约具体名称列表
     */
    const url = "http://www.gfex.com.cn/u/interfacesWebTiMemberDealPosiQuotes/loadListContract_id";
    const payload = {
        variety: symbol,
        trade_date: date,
    };
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    };

    try {
        const response = await axios.post(url, payload, { headers });
        const dataJson = response.data;
        const tempData = dataJson.data || [];
        const contractList = tempData.map(item => item[0]);
        return contractList;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者你可以选择返回一个空数组或其他默认值
    }
}
///广州期货交易所-合约具体数据

async function __futures_gfex_contract_data(symbol = "si", contract_id = "si2312", date = "20231113") {
    const url = "http://www.gfex.com.cn/u/interfacesWebTiMemberDealPosiQuotes/loadList";
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    };
    let big_df = [];

    for (let page = 1; page < 4; page++) {
        const payload = {
            trade_date: date,
            trade_type: "0",
            variety: symbol,
            contract_id: contract_id,
            data_type: page.toString()
        };

        try {
            const response = await axios.post(url, payload, { headers });
            const data_json = response.data;
            let temp_df = data_json.data;

            if (_.has(temp_df[0], 'qtySub')) {
                temp_df = _.map(temp_df, item => ({
                    vol_party_name: item.abbr,
                    vol: item.todayQty,
                    vol_chg: item.qtySub
                }));
            } else {
                temp_df = _.map(temp_df, item => ({
                    vol_party_name: item.abbr,
                    vol: item.todayQty,
                    vol_chg: item.todayQtyChg
                }));
            }

            // 假设big_df是二维数组，这里我们简单地合并数据。
            // 在实际应用中，你可能需要更复杂的逻辑来正确合并这些数据。
            big_df = big_df.concat(temp_df);
        } catch (error) {
            console.error(`Error fetching data for page ${page}:`, error);
        }
    }

    // 处理索引并添加额外字段
    big_df = big_df.map((row, index) => ({
        ...row,
        rank: index + 1,
        symbol: contract_id.toUpperCase(),
        variety: symbol.toUpperCase()
    }));

    // 删除最后一行（假设与Python代码中的big_df.iloc[:-1, :]等效）
    big_df.pop();

    // 转换数值类型
    ['vol', 'vol_chg', 'long_open_interest', 'long_open_interest_chg', 'short_open_interest', 'short_open_interest_chg'].forEach(key => {
        big_df.forEach(row => {
            row[key] = parseFloat(row[key]) || 0; // 如果转换失败则设置为0
        });
    });

    return big_df;
}
///广州期货交易所-日成交持仓排名
// 假设已经定义了如下函数或它们的等价物
// const cons = { convert_date: (date) => ... };
// const calendar = [...]; // 交易日历
// function __futures_gfex_vars_list() {...}
// function __futures_gfex_contract_list(symbol, date) {...}
// function __futures_gfex_contract_data(symbol, contract_id, date) {...}

function futuresGfexPositionRank(date = "20231113", varsList = null) {
    /**
     * 广州期货交易所-日成交持仓排名
     * http://www.gfex.com.cn/gfex/rcjccpm/hqsj_tjsj.shtml
     * @param {string} date - 开始日期; 广州期货交易所的日成交持仓排名从 20231110 开始
     * @param {Array<string>} [varsList] - 商品代码列表
     * @returns {Object} 日成交持仓排名
     */
    let currentDate = date ? cons.convert_date(date) : dayjs().format("YYYYMMDD");
    if (!calendar.includes(currentDate)) {
        console.warn(`${currentDate} 非交易日`);
        return {};
    }
    if (varsList === null) {
        varsList = __futures_gfex_vars_list();
    } else {
        varsList = varsList.map(item => item.toLowerCase());
    }
    let bigDict = {};
    for (let item of varsList) {
        try {
            let futuresContractList = __futures_gfex_contract_list(item.toLowerCase(), currentDate);
            for (let name of futuresContractList) {
                try {
                    let tempDf = __futures_gfex_contract_data(item.toLowerCase(), name, currentDate);
                    bigDict[name] = tempDf;
                } catch (error) {
                    return {};
                }
            }
        } catch (error) {
            return {};
        }
    }
    return bigDict;
}
module.exports = {
    get_rank_sum_daily : get_rank_sum_daily,
    get_rank_sum : get_rank_sum,
    get_shfe_rank_table : get_shfe_rank_table,
    _czce_df_read : _czce_df_read,
    get_czce_rank_table : get_czce_rank_table,
    _get_dce_contract_list : _get_dce_contract_list,
    get_dce_rank_table : get_dce_rank_table,
    get_cffex_rank_table : get_cffex_rank_table,
    _table_cut_cal : _table_cut_cal,
    futures_dce_position_rank : futures_dce_position_rank,
    futures_dce_position_rank_other : futures_dce_position_rank_other,
    __futures_gfex_vars_list : __futures_gfex_vars_list,
    __futures_gfex_contract_list : __futures_gfex_contract_list,
    __futures_gfex_contract_data : __futures_gfex_contract_data,
    futures_gfex_position_rank : futures_gfex_position_rank,
};