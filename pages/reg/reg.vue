<template>
	<view class="content">
		<view class="input-group">
			<view class="input-row border">
				<text class="title">账号：</text>
				<m-input type="text" clearable v-model="username" placeholder="请输入账号" :focus="true"></m-input>
			</view>
			<view class="input-row border">
				<text class="title">密码：</text>
				<m-input type="password" displayable v-model="password" placeholder="请输入密码"></m-input>
			</view>
			<view class="input-row border">
				<text class="title">手机号：</text>
				<m-input type="text" clearable v-model="telephone" placeholder="请输入手机号"></m-input>
			</view>
			<view class="input-row border-bottom-1px">
				<text class="title">验证码：</text>
				<m-input type="number" clearable v-model="authCode" placeholder="请输入短信验证码" :maxLength="6"></m-input>
				<view class="sendCode">
					<button size="mini" :disabled="btnDis" @tap="sendCode">{{btnText}}</button>
				</view>
			</view>
		</view>
		<view class="btn-row">
			<button type="primary" class="primary" @tap="register" :loading="reging" >注册</button>
		</view>
	</view>
</template>

<script>
	import mInput from '../../components/m-input.vue'
	import graceChecker from '@/utils/graceChecker.js'
	import { mapState} from 'vuex';
	

	export default {
		components: {
			mInput
		},
		data() {
			return {
				btnDis: false,
				btnText: "发送验证码",
				reging: false,
				username: '',
				password: '',
				telephone: '',
				authCode: '',
				regValidRule: [{
					name: "username",
					checkType: "notnull",
					checkRule: "",
					errorMsg: "账号不能为空"
				},{
					name: "password",
					checkType: "notnull",
					checkRule: "",
					errorMsg: "密码不能为空"
				},{
					name: "telephone",
					checkType: "notnull",
					checkRule: "",
					errorMsg: "手机号不能为空"
				}, {
					name: "telephone",
					checkType: "phoneno",
					checkRule: "",
					errorMsg: "手机号格式不正确"
				},{
					name: "authCode",
					checkType: "notnull",
					checkRule: "",
					errorMsg: "验证码不能为空"
				}],
				telephoneValidRule: [{
					name: "telephone",
					checkType: "notnull",
					checkRule: "",
					errorMsg: "手机号不能为空"
				}, {
					name: "telephone",
					checkType: "phoneno",
					checkRule: "",
					errorMsg: "手机号格式不正确"
				}]
			}
		},
		computed: {
			...mapState(['openId']),
		},
		methods: {
			register() {
				this.reging = true
				const data = {
					username: this.username,
					password: this.password,
					telephone: this.telephone,
					authCode: this.authCode
				}
				let checkRes = graceChecker.check(data, this.regValidRule);
				if (!checkRes) {
					this.$api.msg(graceChecker.error)
					this.updating = false
					return;
				}
				if(this.openId) {
					data.type='openid'
					data.value=this.openId
				}
				this.$api.register(data,(res)=>{
					if(res.code) {
						this.$api.msg('注册成功')
						this.$store.commit("SET_OPENID", "");
						this.reging = false
					}else {
						this.$api.msg(res.message)
					}
				})
				
				/* uni.navigateBack({
					delta: 1
				}); */
			},
			// 发送验证码
			async sendCode() {
			
				let checkRes = graceChecker.checkSingleData(this.telephone, this.telephoneValidRule);
				if (!checkRes) {
					this.$api.msg(graceChecker.error)
					return;
				}
				
				await this.$api.getMsgCode({
					params: {
					  telephone: this.telephone
					}
				  },(res)=>{
					  console.log('验证码：'+res.data)});
				this.$api.msg('发送成功')
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
						this.btnText = "重新发送";
						this.btnDis = false;
						return;
					}
					timer--;
					this.btnText = `${timer}s`;
				}, 1000)
			}
		}
	}
</script>

<style lang='scss'>
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
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}
	
	.input-group::after {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
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
		-webkit-transform: scaleY(.5);
		transform: scaleY(.5);
		background-color: #c8c7cc;
	}
	
	.btn-row {
		margin-top: 25px;
		padding: 10px;
	}
	
	button.primary {
		background-color: #0faeff;
	}
	
	.sendCode {
		display: flex;
		align-items: center;
		padding-right: 20upx;
		box-sizing: border-box;
		align-items: stretch;
	
		button {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 200upx;
			background: #0faeff;
			color: #fff;
			border-radius: 0;
			font-size: 26upx;
			&::after{
				display: none;
			}
		}
	}

</style>
