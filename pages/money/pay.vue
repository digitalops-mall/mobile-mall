<template>
	<view class="app">
		<view class="price-box">
			<text>支付金额</text>
			<text class="price">{{orderInfo.paymentMoney}}</text>
		</view>

		<view class="pay-type-list">

			<view class="type-item b-b" @click="changePayType(1)">
				<text class="icon yticon icon-weixinzhifu"></text>
				<view class="con">
					<text class="tit">微信支付</text>
					<text>推荐使用微信支付</text>
				</view>
				<label class="radio">
					<radio value="" color="#fa436a" :checked='payType == 1' />
					</radio>
				</label>
			</view>
			<view class="type-item b-b" @click="changePayType(2)">
				<text class="icon yticon icon-alipay"></text>
				<view class="con">
					<text class="tit">支付宝支付</text>
				</view>
				<label class="radio">
					<radio value="" color="#fa436a" :checked='payType == 2' />
					</radio>
				</label>
			</view>
			<view class="type-item" @click="changePayType(3)">
				<text class="icon yticon icon-erjiye-yucunkuan"></text>
				<view class="con">
					<text class="tit">二维码支付</text>
				</view>
				<label class="radio">
					<radio value="" color="#fa436a" :checked='payType == 3' />
					</radio>
				</label>
			</view>
		</view>
		
		<text class="mix-btn" @click="confirm">确认支付</text>
		
		<view class="qrcode-box" >
			<canvas canvas-id="qrcode" style="width: 354px;height: 354px;" v-if="showQrcode"/>
			<text class="countdown">{{orderDeadLineText}}</text>
		</view>
		<!-- 对话框 -->
		<uni-popup ref="popupDialog" type="dialog" >
			<uni-popup-dialog :type="msgType" :title="msgTitle" :content="msgContent" :before-close="true" @confirm="msgConfirm" @close="msgClose"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import {
		mapState,
		mapGetters
	} from 'vuex';
	import uQRCode from '@/js_sdk/Sansnn-uQRCode/uqrcode.js';
	import qs from 'qs';
	import config from "@/config/index.config.js";
	import uniPopupMessage from '@/components/uni-popup/uni-popup-message.vue'
	import uniPopupDialog from '@/components/uni-popup/uni-popup-dialog.vue'
	import uniPopupShare from '@/components/uni-popup/uni-popup-share.vue'
	
	export default {
		components: {
			uniPopupMessage,
			uniPopupDialog,
			uniPopupShare
		},
		data() {
			return {
				showQrcode:true,
				payType: 3,
				orderId:'',
				orderInfo: {},
				orderDeadLineText:'',
				msgType:'',
				msgTitle:'',
				msgContent:'',
				msgConfirm:function(done){
					done()
					this.goToContact()
				},
				msgClose:function(done){
					done()
				}
			};
		},
		computed: {
			...mapGetters(['hasLogin']),
			...mapState(['userInfo']),
		},
		onLoad(options) {
			this.orderId = options.id;
			this.getOrderPaymentInfo(this.orderId);
		},

		methods: {
			//选择支付方式
			changePayType(type) {
				this.payType = type;
			},
			getOrderPaymentInfo(orderId) {
				let data = {
				  "orderId": orderId
				}
				this.$api.getOrderPaymentInfo(data,(res)=>{
					if(res.code) {
						this.orderInfo = res.data
					}else {
						this.$api.msg(res.message)
					}
				})
			},
			getPayChannelId(payType){
				switch(payType){
					case 1:
						return "wx"
					case 2:
						return "ALIPAY_WAP"
					case 3:
						return "ALIPAY_WAP"
					default:
						return "ALIPAY_WAP"
				}
			},
			makeQRCode(text) {
			    uQRCode.make({
					canvasId: 'qrcode',
					componentInstance: this,
					text: text,
					size: 354,
					margin: 10,
					backgroundColor: '#ffffff',
					foregroundColor: '#000000',
					fileType: 'jpg',
					correctLevel: uQRCode.errorCorrectLevel.H,
					success: res => {
					  console.log('make qrcode:'+res)
					}
				})
			},
			//确认支付
			confirm: async function() {
				/* uni.redirectTo({
					url: '/pages/money/paySuccess'
				}) */
				let data = {
				  "orderId": this.orderId,
				  "orderName":this.orderInfo.orderSn,
				  "channelId": this.getPayChannelId(this.payType),
				  "payerUserId":this.userInfo.memberId,
				  "payerUserName":this.userInfo.nickName,
				  "payerUserType":"wx",
				  "orderPayMoney":this.orderInfo.paymentMoney,
				  "payeeUserId":"ops",
				  "payeeUserType":"company",
				  "payeeUserName":"欧普斯数字化科技有限公司",
				}
				let url = `${config.opspayUrl}/mallPay/qrPay.html`+'?'+ qs.stringify(data)
				this.makeQRCode(url)
				/* this.$api.payOrder(data,(res)=>{
					// console.log("return:"+ res)
					if(res.status == 200) {
					}
				}) */
				//15 mins, unit: seconds
				let time = 15 * 60
				this.countDown(time)
				
			},
			// 二维码倒计时
			countDown(timer) {
				let t = null;
				let deadline = Date.now()+(timer*1000)
				// this.btnDis = true;
				clearInterval(t);
				let index = 0
				t = setInterval(() => {
					if (timer == 0) {
						clearInterval(t);
						this.msgType='warn'
						this.msgTitle='支付超时'
						this.msgContent='您在指定时间内未完成支付订单，订单已取消，如需购买请再次下单！'
						this.msgConfirm=function(done){
							done()
						}
						this.$refs.popupDialog.open()
						return;
					}
					index++;
					timer = timer-index;
					this.orderDeadLineText = this.filterDeadline(deadline);
					if(index%3 ==0) {
						let data = {
						  "orderId": this.orderId
						}
						this.$api.getOrderPaymentInfo(data,(res)=>{
							if(res.code) {
								let orderInfo = res.data
								let status = orderInfo.status
								//支付成功
								if(status == 2) {
									clearInterval(t);
									this.showQrcode=false
									this.msgType='success'
									this.msgTitle='支付成功'
									this.msgContent='您的订单已支付成功！'
									let that = this
									this.msgConfirm=function(done){
										done()
										that.goToContact()
									}
									this.$refs.popupDialog.open()
								}
							}else {
								this.$api.msg(res.message)
							}
						})
					}
				}, 1000)
			},
			filterDeadline(time) {
				let deadlineDate = new Date(time).getTime()
				let newDate = Date.now()
				let getTime = parseInt((deadlineDate - newDate)/1000);
				if (getTime < 0) {
					return `00 时 00 分 00 秒`
				}
				let day = parseInt(getTime/3600/24);   //  天数
				let hour = parseInt((getTime - (day*3600*24))/3600)  //  小时
				let minute = parseInt((getTime - ((day*3600*24) + hour*3600))/60)  //  分钟
				let second = parseInt((getTime - ((day*3600*24) + hour*3600))%60) //  秒
				function checkTime(time){
					return time = time < 10 ? `0${time}` : time
				}
				return `${checkTime(hour)} 时 ${checkTime(minute)} 分 ${checkTime(second)} 秒`
			},
			goToContact(e){
				/* uni.navigateTo({
					url:"../user/user"
				}) */
				this.$mUtils.goto(this.$mRoutesConfig.user)
			}
		}
	}
</script>

<style lang='scss'>
	.app {
		width: 100%;
	}

	.price-box {
		background-color: #fff;
		height: 265upx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 28upx;
		color: #909399;

		.price{
			font-size: 50upx;
			color: #303133;
			margin-top: 12upx;
			&:before{
				content: '￥';
				font-size: 40upx;
			}
		}
		
		
	}
	.qrcode-box {
		background-color: #fff;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 28upx;
		color: #909399;

		.countdown{
			font-size: 50upx;
			color: $base-color;
			margin-top: 12upx;
		}
		
		
	}

	.pay-type-list {
		margin-top: 20upx;
		background-color: #fff;
		padding-left: 60upx;
		
		.type-item{
			height: 120upx;
			padding: 20upx 0;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-right: 60upx;
			font-size: 30upx;
			position:relative;
		}
		
		.icon{
			width: 100upx;
			font-size: 52upx;
		}
		.icon-erjiye-yucunkuan {
			color: #fe8e2e;
		}
		.icon-weixinzhifu {
			color: #36cb59;
		}
		.icon-alipay {
			color: #01aaef;
		}
		.tit{
			font-size: $font-lg;
			color: $font-color-dark;
			margin-bottom: 4upx;
		}
		.con{
			flex: 1;
			display: flex;
			flex-direction: column;
			font-size: $font-sm;
			color: $font-color-light;
		}
	}
	.mix-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 630upx;
		height: 80upx;
		margin: 80upx auto 30upx;
		font-size: $font-lg;
		color: #fff;
		background-color: $base-color;
		border-radius: 10upx;
		box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
	}

</style>
