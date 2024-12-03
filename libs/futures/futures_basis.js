const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///指定时间段内大宗商品现货价格及相应基差

function futures_spot_price_daily(start_day = "20210201", end_day = "20210208", vars_list = cons.contract_symbols) {
    /**
     * 指定时间段内大宗商品现货价格及相应基差
     * https://www.100ppi.com/sf/
     * @param {string} start_day 开始日期 format：YYYY-MM-DD 或 YYYYMMDD 或 Date对象; 默认为当天
     * @param {string} end_day 结束日期 format：YYYY-MM-DD 或 YYYYMMDD 或 Date对象; 默认为当天
     * @param {Array<string>} vars_list 合约品种如 ["RB", "AL"]; 默认参数为所有商品
     * @return {Array<Object>} 数据集
     * 展期收益率数据:
     * var               商品品种                      string
     * sp                现货价格                      float
     * near_symbol       临近交割合约                  string
     * near_price        临近交割合约结算价             float
     * dom_symbol        主力合约                      string
     * dom_price         主力合约结算价                 float
     * near_basis        临近交割合约相对现货的基差      float
     * dom_basis         主力合约相对现货的基差          float
     * near_basis_rate   临近交割合约相对现货的基差率    float
     * dom_basis_rate    主力合约相对现货的基差率        float
     * date              日期                          string YYYYMMDD
     */

    // 将日期字符串转换为Date对象
    function convert_date(date) {
        if (date instanceof Date) return date;
        return dayjs(date, ['YYYY-MM-DD', 'YYYYMMDD']).toDate();
    }

    start_day = convert_date(start_day) || new Date();
    end_day = convert_date(end_day) || convert_date(cons.get_latest_data_date(new Date()));

    let df_list = [];
    while (start_day <= end_day) {
        let temp_df = futures_spot_price(dayjs(start_day).format('YYYYMMDD'), vars_list);
        if (temp_df === false) {
            return _.flatMap(df_list);  // 使用lodash的flatMap来模拟pandas.concat的行为
        } else if (temp_df !== null && temp_df.length > 0) {
            df_list.push(...temp_df);  // 将获取到的数据添加到列表中
        }
        start_day.setDate(start_day.getDate() + 1);  // 增加一天
    }
    if (df_list.length > 0) {
        return _.uniqBy(df_list, 'date');  // 使用lodash确保日期唯一性，模拟reset_index(drop=True)
    }
    return [];
}

// 注意：这里的futures_spot_price函数需要根据实际情况实现。
///指定交易日大宗商品现货价格及相应基差

// 假设 cons 和 _check_information 是已定义的外部模块或函数
// const { contract_symbols, convert_date, calendar } = require('./cons');
// const _check_information = require('./_check_information');

async function futuresSpotPrice(date = "20240430", varsList = contract_symbols) {
    // 将输入的日期转换为正确的格式
    date = convert_date(date) || dayjs().format('YYYYMMDD');
    if (dayjs(date, 'YYYYMMDD').isBefore(dayjs('20110104', 'YYYYMMDD'))) {
        throw new Error("数据源开始日期为 20110104, 请将获取数据时间点设置在 20110104 后");
    }
    if (!calendar.includes(date)) {
        console.warn(`${date}非交易日`);
        return [];
    }

    const u1 = "https://www.100ppi.com/sf/";
    const u2 = `https://www.100ppi.com/sf/day-${dayjs(date, 'YYYYMMDD').format('YYYY-MM-DD')}.html`;
    let i = 1;

    while (true) {
        for (const url of [u2, u1]) {
            try {
                const response = await axios.get(url);
                const $ = cheerio.load(response.data); // 使用cheerio解析HTML
                const string = $('table tr:eq(1) td:eq(1)').text();
                const news = string.replace(/\D/g, '');
                if (news.substring(3, 11) === date) {
                    const records = _check_information($('table:eq(1)').html(), date);
                    const varListInMarket = varsList.filter(i => records.some(record => record.symbol === i));
                    const tempRecords = records.filter(record => varListInMarket.includes(record.symbol));
                    return tempRecords;
                } else {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            } catch (error) {
                console.log(`${date}日生意社数据连接失败，第${i}次尝试，最多5次`);
                i++;
                if (i > 5) {
                    console.log(`${date}日生意社数据连接失败, 如果当前交易日是 2018-09-12, 由于生意社源数据缺失, 无法访问, 否则为重复访问已超过5次，您的地址被网站墙了，请保存好返回数据，稍后从该日期起重试`);
                    return [];
                }
            }
        }
    }
}

// 注意: 上面的代码中使用了cheerio库来解析HTML，你需要安装它：npm install cheerio
///数据验证和计算模块

function _check_information(df_data, date) {
    // 选择需要的列
    const selectedColumns = [0, 1, 2, 3, 5, 6];
    df_data = _.map(df_data, row => _.pick(row, selectedColumns));

    // 重命名列
    const columnsMapping = {
        0: "symbol",
        1: "spot_price",
        2: "near_contract",
        3: "near_contract_price",
        5: "dominant_contract",
        6: "dominant_contract_price"
    };
    df_data = _.map(df_data, row => _.mapKeys(row, (v, k) => columnsMapping[k]));

    let records = [];
    for (let string of _.map(df_data, 'symbol')) {
        let news = string === "PTA" ? "PTA" : string.match(/[\u4e00-\u9fa5]/g)?.join('');
        if (news && !["商品", "价格", "上海期货交易所", "郑州商品交易所", "大连商品交易所", "广州期货交易所"].includes(news)) {
            let symbol = chinese_to_english(news); // 假设这个函数已经在别处定义
            let record = _.filter(df_data, { symbol: string });
            record[0].symbol = symbol;
            record[0].spot_price = parseFloat(record[0].spot_price);
            if (symbol === "JD") {
                record[0].spot_price *= 500; // 鸡蛋现货单位换算
            } else if (symbol === "FG") {
                record[0].spot_price *= 80; // 玻璃现货单位换算
            }
            records = [...records, ...record];
        }
    }

    // 将特定列转换为浮点数
    records = _.map(records, row => ({
        ...row,
        near_contract_price: parseFloat(row.near_contract_price),
        dominant_contract_price: parseFloat(row.dominant_contract_price),
        spot_price: parseFloat(row.spot_price)
    }));

    // 清理合约名称
    records = _.map(records, row => ({
        ...row,
        near_contract: row.near_contract.replace(/[^0-9]*(\d*)$/, "$1"),
        dominant_contract: row.dominant_contract.replace(/[^0-9]*(\d*)$/, "$1")
    }));

    // 格式化合约名称
    records = _.map(records, row => ({
        ...row,
        near_contract: row.symbol + parseInt(row.near_contract, 10).toString(),
        dominant_contract: row.symbol + parseInt(row.dominant_contract, 10).toString()
    }));

    // 处理某些市场的特殊规则
    const shfeDceSymbols = cons.market_exchange_symbols.shfe.concat(cons.market_exchange_symbols.dce);
    const czceSymbols = cons.market_exchange_symbols.czce;

    records = _.map(records, row => ({
        ...row,
        near_contract: shfeDceSymbols.includes(row.near_contract.slice(0, -4)) ? row.near_contract.toLowerCase() : row.near_contract,
        dominant_contract: shfeDceSymbols.includes(row.dominant_contract.slice(0, -4)) ? row.dominant_contract.toLowerCase() : row.dominant_contract,
        near_contract: czceSymbols.includes(row.near_contract.slice(0, -4)) ? row.near_contract.slice(0, -4) + row.near_contract.slice(-3) : row.near_contract,
        dominant_contract: czceSymbols.includes(row.dominant_contract.slice(0, -4)) ? row.dominant_contract.slice(0, -4) + row.dominant_contract.slice(-3) : row.dominant_contract,
    }));

    // 计算基差和基差率
    records = _.map(records, row => ({
        ...row,
        near_basis: row.near_contract_price - row.spot_price,
        dom_basis: row.dominant_contract_price - row.spot_price,
        near_basis_rate: row.near_contract_price / row.spot_price - 1,
        dom_basis_rate: row.dominant_contract_price / row.spot_price - 1,
        date: dayjs(date).format('YYYYMMDD')
    }));

    return records;
}
///

function _join_head(content) {
    let headers = [];
    // Assuming content is an array of arrays, similar to a 2D list or DataFrame
    const firstRow = content[0];
    const secondRow = content[1];

    _.zip(firstRow, secondRow).forEach(([s1, s2]) => {
        if (s1 !== s2) {
            let s = `${s1}${s2}`;
        } else {
            s = s1;
        }
        headers.push(s);
    });

    return headers;
}
///具体交易日大宗商品现货价格及相应基差
const cheerio = require('cheerio');

// 假设calendar是一个包含交易日的数组，例如：['20240430', '20240429', ...]
const calendar = []; // 需要根据实际情况填充

function convertDate(date) {
    return dayjs(date, 'YYYYMMDD').toDate();
}

async function futuresSpotPricePrevious(date = "20240430") {
    /**
     * 具体交易日大宗商品现货价格及相应基差
     * https://www.100ppi.com/sf/day-2017-09-12.html
     * @param {string} date - 交易日; 历史日期
     * @returns {Object[]} - 现货价格及相应基差
     */
    const convertedDate = date ? convertDate(date) : new Date();
    if (convertedDate < new Date(2011, 0, 4)) { // 注意：月份从0开始
        throw new Error("数据源开始日期为 20110104, 请将获取数据时间点设置在 20110104 后");
    }
    const formattedDate = dayjs(convertedDate).format('YYYYMMDD');
    if (!calendar.includes(formattedDate)) {
        console.warn(`${formattedDate}非交易日`);
        return [];
    }

    const url = `https://www.100ppi.com/sf2/day-${dayjs(convertedDate).format('YYYY-MM-DD')}.html`;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const mainTable = $('table').eq(1); // 假设第二个表格是主表
        const header = _joinHead(mainTable); // 这里需要实现_joinHead函数
        const valuesRows = mainTable.find('tr').filter((index, element) => $(element).find('td:eq(3)').text().endsWith('%'));
        const values = [];

        valuesRows.each((index, element) => {
            const row = $(element).find('td');
            values.push(header.map((h, i) => row.eq(i).text()).get());
        });

        // Basis部分的处理
        let basisTables = [];
        for (let i = 2; i < $('table').length - 1; i++) {
            basisTables = basisTables.concat($('table').eq(i).find('tr').toArray());
        }
        const basisData = basisTables.map(row => $(row).find('td').map((i, el) => $(el).text()).get());

        // 构建最终的数据结构
        const result = basisData.map(basisRow => {
            const valueRow = values.find(v => v[0] === basisRow[2]); // 商品名匹配
            return {
                商品: valueRow[0],
                现货价格: valueRow[1],
                主力合约代码: valueRow[2],
                主力合约价格: valueRow[3],
                主力合约基差: basisRow[0],
                主力合约变动百分比: basisRow[1].replace('%', ''),
                '180日内主力基差最高': valueRow[4],
                '180日内主力基差最低': valueRow[5],
                '180日内主力基差平均': valueRow[6],
            };
        });

        return result;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        return [];
    }
}

// 需要定义_joinHead函数来正确地组合头部信息
function _joinHead(table) {
    // 根据实际的HTML结构调整此函数
}
module.exports = {
    futures_spot_price_daily: futures_spot_price_daily,
    futures_spot_price: futures_spot_price,
    _check_information: _check_information,
    _join_head: _join_head,
    futures_spot_price_previous: futures_spot_price_previous,
};