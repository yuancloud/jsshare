const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-行情中心-涨停板行情-涨停股池
async function stock_zt_pool_em(date = "20241204") {
    /**
     * 东方财富网-行情中心-涨停板行情-涨停股池
     * https://quote.eastmoney.com/ztb/detail#type=ztgc
     * @param {string} date - 交易日
     * @returns {Object[]} 涨停股池
     */
    const url = "https://push2ex.eastmoney.com/getTopicZTPool";
    const params = new URLSearchParams({
        ut: "7eea3edcaed734bea9cbfc24409ed989",
        dpt: "wz.ztzt",
        Pageindex: "0",
        pagesize: "10000",
        sort: "fbt:asc",
        date: date,
        _: "1621590489736"
    });

    try {
        const response = await axios.get(url, { params });
        const records = response.data?.data.pool || [];
        let result = records.map(item => ({
            "代码": item.c,
            "名称": item.n,
            "最新价": item.p / 1000,
            "涨跌幅": item.zdp,
            "成交额": item.amount,
            "流通市值": item.ltsz,
            "总市值": item.tshare,
            "换手率": item.hs,
            "连板数": item.lbc,
            "首次封板时间": item.fbt.toString().padStart(6, "0"),
            "最后封板时间": item.lbt.toString().padStart(6, "0"),
            "封板资金": item.fund,
            "炸板次数": item.zbc,
            "所属行业": item.hybk,
            "涨停统计": item.zttj.ct + "/" + item.zttj.days,
        }));

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}
///东方财富网-行情中心-涨停板行情-昨日涨停股池
async function stock_zt_pool_previous_em(date = "20241204") {
    /**
     * 东方财富网-行情中心-涨停板行情-昨日涨停股池
     * https://quote.eastmoney.com/ztb/detail#type=zrzt
     * @param {string} date - 交易日
     * @returns {Promise<Array>} 昨日涨停股池
     */
    const url = "https://push2ex.eastmoney.com/getYesterdayZTPool";
    const params = new URLSearchParams({
        ut: "7eea3edcaed734bea9cbfc24409ed989",
        dpt: "wz.ztzt",
        Pageindex: "0",
        pagesize: "170",
        sort: "zs:desc",
        date: date,
        _: "1621590489736"
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data?.data.pool;
        // 调整列名
        let tempDf = dataJson.map(item => ({
            "代码": item.c,
            "名称": item.n,
            "最新价": item.p,
            "涨停价": item.ztp,
            "涨跌幅": item.zdp,
            "成交额": item.amount,
            "流通市值": item.ltsz,
            "总市值": item.tshare,
            "换手率": item.hs,
            "振幅": item.zf,
            "涨速": item.zs,
            "昨日封板时间": item.yfbt.toString().padStart(6, "0"),
            "昨日连板数": item.ylbc,
            "所属行业": item.hybk,
            "涨停统计": item.zttj.ct + "/" + item.zttj.days,
        }));

        return tempDf;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        return [];
    }
}
///东方财富网-行情中心-涨停板行情-强势股池
async function stock_zt_pool_strong_em(date = "20241204") {
    const url = "https://push2ex.eastmoney.com/getTopicQSPool";
    const params = new URLSearchParams({
        ut: "7eea3edcaed734bea9cbfc24409ed989",
        dpt: "wz.ztzt",
        Pageindex: "0",
        pagesize: "170",
        sort: "zdp:desc",
        date,
        _: "1621590489736"
    });

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data?.data.pool;

        let tempData = dataJson.map((item, index) => ({
            "代码": item.c,
            "名称": item.n,
            "最新价": item.p / 1000,
            "涨停价": item.ztp / 1000,
            "涨跌幅": item.zdp,
            "成交额": item.amount,
            "流通市值": item.ltsz,
            "总市值": item.tshare,
            "换手率": item.hs,
            "是否新高": item.nh,
            "入选理由": item.cc,
            "量比": item.lb,
            "涨速": item.zs,
            "涨停统计": item.zttj.ct + "/" + item.zttj.days,
            "所属行业": item.hybk,
        }));

        return tempData;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}
///东方财富网-行情中心-涨停板行情-次新股池
async function stock_zt_pool_sub_new_em(date = "20241204") {
    const url = "https://push2ex.eastmoney.com/getTopicCXPooll";
    const params = new URLSearchParams({
        ut: "7eea3edcaed734bea9cbfc24409ed989",
        dpt: "wz.ztzt",
        Pageindex: "0",
        pagesize: "170",
        sort: "ods:asc",
        date: date,
        _: "1621590489736"
    });

    try {
        const response = await axios.get(url, { params: params });

        const dataJson = response.data?.data.pool || [];

        let temp_df = dataJson.map((item, index) => ({
            "代码": item.c,
            "名称": item.n,
            "最新价": item.p / 1000,
            "涨停价": item.ztp == 1000000000 ? null : (item.ztp / 1000),
            "涨跌幅": item.zdp,
            "成交额": item.amount,
            "流通市值": item.ltsz,
            "总市值": item.tshare,
            "转手率": item.hs,
            "开板几日": item.ods,
            "开板日期": item.od.toString(),
            "上市日期": item.ipod.toString(),
            "是否新高": item.nh,
            "涨停统计": item.zttj.ct + "/" + item.zttj.days,
            "所属行业": item.hybk,
        }));

        return temp_df;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}
///东方财富网-行情中心-涨停板行情-炸板股池

async function stock_zt_pool_zbgc_em(date = "20241204") {
    // 计算30天前的日期
    const thirtyDaysAgo = dayjs().subtract(30, 'day').format("YYYYMMDD");
    // if (parseInt(date) < parseInt(thirtyDaysAgo)) {
    //     throw new Error("炸板股池只能获取最近 30 个交易日的数据");
    // }
    const url = "https://push2ex.eastmoney.com/getTopicZBPool";
    const params = {
        ut: "7eea3edcaed734bea9cbfc24409ed989",
        dpt: "wz.ztzt",
        Pageindex: "0",
        pagesize: "170",
        sort: "fbt:asc",
        date: date,
        _: "1621590489736",
    };
    let response = await axios.get(url, { params: params });
    let records = response.data?.data.pool || [];
    let result = records.map(item => ({
        "代码": item.c,
        "名称": item.n,
        "最新价": item.p / 1000,
        "涨停价": item.ztp / 1000,
        "涨跌幅": item.zdp,
        "成交额": item.amount,
        "流通市值": item.ltsz,
        "总市值": item.tshare,
        "换手率": item.hs,
        "首次封板时间": item.fbt.toString().padStart(6, "0"),
        "炸板次数": item.zbc,
        "振幅": item.zf,
        "涨速": item.zs,
        "涨停统计": item.zttj.ct + "/" + item.zttj.days,
        "所属行业": item.hybk,
    }));
    return result;
}
///东方财富网-行情中心-涨停板行情-跌停股池
async function stock_zt_pool_dtgc_em(date = "20241204") {
    // 计算30天前的日期
    const thirtyDaysAgo = dayjs().subtract(30, 'day').format("YYYYMMDD");
    // if (parseInt(date) < parseInt(thirtyDaysAgo)) {
    //     throw new Error("跌停股池只能获取最近 30 个交易日的数据");
    // }

    const url = "https://push2ex.eastmoney.com/getTopicDTPool";
    const params = {
        ut: "7eea3edcaed734bea9cbfc24409ed989",
        dpt: "wz.ztzt",
        Pageindex: "0",
        pagesize: "10000",
        sort: "fund:asc",
        date: date,
        _: "1621590489736",
    };

    try {
        const response = await axios.get(url, { params });
        const dataJson = response.data?.data.pool || [];

        let temp_df = dataJson.map((item, index) => ({
            "代码": item.c,
            "名称": item.n,
            "最新价": item.p / 1000,
            "涨跌幅": item.zdp,
            "成交额": item.amount,
            "流通市值": item.ltsz,
            "总市值": item.tshare,
            "动态市盈率": item.pe,
            "换手率": item.hs,
            "封单资金": item.fund,
            "最后封板时间": item.lbt.toString().padStart(6, "0"),
            "板上成交额": item.fba,
            "连续跌停": item.days,
            "开板次数": item.oc,
            "所属行业": item.hybk,
        }));

        return temp_df;
    } catch (error) {
        console.error(error);
        return [];
    }
}
module.exports = {
    stock_zt_pool_em: stock_zt_pool_em,
    stock_zt_pool_previous_em: stock_zt_pool_previous_em,
    stock_zt_pool_strong_em: stock_zt_pool_strong_em,
    stock_zt_pool_sub_new_em: stock_zt_pool_sub_new_em,
    stock_zt_pool_zbgc_em: stock_zt_pool_zbgc_em,
    stock_zt_pool_dtgc_em: stock_zt_pool_dtgc_em,
};