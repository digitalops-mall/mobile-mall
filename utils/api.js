import http from "./http.js";
import config from "@/config/index.config.js";
import jdd from '@/utils/jdd.js'
import moment from 'moment'

//统一提示信息
export const msg = (title,fun,duration=1500, mask=false, icon='none')=>{
	//统一提示方便全局修改
	if(Boolean(title) === false){
		return;
	}
	if(fun) {
		uni.showToast({
			title,
			duration,
			mask,
			icon,
			success:fun
		});
	} else {
		uni.showToast({
			title,
			duration,
			mask,
			icon
		});
	}
	
}

// 用户登录
export const login = (data,fun) => http.POST_REQ_PARAM(`${config.baseUrl}/sso/login`, data,{}, fun);
//刷新token
export const refreshLogin = (data,fun,failFun) => http.GET(`${config.baseUrl}/sso/refreshToken`, data,{}, fun,failFun);

// 获取短信验证码
export const getMsgCode = (data,fun) => http.GET(`${config.baseUrl}/sso/getAuthCode`, data,{}, fun)

// 更改密码
export const updatePassword = (data,fun) => http.POST_REQ_PARAM(`${config.baseUrl}/sso/updatePassword`, data,{}, fun)

// 注册信息
export const register = (data,fun) => http.POST_REQ_PARAM(`${config.baseUrl}/sso/register`, data,{}, fun)

// 获取购物车信息
export const getCartInfo = (fun) => http.GET(`${config.baseUrl}/cart/list`, {},{}, fun)

// 获取商品扩展信息
export const getProductDetailEx = (data,fun) => http.GET(`${config.baseUrl}/home/productDetailInfo`, data,{}, fun)

//添加商品到购物车
export const addCartInfo = (data,fun) => http.POST(`${config.baseUrl}/cart/add`, data,{}, fun)
//删除购物车商品
export const delCartInfo = (data,fun) => http.POST_REQ_PARAM(`${config.baseUrl}/cart/delete`, data,{}, fun)
//清空购物车商品
export const clearCartInfo = (fun) => http.POST(`${config.baseUrl}/cart/clear`, {},{}, fun)


//同步购物车信息
export const syncCartInfo = (left,right,fun) => {
	left.forEach((item)=>{
		
	})
	let diffs = jdd.COMPARE(left, right)
	let params = null
	if(diffs.toAddEle) {
		params={}
		params.toAddEle = diffs.toAddEle
	}
	if(diffs.toDelEle) {
		params={}
		params.toDelEle = diffs.toDelEle.map((item)=>item.id)
	}
	if(diffs.toUpdatePro) {
		params={}
		params.toUpdatePro = diffs.toUpdatePro.filter((item)=>{
			let keepCondition = item.leftObj.productId == item.rightObj.productId
				&& item.leftObj.quantity == item.rightObj.quantity
			return !keepCondition
		}).map((item)=>{
			let updateTime1 = moment(item.leftObj.modifyDate)
			let updateTime2 = moment(item.rightObj.modifyDate)
			if(updateTime1.isSameOrBefore(updateTime2)) {
				return {
					updateVal: item.rightObj[item.key],
					keyName: item.key,
					id: item.rightObj.id
				}
			}else {
				return {
					updateVal: item.leftObj[item.key],
					keyName: item.key,
					id: item.leftObj.id
				}
			}
		})
	}
	if(params) {
		console.log('params: '+JSON.stringify(params))
		http.POST(`${config.baseUrl}/cart/sync`, params,{}, fun)
	}
}

//获取地址列表
export const getAddressList = (fun) => http.GET(`${config.baseUrl}/member/address/list`, {},{}, fun)
//增加地址信息
export const addAddress = (data,fun) => http.POST(`${config.baseUrl}/member/address/add`, data,{}, fun)
//删除地址信息
export const delAddress = (addressId,fun) => http.POST_REQ_PARAM(`${config.baseUrl}/member/address/delete/${addressId}`, {},{}, fun)
//更新地址信息
export const updateAddress = (data,fun) => http.POST(`${config.baseUrl}/member/address/update/${data.id}`, data,{}, fun)
//更新地址信息
export const setDefaultAddress = (id,fun) => http.GET(`${config.baseUrl}/member/address/setDefaultAddress/${id}`, {},{}, fun)

//获取地址列表
export const getCouponList = (status,fun) => http.GET(`${config.baseUrl}/member/coupon/list?useStatus=${status}`, {},{}, fun)
//获取购物车优惠卷
export const getCartCouponList = (type,fun) => http.GET(`${config.baseUrl}/member/coupon/list/cart/${type}`, {},{}, fun)

//根据购物车信息生成订单
export const generateOrder = (data,fun) => http.POST(`${config.baseUrl}/order/generateOrderBySeletedCartItem`, data,{}, fun)
//获取支付账单信息
export const getOrderPaymentInfo = (data,fun) => http.POST_REQ_PARAM(`${config.baseUrl}/order/getOrderPaymentInfo`, data,{}, fun)
//去支付
export const payOrder = (data,fun) => http.GET(`${config.baseUrl}/mallPay/qrPay.html`, data,{directReturn:true}, fun)
//获取订单信息
export const getOrders = (data,fun) => http.GET(`${config.baseUrl}/order/getOrders`, data,{}, fun)
//更新用户数据
export const loginAndUpdateUserInfo = (data,fun) => http.POST(`${config.baseUrl}/sso/loginAndUpdateUserInfo`, data,{}, fun)
