
// import lunar from "chinese-lunar";
import {compress,decompress,encrypt,decrypt,headerName,dataName,y} from "./fetch-wrapper";

// var headerName = window.HeaderMap || "Header"
//           , dataName = window.DataMap || "Data"
//           , y = {}
//           , compressLen = 2048;
      
export class Request {
  constructor() {
      // console.log('onRequest constructor');
      //1.创建压缩加密对象 TODO
      //2.初始化
      var e = this;
      this.defaultHeaders = {
             "Content-Type": "application/json; charset=utf-8"
      },
      this.reqEntityHeader = {},
      this.gateUrl = "",
      this.reconnectedCount = 0,
      this.reconnectTime = 30,
      this.connectState = "ok",
      this.req = null,
      this.reqQueue = {},
      window.SetReqUrl = function() {
             var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
             e.gateUrl = t
      },
      this.noNeedReconnectMethods = ["poll", "order", "deposit"],
      this.networkStatus = "ok"; 
     
  }
  setReqHeader(){
	    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
	                    this.reqEntityHeader = t
  }
  
  resetReqHeader(){ 
	  this.defaultHeaders = {};
  }
  
  setPostHeader(){
	  var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
	  this.reqEntityHeader = t
  }
  gameGate(postData,succ,err){
//       callback(); 
	  var me = this;
	  var _none;
	  if(arguments.length > 4 && typeof void 0 !== arguments[4]  ){//arguments[4] !==  'undefined' && arguments[4] != null
		  _none = arguments[4];
	  }else{
		  _none = window.__none;
	  }
	  var hasHeader = postData.hasOwnProperty(headerName);
	  var reqHeader;
	  var reqMethod;
	  if(hasHeader){
		  reqHeader = postData[headerName];
		  reqMethod = postData[headerName].Method || postData[headerName].method;
	  }else{
		  reqHeader = this.reqEntityHeader;
		  reqMethod = postData.Method || postData.method;
	  }
	  var keyMap = !!_none;//a!=null && typeof(a) !=undefined &&a !=''
	  var key = 'KNIMKLIQ';// decode(keyMap);//
      
      var compressData = {
    	        Header: Object.assign({}, reqHeader, {
    	            Method: reqMethod
    	        }),
    	        Data: postData.Data || postData.data
     }
       
// console.log(compressData);
     compress(compressData,function(data){
            //TODO 1 rc4 加密处理
            //判断如果有加密的key 则设置默认头
            // h.defaultHeaders = {
            //    "Content-Type": "text/html"
            // }
          //TODO 2  _send(i, r, e, d, n)   i->数据  i->
          var fetchData = encrypt(data, function() {
                if(keyMap){
                    me.defaultHeaders = {  "Content-Type": "text/html"  };
                }
          }, key);
          me._send(fetchData, undefined, succ, key, err);
      });
      // return me.doCompress(compressData,
      // 
      // );
  }

  //改变网络状态
  changeNetworkState(status){
	  if(status != this.connectState){
		  window.$GH.EventEmitter.emit("CHANGE_NETWORK_STATUS", {
	          state: status
	      });
		  this.connectState = status;
	  } 
  }
  //请求
  _send(postData){
	   var me = this;
	   //删除
	   function deleteQueue() {
          delete me.reqQueue[id]
      }
      function onResonse(data) { // data  未解密的rc4 数据
    	  me.changeNetworkState("ok");
    	  //1.先解密 data 2.解压缩 
        var decryptData = decrypt(data,key);  
        decompress(decryptData,function(res){
 
          // console.log(res);  
          var errCode =   res[headerName].ErrCode;         
          switch (errCode.Code) {
             case "30003":
             case "30024":
             case "30039":
                 window.$GH.CallFunc(window.LoginFail)(errCode.Desc),
                 G_O_EventEmitter.emit("LOGIN_FAIL"),
                 err && err(errCode.Desc); 
                 break;
             default:
               window.$GH.CallFunc(succ)(res, data);
           } 
        });  
      }
      
      var gateUrl , key ,err,succ;
      if(arguments.length > 1 && void 0 !== arguments[1]  ){
    	  gateUrl = arguments[1];
      }else{
    	  gateUrl = this.reqEntityHeader.gateUrl || window.GATE_URL;
        succ = arguments[2];
    	  key = arguments[3];
        err = arguments[4];
      }
      if(gateUrl.indexOf('http') != 0){
          gateUrl = 'https:'+gateUrl;
      }
//      var r = arguments.length > 1 && void 0 !== arguments[1]  ? 
//      arguments[1] :
//      this.reqEntityHeader.gateUrl || window.GATE_URL
//        , o = arguments[2]
//        , i = this
//        , u = arguments[3]
//        , a = arguments[4]
//        , s = this.defaultHeaders; 
      if (gateUrl) {
           var id = window.$GH.GenerteID()
           var reqData = {
              method: "POST",
              credentials: 'include',
              headers: this.defaultHeaders,
              body: key ? postData : JSON.stringify(postData)
          };  

          
          return me.reqQueue[id] = fetch(gateUrl, reqData).then(function(e) {
              if (200 == e.status){
                 return e.text();
              }
                 
//              i.reconnect(t, r, o)
          }).then(function(data) {
          // console.log(data);
        	 onResonse(data);
        	 deleteQueue();
          }).catch(function(t) {
              // console.log(t);
        	    err && err(t);
              deleteQueue();
          });
      }
  }

}
 


export const onRequest = new Request();
Object.assign(window, {onRequest});
// export onRequest;