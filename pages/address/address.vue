<template>
	<view>
		<view class="content">
			<view class="list">
				<view class="row" v-for="(row,index) in addressList" :key="index" @tap="select(row)">
					<view class="left">
						<view class="head" v-if="!row.isDefault" @click="setDefault(row.id)">
							默
						</view>
					</view>
					<view class="center">
						<view class="name-tel">
							<view class="name">{{row.name}}</view>
							<view class="tel">{{row.tel}}</view>
							<view class="default" v-if="row.isDefault">
								默认
							</view>
						</view>
						<view class="address">
							{{row.address.region.label.split('-').join('')}}{{row.detailed}}
						</view>
					</view>
					<view class="right">
						<view class="icon yticon icon-bianji" @tap.stop="edit(row)">
							
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="add">
			<view class="btn" @tap="add">
				<view class="icon tianjia"></view>新增地址
			</view>
		</view>
	</view>
</template>
<script>
	import {
		mapState,
		mapGetters
	} from 'vuex';
	import map from "lodash/fp/map"
	import flow from "lodash/fp/flow"

	export default {
		data() {
			return {
				isSelect:false,
				addressList:[]
			};
		},
		onLoad(e) {
			if(e.type=='select'){
				this.isSelect = true;
			}
			
		},
		onShow() {
			this.loadData()
		},
		computed:{
			// ...mapState(['hasLogin'])
			...mapGetters(['hasLogin']),
			...mapState(['addressInfo'])
		},
		methods:{
			//请求数据
			async loadData(){
				let addressList = null
				this.$api.getAddressList((res)=>{
					if(res.code) {
						addressList = flow(
							map(x => {
								let y = {}
								y.isDefault = x.defaultStatus?true:false
								y.detailed = x.detailAddress  
								y.id = x.id
								y.name = x.name
								y.tel = x.phoneNumber
								y.postCode = x.postCode
								y.address = {region:{"label":x.province+'-'+x.city+'-'+x.region,"value":x.ext1.split('_'),"cityCode":x.regionCode},detailed:x.detailAddress}
								return y
							})
						)(res.data)
						this.addressList = addressList
						this.addressInfo.addressList = addressList
						this.$store.commit("SET_ADDRESSINFO",this.addressInfo)
					}else {
						this.$api.msg(res.message)
					}
				})
			},
			edit(row){
				this.addressInfo.editAddressInfo =  row
				this.$store.commit("SET_ADDRESSINFO",this.addressInfo)
				uni.navigateTo({
					url:"edit/edit?type=edit"
				})
			},
			add(){
				uni.navigateTo({
					url:"edit/edit?type=add"
				})
			},
			select(row){
				//是否需要返回地址(从订单确认页跳过来选收货地址)
				if(!this.isSelect){
					return ;
				}
				this.addressInfo.defaultAddressInfo =  row
				this.$store.commit("SET_ADDRESSINFO",this.addressInfo)
				this.$mUtils.goto(this.$mRoutesConfig.order)
			},
			setDefault(id) {
				if(id) {
					this.$api.setDefaultAddress(id,(res)=>{
						this.$api.msg('已设为默认地址')
						this.loadData()
					})
				}
			}
		}
	}
</script>

<style lang="scss">
view{
	display: flex;
}
	.icon {
		// &.bianji {
		// 	&:before{content:"\e61b";}
		// }
		// &.tianjia {
		// 	&:before{content:"\e81a";}
		// }
	}
	.add{
		position: fixed;
		bottom: 0;
		width: 100%;
		height: 120upx;
		justify-content: center;
		align-items: center;
		.btn{
			box-shadow: 0upx 5upx 10upx rgba(0,0,0,0.4);
			width: 70%;
			height: 80upx;
			border-radius: 80upx;
			background-color: #0faeff;
			color: #fff;
			justify-content: center;
			align-items: center;
			.icon{
				height: 80upx;
				color: #fff;
				font-size: 30upx;
				justify-content: center;
				align-items: center;
			}
			font-size: 30upx;
		}
	}
	.list{
		flex-wrap: wrap;
		.row{
			width: 96%;
			padding: 20upx 2%;
			.left{
				width: 90upx;
				flex-shrink: 0;
				align-items: center;
				.head{
					width: 70upx;
					height: 70upx;
					background:linear-gradient(to right,#0faeff,#0faeff);
					color: #fff;
					justify-content: center;
					align-items: center;
					border-radius: 60upx;
					font-size: 35upx;
					text-decoration: underline;
				}
			}
			.center{
				width: 100%;
				flex-wrap: wrap;
				.name-tel{
					width: 100%;
					align-items: baseline;
					.name{
						font-size: 34upx;
					}
					.tel{
						margin-left: 30upx;
						font-size: 24upx;
						color: #777;
					}
					.default{

						font-size: 22upx;
						
						background-color: #f06c7a;
						color: #fff;
						padding: 0 18upx;
						border-radius: 24upx;
						margin-left: 20upx;
					}
				}
				.address{
					width: 100%;
					font-size: 24upx;
					align-items: baseline;
					color: #777;
				}
			}
			.right{
				flex-shrink: 0;
				align-items: center;
				margin-left: 20upx;
				.icon{
					justify-content: center;
					align-items: center;
					width: 80upx;
					height: 60upx;
					border-left: solid 1upx #aaa;
					font-size: 40upx;
					color: #777;
				}
			}
		}
	}
</style>
