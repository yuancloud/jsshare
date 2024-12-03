const axios = require('axios');
const util = require('../util/util.js');
const dayjs = require('dayjs');
const _ = require('lodash');
///东方财富网-行情中心-期货市场-国际期货

async function futures_global_em() {
    const url = "https://futsseapi.eastmoney.com/list/COMEX,NYMEX,COBOT,SGX,NYBOT,LME,MDEX,TOCOM,IPE";
    const params = {
        orderBy: 'zdf',
        sort: 'desc',
        pageSize: '20',
        pageIndex: '0',
        token: '58b2fa8f54638b60b87d69b31969089c',
        field: 'dm,sc,name,p,zsjd,zde,zdf,f152,o,h,l,zjsj,vol,wp,np,ccl',
        blockName: 'callback',
        _: '1705570814466'
    };

    const response = await axios.get(url, { params });
    const dataJson = response.data;
    const totalNum = dataJson.total;
    const totalPages = Math.ceil(totalNum / 20) - 1;

    let bigDf = [];

    for (let page = 0; page <= totalPages; page++) {
        params.pageIndex = page.toString();
        const pageResponse = await axios.get(url, { params });
        const pageDataJson = pageResponse.data;
        const tempDf = pageDataJson.list;
        bigDf = bigDf.concat(tempDf);
    }

    bigDf = _.map(bigDf, (row, index) => ({
        ...row,
        index: index + 1
    }));

    bigDf = _.map(bigDf, row => ({
        序号: row.index,
        代码: row.dm,
        名称: row.name,
        最新价: row.h,
        涨跌额: row.zde,
        涨跌幅: row.zdf,
        今开: row.o,
        最高: row.p,
        最低: row.l,
        昨结: row.zjsj,
        成交量: row.vol,
        买盘: row.wp,
        卖盘: row.np,
        持仓量: row.ccl
    }));

    // Convert specific columns to numeric values
    const convertToNumeric = (value) => !isNaN(value) ? Number(value) : null;
    ['最新价', '涨跌额', '涨跌幅', '今开', '最高', '最低', '昨结', '成交量', '买盘', '卖盘', '持仓量']
        .forEach(column => {
            bigDf = _.map(bigDf, row => ({
                ...row,
                [column]: convertToNumeric(row[column])
            }));
        });

    return bigDf;
}
module.exports = {
    futures_global_em: futures_global_em,
};