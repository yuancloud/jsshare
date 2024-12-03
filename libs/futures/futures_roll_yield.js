const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///指定交易日指定品种（主力和次主力）或任意两个合约的展期收益率
const warnings = require('some-warning-module'); // 假设有一个warning模块

function get_roll_yield(date = null, varName = "BB", symbol1 = null, symbol2 = null, df = null) {
    /**
     * 指定交易日指定品种（主力和次主力）或任意两个合约的展期收益率
     * @param {string} date - 某一天日期 format： YYYYMMDD
     * @param {string} varName - 合约品种如 RB、AL 等
     * @param {string} symbol1 - 合约 1 如 rb1810
     * @param {string} symbol2 - 合约 2 如 rb1812
     * @param {Object|null} df - DataFrame或null 从dailyBar得到合约价格，如果为空就在函数内部抓dailyBar
     * @return {Array|boolean|null} 展期收益率及相关的符号信息
     */

    const today = dayjs().format('YYYYMMDD');
    date = date ? convertDate(date) : today; // 假设convertDate是一个已定义的函数，用于转换日期格式

    if (!calendar[date]) {
        warnings.warn(`${date}非交易日`);
        return null;
    }

    if (symbol1) {
        varName = symbol_varieties(symbol1); // 假设symbol_varieties是一个已定义的函数
    }

    if (!_.isObject(df)) {
        const market = symbol_market(varName); // 假设symbol_market是一个已定义的函数
        df = get_futures_daily({ start_date: date, end_date: date, market }); // 假设get_futures_daily是一个已定义的函数
    }

    if (varName) {
        df = _.filter(df, item => !item.symbol.includes("efp")); // 过滤掉包含"efp"的项目
        df = _.orderBy(df, ['open_interest'], ['desc']); // 根据持仓量降序排序
        df.forEach(item => item.close = parseFloat(item.close)); // 将close字段转换为浮点数

        if (df.length < 2) {
            return null;
        }

        symbol1 = df[0].symbol;
        symbol2 = df[1].symbol;
    }

    const close1 = _.find(df, { symbol: symbol1 }).close;
    const close2 = _.find(df, { symbol: symbol2 }).close;

    const a = parseInt(_.replace(symbol1, /\D/g, ''));
    const a_1 = Math.floor(a / 100);
    const a_2 = a % 100;
    const b = parseInt(_.replace(symbol2, /\D/g, ''));
    const b_1 = Math.floor(b / 100);
    const b_2 = b % 100;
    const c = (a_1 - b_1) * 12 + (a_2 - b_2);

    if (close1 === 0 || close2 === 0) {
        return false;
    }

    const result = Math.log(close2 / close1) / c * 12;
    return c > 0 ? [result, symbol2, symbol1] : [result, symbol1, symbol2];
}

// 注意：上述代码中的某些函数（例如convertDate, symbol_varieties, symbol_market, get_futures_daily）需要在您的环境中实现。
///展期收益率

function getRollYieldBar(typeMethod = "var", varSymbol = "RB", date = "20201030", startDay = null, endDay = null) {
    const convertDate = (inputDate) => inputDate ? dayjs(inputDate, 'YYYYMMDD').toDate() : new Date();

    let currentDate = convertDate(date);
    let startDate = convertDate(startDay) || new Date();
    let endDate = convertDate(endDay) || convertDate(cons.getLatestDataDate(new Date()));

    if (typeMethod === "symbol") {
        let df = getFuturesDaily({ startDate: currentDate, endDate: currentDate, market: symbolMarket(varSymbol) });
        df = _.filter(df, { variety: varSymbol });
        return df;
    }

    if (typeMethod === "var") {
        let df = [];
        ["dce", "cffex", "shfe", "czce", "gfex"].forEach(market => {
            df = df.concat(getFuturesDaily({ startDate: currentDate, endDate: currentDate, market: market }));
        });
        let varList = _.uniqBy(df, 'variety').map(item => item.variety);
        ['IO', 'MO', 'HO'].forEach(iRemove => {
            if (varList.includes(iRemove)) {
                _.pull(varList, iRemove);
            }
        });
        let dfL = [];
        varList.forEach(variety => {
            let ry = getRollYield(currentDate, variety, df);
            if (ry) {
                dfL.push({
                    roll_yield: ry.roll_yield,
                    near_by: ry.near_by,
                    deferred: ry.deferred,
                    index: variety
                });
            }
        });
        dfL = _.orderBy(dfL, ['roll_yield'], ['asc']);
        return dfL;
    }

    if (typeMethod === "date") {
        let dfL = [];
        while (dayjs(startDate).isSameOrBefore(dayjs(endDate))) {
            try {
                let ry = getRollYield(startDate, varSymbol);
                if (ry) {
                    dfL.push({
                        roll_yield: ry.roll_yield,
                        near_by: ry.near_by,
                        deferred: ry.deferred,
                        index: dayjs(startDate).format('YYYYMMDD')
                    });
                }
            } catch (e) {
                // Handle error or ignore
            } finally {
                startDate = dayjs(startDate).add(1, 'day').toDate();
            }
        }
        return dfL;
    }
}
module.exports = {
    get_roll_yield: get_roll_yield,
    get_roll_yield_bar: get_roll_yield_bar,
};