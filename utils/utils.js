import {
		mapState
	} from 'vuex'
import reduce from "lodash/fp/reduce"
import filter from "lodash/fp/filter"

export default {
	/* 
	 * 将cityNo 转 cityName
	 * cityData:原数据
	 * cityNo：二级地区编码
	 */
	getCityName(cityData, cityNo) {
		if (!cityNo) return;
		if (!(cityData instanceof Array)) return;
		// 9112
		cityNo += "";
		for (let i = 0; i < cityData.length; i++) {
			let sheng = cityData[i];
			for (let j = 0; j < sheng.children.length; j++) {
				let shi = sheng.children[j];
				if (shi.value == cityNo) {
					// 使用return 终止循环
					return `${sheng.label}-${shi.label}`;
				}
			}
		}
	},

	/* 
	 * obj 转 params字符串参数  
	 * 例子：{a:1,b:2} => a=1&b=2
	 */
	objParseParam(obj) {
		let paramsStr = "";
		if (obj instanceof Array) return paramsStr;
		if (!(obj instanceof Object)) return paramsStr;
		for (let key in obj) {
			paramsStr += `${key}=${obj[key]}&`;
		}
		return paramsStr.substring(0, paramsStr.length - 1);
	},

	/* 
	 * obj 转 路由地址带参数
	 * 例子：{a:1,b:2} => /pages/index/index?a=1&b=2
	 */
	objParseUrlAndParam(path, obj) {
		let url = path || "/";
		let paramsStr = "";
		if (obj instanceof Array) return url;
		if (!(obj instanceof Object)) return url;
		paramsStr = this.objParseParam(obj);
		paramsStr && (url += "?");
		url += paramsStr;
		return url;
	},

	/* 
	 * 获取url字符串参数
	 */
	getRequestParameters(locationhref) {
		let href = locationhref || "";
		let theRequest = new Object();
		let str = href.split("?")[1];
		if (str != undefined) {
			let strs = str.split("&");
			for (let i = 0; i < strs.length; i++) {
				theRequest[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
			}
		}
		return theRequest;
	},

	/* 
	 * 银行卡每四位空格
	 */
	formatCardNo(cardNo) {
		cardNo += "";
		return cardNo.replace(/\s/g, '').replace(/[^\d]/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
	},

	/**
	 * 乘法，解决js精度损失问题
	 * @param {*} arg1 
	 * @param {*} arg2 
	 */
	accMul(arg1, arg2) {
		arg1 = arg1 || 0;
		var m = 0,
			s1 = arg1.toString(),
			s2 = arg2.toString();
		try {
			m += s1.split(".")[1].length
		} catch (e) {}
		try {
			m += s2.split(".")[1].length
		} catch (e) {}
		return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
	},
	stringToBase64(str) {
		return Buffer.from(str).toString("base64")
	},
	base64ToString(base64) {
	    return Buffer.from(base64, "base64").toString("utf8");
	},
	getUserInfoFromToken(token) {
		let [header, content, sign] = token.split(".");
		// 将 content 转成对象
		content = JSON.parse(this.base64ToString(content));
		return content.sub
	},
	getMapStateByKey(key) {
		return this[key]
	},
	isJson(obj) {
		var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length; 
		return isjson;
	},
	goback(path,param) {
		if(path) {
			this.goto(path,param)
		}else {
			uni.navigateBack();
		}
	},
	goto(path,param) {
		let paramObj = {};
		if(path.route && path.query) {
			paramObj = path
		}else if(param) {
			paramObj = isJson(param) ? {route:path,query:param} : {route:path,query:{param:param}}
		}else {
			paramObj = {route:path,query:{}}
		}
		getApp()
		// #ifdef MP-WEIXIN
		.$vm
		// #endif
		.$mRouter.push(paramObj)
	},
	redirectTo(path,param) {
		let paramObj = {};
		if(path.route && path.query) {
			paramObj = path
		}else if(param) {
			paramObj = isJson(param) ? {route:path,query:param} : {route:path,query:{param:param}}
		}else {
			paramObj = {route:path,query:{}}
		}
		console.log("paramObj:",paramObj)
		getApp()
		// #ifdef MP-WEIXIN
		.$vm
		// #endif
		.$mRouter.redirectTo(paramObj)
	},
	reLaunch(path,param) {
		let paramObj = {};
		if(path.route && path.query) {
			paramObj = path
		}else if(param) {
			paramObj = isJson(param) ? {route:path,query:param} : {route:path,query:{param:param}}
		}else {
			paramObj = {route:path,query:{}}
		}
		console.log("paramObj:",paramObj)
		getApp()
		// #ifdef MP-WEIXIN
		.$vm
		// #endif
		.$mRouter.reLaunch(paramObj)
	},
	objectEquals(object1,object2) {
		//For the first loop, we only check for types
		    for (var propName in object1) {
		        //Check for inherited methods and properties - like .equals itself
		        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
		        //Return false if the return value is different
		        if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
		            return false;
		        }
		        //Check instance type
		        else if (typeof object1[propName] != typeof object2[propName]) {
		            //Different types => not equal
		            return false;
		        }
		    }
		    //Now a deeper check using other objects property names
		    for(var propName in object2) {
		        //We must check instances anyway, there may be a property that only exists in object2
		            //I wonder, if remembering the checked values from the first loop would be faster or not 
		        if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
		            return false;
		        }
		        else if (typeof object1[propName] != typeof object2[propName]) {
		            return false;
		        }
		        //If the property is inherited, do not check any more (it must be equa if both objects inherit it)
		        if(!object1.hasOwnProperty(propName))
		          continue;
		
		        //Now the detail check and recursion
		
		        //This returns the script back to the array comparing
		        /**REQUIRES Array.equals**/
		        if (object1[propName] instanceof Array && object2[propName] instanceof Array) {
		                   // recurse into the nested arrays
		           if (!object1[propName].equals(object2[propName]))
		                        return false;
		        }
		        else if (object1[propName] instanceof Object && object2[propName] instanceof Object) {
		                   // recurse into another objects
		                   //console.log("Recursing to compare ", this[propName],"with",object2[propName], " both named \""+propName+"\"");
		           if (!object1[propName].equals(object2[propName]))
		                        return false;
		        }
		        //Normal value comparison for strings and numbers
		        else if(object1[propName] != object2[propName]) {
		           return false;
		        }
		    }
		    //If everything passed, let's say YES
		    return true;
	},
	arrayEquals(sourceArr,array) {
		// if the other array is a falsy value, return
		if (!array)
		    return false;
		// compare lengths - can save a lot of time 
		if (sourceArr.length != array.length)
		    return false;
		
		for (var i = 0, l = sourceArr.length; i < l; i++) {
		    // Check if we have nested arrays
		    if (sourceArr[i] instanceof Array && array[i] instanceof Array) {
		        // recurse into the nested arrays
		        if (!sourceArr[i].equals(array[i]))
		            return false;
		    }
			else if(sourceArr[i] instanceof Object && array[i] instanceof Object) {
				return this.objectEquals(sourceArr[i],array[i]);
			}
		    else if (sourceArr[i] != array[i]) { 
		        // Warning - two different object instances will never be equal: {x:20} != {x:20}
		        return false;   
		    }
		}
		return true;
	},
	addToCart(data) {
		let resIndex = -1
		let reduceData = reduce.convert({ 'cap': false })((res,obj,index)=>{
			if(res.length >0 && res.some((curVal)=>{
				let curValProductAttr = JSON.parse(curVal.productAttr)
				let paramObjProductAttr = JSON.parse(obj.productAttr)
				if(obj.price == curVal.price 
					&& obj.productId == curVal.productId
					&& getApp()
					// #ifdef MP-WEIXIN
					.$vm
					// #endif
					.$mUtils.arrayEquals(curValProductAttr,paramObjProductAttr)) {
						return true;
					}
				return false;
			})) {
				res[resIndex].quantity++
			} else {
				resIndex++
				res[resIndex] = obj
			}
			return res
		},[])(data)
		getApp()
		// #ifdef MP-WEIXIN
		.$vm
		// #endif
		.$store.commit("SET_CARTINFO",reduceData)
	},
	syncCartInfo(thisCartInfo) {
		let cartInfos = []
		getApp()
		// #ifdef MP-WEIXIN
		.$vm
		// #endif
		.$api.getCartInfo((res)=>{
			if(res.code == 200) {
				let list = res.data
				if(list != null && list.length > 0) {
					if(list.length == 1) {
						cartInfos.push(list[0])
					}else {
						cartInfos.push(...res.data)
					}
				}
				getApp()
				// #ifdef MP-WEIXIN
				.$vm
				// #endif
				.$api.syncCartInfo(cartInfos,thisCartInfo)
				if(!thisCartInfo && thisCartInfo.length == 0) {
					getApp()
					// #ifdef MP-WEIXIN
					.$vm
					// #endif
					.$store.commit("SET_CARTINFO", cartInfos || []);
				}
			}else {
				getApp()
				// #ifdef MP-WEIXIN
				.$vm
				// #endif
				.$api.msg(res.message)
			}
		})
	},
	redirectCurrentPageWithLogin(currentRoute,currentQuery){
		let pages = getCurrentPages()
		let currentPage = pages[pages.length -1]
		let routePath = '/'+currentPage.route
		let currentRout = filter((routeConfig) =>{
			if(routeConfig.path == routePath) {
				return true
			}
			return false
		},getApp()
		// #ifdef MP-WEIXIN
		.$vm
		// #endif
		.$mRoutesConfig)
		if(currentRout && currentRout.length >0) {
			this.redirectTo({
				route: currentRout[0],
				query: currentPage
				// #ifdef MP-WEIXIN
				.$vm
				// #endif
				.$mp.query
			});
		}else {
			uni.showToast({
				title: '没找到对应路由',
				icon: "none",
			})
		}
	}
	
	
}
