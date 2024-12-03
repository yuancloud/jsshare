const axios = require('axios');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-数据中心-新股数据-IPO审核信息-科创板

async function stockRegisterKcb() {
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = {
        sortColumns: "UPDATE_DATE,ORG_CODE",
        sortTypes: "-1,-1",
        pageSize: "500",
        pageNumber: "1",
        reportName: "RPT_IPO_INFOALLNEW",
        columns: "SECURITY_CODE,STATE,REG_ADDRESS,INFO_CODE,CSRC_INDUSTRY,ACCEPT_DATE,DECLARE_ORG,PREDICT_LISTING_MARKET,LAW_FIRM,ACCOUNT_FIRM,ORG_CODE,UPDATE_DATE,RECOMMEND_ORG,IS_REGISTRATION",
        source: "WEB",
        client: "WEB",
        filter: '(PREDICT_LISTING_MARKET="科创板")',
    };
    let big_df = [];
    let page_num;

    // Fetch the first page to get total number of pages
    const response = await axios.get(url, { params, headers });
    page_num = response.data.result.pages;

    for (let page = 1; page <= page_num; page++) {
        params.pageNumber = page.toString();
        const r = await axios.get(url, { params, headers });
        const data_json = r.data;
        const temp_df = data_json.result.data;
        big_df = _.concat(big_df, temp_df);
    }

    // Process the concatenated data
    big_df = _.map(big_df, (item, index) => ({
        ...item,
        index: index + 1,
    }));

    // Rename and format the fields
    big_df = _.map(big_df, item => ({
        '序号': item.index,
        '企业名称': item.DECLARE_ORG,
        '最新状态': item.STATE,
        '注册地': item.REG_ADDRESS,
        '行业': item.CSRC_INDUSTRY,
        '保荐机构': item.RECOMMEND_ORG,
        '律师事务所': item.LAW_FIRM,
        '会计师事务所': item.ACCOUNT_FIRM,
        '更新日期': dayjs(item.UPDATE_DATE).format('YYYY-MM-DD'),
        '受理日期': dayjs(item.ACCEPT_DATE).format('YYYY-MM-DD'),
        '拟上市地点': item.PREDICT_LISTING_MARKET,
        '招股说明书': `https://pdf.dfcfw.com/pdf/H2_${item.INFO_CODE}_1.pdf`,
    }));

    // Select the required columns
    big_df = _.map(big_df, item => _.pick(item, [
        '序号', '企业名称', '最新状态', '注册地', '行业', '保荐机构', '律师事务所', '会计师事务所', '更新日期', '受理日期', '拟上市地点', '招股说明书'
    ]));

    return big_df;
}

// Note: The `headers` variable is not defined in the JavaScript code. You need to define it or pass it as a parameter.
///东方财富网-数据中心-新股数据-IPO审核信息-创业板

async function stock_register_cyb() {
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: "UPDATE_DATE,ORG_CODE",
        sortTypes: "-1,-1",
        pageSize: "500",
        pageNumber: "1",
        reportName: "RPT_IPO_INFOALLNEW",
        columns: "SECURITY_CODE,STATE,REG_ADDRESS,INFO_CODE,CSRC_INDUSTRY,ACCEPT_DATE,DECLARE_ORG,PREDICT_LISTING_MARKET,LAW_FIRM,ACCOUNT_FIRM,ORG_CODE,UPDATE_DATE,RECOMMEND_ORG,IS_REGISTRATION",
        source: "WEB",
        client: "WEB",
        filter: '(PREDICT_LISTING_MARKET="创业板")'
    });

    // 发起请求获取数据
    let response = await axios.get(url, { params, headers });
    let dataJson = response.data;
    let pageNum = dataJson.result.pages;
    let bigDf = [];

    for (let page = 1; page <= pageNum; page++) {
        params.set("pageNumber", page.toString());
        response = await axios.get(url, { params, headers });
        dataJson = response.data;
        let tempDf = dataJson.result.data;
        bigDf = bigDf.concat(tempDf);
    }

    // 重命名列并添加序号
    bigDf = bigDf.map((row, index) => ({
        序号: index + 1,
        企业名称: row.DECLARE_ORG,
        最新状态: row.STATE,
        注册地: row.REG_ADDRESS,
        行业: row.CSRC_INDUSTRY,
        保荐机构: row.RECOMMEND_ORG,
        律师事务所: row.LAW_FIRM,
        会计师事务所: row.ACCOUNT_FIRM,
        更新日期: row.UPDATE_DATE,
        受理日期: row.ACCEPT_DATE,
        拟上市地点: row.PREDICT_LISTING_MARKET,
        招股说明书: `https://pdf.dfcfw.com/pdf/H2_${row.INFO_CODE}_1.pdf`
    }));

    // 转换日期格式
    bigDf.forEach(row => {
        row.更新日期 = dayjs(row.更新日期).toDate();
        row.受理日期 = dayjs(row.受理日期).toDate();
    });

    return bigDf;
}
///东方财富网-数据中心-新股数据-IPO审核信息-北交所

async function stock_register_bj() {
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = {
        sortColumns: "UPDATE_DATE,ORG_CODE",
        sortTypes: "-1,-1",
        pageSize: "500",
        pageNumber: "1",
        reportName: "RPT_IPO_INFOALLNEW",
        columns: "SECURITY_CODE,STATE,REG_ADDRESS,INFO_CODE,CSRC_INDUSTRY,ACCEPT_DATE,DECLARE_ORG,PREDICT_LISTING_MARKET,LAW_FIRM,ACCOUNT_FIRM,ORG_CODE,UPDATE_DATE,RECOMMEND_ORG,IS_REGISTRATION",
        source: "WEB",
        client: "WEB",
        filter: '(PREDICT_LISTING_MARKET="北交所")',
    };
    const headers = {}; // 假设headers已经定义

    let big_df = [];
    let { data: data_json } = await axios.get(url, { params, headers });
    let page_num = data_json.result.pages;

    for (let page = 1; page <= page_num; page++) {
        _.set(params, 'pageNumber', page.toString());
        ({ data: data_json } = await axios.get(url, { params, headers }));
        let temp_df = data_json.result.data;
        big_df = big_df.concat(temp_df);
    }

    big_df = big_df.map((row, index) => ({
        ...row,
        index: index + 1,
        企业名称: row.DECLARE_ORG,
        最新状态: row.STATE,
        注册地: row.REG_ADDRESS,
        行业: row.CSRC_INDUSTRY,
        保荐机构: row.RECOMMEND_ORG,
        律师事务所: row.LAW_FIRM,
        会计师事务所: row.ACCOUNT_FIRM,
        更新日期: dayjs(row.UPDATE_DATE).toDate(),
        受理日期: dayjs(row.ACCEPT_DATE).toDate(),
        拟上市地点: row.PREDICT_LISTING_MARKET,
        招股说明书: `https://pdf.dfcfw.com/pdf/H2_${row.INFO_CODE}_1.pdf`,
    }));

    big_df = big_df.map(row => ({
        序号: row.index,
        企业名称: row.企业名称,
        最新状态: row.最新状态,
        注册地: row.注册地,
        行业: row.行业,
        保荐机构: row.保荐机构,
        律师事务所: row.律师事务所,
        会计师事务所: row.会计师事务所,
        更新日期: row.更新日期,
        受理日期: row.受理日期,
        拟上市地点: row.拟上市地点,
        招股说明书: row.招股说明书,
    }));

    return big_df;
}
///东方财富网-数据中心-新股数据-IPO审核信息-上海主板

async function stockRegisterSh() {
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = {
        sortColumns: "UPDATE_DATE,ORG_CODE",
        sortTypes: "-1,-1",
        pageSize: "500",
        pageNumber: "1",
        reportName: "RPT_IPO_INFOALLNEW",
        columns: "SECURITY_CODE,STATE,REG_ADDRESS,INFO_CODE,CSRC_INDUSTRY,ACCEPT_DATE,DECLARE_ORG,PREDICT_LISTING_MARKET,LAW_FIRM,ACCOUNT_FIRM,ORG_CODE,UPDATE_DATE,RECOMMEND_ORG,IS_REGISTRATION",
        source: "WEB",
        client: "WEB",
        filter: '(PREDICT_LISTING_MARKET="沪主板")'
    };

    // 发起请求获取总页数
    const response = await axios.get(url, { params });
    const totalPages = response.data.result.pages;
    let bigData = [];

    for (let page = 1; page <= totalPages; page++) {
        params.pageNumber = page.toString();
        const res = await axios.get(url, { params });
        bigData = bigData.concat(res.data.result.data);
    }

    // 重命名列名
    const renamedData = bigData.map(item => ({
        序号: item.index + 1,
        企业名称: item.DECLARE_ORG,
        最新状态: item.STATE,
        注册地: item.REG_ADDRESS,
        行业: item.CSRC_INDUSTRY,
        保荐机构: item.RECOMMEND_ORG,
        律师事务所: item.LAW_FIRM,
        会计师事务所: item.ACCOUNT_FIRM,
        更新日期: dayjs(item.UPDATE_DATE).format('YYYY-MM-DD'),
        受理日期: dayjs(item.ACCEPT_DATE).format('YYYY-MM-DD'),
        拟上市地点: item.PREDICT_LISTING_MARKET,
        招股说明书: `https://pdf.dfcfw.com/pdf/H2_${item.INFO_CODE}_1.pdf`
    }));

    // 仅保留需要的字段
    const finalData = _.map(renamedData, obj => _.pick(obj, [
        '序号',
        '企业名称',
        '最新状态',
        '注册地',
        '行业',
        '保荐机构',
        '律师事务所',
        '会计师事务所',
        '更新日期',
        '受理日期',
        '拟上市地点',
        '招股说明书'
    ]));

    return finalData;
}

// 注意：此函数是异步的，调用时需要使用await或者通过.then()来处理结果。
///东方财富网-数据中心-新股数据-IPO审核信息-深圳主板

async function stock_register_sz() {
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: "UPDATE_DATE,ORG_CODE",
        sortTypes: "-1,-1",
        pageSize: "500",
        pageNumber: "1",
        reportName: "RPT_IPO_INFOALLNEW",
        columns: "SECURITY_CODE,STATE,REG_ADDRESS,INFO_CODE,CSRC_INDUSTRY,ACCEPT_DATE,DECLARE_ORG,PREDICT_LISTING_MARKET,LAW_FIRM,ACCOUNT_FIRM,ORG_CODE,UPDATE_DATE,RECOMMEND_ORG,IS_REGISTRATION",
        source: "WEB",
        client: "WEB",
        filter: '(PREDICT_LISTING_MARKET="深主板")',
    });

    // Fetch the first page to get total number of pages
    const response = await axios.get(url, { params: params, headers });
    const pageNum = response.data.result.pages;

    let big_df = [];

    for (let page = 1; page <= pageNum; page++) {
        params.set("pageNumber", page.toString());
        const r = await axios.get(url, { params: params, headers });
        const temp_df = r.data.result.data;
        big_df = _.concat(big_df, temp_df);
    }

    // Add index and rename columns
    big_df = big_df.map((item, index) => ({
        ...item,
        "序号": index + 1,
        "企业名称": item.DECLARE_ORG,
        "最新状态": item.STATE,
        "注册地": item.REG_ADDRESS,
        "行业": item.CSRC_INDUSTRY,
        "保荐机构": item.RECOMMEND_ORG,
        "律师事务所": item.LAW_FIRM,
        "会计师事务所": item.ACCOUNT_FIRM,
        "更新日期": item.UPDATE_DATE,
        "受理日期": item.ACCEPT_DATE,
        "拟上市地点": item.PREDICT_LISTING_MARKET,
        "招股说明书": `https://pdf.dfcfw.com/pdf/H2_${item.INFO_CODE}_1.pdf`
    }));

    // Convert dates
    big_df = big_df.map(item => ({
        ...item,
        "更新日期": dayjs(item["更新日期"], "YYYY-MM-DD").toDate(),
        "受理日期": dayjs(item["受理日期"], "YYYY-MM-DD").toDate()
    }));

    // Select only needed columns
    big_df = big_df.map(item => _.pick(item, [
        "序号",
        "企业名称",
        "最新状态",
        "注册地",
        "行业",
        "保荐机构",
        "律师事务所",
        "会计师事务所",
        "更新日期",
        "受理日期",
        "拟上市地点",
        "招股说明书"
    ]));

    return big_df;
}

// 注意：上述代码中未包含headers的具体定义，请根据实际情况添加。
///东方财富网-数据中心-新股数据-IPO审核信息-达标企业

async function stockRegisterDb() {
    const url = "https://datacenter-web.eastmoney.com/api/data/v1/get";
    const params = new URLSearchParams({
        sortColumns: "NOTICE_DATE,SECURITY_CODE",
        sortTypes: "-1,-1",
        pageSize: "500",
        pageNumber: "1",
        reportName: "RPT_KCB_IPO",
        columns: "KCB_LB",
        source: "WEB",
        client: "WEB",
        filter: '(ORG_TYPE_CODE="03")'
    });

    try {
        let response = await axios.get(url, { params, headers });
        let dataJson = response.data;
        let pageNum = dataJson.result.pages;
        let bigDf = [];

        for (let page = 1; page <= pageNum; page++) {
            params.set("pageNumber", page.toString());
            response = await axios.get(url, { params, headers });
            dataJson = response.data;
            let tempDf = dataJson.result.data;
            bigDf = bigDf.concat(tempDf);
        }

        // Reset index and add a new column with the index
        bigDf = bigDf.map((row, index) => ({ ...row, index: index + 1 }));

        // Rename columns
        bigDf = bigDf.map(row => ({
            序号: row.index,
            企业名称: row.ORG_NAME
        }));

        // Filter out only the required columns
        bigDf = bigDf.map(({ 序号, 企业名称 }) => ({ 序号, 企业名称 }));

        return bigDf;
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;
    }
}
module.exports = {
    stock_register_kcb : stock_register_kcb,
    stock_register_cyb : stock_register_cyb,
    stock_register_bj : stock_register_bj,
    stock_register_sh : stock_register_sh,
    stock_register_sz : stock_register_sz,
    stock_register_db : stock_register_db,
};