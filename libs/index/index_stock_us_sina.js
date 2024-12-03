const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///新浪财经-美股指数行情
const vm = require('vm');

async function indexUsStockSina(symbol = ".INX") {
    const url = `https://finance.sina.com.cn/staticdata/us/${symbol}`;
    try {
        const response = await axios.get(url);
        const jsCode = response.data.split('=')[1].split(';')[0].replace(/"/g, '');
        
        // 使用 vm 模块创建一个上下文并运行解码函数
        const context = vm.createContext({ d: undefined });
        const script = new vm.Script(`var d = ${zh_js_decode}; ${jsCode};`);
        script.runInContext(context);

        // 假设 zh_js_decode 是定义了解码函数的字符串
        // 并且 d 是解码后返回的数据
        const dictList = context.d;
        const tempData = _.map(dictList, item => ({
            ...item,
            date: dayjs(item.date).toDate(),
            open: Number.parseFloat(item.open) || null,
            high: Number.parseFloat(item.high) || null,
            low: Number.parseFloat(item.low) || null,
            close: Number.parseFloat(item.close) || null,
            volume: Number.parseInt(item.volume) || null,
            amount: Number.parseFloat(item.amount) || null
        }));

        return tempData;
    } catch (error) {
        console.error(`Error fetching or processing data: ${error.message}`);
        throw error;
    }
}

// 注意：此处未提供 zh_js_decode 的实现，因为它依赖于原始 Python 代码中未提供的具体细节。
module.exports = {
    index_us_stock_sina : index_us_stock_sina,
};