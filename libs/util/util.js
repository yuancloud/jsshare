const CryptoJS = require('crypto-js');


Date.prototype.fstr = function (format = "YYYYMMDD") {
    const options = {
        YYYY: this.getFullYear(),
        MM: String(this.getMonth() + 1).padStart(2, '0'),
        DD: String(this.getDate()).padStart(2, '0'),
        HH: String(this.getHours()).padStart(2, '0'),
        mm: String(this.getMinutes()).padStart(2, '0'),
        ss: String(this.getSeconds()).padStart(2, '0')
    };

    // Replace format tokens with date values
    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => options[match]);
};

function parseDate(str = 20211128) {
    // Ensure the input is treated as a string
    str = str.toString().replace(/-/g, ''); // Remove any dashes if present

    // Check if the string length is valid for a date in YYYYMMDD format
    if (str.length === 8) {
        // Extract year, month, and day from the string
        const year = str.slice(0, 4);
        const month = str.slice(4, 6);
        const day = str.slice(6, 8);

        // Construct a valid Date string in the format YYYY-MM-DD
        const dateString = `${year}-${month}-${day}`;

        // Return a Date object
        return new Date(dateString);
    } else {
        // If the string format is invalid, return null or throw an error
        console.error("Invalid date format");
        return null;
    }
}
function get_market(symbol) {
    /**
     * Determine the market based on the stock_info symbol.
     * Returns:
     *     "sh" for Shanghai, "sz" for Shenzhen, "bj" for Beijing.
     */
    if (symbol.startsWith("60") || symbol.startsWith("68")) {
        return "sh"; // Shanghai stock_info Exchange (Main board or STAR Market)
    } else if (symbol.startsWith("00") || symbol.startsWith("30")) {
        return "sz"; // Shenzhen stock_info Exchange (Main board or ChiNext)
    } else if (symbol.startsWith("8") || symbol.startsWith("43") || symbol.startsWith("92")) {
        return "bj"; // Beijing stock_info Exchange (including former NEEQ Select)
    } else {
        console.log("Unknown or unsupported market: " + symbol);
        return "unknown"; // Unknown or unsupported market
    }
}

function get_market_number(symbol) {
    let code = get_market(symbol);
    if (code == "sh") return 1
    if (code == "sz" || code == "bj") return 0
    return -1
}
function getResCode1() {
    var encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(Math.floor(new Date().getTime() / 1000).toString()),
        CryptoJS.enc.Utf8.parse('1234567887654321'),
        {
            iv: CryptoJS.enc.Utf8.parse('1234567887654321'),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );
    return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
}

function my_decode(data) {
    var encrypted = CryptoJS.AES.decrypt(
        data,
        CryptoJS.enc.Utf8.parse('h5.jiucaishuo.comaaaaaaaaaaaaaaa'),
        {
            iv: CryptoJS.enc.Utf8.parse('h5.jiucaishuo.com'),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );
    return encrypted.toString(CryptoJS.enc.Utf8);
}

function new_my_decode(data) {
    let key = CryptoJS.enc.Utf8.parse('bieyanjiulexixishuibatoufameill1'); // 密钥需要是32字节，这里可能需要调整
    let iv = CryptoJS.enc.Utf8.parse('nengnongchulainbl1'); // 向量通常是16字节
    let decrypted = CryptoJS.AES.decrypt(
        data,
        key,
        {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
}
module.exports = {
    parseDate, get_market_number, get_market, getResCode1, my_decode, new_my_decode
};