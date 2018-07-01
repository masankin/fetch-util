//对数据的压缩 加密 
import RC4Class from './rc4-es6';
import './lzma_worker';
 

export const headerName = window.HeaderMap || "Header";
export const dataName = window.DataMap || "Data";
export const y = {};
export const compressLen = 0;

const rc4_Pool = [];
function convert_formated_hex_to_bytes(t) {
            // for (var hex_data = [], n = 0; n < hex_str.length; n += 2){ 
            //     hex_data.push(parseInt(hex_str.substr(n, 2), 16));
            // }
            // return hex_data;
        for (var e = [], n = 0; n < t.length; n += 2)
                e.push(parseInt(t.substr(n, 2), 16));
            return e
}
            
function convert_to_formated_hex(byte_arr) {
    var hex_str = "",
        i,
        len,
        tmp_hex;
    
    if (!is_array(byte_arr)) {
        return false;
    }
    
    len = byte_arr.length;
    
    for (i = 0; i < len; ++i) {
        if (byte_arr[i] < 0) {
            byte_arr[i] = byte_arr[i] + 256;
        }
        tmp_hex = byte_arr[i].toString(16);
        
        /// Add leading zero.
        if (tmp_hex.length === 1) {
            tmp_hex = "0" + tmp_hex;
        }
        
        // if ((i + 1) % 16 === 0) {
        //     // tmp_hex += "\n";
        // } else {
        //     // tmp_hex += " ";
        // }
        
        hex_str += tmp_hex;
    }
    
    return hex_str.trim();
}
function is_array(input) {
    return input && typeof input === "object" && (input instanceof Array || (input.buffer && input.buffer instanceof ArrayBuffer));
}
//加密
export function encrypt(fetchData, callback, key) {
    var res = fetchData;
    if (key) {
        var json = JSON.stringify(fetchData);
        var rc4 = rc4_Pool[key];
        if(!rc4){ 
          rc4 = new RC4Class(key);
          rc4_Pool[key] = rc4;
        }
        res = rc4.encrypt(btoa(unescape(encodeURIComponent(json))));
    }
    window.$GH.CallFunc(callback)(res);
    return res;
}
//解密
export function decrypt(data, key) {
    var res = data;
    if (key) {
        var rc4 = rc4_Pool[key];
        if(!rc4){ 
          rc4 = new RC4Class(key);
          rc4_Pool[key] = rc4;
        } 
        var decryptData = rc4.decrypt(res);
        try {
            var jsonStr = decodeURIComponent(escape(atob(decryptData)));
            res = JSON.parse(jsonStr);
        } catch (e) {

        }
    }
    return ("string" === typeof res ? JSON.parse(res) : res) || {};
}
//压缩
export function compress(t,callbak) {
   var data = t['Data'] || {};
   var json = JSON.stringify(t);
   var fetchData = Object.assign({}, t);
   if(json.length > compressLen){

      fetchData['Header'] = Object.assign({}, fetchData['Header'], { Compress: 1 });
      window.LZMA.compress(JSON.stringify(data), 1, function(t) {
                // console.log('compress  完成');
                fetchData['Data'] = convert_to_formated_hex(t);
                // console.log(fetchData['Data']);
                callbak(fetchData);
      });
   }else{
      callbak(fetchData);
   }
      
}
//解压缩
export function decompress(data,callbak) {

            var res = Object.assign({}, data);
            if (res['Header'])
                if (1 == res['Header'].Compress) {
                    var byte_arr = convert_formated_hex_to_bytes(res.Data);
                    window.LZMA.decompress(byte_arr, function(decompressData, r) {
                        try {
                            // console.log('decompress  完成');
                            res.Data = JSON.parse(decompressData);
                        } catch (e) {
                        }
                        window.$GH.CallFunc(callbak)(res);
                    },function(progress){

                    })
                } else
                    window.$GH.CallFunc(callbak)(res);
        }
