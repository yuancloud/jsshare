const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富-股票和市场代码

async function __code_id_map_em() {
  /**
   * 东方财富-股票和市场代码
   * https://quote.eastmoney.com/center/gridlist.html#hs_a_board
   * @return {Object} 股票和市场代码
   */
  const url = "http://80.push2.eastmoney.com/api/qt/clist/get";
  const params = new URLSearchParams({
    "pn": "1",
    "pz": "50000",
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

  try {
    const response = await axios.get(url, { params });
    const data_json = response.data;
    if (!data_json.data.diff) return {};

    let temp_df = data_json.data.diff.map(item => ({ sh_code: item.f12, sh_id: 1 }));
    let code_id_dict = temp_df.reduce((acc, item) => (acc[item.sh_code] = item.sh_id, acc), {});

    // 对于深证市场的请求
    params.set("fs", "m:0 t:6,m:0 t:80");
    const response_sz = await axios.get(url, { params });
    const data_json_sz = response_sz.data;
    if (data_json_sz.data.diff) {
      let temp_df_sz = data_json_sz.data.diff.map(item => ({ f12: item.f12, sz_id: 0 }));
      temp_df_sz.forEach(item => code_id_dict[item.f12] = item.sz_id);
    }

    // 对于北京市场的请求
    params.set("fs", "m:0 t:81 s:2048");
    const response_bj = await axios.get(url, { params });
    const data_json_bj = response_bj.data;
    if (data_json_bj.data.diff) {
      let temp_df_bj = data_json_bj.data.diff.map(item => ({ f12: item.f12, bj_id: 0 }));
      temp_df_bj.forEach(item => code_id_dict[item.f12] = item.bj_id);
    }

    return code_id_dict;
  } catch (error) {
    console.error(error);
    return {};
  }
}
/**
 * 东财财富-分时数据
 * https://quote.eastmoney.com/f1.html?newcode=0.000001
 * @param {string} symbol - 股票代码
 * @return {Promise<Array>} 分时数据
 */
async function stock_intraday_em(symbol = '000001') {

  const url = "https://70.push2.eastmoney.com/api/qt/stock/details/sse";
  const params = new URLSearchParams({
    fields1: "f1,f2,f3,f4",
    fields2: "f51,f52,f53,f54,f55",
    mpi: "2000",
    ut: "bd1d9ddb04089700cf9c27f6f7426281",
    fltt: "2",
    pos: "-0",
    secid: `${util.get_market_number(symbol)}.${symbol}`,
    wbp2u: "|0|0|0|web"
  });

  let records
  let buffer = ''; // 用于存储不完整的 JSON 数据

  const response = await axios({
    method: 'get',
    url: url,
    params: params,
    responseType: 'stream', // 获取流式响应
  });

  const stream = Readable.from(response.data);

  for await (const chunk of stream) {
    buffer += chunk.toString(); // 将当前块的数据添加到缓冲区

    // 处理缓冲区中的数据
    let startIndex = 0;
    let endIndex;

    // 查找完整的 JSON 数据
    while ((endIndex = buffer.indexOf('\n', startIndex)) !== -1) {
      const event = buffer.slice(startIndex, endIndex).trim();

      if (event.startsWith("data: ")) {
        try {
          const eventJson = JSON.parse(event.replace("data: ", ""));
          records = eventJson.data.details
          break;
        } catch (e) {
          console.error("JSON 解析错误:", e);
        }
      }

      // 更新缓冲区的起始位置
      startIndex = endIndex + 1;
    }
    if (records) break;
    // 将未处理的部分留在缓冲区中
    buffer = buffer.slice(startIndex);
  }

  // 处理数据
  let result = records.map(row => {
    let items = row.split(',')
    return {
      时间: items[0],
      成交价: parseFloat(items[1]) || null,
      手数: parseInt(items[2]) || null,
      买卖盘性质: {
        2: '买盘',
        1: '卖盘',
        4: '中性盘'
      }[items[4]] || ''
    }
  });

  return result;
}

// 注意：这里的 __codeIdMapEm 和 __eventStream 函数需要根据实际情况实现。
module.exports = {
  stock_intraday_em: stock_intraday_em,
};