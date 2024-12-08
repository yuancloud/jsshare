const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-大宗交易-市场统计

async function stock_dzjy_sctj() {
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        'sortColumns': 'TRADE_DATE',
        'sortTypes': '-1',
        'pageSize': '500',
        'pageNumber': '1',
        'reportName': 'PRT_BLOCKTRADE_MARKET_STA',
        'columns': 'TRADE_DATE,SZ_INDEX,SZ_CHANGE_RATE,BLOCKTRADE_DEAL_AMT,PREMIUM_DEAL_AMT,PREMIUM_RATIO,DISCOUNT_DEAL_AMT,DISCOUNT_RATIO',
        'source': 'WEB',
        'client': 'WEB'
    });

    try {
        let response = await axios.get(url, { params: params });
        let dataJson = response.data;
        let totalPages = parseInt(dataJson.result.pages);
        let bigData = [];

        for (let page = 1; page <= totalPages; page++) {
            params.set('pageNumber', page.toString());
            response = await axios.get(url, { params: params });
            bigData = bigData.concat(response.data.result.data);
        }

        // 处理数据
        let bigDf = bigData.map((item, index) => ({
            序号: index + 1,
            交易日期: dayjs(item.TRADE_DATE).format('YYYYMMDD'),
            上证指数: parseFloat(item.SZ_INDEX),
            上证指数涨跌幅: (item.SZ_CHANGE_RATE),
            大宗交易成交总额: (item.BLOCKTRADE_DEAL_AMT),
            溢价成交总额: (item.PREMIUM_DEAL_AMT),
            溢价成交总额占比: (item.PREMIUM_RATIO),
            折价成交总额: (item.DISCOUNT_DEAL_AMT),
            折价成交总额占比: (item.DISCOUNT_RATIO)
        }));

        return bigDf;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///东方财富网-数据中心-大宗交易-每日明细

async function stock_dzjy_mrmx(symbol = 'A股', start_date = '20220104', end_date = '20220104') {
    const symbol_map = {
        'A股': '1',
        'B股': '2',
        '基金': '3',
        '债券': '4',
    };

    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = {
        sortColumns: 'SECURITY_CODE',
        sortTypes: '1',
        pageSize: '5000',
        pageNumber: '1',
        reportName: 'RPT_DATA_BLOCKTRADE',
        columns: 'TRADE_DATE,SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,CHANGE_RATE,CLOSE_PRICE,DEAL_PRICE,PREMIUM_RATIO,DEAL_VOLUME,DEAL_AMT,TURNOVER_RATE,BUYER_NAME,SELLER_NAME,CHANGE_RATE_1DAYS,CHANGE_RATE_5DAYS,CHANGE_RATE_10DAYS,CHANGE_RATE_20DAYS,BUYER_CODE,SELLER_CODE',
        source: 'WEB',
        client: 'WEB',
        filter: `(SECURITY_TYPE_WEB=${symbol_map[symbol]})(TRADE_DATE>='${[start_date.slice(0, 4), start_date.slice(4, 6), start_date.slice(6)].join('-')}')(TRADE_DATE<='${[end_date.slice(0, 4), end_date.slice(4, 6), end_date.slice(6)].join('-')}')`
    };

    try {
        const response = await axios.get(url, { params });
        const data_json = response.data;

        if (!data_json.result || !data_json.result.data || data_json.result.data.length === 0) {
            return [];
        }

        let temp_df = data_json.result.data;
        temp_df = temp_df.map((item, index) => ({ ...item, index: index + 1 }));

        if (symbol === 'A股') {
            temp_df = temp_df.map(item => ({
                "序号": item.index,
                "交易日期": dayjs(item.TRADE_DATE).format('YYYYMMDD'),
                "证券代码": item.SECURITY_CODE,
                "证券简称": item.SECURITY_NAME_ABBR,
                "涨跌幅": (item.CHANGE_RATE),
                "收盘价": (item.CLOSE_PRICE),
                "成交价": (item.DEAL_PRICE),
                "折溢率": (item.PREMIUM_RATIO),
                "成交量": (item.DEAL_VOLUME),
                "成交额": (item.DEAL_AMT),
                "成交额/流通市值": (item.TURNOVER_RATE),
                "买方营业部": item.BUYER_NAME,
                "卖方营业部": item.SELLER_NAME,
            }));
        } else if (['B股', '基金', '债券'].includes(symbol)) {
            temp_df = temp_df.map(item => ({
                "序号": item.index,
                "交易日期": dayjs(item.TRADE_DATE).format('YYYYMMDD'),
                "证券代码": item.SECURITY_CODE,
                "证券简称": item.SECURITY_NAME_ABBR,
                "成交价": (item.DEAL_PRICE),
                "成交量": (item.DEAL_VOLUME),
                "成交额": (item.DEAL_AMT),
                "买方营业部": item.BUYER_NAME,
                "卖方营业部": item.SELLER_NAME,
            }));
        }

        return temp_df;
    } catch (error) {
        console.error(error);
        return [];
    }
}
///东方财富网-数据中心-大宗交易-每日统计

async function stock_dzjy_mrtj(start_date = '20220105', end_date = '20220105') {
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: 'TURNOVERRATE',
        sortTypes: '-1',
        pageSize: '5000',
        pageNumber: '1',
        reportName: 'RPT_BLOCKTRADE_STA',
        columns: 'TRADE_DATE,SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,CHANGE_RATE,CLOSE_PRICE,AVERAGE_PRICE,PREMIUM_RATIO,DEAL_NUM,VOLUME,DEAL_AMT,TURNOVERRATE,D1_CLOSE_ADJCHRATE,D5_CLOSE_ADJCHRATE,D10_CLOSE_ADJCHRATE,D20_CLOSE_ADJCHRATE',
        source: 'WEB',
        client: 'WEB',
        filter: `(TRADE_DATE>='${start_date.slice(0, 4)}-${start_date.slice(4, 6)}-${start_date.slice(6, 8)}')(TRADE_DATE<='${end_date.slice(0, 4)}-${end_date.slice(4, 6)}-${end_date.slice(6, 8)}')`
    });

    try {
        const response = await axios.get(url, { params });
        const data = response.data.result.data;

        // 构建DataFrame类似的结构
        const temp_df = data.map((item, index) => ({
            序号: index + 1,
            交易日期: dayjs(item.TRADE_DATE).format('YYYYMMDD'),
            证券代码: item.SECURITY_CODE,
            证券简称: item.SECURITY_NAME_ABBR,
            涨跌幅: (item.CHANGE_RATE),
            收盘价: (item.CLOSE_PRICE),
            成交价: (item.AVERAGE_PRICE),
            折溢率: (item.PREMIUM_RATIO),
            成交笔数: (item.DEAL_NUM),
            成交总量: (item.VOLUME),
            成交总额: (item.DEAL_AMT),
            '成交总额/流通市值': (item.TURNOVERRATE)
        }));

        return temp_df;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // 或者根据需要处理错误
    }
}
///东方财富网-数据中心-大宗交易-活跃 A 股统计

async function stock_dzjy_hygtj(symbol = '近三月') {
    const periodMap = {
        '近一月': '1',
        '近三月': '3',
        '近六月': '6',
        '近一年': '12',
    };

    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: 'DEAL_NUM,SECURITY_CODE',
        sortTypes: '-1,-1',
        pageSize: '5000',
        pageNumber: '1',
        reportName: 'RPT_BLOCKTRADE_ACSTA',
        columns: 'SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,CLOSE_PRICE,CHANGE_RATE,TRADE_DATE,DEAL_AMT,PREMIUM_RATIO,SUM_TURNOVERRATE,DEAL_NUM,PREMIUM_TIMES,DISCOUNT_TIMES,D1_AVG_ADJCHRATE,D5_AVG_ADJCHRATE,D10_AVG_ADJCHRATE,D20_AVG_ADJCHRATE,DATE_TYPE_CODE',
        source: 'WEB',
        client: 'WEB',
        filter: `(DATE_TYPE_CODE=${periodMap[symbol]})`,
    });

    let bigData = [];
    let totalPage;

    try {
        const response = await axios.get(url, { params });
        totalPage = response.data.result.pages;

        for (let page = 1; page <= totalPage; page++) {
            params.set('pageNumber', page.toString());
            const pageResponse = await axios.get(url, { params });
            bigData = bigData.concat(pageResponse.data.result.data);
        }
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
    }

    // 数据处理
    const processedData = bigData.map((item, index) => ({
        序号: index + 1,
        证券代码: item.SECURITY_CODE,
        证券简称: item.SECURITY_NAME_ABBR,
        最新价: parseFloat(item.CLOSE_PRICE),
        涨跌幅: parseFloat(item.CHANGE_RATE),
        最近上榜日: dayjs(item.TRADE_DATE).format('YYYYMMDD'),
        上榜次数总计: parseInt(item.DEAL_NUM),
        上榜次数溢价: parseInt(item.PREMIUM_TIMES),
        上榜次数折价: parseInt(item.DISCOUNT_TIMES),
        总成交额: parseFloat(item.DEAL_AMT),
        折溢率: parseFloat(item.PREMIUM_RATIO),
        成交总额流通市值: parseFloat(item.SUM_TURNOVERRATE),
        上榜日后平均涨跌幅1日: parseFloat(item.D1_AVG_ADJCHRATE),
        上榜日后平均涨跌幅5日: parseFloat(item.D5_AVG_ADJCHRATE),
        上榜日后平均涨跌幅10日: parseFloat(item.D10_AVG_ADJCHRATE),
        上榜日后平均涨跌幅20日: parseFloat(item.D20_AVG_ADJCHRATE),
    }));

    return processedData;
}
///东方财富网-数据中心-大宗交易-活跃营业部统计

async function stock_dzjy_hyyybtj(symbol = '近3日') {
    const periodMap = {
        '当前交易日': '1',
        '近3日': '3',
        '近5日': '5',
        '近10日': '10',
        '近30日': '30',
    };

    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: 'BUYER_NUM,TOTAL_BUYAMT',
        sortTypes: '-1,-1',
        pageSize: '5000',
        pageNumber: '1',
        reportName: 'RPT_BLOCKTRADE_OPERATEDEPTSTATISTICS',
        columns: 'OPERATEDEPT_CODE,OPERATEDEPT_NAME,ONLIST_DATE,STOCK_DETAILS,BUYER_NUM,SELLER_NUM,TOTAL_BUYAMT,TOTAL_SELLAMT,TOTAL_NETAMT,N_DATE',
        source: 'WEB',
        client: 'WEB',
        filter: `(N_DATE=-${periodMap[symbol]})`,
    });


    try {
        const response = await axios.get(url, { params });
        const totalPage = response.data.result.pages;
        let big_df = [];
        for (let page = 1; page <= totalPage; page++) {
            params.set('pageNumber', page.toString());
            const res = await axios.get(url, { params });
            const tempData = res.data.result.data;
            big_df = big_df.concat(tempData);
        }

        // 处理数据
        let result = big_df.map((row, index) => ({
            序号: index + 1,
            营业部代码: row.OPERATEDEPT_CODE,
            营业部名称: row.OPERATEDEPT_NAME,
            最近上榜日: dayjs(row.ONLIST_DATE).format('YYYYMMDD'),
            买入的股票: row.STOCK_DETAILS,
            次数总计_买入: (row.BUYER_NUM),
            次数总计_卖出: (row.SELLER_NUM),
            成交金额统计_买入: (row.TOTAL_BUYAMT),
            成交金额统计_卖出: (row.TOTAL_SELLAMT),
            成交金额统计_净买入额: (row.TOTAL_NETAMT),
        }));
        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}
///东方财富网-数据中心-大宗交易-营业部排行

async function stock_dzjy_yybph(symbol = '近三月') {
    const periodMap = {
        '近一月': '30',
        '近三月': '90',
        '近六月': '120',
        '近一年': '360',
    };

    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = {
        sortColumns: 'D5_BUYER_NUM,D1_AVERAGE_INCREASE',
        sortTypes: '-1,-1',
        pageSize: '5000',
        pageNumber: '1',
        reportName: 'RPT_BLOCKTRADE_OPERATEDEPT_RANK',
        columns: 'OPERATEDEPT_CODE,OPERATEDEPT_NAME,D1_BUYER_NUM,D1_AVERAGE_INCREASE,D1_RISE_PROBABILITY,D5_BUYER_NUM,D5_AVERAGE_INCREASE,D5_RISE_PROBABILITY,D10_BUYER_NUM,D10_AVERAGE_INCREASE,D10_RISE_PROBABILITY,D20_BUYER_NUM,D20_AVERAGE_INCREASE,D20_RISE_PROBABILITY,N_DATE,RELATED_ORG_CODE',
        source: 'WEB',
        client: 'WEB',
        filter: `(N_DATE=-${periodMap[symbol]})`,
    };

    let bigData = [];
    try {
        const response = await axios.get(url, { params });
        const totalPages = response.data.result.pages;

        for (let page = 1; page <= totalPages; page++) {
            params.pageNumber = page.toString();
            const r = await axios.get(url, { params });
            const tempData = r.data.result.data;
            bigData = bigData.concat(tempData);
        }

        // 转换数据格式
        bigData = bigData.map((item, index) => ({
            序号: index + 1,
            营业部名称: item.OPERATEDEPT_NAME,
            '上榜后1天-买入次数': (item.D1_BUYER_NUM),
            '上榜后1天-平均涨幅': (item.D1_AVERAGE_INCREASE),
            '上榜后1天-上涨概率': (item.D1_RISE_PROBABILITY),
            '上榜后5天-买入次数': (item.D5_BUYER_NUM),
            '上榜后5天-平均涨幅': (item.D5_AVERAGE_INCREASE),
            '上榜后5天-上涨概率': (item.D5_RISE_PROBABILITY),
            '上榜后10天-买入次数': (item.D10_BUYER_NUM),
            '上榜后10天-平均涨幅': (item.D10_AVERAGE_INCREASE),
            '上榜后10天-上涨概率': (item.D10_RISE_PROBABILITY),
            '上榜后20天-买入次数': (item.D20_BUYER_NUM),
            '上榜后20天-平均涨幅': (item.D20_AVERAGE_INCREASE),
            '上榜后20天-上涨概率': (item.D20_RISE_PROBABILITY),
        }));

        return bigData;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
module.exports = {
    stock_dzjy_sctj: stock_dzjy_sctj,
    stock_dzjy_mrmx: stock_dzjy_mrmx,
    stock_dzjy_mrtj: stock_dzjy_mrtj,
    stock_dzjy_hygtj: stock_dzjy_hygtj,
    stock_dzjy_hyyybtj: stock_dzjy_hyyybtj,
    stock_dzjy_yybph: stock_dzjy_yybph,
};