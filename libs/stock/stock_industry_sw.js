const axios = require('axios');
const XLSX = require('xlsx');
///申万宏源研究-行业分类-全部行业分类
async function stock_industry_clf_hist_sw() {
    const url = "https://www.swsresearch.com/swindex/pdf/SwClass2021/StockClassifyUse_stock.xls";
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const tempData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: "" });
        return tempData;
    } catch (error) {
        console.error("Error fetching or processing the data:", error);
        throw error;
    }
}
module.exports = {
    stock_industry_clf_hist_sw: stock_industry_clf_hist_sw,
};