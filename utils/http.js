import axios from '@/js_sdk/gangdiedao-uni-axios'
import qs from 'qs'
import filter from "lodash/fp/filter"

/**
 * 请求接口日志记录
 */
function _reqlog(req) {
    if (process.env.NODE_ENV === 'development') {
        console.log("请求地址：" + req.url, req.data || req.params)
    }
    //TODO 调接口异步写入日志数据库
}

/**
 * 响应接口日志记录
 */
function _reslog(res) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`${res.config.url}响应结果：`, res)
    }
}


// 创建自定义接口服务实例
const httpAxios = axios.create({
    // baseURL: [baseURL],
    timeout: 6000,  // 不可超过 manifest.json 中配置 networkTimeout的超时时间
    // #ifdef H5
    withCredentials: true,
    // #endif
    headers: {
        'Content-Type': 'application/json',
        //'X-Requested-With': 'XMLHttpRequest',
    },
})

// 拦截器 在请求之前拦截
httpAxios.interceptors.request.use(config => {
    // code...
    // 获取本地存储的Cookie
    // const cookie = uni.getStorageSync('cookie')
    // 设置Cookie
    // config.headers.Cookie = cookie
	let token = getApp().$store.state.tokenType + ' ' + getApp().$store.state.token
	if(token)config.headers.Authorization = token;
    _reqlog(config)
    return config
})

// 拦截器 在请求之后拦截
httpAxios.interceptors.response.use(response => {
    _reslog(response)
    // code...
    // 获取cookie
    // let headerStr = JSON.stringify(response.headers)
    // let cookie = (/(?:Set-Cookie).+;/.exec(headerStr)[0]).replace(/Set-Cookie|:|"/g, "")
    // if (cookie) {
        // uni.setStorage({
            // key: 'cookie',
            // data: cookie.split(';')[0]
        // })
    // }
    return response
}, error => {
    return Promise.reject(error.message)
})

function HTTP(obj, config,resolve, reject) {

	let defaultConfig = {
		isRes: false,
		loading: false,
		isWxReq: false
	}
	// #ifdef MP-WEIXIN
	defaultConfig.isWxReq=true
	// #endif

	config = { ...defaultConfig,
		...config
	}


	// 如果需要显示loading,mask防止点击穿透
	config.loading && uni.showLoading({
		title: '加载中',
		mask: true
	});
	if(config.isWxReq) {
			let options = {
				url: "",
				method: "GET",
				data: {},
				dataType: "json",
				header: {
					"content-type": "application/json",
					"X-requested-With": "XMLHttpRequest"
				},
				success: (res) => {
					console.log("wx HTTP请求结果：",res)
					uni.hideLoading();
					
					if(config.directReturn) {
						resolve && resolve(res)
						return
					}
					let data = res.data;
					console.log('data:',data)
					//自动校验用户是否登录过期
					if (data.code == "401") {
						getApp()
						// #ifdef MP-WEIXIN
						.$vm
						// #endif
						.$store.commit("SET_LOGOUT")
						getApp()
						// #ifdef MP-WEIXIN
						.$vm
						// #endif
						.$mUtils.redirectCurrentPageWithLogin()
					}
	
					//返回 { code:10000,msg:"消息",data:[] }
					if((data.code == 200 && data.data) || data.code > 10000) {
						let result = {
							data:data.data,
							code:data.code
						}
						resolve && resolve(result)
					}else {
						wx.showToast({
							title: data.message,
							icon: "none",
							duration: 2000
						})
						reject && reject(data.message);
					}
				},
				fail: (err) => {
					console.log('reqeust error',err)
					uni.hideLoading();
					wx.showToast({
						title: "网络异常，请稍后再试!",
						icon: "none",
					})
					reject && reject("网络异常，请稍后再试!");
				},
				complete: () => {}
			}
		
			options = { ...options,
				...obj
			};
			if(obj.method == 'POST_REQ_PARAM' || obj.method == 'POST') {
				options.method = 'POST'
				if(obj.method == 'POST_REQ_PARAM')options.header["content-type"]="application/x-www-form-urlencoded"
			}
			let token = getApp()
			// #ifdef MP-WEIXIN
			.$vm
			// #endif
			.$store.state.tokenType + ' ' + getApp()
			// #ifdef MP-WEIXIN
			.$vm
			// #endif
			.$store.state.token
			if(token)options.header.Authorization = token;
			console.log("options:",options)
			
			const OPENID = uni.getStorageSync("openId");
			if (OPENID) options["header"]["openId"] = OPENID;
		
			if (options.url && options.method) {
				wx.request(options);
			} else {
				wx.showToast({
					title: 'HTTP：缺失参数',
					icon: "none",
					duration: 2000
				})
			}
	}else {
		if(obj.method == 'GET') {
			let url = null
			if(obj.data) {
				if(obj.url.indexOf('?') > 0) {
					url = obj.url+'&'+qs.stringify(obj.data)
				}else {
					url = obj.url+'?'+qs.stringify(obj.data)
				}
			}else {
				url = obj.url
			}
			httpAxios.get(url,{}).then((res) => {
			    // console.log(res)
				if(config.directReturn) {
					resolve && resolve(res)
					return
				}
				//自动校验用户是否登录过期
				if (res.data.code == 401) {
					getApp()
					// #ifdef MP-WEIXIN
					.$vm
					// #endif
					.$store.commit("SET_LOGOUT")
					getApp()
					// #ifdef MP-WEIXIN
					.$vm
					// #endif
					.$mUtils.redirectCurrentPageWithLogin()
				}
				if((res.data.code == 200 && res.data.data) || res.data.code > 10000) {
					let result = {
						data:res.data.data,
						code:res.data.code
					}
					resolve && resolve(result)
				}else {
					uni.showToast({
						title: res.data.message,
						icon: "none",
					})
					reject(res.data.message);
				}
			}).catch(error => {
			    console.log(error)
				reject && reject(error)
			}).finally(() => {
			    
			})
		}
		if(obj.method == 'POST') {
			httpAxios.post(obj.url, obj.data).then((res) => {
			    console.log(res)
				//自动校验用户是否登录过期
				if (res.data.code == 401) {
					getApp()
					// #ifdef MP-WEIXIN
					.$vm
					// #endif
					.$mUtils.redirectCurrentPageWithLogin()
				}
				if((res.data.code == 200 && res.data.data) || res.data.code > 10000) {
					let result = {
						data:res.data.data,
						code:res.data.code
					}
					resolve && resolve(result)
				}else {
					uni.showToast({
						title: res.data.message,
						icon: "none",
					})
					reject(res.data.message);
				}
			}).catch(error => {
			    console.log(error)
				reject && reject(error)
			}).finally(() => {
			    
			})
		}
		if(obj.method == 'POST_REQ_PARAM') {
			httpAxios.post(obj.url+'?'+qs.stringify(obj.data, {indices: false }),{}).then((res) => {
			    console.log(res)
				//自动校验用户是否登录过期
				if (res.data.code == 401) {
					getApp()
					// #ifdef MP-WEIXIN
					.$vm
					// #endif
					.$store.commit("SET_LOGOUT")
					getApp()
					// #ifdef MP-WEIXIN
					.$vm
					// #endif
					.$mUtils.redirectCurrentPageWithLogin()
					return;
				}
				if((res.data.code == 200 && res.data.data) || res.data.code > 10000) {
					let result = {
						data:res.data.data,
						code:res.data.code
					}
					resolve && resolve(result)
				}else {
					uni.showToast({
						title: res.data.message,
						icon: "none",
					})
					reject(res.data.message);
				}
			}).catch(error => {
			    console.log(error)
				reject && reject(error)
			}).finally(() => {
			    
			})
		}
		
	}

	
	

}

export default {
	GET(url, data = {}, config,resolve,reject) {
		return HTTP({
			url,
			data,
			method: "GET"
		}, config,resolve,reject);
	},
	POST(url, data = {}, config,resolve,reject) {
		return HTTP({
			url,
			data,
			method: "POST"
		}, config,resolve,reject);
	},
	POST_REQ_PARAM(url, data = {}, config,resolve,reject) {
		return HTTP({
			url,
			data,
			method: "POST_REQ_PARAM"
		}, config,resolve,reject);
	}
}