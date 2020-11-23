import Vue from 'vue'
import Vuex from 'vuex'
import $mConfig from '@/config/index.config.js'
import $mRoutesConfig from '@/config/routes.config.js'


Vue.use(Vuex)

// uni.setStorageSync("token", "oVG1b1Bgrb");
// uni.setStorageSync("openId", "oVG1b1Bgrb-l6jNYCUr6sYpQ5F-U");

const TOKEN = uni.getStorageSync("token") || "";
const TOKEN_TYPE = uni.getStorageSync("tokenType") || "";
const OPENID = uni.getStorageSync("openId") || "";
const APPID = uni.getStorageSync("appId") || "";
const USER_INFO = uni.getStorageSync("userInfo") || {};
const CUSTOMER_INFO = uni.getStorageSync("customerInfo") || {};
const CART_INFO = uni.getStorageSync("cartInfo") || {};
const ORDER_CART_INFO = uni.getStorageSync("orderCartInfo") || {};
const ADDRESS_INFO = uni.getStorageSync("addressInfo") || {};

const store = new Vuex.Store({
	state: {
		// 是否強制登录
		forcedLogin:$mConfig.forcedLogin,
		// 前端token
		token: TOKEN,
		// token类型
		tokenType: TOKEN_TYPE,
		// 用户openid
		openId: OPENID,
		// appId
		appId: APPID,
		// 用户信息 头像 昵称
		userInfo: USER_INFO,
		// 商户信息
		customerInfo: CUSTOMER_INFO,
		// 用户的购物车信息
		cartInfo: CART_INFO,
		// 待生成订单的商品信息
		// 1.从购物车选中商品结算则进入该类
		// 2.直接购物商品也进入该类
		orderCartInfo: ORDER_CART_INFO,
		//用户的地址信息
		addressInfo: ADDRESS_INFO
	},
	getters: {
		// 用户是否登录
		hasLogin: state => {
			if (state.token) {
				return true;
			} else {
				return false
			}
		}
	},
	mutations: {
		SET_TOKEN_TYPE(state, tokenType) {
			state.tokenType = tokenType;
			uni.setStorageSync("tokenType", tokenType);
		},
		SET_TOKEN(state, token) {
			state.token = token;
			uni.setStorageSync("token", token);
		},
		SET_APPID(state, appId) {
			state.appId = appId;
			uni.setStorageSync("appId", appId);
		},
		SET_OPENID(state, openId) {
			state.openId = openId;
			uni.setStorageSync("openId", openId);
		},
		SET_USERINFO(state, userInfo) {
			state.userInfo = userInfo;
			uni.setStorageSync("userInfo", userInfo);
		},
		SET_CUSTOMERINFO(state, customerInfo) {
			state.customerInfo = customerInfo;
			uni.setStorageSync("customerInfo", customerInfo);
		},
		SET_LOGOUT(state) {
			state.token = "";
			uni.setStorageSync("token", "");
			state.tokenType = "";
			uni.setStorageSync("tokenType", "");
			state.openId = "";
			uni.setStorageSync("openId", "");
			state.userInfo = {};
			uni.setStorageSync("userInfo", {});
			state.customerInfo = {};
			uni.setStorageSync("customerInfo", {});
			state.cartInfo = {}
			uni.setStorageSync("cartInfo", {});
			state.orderCartInfo = {}
			uni.setStorageSync("orderCartInfo", {});
			state.addressInfo = {}
			uni.setStorageSync("addressInfo", {});
		},
		SET_CARTINFO(state,cartInfo) {
			state.cartInfo = cartInfo
			uni.setStorageSync("cartInfo", cartInfo);
		},
		SET_ORDERCARTINFO(state,orderCartInfo) {
			state.orderCartInfo = orderCartInfo
			uni.setStorageSync("orderCartInfo", orderCartInfo);
		},
		SET_ADDRESSINFO(state,addressInfo) {
			state.addressInfo = addressInfo
			uni.setStorageSync("addressInfo", addressInfo);
		}
	},
	actions: {
		// 登录过期 重新登录
		reLogin({
			commit
		}, path) {
			commit("SET_TOKEN","");
			commit("SET_TOKEN_TYPE","");
			getApp()
			// #ifdef MP-WEIXIN
			.$vm
			// #endif
			.$mUtils.redirectTo(path)
		}
	}
})

export default store
