const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');

///巨潮资讯-个股-上市相关
async function stock_ipo_summary_cninfo(symbol = "600030") {
  const url = "https://webapi.cninfo.com.cn/api/sysapi/p_sysapi1134";
  const params = { scode: symbol };

  const headers = {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    "Content-Length": "0",
    "Host": "webapi.cninfo.com.cn",
    "Accept-Enckey": util.getResCode1(),
    "Origin": "https://webapi.cninfo.com.cn",
    "Pragma": "no-cache",
    "Proxy-Connection": "keep-alive",
    "Referer": "https://webapi.cninfo.com.cn/",
    "X-Requested-With": "XMLHttpRequest"
  };

  try {
    const response = await axios.post(url, null, { params, headers });
    const records = response.data?.records;
    let result = records.map(record => ({
      "股票代码": record.SECCODE,
      "招股公告日期": record.F034D,
      "中签率公告日": record.F109D,
      "每股面值": record.F007N,
      "总发行数量": record.F003N,
      "发行前每股净资产": record.F014N,
      "摊薄发行市盈率": record.F013N,
      "募集资金净额": record.F028N,
      "上网发行日期": record.F035D,
      "上市日期": record.F006D,
      "发行价格": record.F008N,
      "发行费用总额": record.F030N,
      "发行后每股净资产": record.F015N,
      "上网发行中签率": record.F050N,
      "主承销商": record.F047V,
    }))
    return result; // 返回处理后的数据
  } catch (error) {
    console.error(`Error fetching IPO summary for ${symbol}:`, error);
    throw error;
  }
}
module.exports = {
  stock_ipo_summary_cninfo: stock_ipo_summary_cninfo,
};