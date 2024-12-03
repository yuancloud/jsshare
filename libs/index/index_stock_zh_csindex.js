const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///生成时间戳
function __get_current_timestamp_ms() {
    /**
     * 生成时间戳
     * @return {number} 时间戳
     */
    const timestampMs = Date.now();
    return timestampMs;
}
///生成 md5 加密后的值
const crypto = require('crypto');

function __md5_hash(input_string) {
    /**
     * 生成 md5 加密后的值
     * @param {string} input_string - 需要加密的字符串
     * @return {string} 生成 md5 加密后的值
     */
    const hash = crypto.createHash('md5');
    hash.update(input_string, 'utf-8');
    return hash.digest('hex');
}
///生成 post 密文，需要 JS 观察如下文件：
const crypto = require('crypto'); // 如果你在Node.js环境外，请使用crypto-js

function __create_encode(
    act_time = "1688635494326",
    authtoken = "",
    gu_code = "399808.SZ",
    pe_category = "pb",
    type = "pc",
    ver = "new",
    version = "2.2.7",
    year = -1,
) {
    const input_string = `${act_time}${authtoken}${gu_code}${pe_category}${type}${ver}${version}${year}EWf45rlv#kfsr@k#gfksgkr`;
    const hash_value = crypto.createHash('md5').update(input_string).digest('hex');
    const l = hash_value;  // 注意：这里使用l作为变量名，在JavaScript中是合法的
    const c = l.substring(29, 31);
    const d = l.substring(2, 4);
    const f = l.substring(5, 6);
    const h = l.substring(26, 27);
    const m = l.substring(6, 8);
    const v = l.substring(1, 2);
    const y = l.substring(0, 2);
    const k = l.substring(6, 8);
    const w = l.substring(8, 9);
    const x = l.substring(30, 31);
    const P = l.substring(11, 14);
    const z = l.substring(11, 12);
    const j = l.substring(2, 5);
    const q = l.substring(9, 11);
    const H = l.substring(23, 25);
    const O = l.substring(31, 32);  // 注意：O是有效的变量名
    const C = l.substring(25, 27);
    const E = l.substring(9, 11);
    const A = l.substring(27, 29);
    const T = l.substring(17, 19);
    const F = l.substring(26, 27);
    const U = l.substring(12, 14);
    const S = l.substring(25, 26);
    const R = l.substring(16, 19);
    const K = l.substring(17, 21);
    const I = l.substring(18, 19);  // 注意：I是有效的变量名
    const D = l.substring(21, 23);
    const _ = l.substring(14, 16);  // $ 不是有效的变量名，所以用下划线代替
    const B = l.substring(29, 32);
    const N = l.substring(21, 23);
    const V = l.substring(24, 26);
    const Y = l.substring(16, 17);

    function b(
        t,
        e,
        n,
        i,
        a,
        r,
        o,
        l,  // 注意：这里使用l作为参数名
        u,
        c,
        s,
        d,
        _,
        f,
        h,
        p,
        m,
        g,
        v,
        y,
        b,
        k,
        w,
        x,
        P,
        z,
        j,
        q,
        H,
        O,  // 注意：O是有效的参数名
        C,
        E,
        A,
    ) {
        t.data.tirgkjfs = f;
        t.data.abiokytke = _;
        t.data.u54rg5d = e;
        t.data.kf54ge7 = q;
        t.data.tiklsktr4 = d;
        t.data.lksytkjh = z;
        t.data.sbnoywr = j;
        t.data.bgd7h8tyu54 = w;
        t.data.y654b5fs3tr = C;
        t.data.bioduytlw = n;
        t.data.bd4uy742 = P;
        t.data.h67456y = o;
        t.data.bvytikwqjk = s;
        t.data.ngd4uy551 = b;
        t.data.bgiuytkw = v;
        t.data.nd354uy4752 = g;
        t.data.ghtoiutkmlg = x;
        t.data.bd24y6421f = i;
        t.data.tbvdiuytk = l;
        t.data.ibvytiqjek = p;
        t.data.jnhf8u5231 = A;
        t.data.fjlkatj = E;
        t.data.hy5641d321t = H;
        t.data.iogojti = r;
        t.data.ngd4yut78 = a;
        t.data.nkjhrew = c;
        t.data.yt447e13f = O;
        t.data.n3bf4uj7y7 = k;
        t.data.nbf4uj7y432 = h;
        t.data.yi854tew = u;
        t.data.h13ey474 = m;
        t.data.quikgdky = y;
    }

    const t = { data: {} };

    b(
        t,
        d,
        f,
        V,
        U,
        S,
        R,
        Y,
        c,
        h,
        m,
        v,
        N,
        y,
        D,
        _,
        B,
        x,
        E,
        A,
        T,
        I,
        k,
        P,
        F,
        K,
        H,
        O,
        C,
        w,
        z,
        j,
        q,
    );
    return t.data;
}
///中证指数-具体指数-历史行情数据

async function stock_zh_index_hist_csindex(symbol = "000928", start_date = "20180526", end_date = "20240604") {
    /**
     * 中证指数-具体指数-历史行情数据
     * P.S. 只有收盘价，正常情况下不应使用该接口，除非指数只有中证网站有
     * https://www.csindex.com.cn/zh-CN/indices/index-detail/H30374#/indices/family/detail?indexCode=H30374
     * @param {string} symbol - 指数代码; e.g., H30374
     * @param {string} start_date - 开始日期
     * @param {string} end_date - 结束日期
     * @return {Array<Object>} 包含日期和收盘价等信息的指数数据
     */
    const url = "https://www.csindex.com.cn/csindex-home/perf/index-perf";
    const params = {
        indexCode: symbol,
        startDate: start_date,
        endDate: end_date,
    };

    try {
        const response = await axios.get(url, { params });
        const data = response.data;
        if (data && Array.isArray(data.data)) {
            const tempData = data.data.map(item => ({
                日期: dayjs(item.date).format('YYYY-MM-DD'),
                指数代码: item.indexCode,
                指数中文全称: item.fullNameZh,
                指数中文简称: item.shortNameZh,
                指数英文全称: item.fullNameEn,
                指数英文简称: item.shortNameEn,
                开盘: parseFloat(item.open) || null,
                最高: parseFloat(item.high) || null,
                最低: parseFloat(item.low) || null,
                收盘: parseFloat(item.close) || null,
                涨跌: parseFloat(item.change) || null,
                涨跌幅: parseFloat(item.changePct) || null,
                成交量: parseFloat(item.volume) || null,
                成交金额: parseFloat(item.amount) || null,
                样本数量: parseInt(item.sampleCount, 10) || null,
                滚动市盈率: parseFloat(item.rollingPe) || null,
            }));
            return tempData;
        }
        return [];
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
///中证指数-指数估值数据
const XLSX = require('xlsx');

async function stock_zh_index_value_csindex(symbol = "H30374") {
    /**
     * 获取中证指数-指数估值数据
     * @param {string} symbol - 指数代码; e.g., H30374
     * @returns {Array<Object>} - 指数估值数据
     */
    const url = `https://csi-web-dev.oss-cn-shanghai-finance-1-pub.aliyuncs.com/static/html/csindex/public/uploads/file/autofile/indicator/${symbol}indicator.xls`;

    try {
        // 使用axios下载Excel文件
        const response = await axios({
            method: 'get',
            url,
            responseType: 'arraybuffer'
        });

        // 使用xlsx库解析Excel
        const workbook = XLSX.read(response.data, {type: 'buffer'});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const tempData = XLSX.utils.sheet_to_json(worksheet, {header: 1});

        // 处理列名
        const headers = [
            "日期",
            "指数代码",
            "指数中文全称",
            "指数中文简称",
            "指数英文全称",
            "指数英文简称",
            "市盈率1",
            "市盈率2",
            "股息率1",
            "股息率2"
        ];

        // 将数据转换为对象数组并处理数据类型
        const result = tempData.slice(1).map(row => {
            return {
                日期: dayjs(row[0], 'YYYYMMDD').toDate(),
                指数代码: row[1],
                指数中文全称: row[2],
                指数中文简称: row[3],
                指数英文全称: row[4],
                指数英文简称: row[5],
                市盈率1: parseFloat(row[6]) || null,
                市盈率2: parseFloat(row[7]) || null,
                股息率1: parseFloat(row[8]) || null,
                股息率2: parseFloat(row[9]) || null,
            };
        });

        return result;
    } catch (error) {
        console.error('Error fetching or processing the data:', error);
        throw error;
    }
}
///funddb-指数估值-指数代码

function indexValueNameFunddb() {
    /**
     * funddb-指数估值-指数代码
     * https://funddb.cn/site/index
     * @returns {Array} 指数代码等相关数据
     */
    const url = "https://api.jiucaishuo.com/v2/guzhi/showcategory";
    const getCurrentTimestampMsStr = () => Date.now();
    const createEncode = (actTime, authtoken, guCode, peCategory, type, ver, version, year) => {
        // 这里需要根据实际的编码逻辑来实现
        return {};
    };

    const get_current_timestamp_ms_str = getCurrentTimestampMsStr();
    const encodeParams = createEncode(
        actTime: String(get_current_timestamp_ms_str),
        authtoken: "",
        guCode: "",
        peCategory: "",
        type: "pc",
        ver: "",
        version: "2.2.7",
        year: ""
    );

    const payload = {
        type: "pc",
        version: "2.2.7",
        authtoken: "",
        act_time: String(get_current_timestamp_ms_str),
    };
    Object.assign(payload, encodeParams);

    return axios.post(url, payload)
        .then(response => {
            const dataJson = response.data;
            let tempData = dataJson.data.right_list.map(item => ({
                '指数开始时间': item[0],
                '指数名称': item[2],
                '指数代码': item[3],
                '最新PE': item[4],
                '最新PB': item[5],
                'PE分位': item[6],
                'PB分位': item[7],
                '股息率': item[8],
                '更新时间': item[12],
                '股息率分位': item[13]
            }));

            tempData = tempData.map(item => ({
                ...item,
                '指数开始时间': dayjs(item['指数开始时间']).toDate(),
                '最新PE': Number.parseFloat(item['最新PE']) || null,
                'PE分位': Number.parseFloat(item['PE分位']) || null,
                '最新PB': Number.parseFloat(item['最新PB']) || null,
                'PB分位': Number.parseFloat(item['PB分位']) || null,
                '股息率': Number.parseFloat(item['股息率']) || null,
                '股息率分位': Number.parseFloat(item['股息率分位']) || null
            }));

            return tempData;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            throw error;
        });
}

// 注意：在实际应用中，你需要根据实际情况调整createEncode函数的实现。
///funddb-指数估值-估值信息
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone'); // 用于时区转换
dayjs.extend(utc);
dayjs.extend(timezone);

async function indexValueHistFunddb(symbol = "大盘成长", indicator = "市盈率", year = "-1") {
    const indicatorMap = {
        "市盈率": "pe",
        "市净率": "pb",
        "股息率": "xilv",
        "风险溢价": "fed",
    };
    const indexValueNameFunddbDf = await index_value_name_funddb();
    const nameCodeMap = new Map(indexValueNameFunddbDf.map(item => [item.指数名称, item.指数代码]));

    const url = "https://api.jiucaishuo.com/v2/guzhi/newtubiaolinedata";
    const getCurrentTimestampMsStr = () => Date.now();
    const createEncode = (actTime, authtoken, guCode, peCategory, type, ver, version, year) => {
        // 这里需要实现具体的编码逻辑，因为原始的__create_encode没有提供细节
        return {};
    };

    const encodeParams = createEncode(
        String(getCurrentTimestampMsStr()),
        "",
        nameCodeMap.get(symbol),
        indicatorMap[indicator],
        "pc",
        "new",
        "2.2.7",
        parseInt(year, 10)
    );

    const payload = {
        gu_code: nameCodeMap.get(symbol),
        pe_category: indicatorMap[indicator],
        year: parseInt(year, 10),
        ver: "new",
        type: "pc",
        version: "2.2.7",
        authtoken: "",
        act_time: String(getCurrentTimestampMsStr()),
    };
    Object.assign(payload, encodeParams);

    try {
        const response = await axios.post(url, payload);
        const dataJson = response.data;
        let bigDf = [];
        const tempDf = dataJson.data.tubiao.series[0].data.map(item => ({ timestamp: item[0], value: item[1] }));

        bigDf = tempDf.map((item, index) => ({
            日期: dayjs(item.timestamp).tz("Asia/Shanghai").format("YYYY-MM-DD"),
            平均值: Number(item.value),
            [indicator]: Number(dataJson.data.tubiao.series[1].data[index][1]),
            最低30: Number(dataJson.data.tubiao.series[2].data[index][1]),
            最低10: Number(dataJson.data.tubiao.series[3].data[index][1]),
            最高30: Number(dataJson.data.tubiao.series[4].data[index][1]),
            最高10: Number(dataJson.data.tubiao.series[5].data[index][1])
        }));

        return bigDf;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
module.exports = {
    __get_current_timestamp_ms : __get_current_timestamp_ms,
    __md5_hash : __md5_hash,
    __create_encode : __create_encode,
    stock_zh_index_hist_csindex : stock_zh_index_hist_csindex,
    stock_zh_index_value_csindex : stock_zh_index_value_csindex,
    index_value_name_funddb : index_value_name_funddb,
    index_value_hist_funddb : index_value_hist_funddb,
};