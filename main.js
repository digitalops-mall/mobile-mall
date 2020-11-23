import Vue from 'vue'
import App from './App'
import store from './store'
import $AppEntryController from './AppEntryController.js'
import Json from './Json' //测试用数据
import $mRouter from './utils/router.js'
import $mRoutesConfig from './config/routes.config.js'
import $mUtils from './utils/utils.js'
import * as $api from './utils/api.js'
import $mConfig from "./config/index.config.js"




const json = type=>{
	//模拟异步请求数据
	return new Promise(resolve=>{
		setTimeout(()=>{
			resolve(Json[type]);
		}, 500)
	})
}

if(process && process.env.NODE_ENV == 'present') {
	Vue.prototype.$api = {json};
}else {
	Vue.prototype.$api = $api;
}
Vue.prototype.$store = store;
Vue.prototype.$mRouter = $mRouter;
Vue.prototype.$mRoutesConfig = $mRoutesConfig;
Vue.prototype.$mUtils = $mUtils;
Vue.prototype.$AppEntryController = $AppEntryController;
Vue.prototype.$mConfig = $mConfig;



$mRouter.beforeEach((navType, to) => {
	if (to.route === undefined) throw ("路由钩子函数中没有找到to.route对象，路由信息:" + JSON.stringify(to));
	if (to.route.path === $mRoutesConfig.login.path && store.getters.hasLogin) {
		uni.redirectTo({
			url: $mUtils.objParseUrlAndParam($mRoutesConfig.main.path, to.query)
		})
		return;
	}

	// 过滤需要权限的页面
	if (to.route.requiresAuth) {

		if (store.getters.hasLogin) {
			// 已经登录
			uni[navType]({
				url: $mUtils.objParseUrlAndParam(to.route.path, to.query)
			})
		} else {
			// 登录成功后的重定向地址和参数
			let query = {
				redirectUrl: to.route.path,
				...to.query
			}
			// 没有登录 是否强制登录?
			if (store.state.forcedLogin) {
				uni.redirectTo({
					url: $mUtils.objParseUrlAndParam($mRoutesConfig.login.path, query)
				})
			} else {
				uni.navigateTo({
					url: $mUtils.objParseUrlAndParam($mRoutesConfig.login.path, query)
				})
			}
		}
	} else {
		uni[navType]({
			url: $mUtils.objParseUrlAndParam(to.route.path, to.query)
		})
	}
})



Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
