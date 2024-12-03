const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///期货的品种和代码映射
const demjson = require('demjson'); // 用于解析非标准JSON

async function futuresSymbolMark() {
    const url = "https://vip.stock.finance.sina.com.cn/quotes_service/view/js/qihuohangqing.js";
    try {
        const response = await axios.get(url, { responseType: 'text', responseEncoding: 'gb2312' });
        let dataText = response.data;
        let rawJson = dataText.substring(dataText.indexOf("{"), dataText.lastIndexOf("}") + 1);
        let dataJson = demjson.decode(rawJson);

        let czceMarkList = dataJson.czce.slice(1).map(item => item[1]);
        let dceMarkList = dataJson.dce.slice(1).map(item => item[1]);
        let shfeMarkList = dataJson.shfe.slice(1).map(item => item[1]);
        let cffexMarkList = dataJson.cffex.slice(1).map(item => item[1]);
        let gfexMarkList = dataJson.gfex.slice(1).map(item => item[1]);
        let allMarkList = [...czceMarkList, ...dceMarkList, ...shfeMarkList, ...cffexMarkList, ...gfexMarkList];

        let czceMarketNameList = Array(czceMarkList.length).fill(dataJson.czce[0]);
        let dceMarketNameList = Array(dceMarkList.length).fill(dataJson.dce[0]);
        let shfeMarketNameList = Array(shfeMarkList.length).fill(dataJson.shfe[0]);
        let cffexMarketNameList = Array(cffexMarkList.length).fill(dataJson.cffex[0]);
        let gfexMarketNameList = Array(gfexMarkList.length).fill(dataJson.gfex[0]);
        let allMarketNameList = [...czceMarketNameList, ...dceMarketNameList, ...shfeMarketNameList, ...cffexMarketNameList, ...gfexMarketNameList];

        let czceSymbolList = dataJson.czce.slice(1).map(item => item[0]);
        let dceSymbolList = dataJson.dce.slice(1).map(item => item[0]);
        let shfeSymbolList = dataJson.shfe.slice(1).map(item => item[0]);
        let cffexSymbolList = dataJson.cffex.slice(1).map(item => item[0]);
        let gfexSymbolList = dataJson.gfex.slice(1).map(item => item[0]);
        let allSymbolList = [...czceSymbolList, ...dceSymbolList, ...shfeSymbolList, ...cffexSymbolList, ...gfexSymbolList];

        let tempData = [];
        for (let i = 0; i < allMarketNameList.length; i++) {
            tempData.push({
                exchange: allMarketNameList[i],
                symbol: allSymbolList[i],
                mark: allMarkList[i]
            });
        }

        return tempData;
    } catch (error) {
        console.error(`Error fetching or parsing data: ${error}`);
        throw error;
    }
}
///期货品种当前时刻所有可交易的合约实时数据

async function futures_zh_realtime(symbol = "白糖") {
    /**
     * 期货品种当前时刻所有可交易的合约实时数据
     * @param {string} symbol - 品种名称；可以通过 futures_symbol_mark() 获取所有品种命名表
     * @returns {Object[]} 返回一个包含实时数据的对象数组
     */

    const _futures_symbol_mark_df = await futures_symbol_mark();
    const symbol_mark_map = _futures_symbol_mark_df.reduce((acc, cur) => {
        acc[cur.symbol] = cur.mark;
        return acc;
    }, {});

    const url = "https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQFuturesData";
    const params = {
        page: "1",
        sort: "position",
        asc: "0",
        node: symbol_mark_map[symbol],
        base: "futures"
    };

    try {
        const response = await axios.get(url, { params });
        const data_json = response.data;

        const temp_df = data_json.map(item => ({
            ...item,
            trade: parseFloat(item.trade) || null,
            settlement: parseFloat(item.settlement) || null,
            presettlement: parseFloat(item.presettlement) || null,
            open: parseFloat(item.open) || null,
            high: parseFloat(item.high) || null,
            low: parseFloat(item.low) || null,
            close: parseFloat(item.close) || null,
            bidprice1: parseFloat(item.bidprice1) || null,
            askprice1: parseFloat(item.askprice1) || null,
            bidvol1: parseFloat(item.bidvol1) || null,
            askvol1: parseFloat(item.askvol1) || null,
            volume: parseFloat(item.volume) || null,
            position: parseFloat(item.position) || null,
            preclose: parseFloat(item.preclose) || null,
            changepercent: parseFloat(item.changepercent) || null,
            bid: parseFloat(item.bid) || null,
            ask: parseFloat(item.ask) || null,
            prevsettlement: parseFloat(item.prevsettlement) || null
        }));

        return temp_df;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

// 假设存在的函数，用于获取品种标记
async function futures_symbol_mark() {
    // 这里应该返回一个包含 symbol 和 mark 的对象数组
    // 例如：[{symbol: '白糖', mark: 'someMark'}, ...]
    return [];
}
///交易所具体的可交易品种

async function zh_subscribe_exchange_symbol(symbol = "cffex") {
    /**
     * 交易所具体的可交易品种
     * https://vip.stock.finance.sina.com.cn/quotes_service/view/qihuohangqing.html#titlePos_1
     * @param {string} symbol - choice of {'czce', 'dce', 'shfe', 'cffex', 'gfex'}
     * @returns {Array} 交易所具体的可交易品种
     */
    try {
        const response = await axios.get(zh_subscribe_exchange_symbol_url, { responseType: 'text' });
        let dataText = response.data;
        // 解码GBK编码的数据文本（假设环境支持）
        // 注意：Node.js环境下可能需要额外库如iconv-lite来处理GBK编码
        // dataText = iconv.decode(Buffer.from(dataText, 'binary'), 'gbk');

        // 找到JSON部分并解析
        const start = dataText.indexOf('{');
        const end = dataText.indexOf('};') + 1; // 包括';'
        const jsonString = dataText.substring(start, end);
        const dataJson = JSON.parse(jsonString.replace(/;\s*$/, ''));  // 去除末尾可能存在的分号

        // 根据symbol过滤数据
        if (['czce', 'dce', 'shfe', 'cffex', 'gfex'].includes(symbol)) {
            const exchangeName = `${symbol.toUpperCase()}商品交易所`;
            const filteredData = _.filter(dataJson[symbol], item => item !== exchangeName);
            return filteredData;  // 返回过滤后的数组
        } else {
            throw new Error(`Invalid symbol: ${symbol}`);
        }
    } catch (error) {
        console.error(error);
        throw error;  // 或者返回适当的错误信息
    }
}

// 注意：zh_subscribe_exchange_symbol_url 应该是一个已经定义好的URL字符串。
///新浪财经-期货-主力合约

async function matchMainContract(symbol = "cffex") {
    /**
     * 新浪财经-期货-主力合约
     * https://vip.stock.finance.sina.com.cn/quotes_service/view/qihuohangqing.html#titlePos_1
     * @param {string} symbol - 选择 {'czce', 'dce', 'shfe', 'cffex', 'gfex'}
     * @return {string} 主力合约的字符串
     */
    let subscribeExchangeList = [];
    let exchangeSymbolList = zhSubscribeExchangeSymbol(symbol).map(row => row[1]);

    for (let item of exchangeSymbolList) {
        // 更新payload
        zhMatchMainContractPayload.node = item;

        try {
            const res = await axios.get(zhMatchMainContractUrl, { params: zhMatchMainContractPayload });
            const dataJson = JSON.parse(res.data);
            let dataDf = dataJson; // 假设dataJson可以直接当作数据表处理

            // 查找重复项
            let mainContracts = _.filter(dataDf, (value, index, collection) =>
                _.some(_.tail(_.values(value)), v => _.includes(_.without(collection, value), v))
            );

            if (mainContracts.length > 0) {
                console.log(mainContracts[0].symbol);
                subscribeExchangeList.push(mainContracts[0].symbol);
            } else if (dataDf.length === 1) {
                console.log(dataDf[0].symbol);
                subscribeExchangeList.push(dataDf[0].symbol);
            } else {
                console.log(`${item} 无主力合约`);
            }
        } catch (error) {
            console.error(`Error processing ${item}:`, error);
        }
    }

    console.log(`${symbol} 主力合约获取成功`);
    return subscribeExchangeList.join(",");
}

// 注意：这里假设zhSubscribeExchangeSymbol、zhMatchMainContractUrl和zhMatchMainContractPayload是已经定义好的函数或变量。
///期货的实时行情数据

async function futures_zh_spot(symbol = "V2309", market = "CF", adjust = "0") {
    const fileData = "Math.round(Math.random() * 2147483648).toString(16)";
    const rnCode = eval(fileData);
    const subscribeList = symbol.split(',').map(item => item.trim()).map(item => `nf_${item}`).join(',');
    const url = `https://hq.sinajs.cn/rn=${rnCode}&list=${subscribeList}`;
    const headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Host': 'hq.sinajs.cn',
        'Pragma': 'no-cache',
        'Proxy-Connection': 'keep-alive',
        'Referer': 'https://vip.stock.finance.sina.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'
    };

    try {
        const response = await axios.get(url, { headers });
        const data = response.data;

        // 处理返回的数据
        const dataRows = data.split(';')
            .filter(row => row.trim())
            .map(row => row.split('=')[1].replace(/"/g, '').split(','));

        if (adjust === "1") {
            // 这里需要一个函数 futures_contract_detail 来获取合约详情
            // 请根据实际情况实现此函数
            const contractNameList = _.map(subscribeList.split(','), name => name.split('_')[1]);
            const contractExchangeList = [];
            const contractMinList = [];

            for (let contractName of contractNameList) {
                let tempDf = futures_contract_detail(contractName); // 假设这个函数已经被定义
                let exchangeName = tempDf.find(item => item.item === "上市交易所").value;
                contractExchangeList.push(exchangeName);
                let contractMin = tempDf.find(item => item.item === "最小变动价位").value;
                contractMinList.push(contractMin);
            }

            if (market === "CF") {
                // 处理 CF 市场数据
                // ...
            } else {
                // 处理其他市场数据
                // ...
            }
        } else {
            if (market === "CF") {
                // 处理 CF 市场数据，无需调整
                // ...
            } else {
                // 处理其他市场数据，无需调整
                // ...
            }
        }

        // 返回处理后的数据
        return dataRows;
    } catch (error) {
        console.error('Error fetching futures data:', error);
        throw error;
    }
}

// 注意：这里假设 futures_contract_detail 函数已经定义好。
// 你需要根据实际情况实现它或者用其他方式获取合约详情。
///中国各品种期货分钟频率数据

async function futures_zh_minute_sina(symbol = "IF2008", period = "5") {
    /**
     * 中国各品种期货分钟频率数据
     * @param {string} symbol - 可以通过 match_main_contract(symbol="cffex") 获取, 或者访问网页获取
     * @param {string} period - choice of {"1": "1分钟", "5": "5分钟", "15": "15分钟", "30": "30分钟", "60": "60分钟"}
     * @returns {Promise<Array>} 指定 symbol 和 period 的数据
     */
    const url = "https://stock2.finance.sina.com.cn/futures/api/jsonp.php/=/InnerFuturesNewService.getFewMinLine";
    const params = new URLSearchParams({
        symbol: symbol,
        type: period,
    });

    try {
        const response = await axios.get(url, { params: params.toString() });
        const data = JSON.parse(response.data.split("=(")[1].split(");")[0]);
        const temp_df = _.map(data, item => ({
            datetime: item[0],
            open: parseFloat(item[1]) || null,
            high: parseFloat(item[2]) || null,
            low: parseFloat(item[3]) || null,
            close: parseFloat(item[4]) || null,
            volume: parseInt(item[5], 10) || null,
            hold: parseInt(item[6], 10) || null,
        }));

        // 如果需要将datetime转换成Date对象，可以取消下面这行的注释
        // temp_df.forEach(item => item.datetime = dayjs(item.datetime).toDate());

        return temp_df;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        throw error;
    }
}
///中国各品种期货日频率数据

async function futures_zh_daily_sina(symbol = "RB0") {
    /**
     * 中国各品种期货日频率数据
     * https://finance.sina.com.cn/futures/quotes/V2105.shtml
     * @param {string} symbol 可以通过 match_main_contract(symbol="cffex") 获取, 或者访问网页获取
     * @returns {Array<Object>} 指定 symbol 的数据
     */
    const date = "20210412";
    const url = `https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_V2105${date}_=InnerFuturesNewService.getDailyKLine`;
    const params = {
        symbol: symbol,
        type: `${date.slice(0, 4)}_${date.slice(4, 6)}_${date.slice(6)}`,
    };

    try {
        const response = await axios.get(url, { params });
        // 解析JSONP响应
        const jsonpResponse = response.data;
        const dataStartIndex = jsonpResponse.indexOf('(') + 1;
        const dataEndIndex = jsonpResponse.lastIndexOf(')');
        const jsonData = JSON.parse(jsonpResponse.substring(dataStartIndex, dataEndIndex));

        // 转换数据
        const tempData = jsonData.map(item => ({
            date: item[0],
            open: parseFloat(item[1]) || null,
            high: parseFloat(item[2]) || null,
            low: parseFloat(item[3]) || null,
            close: parseFloat(item[4]) || null,
            volume: parseFloat(item[5]) || null,
            hold: parseFloat(item[6]) || null,
            settle: parseFloat(item[7]) || null,
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者根据需要处理错误
    }
}
module.exports = {
    futures_symbol_mark: futures_symbol_mark,
    futures_zh_realtime: futures_zh_realtime,
    zh_subscribe_exchange_symbol: zh_subscribe_exchange_symbol,
    match_main_contract: match_main_contract,
    futures_zh_spot: futures_zh_spot,
    futures_zh_minute_sina: futures_zh_minute_sina,
    futures_zh_daily_sina: futures_zh_daily_sina,
};