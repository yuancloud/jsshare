const axios = require('axios');
const _ = require('lodash');
const util = require('../util/util');
///东方财富网-沪深京 A 股-实时行情
async function stock_zh_a_spot_em() {
  const url = "https://82.push2.eastmoney.com/api/qt/clist/get";
  const params = new URLSearchParams({
    pn: "1",
    pz: "50000",
    po: "1",
    np: "1",
    ut: "bd1d9ddb04089700cf9c27f6f7426281",
    fltt: "2",
    invt: "2",
    fid: "f3",
    fs: "m:0 t:6,m:0 t:80,m:1 t:2,m:1 t:23,m:0 t:81 s:2048",
    fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152",
    _: "1623833739532"
  });

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.diff;
    let result = records.map(record => ({
      "最新价": record.f2,
      "涨跌幅": record.f3,
      "涨跌额": record.f4,
      "成交量": record.f5,
      "成交额": record.f6,
      "振幅": record.f7,
      "换手率": record.f8,
      "市盈率-动态": record.f9,
      "量比": record.f10,
      "5分钟涨跌": record.f11,
      "代码": record.f12,
      "名称": record.f14,
      "最高": record.f15,
      "最低": record.f16,
      "今开": record.f17,
      "昨收": record.f18,
      "总市值": record.f20,
      "流通市值": record.f21,
      "涨速": record.f22,
      "市净率": record.f23,
      "60日涨跌幅": record.f24,
      "年初至今涨跌幅": record.f25,
    })).filter(f => !!f['最新价'] || f['最新价'] == '-')

    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}
///东方财富网-沪 A 股-实时行情
async function stock_sh_a_spot_em() {
  const url = "https://82.push2.eastmoney.com/api/qt/clist/get";
  const params = new URLSearchParams({
    pn: "1",
    pz: "50000",
    po: "1",
    np: "1",
    ut: "bd1d9ddb04089700cf9c27f6f7426281",
    fltt: "2",
    invt: "2",
    fid: "f3",
    fs: "m:1 t:2,m:1 t:23",
    fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152",
    _: "1623833739532"
  });

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.diff;
    // 设置列名
    let tempData = records.map(record => ({
      "最新价": record.f2,
      "涨跌幅": record.f3,
      "涨跌额": record.f4,
      "成交量": record.f5,
      "成交额": record.f6,
      "振幅": record.f7,
      "换手率": record.f8,
      "市盈率-动态": record.f9,
      "量比": record.f10,
      "5分钟涨跌": record.f11,
      "代码": record.f12,
      "名称": record.f14,
      "最高": record.f15,
      "最低": record.f16,
      "今开": record.f17,
      "昨收": record.f18,
      "总市值": record.f20,
      "流通市值": record.f21,
      "涨速": record.f22,
      "市净率": record.f23,
      "60日涨跌幅": record.f24,
      "年初至今涨跌幅": record.f25,
    }));
    return tempData;
  } catch (error) {
    console.error(error);
    return [];
  }
}
///东方财富网-深 A 股-实时行情
async function stock_sz_a_spot_em() {
  const url = "https://82.push2.eastmoney.com/api/qt/clist/get";
  const params = new URLSearchParams({
    pn: "1",
    pz: "50000",
    po: "1",
    np: "1",
    ut: "bd1d9ddb04089700cf9c27f6f7426281",
    fltt: "2",
    invt: "2",
    fid: "f3",
    fs: "m:0 t:6,m:0 t:80",
    fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152",
    _: "1623833739532"
  });

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.diff;
    // 设置列名
    let tempData = records.map(record => ({
      "最新价": record.f2,
      "涨跌幅": record.f3,
      "涨跌额": record.f4,
      "成交量": record.f5,
      "成交额": record.f6,
      "振幅": record.f7,
      "换手率": record.f8,
      "市盈率-动态": record.f9,
      "量比": record.f10,
      "5分钟涨跌": record.f11,
      "代码": record.f12,
      "名称": record.f14,
      "最高": record.f15,
      "最低": record.f16,
      "今开": record.f17,
      "昨收": record.f18,
      "总市值": record.f20,
      "流通市值": record.f21,
      "涨速": record.f22,
      "市净率": record.f23,
      "60日涨跌幅": record.f24,
      "年初至今涨跌幅": record.f25,
    }));

    return tempData;
  } catch (error) {
    console.error(error);
    return [];
  }
}
///东方财富网-京 A 股-实时行情
async function stock_bj_a_spot_em() {
  const url = "https://82.push2.eastmoney.com/api/qt/clist/get";
  const params = {
    pn: "1",
    pz: "50000",
    po: "1",
    np: "1",
    ut: "bd1d9ddb04089700cf9c27f6f7426281",
    fltt: "2",
    invt: "2",
    fid: "f3",
    fs: "m:0 t:81 s:2048",
    fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152",
    _: "1623833739532"
  };

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.diff;
    // 设置列名
    let tempData = records.map(record => ({
      "最新价": record.f2,
      "涨跌幅": record.f3,
      "涨跌额": record.f4,
      "成交量": record.f5,
      "成交额": record.f6,
      "振幅": record.f7,
      "换手率": record.f8,
      "市盈率-动态": record.f9,
      "量比": record.f10,
      "5分钟涨跌": record.f11,
      "代码": record.f12,
      "名称": record.f14,
      "最高": record.f15,
      "最低": record.f16,
      "今开": record.f17,
      "昨收": record.f18,
      "总市值": record.f20,
      "流通市值": record.f21,
      "涨速": record.f22,
      "市净率": record.f23,
      "60日涨跌幅": record.f24,
      "年初至今涨跌幅": record.f25,
    }))
    return tempData;
  } catch (error) {
    console.error(error);
    return [];
  }
}
///东方财富网-新股-实时行情
async function stock_new_a_spot_em() {
  const url = "https://82.push2.eastmoney.com/api/qt/clist/get";
  const params = new URLSearchParams({
    pn: "1",
    pz: "50000",
    po: "1",
    np: "1",
    ut: "bd1d9ddb04089700cf9c27f6f7426281",
    fltt: "2",
    invt: "2",
    wbp2u: "|0|0|0|web",
    fid: "f26",
    fs: "m:0 f:8,m:1 f:8",
    fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f11,f62,f128,f136,f115,f152",
    _: "1623833739532"
  });

  try {
    const response = await axios.get(`${url}?${params}`, { timeout: 15000 });
    const records = response.data?.data.diff;
    // 设置列名
    let tempData = records.map(record => ({
      "最新价": record.f2,
      "涨跌幅": record.f3,
      "涨跌额": record.f4,
      "成交量": record.f5,
      "成交额": record.f6,
      "振幅": record.f7,
      "换手率": record.f8,
      "市盈率-动态": record.f9,
      "量比": record.f10,
      "5分钟涨跌": record.f11,
      "代码": record.f12,
      "名称": record.f14,
      "最高": record.f15,
      "最低": record.f16,
      "今开": record.f17,
      "昨收": record.f18,
      "总市值": record.f20,
      "流通市值": record.f21,
      "涨速": record.f22,
      "市净率": record.f23,
      "60日涨跌幅": record.f24,
      "年初至今涨跌幅": record.f25,
      "上市日期": record.f26,
    }))
    return tempData;
  } catch (error) {
    console.error(error);
    return [];
  }
}
///东方财富网-创业板-实时行情
async function stock_cy_a_spot_em() {
  const url = "https://7.push2.eastmoney.com/api/qt/clist/get";
  const params = new URLSearchParams({
    "pn": "1",
    "pz": "50000",
    "po": "1",
    "np": "1",
    "ut": "bd1d9ddb04089700cf9c27f6f7426281",
    "fltt": "2",
    "invt": "2",
    "wbp2u": "|0|0|0|web",
    "fid": "f3",
    "fs": "m:0 t:80",
    "fields": "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152",
    "_": "1623833739532"
  });

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.diff;
    // 设置列名
    let tempData = records.map(record => ({
      "最新价": record.f2,
      "涨跌幅": record.f3,
      "涨跌额": record.f4,
      "成交量": record.f5,
      "成交额": record.f6,
      "振幅": record.f7,
      "换手率": record.f8,
      "市盈率-动态": record.f9,
      "量比": record.f10,
      "5分钟涨跌": record.f11,
      "代码": record.f12,
      "名称": record.f14,
      "最高": record.f15,
      "最低": record.f16,
      "今开": record.f17,
      "昨收": record.f18,
      "总市值": record.f20,
      "流通市值": record.f21,
      "涨速": record.f22,
      "市净率": record.f23,
      "60日涨跌幅": record.f24,
      "年初至今涨跌幅": record.f25,
    }))
    return tempData;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}
///东方财富网-科创板-实时行情
async function stock_kc_a_spot_em() {
  const url = "https://7.push2.eastmoney.com/api/qt/clist/get";
  const params = {
    pn: "1",
    pz: "50000",
    po: "1",
    np: "1",
    ut: "bd1d9ddb04089700cf9c27f6f7426281",
    fltt: "2",
    invt: "2",
    wbp2u: "|0|0|0|web",
    fid: "f3",
    fs: "m:1 t:23",
    fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152",
    _: "1623833739532"
  };

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.diff;
    // 设置列名
    let tempData = records.map(record => ({
      "最新价": record.f2,
      "涨跌幅": record.f3,
      "涨跌额": record.f4,
      "成交量": record.f5,
      "成交额": record.f6,
      "振幅": record.f7,
      "换手率": record.f8,
      "市盈率-动态": record.f9,
      "量比": record.f10,
      "5分钟涨跌": record.f11,
      "代码": record.f12,
      "_": record.f13,
      "名称": record.f14,
      "最高": record.f15,
      "最低": record.f16,
      "今开": record.f17,
      "昨收": record.f18,
      "总市值": record.f20,
      "流通市值": record.f21,
      "涨速": record.f22,
      "市净率": record.f23,
      "60日涨跌幅": record.f24,
      "年初至今涨跌幅": record.f25,
    }))
    return tempData;
  } catch (error) {
    console.error(error);
    return [];
  }
}
///东方财富网- B 股-实时行情
async function stock_zh_b_spot_em() {
  const url = "https://28.push2.eastmoney.com/api/qt/clist/get";
  const params = new URLSearchParams({
    pn: "1",
    pz: "50000",
    po: "1",
    np: "1",
    ut: "bd1d9ddb04089700cf9c27f6f7426281",
    fltt: "2",
    invt: "2",
    fid: "f3",
    fs: "m:0 t:7,m:1 t:3",
    fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152",
    _: "1623833739532"
  });

  try {
    const response = await axios.get(`${url}?${params}`, { timeout: 15000 });
    const records = response.data?.data.diff;
    // 设置列名
    let tempData = records.map(record => ({
      "最新价": record.f2,
      "涨跌幅": record.f3,
      "涨跌额": record.f4,
      "成交量": record.f5,
      "成交额": record.f6,
      "振幅": record.f7,
      "换手率": record.f8,
      "市盈率-动态": record.f9,
      "量比": record.f10,
      "5分钟涨跌": record.f11,
      "代码": record.f12,
      "_": record.f13,
      "名称": record.f14,
      "最高": record.f15,
      "最低": record.f16,
      "今开": record.f17,
      "昨收": record.f18,
      "总市值": record.f20,
      "流通市值": record.f21,
      "涨速": record.f22,
      "市净率": record.f23,
      "60日涨跌幅": record.f24,
      "年初至今涨跌幅": record.f25,
    }))

    return tempData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}
///东方财富网-行情首页-沪深京 A 股-每日行情
async function stock_zh_a_hist(symbol = "000001", period = "daily", start_date = "20240101", end_date = "20500101", adjust = "", timeout) {
  const adjust_dict = { "qfq": "1", "hfq": "2", "": "0" };
  const period_dict = { "daily": "101", "weekly": "102", "monthly": "103" };
  const url = "https://push2his.eastmoney.com/api/qt/stock/kline/get";
  const params = {
    fields1: "f1,f2,f3,f4,f5,f6",
    fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f116",
    ut: "7eea3edcaed734bea9cbfc24409ed989",
    klt: period_dict[period],
    fqt: adjust_dict[adjust],
    secid: `${util.get_market_number(symbol)}.${symbol}`,
    beg: start_date,
    end: end_date,
    _: "1623766962675"
  };

  try {
    const response = await axios.get(url, { params });
    const records = response.data?.data.klines;
    // 设置列名
    let tempData = records.map(record => {
      let items = record.split(',')
      return {
        "日期": items[0],
        "开盘": parseFloat(items[1]),
        "收盘": parseFloat(items[2]),
        "最高": parseFloat(items[3]),
        "最低": parseFloat(items[4]),
        "成交量": parseInt(items[5]),
        "成交额": parseFloat(items[6]),
        "振幅": parseFloat(items[7]),
        "涨跌幅": parseFloat(items[8]),
        "涨跌额": parseFloat(items[9]),
        "换手率": parseFloat(items[10]),
        "股票代码": symbol,
      }
    })

    return tempData;
  } catch (error) {
    console.error(error);
    return [];
  }
}
///东方财富网-行情首页-沪深京 A 股-每日分时行情

// 假设 code_id_map_em 是一个已经定义好的函数或对象
async function stock_zh_a_hist_min_em(
  symbol = "000001",
  period = "5",
  adjust = ""
) {
  const adjustMap = {
    "": "0",
    "qfq": "1",
    "hfq": "2"
  };

  let url, params;
  if (period === "1") {
    url = "https://push2his.eastmoney.com/api/qt/stock/trends2/get";
    params = {
      fields1: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13",
      fields2: "f51,f52,f53,f54,f55,f56,f57,f58",
      ut: "7eea3edcaed734bea9cbfc24409ed989",
      ndays: "5",
      iscr: "0",
      secid: `${util.get_market_number(symbol)}.${symbol}`,
      _: "1623766962675"
    };

    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.trends;
    let tempData = records.map(record => {
      let items = record.split(',');
      return {
        "日期时间": items[0],
        "开盘": parseFloat(items[1]),
        "收盘": parseFloat(items[2]),
        "最高": parseFloat(items[3]),
        "最低": parseFloat(items[4]),
        "成交量": parseFloat(items[5]),
        "成交额": parseFloat(items[6]),
        "均价": parseFloat(items[7]),
      }
    })
    return tempData;
  } else {
    url = "https://push2his.eastmoney.com/api/qt/stock/kline/get";
    params = {
      fields1: "f1,f2,f3,f4,f5,f6",
      fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
      ut: "7eea3edcaed734bea9cbfc24409ed989",
      klt: period,
      fqt: adjustMap[adjust],
      secid: `${util.get_market_number(symbol)}.${symbol}`,
      beg: "0",
      end: "20500000",
      _: "1630930917857"
    };
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.klines;
    let tempData = records.map(record => {
      let row = record.split(',');
      return {
        "日期时间": row[0],
        开盘: parseFloat(row[1]),
        收盘: parseFloat(row[2]),
        最高: parseFloat(row[3]),
        最低: parseFloat(row[4]),
        涨跌幅: parseFloat(row[5]),
        涨跌额: parseFloat(row[6]),
        成交量: parseInt(row[7]),
        成交额: parseFloat(row[8]),
        振幅: parseFloat(row[9]),
        换手率: parseFloat(row[10])
      }
    })
    return tempData;
  }
}
///东方财富网-行情首页-沪深京 A 股-每日分时行情包含盘前数据
async function stock_zh_a_hist_pre_min_em(
  symbol = "000001",
) {
  /**
   * 东方财富网-行情首页-沪深京 A 股-每日分时行情包含盘前数据
   * @param {string} symbol - 股票代码
   * @param {string} start_time - 开始时间
   * @param {string} end_time - 结束时间
   * @returns {Object[]} 每日分时行情包含盘前数据
   */
  const url = "https://push2.eastmoney.com/api/qt/stock/trends2/get";
  const params = new URLSearchParams({
    fields1: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13",
    fields2: "f51,f52,f53,f54,f55,f56,f57,f58",
    ut: "fa5fd1943c7b386f172d6893dbfba10b",
    ndays: "1",
    iscr: "1",
    iscca: "0",
    secid: `${util.get_market_number(symbol)}.${symbol}`,
    _: "1623766962675"
  });

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.trends.map(item => item.split(','));

    const temp_df = records.map(([time, open, close, high, low, volume, amount, latest]) => ({
      日期时间: time,
      开盘: parseFloat(open),
      收盘: parseFloat(close),
      最高: parseFloat(high),
      最低: parseFloat(low),
      成交量: parseFloat(volume),
      成交额: parseFloat(amount),
      最新价: parseFloat(latest)
    }));
    return temp_df;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw error;
  }
}
///东方财富网-港股-实时行情
async function stock_hk_spot_em() {
  const url = "https://72.push2.eastmoney.com/api/qt/clist/get";
  const params = new URLSearchParams({
    pn: "1",
    pz: "50000",
    po: "1",
    np: "1",
    ut: "bd1d9ddb04089700cf9c27f6f7426281",
    fltt: "2",
    invt: "2",
    fid: "f3",
    fs: "m:128 t:3,m:128 t:4,m:128 t:1,m:128 t:2",
    fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152",
    _: "1624010056945"
  });

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data.data.diff;
    let result = records.map(record => ({
      "最新价": record.f2,
      "涨跌幅": record.f3,
      "涨跌额": record.f4,
      "成交量": record.f5,
      "成交额": record.f6,
      "振幅": record.f7,
      "换手率": record.f8,
      "市盈率-动态": record.f9,
      "量比": record.f10,
      "代码": record.f12,
      "名称": record.f14,
      "最高": record.f15,
      "最低": record.f16,
      "今开": record.f17,
      "昨收": record.f18,
      "市净率": record.f23,
    }))
    return result;
  } catch (error) {
    console.error(`Error fetching data: ${error}`);
    throw error;
  }
}
///东方财富网-港股-主板-实时行情
async function stock_hk_main_board_spot_em() {
  const url = "https://81.push2.eastmoney.com/api/qt/clist/get";
  const params = new URLSearchParams({
    pn: "1",
    pz: "50000",
    po: "1",
    np: "1",
    ut: "bd1d9ddb04089700cf9c27f6f7426281",
    fltt: "2",
    invt: "2",
    fid: "f3",
    fs: "m:128 t:3",
    fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152",
    _: "1624010056945"
  });

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data.data.diff;
    let result = records.map(record => ({
      "最新价": record.f2,
      "涨跌幅": record.f3,
      "涨跌额": record.f4,
      "成交量": record.f5,
      "成交额": record.f6,
      "振幅": record.f7,
      "换手率": record.f8,
      "市盈率-动态": record.f9,
      "量比": record.f10,
      "代码": record.f12,
      "名称": record.f14,
      "最高": record.f15,
      "最低": record.f16,
      "今开": record.f17,
      "昨收": record.f18,
      "市净率": record.f23,
    }))
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // 可以根据需求处理错误
  }
}
///东方财富网-行情-港股-每日行情
async function stock_hk_hist(
  symbol = "00593",
  period = "daily",
  adjust = ""
) {
  const adjust_dict = { qfq: "1", hfq: "2", "": "0" };
  const period_dict = { daily: "101", weekly: "102", monthly: "103" };

  const url = "https://33.push2his.eastmoney.com/api/qt/stock/kline/get";
  const params = new URLSearchParams({
    secid: `116.${symbol}`,
    ut: "fa5fd1943c7b386f172d6893dbfba10b",
    fields1: "f1,f2,f3,f4,f5,f6",
    fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
    klt: period_dict[period],
    fqt: adjust_dict[adjust],
    end: "20500000",
    lmt: "1000000",
    _: "1623766962675"
  });

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.klines;
    // 设置列名
    let tempData = records.map(record => {
      let items = record.split(',');
      return {
        "日期时间": items[0],
        "开盘": items[1],
        "收盘": items[2],
        "最高": items[3],
        "最低": items[4],
        "成交量": items[5],
        "成交额": items[6],
        "最新价": items[7],
      }
    })
    return tempData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}
///东方财富网-行情-港股-每日分时行情

async function stock_hk_hist_min_em(
  symbol = "01611",
  period = "1",
  adjust = "",
) {
  const adjustMap = {
    "": "0",
    "qfq": "1",
    "hfq": "2",
  };

  let url, params;
  if (period === "1") {
    url = "https://push2his.eastmoney.com/api/qt/stock/trends2/get";
    params = new URLSearchParams({
      fields1: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13",
      fields2: "f51,f52,f53,f54,f55,f56,f57,f58",
      ut: "fa5fd1943c7b386f172d6893dbfba10b",
      iscr: "0",
      ndays: "5",
      secid: `116.${symbol}`,
      _: "1623766962675",
    });

    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.trends;
    let tempData = records.map(record => {
      let items = record.split(',');
      return {
        "日期时间": items[0],
        "开盘": parseFloat(items[1]),
        "收盘": parseFloat(items[2]),
        "最高": parseFloat(items[3]),
        "最低": parseFloat(items[4]),
        "成交量": parseFloat(items[5]),
        "成交额": parseFloat(items[6]),
        "最新价": parseFloat(items[7]),
      }
    })
    return tempData;
  } else {
    url = "https://push2his.eastmoney.com/api/qt/stock/kline/get";
    params = new URLSearchParams({
      fields1: "f1,f2,f3,f4,f5,f6",
      fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
      ut: "bd1d9ddb04089700cf9c27f6f7426281",
      klt: period,
      fqt: adjustMap[adjust],
      secid: `116.${symbol}`,
      beg: "0",
      end: "20500000",
      _: "1630930917857",
    });
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.klines;
    let tempData = records.map(record => {
      let items = record.split(',');
      return {
        "日期时间": items[0],
        "开盘": parseFloat(items[1]),
        "收盘": parseFloat(items[2]),
        "最高": parseFloat(items[3]),
        "最低": parseFloat(items[4]),
        "成交量": parseInt(items[5]),
        "成交额": parseFloat(items[6]),
        "振幅": parseFloat(items[7]),
        "涨跌幅": parseFloat(items[8]),
        "涨跌额": parseFloat(items[9]),
        "换手率": parseFloat(items[10]),
      }
    })
    return tempData;
  }
}
///东方财富网-美股-实时行情
async function stock_us_spot_em() {
  const url = "https://72.push2.eastmoney.com/api/qt/clist/get";
  const params = new URLSearchParams({
    pn: "1",
    pz: "20000",
    po: "1",
    np: "1",
    ut: "bd1d9ddb04089700cf9c27f6f7426281",
    fltt: "2",
    invt: "2",
    fid: "f3",
    fs: "m:105,m:106,m:107",
    fields: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152",
    _: "1624010056945"
  });

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.diff;
    let result = records.map(record => ({
      "最新价": record.f2,
      "涨跌幅": record.f3,
      "涨跌额": record.f4,
      "成交量": record.f5,
      "成交额": record.f6,
      "振幅": record.f7,
      "换手率": record.f8,
      "简称": record.f12,
      "编码": record.f13,
      "名称": record.f14,
      "最高价": record.f15,
      "最低价": record.f16,
      "开盘价": record.f17,
      "昨收价": record.f18,
      "总市值": record.f20,
      "市盈率": record.f115,
    }))

    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
///东方财富网-行情-美股-每日行情
async function stock_us_hist(
  symbol = "105.MSFT",
  period = "daily",
  start_date = "19700101",
  end_date = "22220101",
  adjust = ""
) {
  const periodDict = { daily: "101", weekly: "102", monthly: "103" };
  const adjustDict = { qfq: "1", hfq: "2", "": "0" };
  const url = "https://63.push2his.eastmoney.com/api/qt/stock/kline/get";
  const params = new URLSearchParams({
    secid: symbol,
    ut: "fa5fd1943c7b386f172d6893dbfba10b",
    fields1: "f1,f2,f3,f4,f5,f6",
    fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
    klt: periodDict[period],
    fqt: adjustDict[adjust],
    end: "20500000",
    lmt: "1000000",
    _: "1623766962675"
  });

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.klines;
    // 设置列名
    let result = records.map(record => {
      let items = record.split(',');
      return {
        "日期": items[0],
        "开盘": parseFloat(items[1]),
        "收盘": parseFloat(items[2]),
        "最高": parseFloat(items[3]),
        "最低": parseFloat(items[4]),
        "成交量": parseInt(items[5]),
        "成交额": parseFloat(items[6]),
        "振幅": parseFloat(items[7]),
        "涨跌幅": parseFloat(items[8]),
        "涨跌额": parseFloat(items[9]),
        "换手率": parseFloat(items[10]),
      }
    })

    return result;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return [];
  }
}
///东方财富网-行情首页-美股-每日分时行情
async function stock_us_hist_min_em(
  symbol = "105.ATER",
) {
  const url = "https://push2his.eastmoney.com/api/qt/stock/trends2/get";
  const params = new URLSearchParams({
    fields1: "f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13",
    fields2: "f51,f52,f53,f54,f55,f56,f57,f58",
    ut: "fa5fd1943c7b386f172d6893dbfba10b",
    iscr: "0",
    ndays: "5",
    secid: `${symbol.split('.')[0]}.${symbol.split('.')[1]}`,
    _: "1623766962675"
  });

  try {
    const response = await axios.get(url, { params, timeout: 15000 });
    const records = response.data?.data.trends;
    let result = records.map(record => {
      let items = record.split(',');
      return {
        "日期时间": items[0],
        "开盘": parseFloat(items[1]),
        "收盘": parseFloat(items[2]),
        "最高": parseFloat(items[3]),
        "最低": parseFloat(items[4]),
        "成交量": parseFloat(items[5]),
        "成交额": parseFloat(items[6]),
        "最新价": parseFloat(items[7]),
      }
    })
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}
//period {'1', '5', '15', '30', '60'}    { "daily": "101", "weekly": "102", "monthly": "103" }
// adjust_dict = {"qfq": "1", "hfq": "2", "": "0"}
async function stock_kline(
  symbol = '000001',
  market = 1,
  period = 101,
  adjust = 1,
  start_date = '20240101',
  end_date = '20500000',
) {
  let url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
  let params = {
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f116',
    ut: '7eea3edcaed734bea9cbfc24409ed989',
    klt: period,
    fqt: adjust,
    secid: `${market != null ? market : util.get_market_number(symbol)}.${symbol}`,
    beg: start_date,
    end: end_date,
    _: '1630930917857',
  };


  try {
    const response = await axios.get(url, {
      params
    });
    let dataJson = response.data;

    let tempData = dataJson.data.klines.map(item => item.split(','));
    let result = tempData.map(item => {
      let obj = {
        symbol: symbol,
        period: period,
        open: parseFloat(item[1]),
        close: parseFloat(item[2]),
        high: parseFloat(item[3]),
        low: parseFloat(item[4]),
        volume: parseFloat(item[5]),
        amount: parseFloat(item[6]),
        amplitude: parseFloat(item[7]),
        percent: parseFloat(item[8]),
        price_change_amount: parseFloat(item[9]),
        turnover: parseFloat(item[10]),
      }

      if (item[0].split(' ').length > 1) {
        obj.date = item[0].split(' ')[0].replace(/-/g, '');
        obj.time = item[0].split(' ')[1].replace(/:/g, '') + "00";
      } else {
        obj.date = util.parseDate(item[0]).fstr();
      }
      return obj;
    });
    return result;
  } catch (error) {
    console.error('Error fetching stock data:', error);
  }
}
// 1分钟数据 默认过去5天
async function stock_1minute(
  symbol = "000001", day_offset = 5
) {
  let url = 'https://push2his.eastmoney.com/api/qt/stock/trends2/get';
  let params = {
    fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
    ut: '7eea3edcaed734bea9cbfc24409ed989',
    ndays: day_offset,
    iscr: '0',
    secid: `${util.get_market_number(symbol)}.${symbol}`,
    _: '1623766962675',
  };
  try {
    const response = await axios.get(url, {
      params
    });
    let dataJson = response.data;

    let tempData;
    tempData = dataJson.data.trends.map(item => item.split(','));
    let result = tempData.map(item => ({
      period: 1,
      symbol: symbol,
      date: item[0].split(' ')[0].replace(/-/g, ''),
      time: item[0].split(' ')[1].replace(/:/g, '') + "00",
      open: parseFloat(item[1]),
      close: parseFloat(item[2]),
      high: parseFloat(item[3]),
      low: parseFloat(item[4]),
      volume: parseFloat(item[5]),
      amount: parseFloat(item[6]),
      avg_price: parseFloat(item[7]),
    }));

    return result;
  } catch (error) {
    console.error('Error fetching stock data:', error);
  }
}
module.exports = {
  stock_kline: stock_kline,
  stock_1minute: stock_1minute,
  stock_zh_a_spot_em: stock_zh_a_spot_em,
  stock_sh_a_spot_em: stock_sh_a_spot_em,
  stock_sz_a_spot_em: stock_sz_a_spot_em,
  stock_bj_a_spot_em: stock_bj_a_spot_em,
  stock_new_a_spot_em: stock_new_a_spot_em,
  stock_cy_a_spot_em: stock_cy_a_spot_em,
  stock_kc_a_spot_em: stock_kc_a_spot_em,
  stock_zh_b_spot_em: stock_zh_b_spot_em,
  stock_zh_a_hist: stock_zh_a_hist,
  stock_zh_a_hist_min_em: stock_zh_a_hist_min_em,
  stock_zh_a_hist_pre_min_em: stock_zh_a_hist_pre_min_em,
  stock_hk_spot_em: stock_hk_spot_em,
  stock_hk_main_board_spot_em: stock_hk_main_board_spot_em,
  stock_hk_hist: stock_hk_hist,
  stock_hk_hist_min_em: stock_hk_hist_min_em,
  stock_us_spot_em: stock_us_spot_em,
  stock_us_hist: stock_us_hist,
  stock_us_hist_min_em: stock_us_hist_min_em,
};