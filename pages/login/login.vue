<template>
	<view class="content">
		<view v-if="needWxLogin">
			<view>
				<view class="wx_header"><image src="/static/weixin.png"></image></view>
				<view class="wx_content">
					<view>申请获取以下权限</view>
					<text>获得你的公开信息(昵称，头像、地区等)</text>
				</view>
				<button class="wx_bottom" type="primary" open-type="getUserInfo" withCredentials="true" lang="zh_CN" @getuserinfo="wxGetUserInfo">授权登录</button>
			</view>
		</view>
		<view v-else>
			<view class="input-group">
				<view class="input-row border">
					<text class="title">账号：</text>
					<!-- <input type="text" clearable v-model="params.account" placeholder="请输入手机号" :maxLength="11" :focus="true"></input> -->
					<m-input class="m-input" type="text" clearable focus v-model="params.account" placeholder="请输入账号"></m-input>
				</view>
				<view class="input-row">
					<text class="title">密码：</text>
					<m-input type="password" displayable v-model="params.password" placeholder="请输入密码"></m-input>
				</view>
			</view>
			<view class="btn-row"><button type="primary" class="primary" @tap="bindLogin">登录</button></view>
			<view class="action-row">
				<navigator url="../reg/reg">注册账号</navigator>
				<text>|</text>
				<navigator url="../pwd/pwd">忘记密码</navigator>
			</view>
			<view class="oauth-row" v-if="hasProvider" v-bind:style="{ top: positionTop + 'px' }">
				<view class="oauth-image" v-for="provider in providerList" :key="provider.value">
					<image :src="provider.image" @tap="oauth(provider.value)"></image>
					<!-- #ifdef MP-WEIXIN -->
					<button v-if="!isDevtools" open-type="getUserInfo" @getuserinfo="getUserInfo"></button>
					<!-- #endif -->
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex';
import graceChecker from '@/utils/graceChecker.js';
import formRuleConfig from '@/config/formRule.config.js';
import mInput from '../../components/m-input.vue';
import filter from 'lodash/fp/filter';
import config from "@/config/index.config.js";

export default {
	components: {
		mInput
	},
	data() {
		return {
			providerList: [],
			hasProvider: false,
			btnDis: false,
			submitBtnDis: false,
			btnText: '发送验证码',
			params: {
				account: '',
				phoneNo: '',
				code: ''
			},
			reqBody: {},
			// 如果为登录状态 默认跳转的地址
			redirectRoute: this.$mRoutesConfig.index,
			routeQuery: {},
			// 微信登录
			SessionKey: '',
			nickName: null,
			avatarUrl: null,
			// #ifdef MP-WEIXIN
			needWxLogin: true,
			// #endif
			// #ifndef MP-WEIXIN
			needWxLogin: false,
			// #endif
			gender:"",
			city:"",
			province:"",
			country:"",
			openIdGetted:""
		};
	},
	onLoad(query) {
		this.initredirectRouteData(query);
	},
	computed: {
		...mapState(['openId','appId']),
		...mapGetters(['hasLogin']),
		submitBtnDisKey() {
			let checkParams = {};
			checkParams['openId'] = this.openId;
			checkParams['phoneNo'] = this.params.phoneNo;
			checkParams['code'] = this.params.code;
			console.log(checkParams);
			let res = graceChecker.check(checkParams, formRuleConfig.loginRule);
			console.log(res);
			return !res;
		}
	},
	methods: {
		initredirectRouteData(query) {
			if (query.redirectUrl) {
				let routePath = query.redirectUrl;
				let currentRout = filter(routeConfig => {
					if (routeConfig.path == routePath) {
						return true;
					}
					return false;
				}, this.$mRoutesConfig);
				console.log('currentRout:', currentRout);
				if (currentRout && currentRout.length > 0) {
					this.redirectRoute = currentRout[0];
					delete query.redirectUrl;
					this.routeQuery = query;
				} else {
					uni.showToast({
						title: '没找到对应路由',
						icon: 'none'
					});
				}
			}
		},

		// 登录
		async bindLogin() {
			try {
				let data = {
					username: this.params.account,
					password: this.params.password,
					openId: this.openIdGetted,
					nickName: this.nickName,
					headUrl: this.avatarUrl,
					gender: this.gender,
					city: this.city,
					province: this.province,
					country: this.country
				};
				this.$api.login(data, res => {
					console.log('login successfully');
					if (res.code == 200) {
						// 校验通过...
						this.submitBtnDis = true;
						this.loginSuccess(res);
					} else {
						this.$api.msg(res.message);
					}
				});
			} catch (e) {
				console.log(e);
				this.submitBtnDis = false;
			}
		},
		loginSuccess(res) {
			let token = res.data.token;
			let tokenType = res.data.tokenHead;
			let memberId = res.data.memberId;
			let userInfo = {};
			userInfo.memberId = memberId;
			userInfo.nickName = this.$mUtils.getUserInfoFromToken(token);
			this.$store.commit('SET_USERINFO', userInfo || {});
			
			// 前端自动登录
			this.$store.commit('SET_TOKEN', token);
			this.$store.commit('SET_TOKEN_TYPE', tokenType);
			// this.$mUtils.redirectTo(this.redirectRoute)
			console.log('this.redirectRoute:', this.redirectRoute);
			this.$mUtils.redirectTo({
				route: this.redirectRoute,
				query: this.routeQuery
			});
		},

		// 发送验证码
		async sendCode() {
			let checkRes = graceChecker.check(this.params, formRuleConfig.sendCodeRule);
			if (!checkRes) {
				this.$api.msg(graceChecker.error);
				return;
			}
			await this.$api.getMsgCode({
				params: {
					telephone: this.telephone
				}
			});
			this.$api.msg('发送成功');
			// 开启倒计时
			this.countDown();
		},

		// 验证码倒计时
		countDown() {
			let t = null;
			let timer = 60;
			this.btnDis = true;
			clearInterval(t);
			this.btnText = `${timer}s`;
			t = setInterval(() => {
				if (timer == 0) {
					clearInterval(t);
					this.btnText = '重新发送';
					this.btnDis = false;
					return;
				}
				timer--;
				this.btnText = `${timer}s`;
			}, 1000);
		},
		//第一授权获取用户信息===》按钮触发
		wxGetUserInfo() {
			let _this = this;
			uni.getUserInfo({
				provider: 'weixin',
				success: function(infoRes) {
					console.log("wxGetUserInfo infoRes:",infoRes)
					_this.nickName = infoRes.userInfo.nickName; //昵称
					_this.avatarUrl = infoRes.userInfo.avatarUrl; //头像
					_this.gender = infoRes.userInfo.gender; //性别
					_this.city = infoRes.userInfo.city; //城市
					_this.province = infoRes.userInfo.province; //省份
					_this.country = infoRes.userInfo.country; //国家
					try {
						_this.login()
					} catch (e) {}
				},
				fail(res) {}
			});
		},
		//登录
		login() {
			let _this = this;
			uni.showLoading({
				title: '登录中...'
			});

			// 1.wx获取登录用户code
			uni.login({
				provider: 'weixin',
				success: function(loginRes) {
					let code = loginRes.code;
					//非第一次授权获取用户信息
					uni.getUserInfo({
						provider: 'weixin',
						success: function(infoRes) {
							//获取用户信息后向调用信息更新方法
							_this.nickName = infoRes.userInfo.nickName; //昵称
							_this.avatarUrl = infoRes.userInfo.avatarUrl; //头像
							_this.gender = infoRes.userInfo.gender; //性别
							_this.city = infoRes.userInfo.city; //城市
							_this.province = infoRes.userInfo.province; //省份
							_this.country = infoRes.userInfo.country; //国家
						}
					});

					//2.将用户登录code传递到后台置换用户SessionKey、OpenId等信息
					uni.request({
						url: `${config.wxApiUrl}/wxAuth/getOpenidByCode`,
						data: {
							appid: `${config.appid}`,
							code: code
						},
						method: 'POST',
						header: {
							'content-type': 'application/json'
						},
						success: res => {
							console.log("getOpenidByCode res:",res)
							//openId、或SessionKdy存储//隐藏loading
							uni.hideLoading();
							let data = res.data
							if(data.code == 200) {
								_this.openIdGetted = data.data
								_this.$store.commit("SET_OPENID", _this.openIdGetted);
								_this.updateUserInfo(); //调用更新信息方法
							}else {
								this.$api.msg(data.msg);
							}
							
						}
					});
				}
			});
		},
		//向后台更新信息
		updateUserInfo() {
			let _this = this;
			let data = {
					appid: this.appId,           
					openId: this.openIdGetted,
					wxUserInfoVO:{
						nickName: this.nickName,
						headUrl: this.avatarUrl,
						gender: this.gender,
						city: this.city,
						province: this.province,
						country: this.country
					}
				};
			console.log("updateUserInfo data:",data)
			this.$api.loginAndUpdateUserInfo(data, res => {
				console.log('loginAndUpdateUserInfo successfully');
				if (res.code == 200) {
					this.loginSuccess(res);
				} else if(res.code == 10001) {//找不到用户信息则走注册流程
				console.log("updateUserInfo res:",res)
					this.needWxLogin = false
				}else {
					this.$api.msg(res.message);
				}
			});
		}
	}
};
</script>

<style lang="scss" scoped>
/* 原生组件模式下需要注意组件外部样式 */
m-input {
	width: 100%;
	/* min-height: 100%; */
	display: flex;
	flex: 1;
}

.action-row {
	display: flex;
	flex-direction: row;
	justify-content: center;
}

.action-row navigator {
	color: #007aff;
	padding: 0 10px;
}

.oauth-row {
	display: flex;
	flex-direction: row;
	justify-content: center;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
}

.oauth-image {
	position: relative;
	width: 50px;
	height: 50px;
	border: 1px solid #dddddd;
	border-radius: 50px;
	margin: 0 20px;
	background-color: #ffffff;
}

.oauth-image image {
	width: 30px;
	height: 30px;
	margin: 10px;
}

.oauth-image button {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	opacity: 0;
}

.content {
	display: flex;
	flex: 1;
	flex-direction: column;
	background-color: #efeff4;
	padding: 10px;
}

.input-group {
	background-color: #ffffff;
	margin-top: 20px;
	position: relative;
}

.input-group::before {
	position: absolute;
	right: 0;
	top: 0;
	left: 0;
	height: 1px;
	content: '';
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
	background-color: #c8c7cc;
}

.input-group::after {
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	height: 1px;
	content: '';
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
	background-color: #c8c7cc;
}

.input-row {
	display: flex;
	flex-direction: row;
	position: relative;
	font-size: 18px;
	line-height: 40px;
}

.input-row .title {
	width: 72px;
	padding-left: 15px;
}

.input-row.border::after {
	position: absolute;
	right: 0;
	bottom: 0;
	left: 8px;
	height: 1px;
	content: '';
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
	background-color: #c8c7cc;
}

.btn-row {
	margin-top: 25px;
	padding: 10px;
}

button.primary {
	background-color: #0faeff;
}

.wx_header {
	margin: 90rpx 0 90rpx 50rpx;
	border-bottom: 1px solid #ccc;
	text-align: center;
	width: 650rpx;
	height: 300rpx;
	line-height: 450rpx;
}

.wx_header image {
	width: 200rpx;
	height: 200rpx;
}

.wx_content {
	margin-left: 50rpx;
	margin-bottom: 90rpx;
}

.wx_content text {
	display: block;
	color: #9d9d9d;
	margin-top: 40rpx;
}

.wx_bottom {
	border-radius: 80rpx;
	margin: 70rpx 50rpx;
	font-size: 35rpx;
}
</style>
