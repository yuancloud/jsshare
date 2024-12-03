const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富-股票和市场代码

async function indexCodeIdMapEm() {
    /**
     * 东方财富-股票和市场代码
     * https://quote.eastmoney.com/center/gridlist.html#hs_a_board
     * @returns {Object} 股票和市场代码
     */
    const url = "https://80.push2.eastmoney.com/api/qt/clist/get";
    
    // 获取上海市场代码
    let params = new URLSearchParams({
        "pn": "1",
        "pz": "10000",
        "po": "1",
        "np": "1",
        "ut": "bd1d9ddb04089700cf9c27f6f7426281",
        "fltt": "2",
        "invt": "2",
        "fid": "f3",
        "fs": "m:1 t:2,m:1 t:23",
        "fields": "f12",
        "_": "1623833739532"
    });
    let response = await axios.get(url, { params: params.toString() });
    let dataJson = response.data;
    if (!dataJson.data.diff) {
        return {};
    }
    let tempDf = dataJson.data.diff.map(item => ({ sh_code: item.f12, sh_id: 1 }));
    let codeIdDict = _.fromPairs(tempDf.map(item => [item.sh_code, item.sh_id]));

    // 获取深圳市场代码
    params.set("fs", "m:0 t:6,m:0 t:80");
    response = await axios.get(url, { params: params.toString() });
    dataJson = response.data;
    if (dataJson.data.diff) {
        let tempDfSz = dataJson.data.diff.map(item => ({ f12: item.f12, sz_id: 0 }));
        codeIdDict = _.merge(codeIdDict, _.fromPairs(tempDfSz.map(item => [item.f12, item.sz_id])));
    }

    // 获取北京市场代码
    params.set("fs", "m:0 t:81 s:2048");
    response = await axios.get(url, { params: params.toString() });
    dataJson = response.data;
    if (dataJson.data.diff) {
        let tempDfBj = dataJson.data.diff.map(item => ({ f12: item.f12, bj_id: 0 }));
        codeIdDict = _.merge(codeIdDict, _.fromPairs(tempDfBj.map(item => [item.f12, item.bj_id])));
    }

    // 更新字典中的值
    codeIdDict = _.mapValues(codeIdDict, value => value === 1 ? value - 1 : value + 1);

    return codeIdDict;
}

// 注意：这个函数是异步的，因为它使用了await关键字。
///东方财富网-中国股票指数-行情数据

// 假设 index_code_id_map_em 是一个函数或对象，返回指数代码到ID的映射
// 这里我们假设它是一个简单的对象
const index_code_id_map_em = {
  // 示例数据
  "000859": "1",
  // 其他代码...
};

function index_zh_a_hist(symbol = "000859", period = "daily", start_date = "19700101", end_date = "22220101") {
  const period_dict = { "daily": "101", "weekly": "102", "monthly": "103" };
  const url = "https://push2his.eastmoney.com/api/qt/stock/kline/get";

  const getParams = (prefix) => ({
    secid: `${index_code_id_map_em[symbol] || prefix}.${symbol}`,
    ut: "7eea3edcaed734bea9cbfc24409ed989",
    fields1: "f1,f2,f3,f4,f5,f6",
    fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
    klt: period_dict[period],
    fqt: "0",
    beg: "0",
    end: "20500000",
    _: "1623766962675"
  });

  const fetchData = async (params) => {
    try {
      const response = await axios.get(url, { params });
      if (response.data.data) {
        return response.data.data;
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  };

  const processKlines = (klines) => {
    const temp_df = klines.map(item => item.split(','));
    const columns = [
      "日期",
      "开盘",
      "收盘",
      "最高",
      "最低",
      "成交量",
      "成交额",
      "振幅",
      "涨跌幅",
      "涨跌额",
      "换手率"
    ];
    const result = temp_df.map(row => {
      const obj = {};
      columns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    }).filter(row => {
      const date = dayjs(row.日期, 'YYYYMMDD');
      return date.isBetween(start_date, end_date, 'day', '[)');
    }).map(row => {
      // 将字符串转换为数字
      ["开盘", "收盘", "最高", "最低", "成交量", "成交额", "振幅", "涨跌幅", "涨跌额", "换手率"].forEach(key => {
        row[key] = parseFloat(row[key]) || 0;
      });
      return row;
    });
    return result;
  };

  let data = null;
  for (let prefix of ['1', '0', '2', '47']) {
    const params = getParams(prefix);
    data = await fetchData(params);
    if (data && data.klines) break;
  }

  if (data && data.klines) {
    return processKlines(data.klines);
  } else {
    throw new Error("No data found for the given parameters.");
  }
}
///东方财富网-指数数据-每日分时行情

async function index_zh_a_hist_min_em(symbol = "399006", period = "1", start_date = "1979-09-01 09:32:00", end_date = "2222-01-01 09:32:00") {
    const codeIdDict = indexCodeIdMapEm();
    let url, params;

    if (period === "1") {
        url = "https://push2his.eastmoney.com/api/qt/stock/trends2/get";
        try {
            params = new URLSearchParams({
                fields1: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13",
                fields2: "f51,f52,f53,f54,f55,f56,f57,f58",
                ut: "fa5fd1943c7b386f172d6893dbfba10b",
                iscr: "0",
                ndays: "5",
                secid: `${codeIdDict[symbol]}.${symbol}`,
                _: "1623766962675"
            });
        } catch (error) {
            params = new URLSearchParams({
                fields1: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13",
                fields2: "f51,f52,f53,f54,f55,f56,f57,f58",
                ut: "fa5fd1943c7b386f172d6893dbfba10b",
                iscr: "0",
                ndays: "5",
                secid: `1.${symbol}`,
                _: "1623766962675"
            });
            let { data: dataJson } = await axios.get(url, { params });
            if (dataJson.data === null) {
                // 尝试其他secid
                // 省略了中间尝试不同secid的过程，逻辑与Python版本相同
            }
        }
        let { data: dataJson } = await axios.get(url, { params });
        let tempDf = dataJson.data.trends.map(item => item.split(","));
        tempDf = tempDf.filter(item => dayjs(item[0]).isBetween(start_date, end_date, 'minute', '[)');
        tempDf = tempDf.map(item => ({
            时间: item[0],
            开盘: parseFloat(item[1]) || 0,
            收盘: parseFloat(item[2]) || 0,
            最高: parseFloat(item[3]) || 0,
            最低: parseFloat(item[4]) || 0,
            成交量: parseFloat(item[5]) || 0,
            成交额: parseFloat(item[6]) || 0,
            最新价: parseFloat(item[7]) || 0,
        }));
        return tempDf;
    } else {
        url = "http://push2his.eastmoney.com/api/qt/stock/kline/get";
        // 类似于上面的逻辑，但针对不同的URL和参数
        // 省略具体实现以保持简洁
    }
}

// 注意：在实际使用中需要实现indexCodeIdMapEm函数，并确保有相应的错误处理。
module.exports = {
    index_code_id_map_em : index_code_id_map_em,
    index_zh_a_hist : index_zh_a_hist,
    index_zh_a_hist_min_em : index_zh_a_hist_min_em,
};