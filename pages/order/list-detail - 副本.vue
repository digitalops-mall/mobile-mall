<template>
	<view class="page-news">
	<scroll-view class="listview" style="flex: 1;" enableBackToTop="true" scroll-y @scrolltolower="loadMore()">
		<view class="container">
			<!-- 空白页 -->
			<view v-if="!hasLogin || empty===true" class="empty">
				<image src="/static/emptyCart.jpg" mode="aspectFit"></image>
				<view v-if="hasLogin" class="empty-tips">
					空空如也
					<navigator class="navigator" v-if="hasLogin" @click="gotoIndex" open-type="switchTab">随便逛逛></navigator>
				</view>
				<view v-else class="empty-tips">
					空空如也
					<view class="navigator" @click="navToLogin">去登陆></view>
				</view>
			</view>
			<view v-else>
				<!-- 列表 -->
				<view class="cart-list">
					<view v-for="(order, index) in dataList"  v-if="order.list.length == 1" :key="order.list[0].id" class="my-card">
						<view class="cart-item">
							<view class="image-wrapper">
								<image :src="order.list[0].productPic" 
									:class="[order.list[0].loaded]"
									mode="aspectFill" 
									lazy-load 
									@load="onImageLoad('dataList', index)" 
									@error="onImageError('dataList', index)"
								></image>
							</view>
							<view class="item-right">
								<text class="clamp title" style="display: block;">{{order.list[0].productName}}</text>
								<text class="attr">{{order.list[0].attr_val}}</text>
								<text class="price">¥{{order.list[0].price}}</text>
								
							</view>
							<text class="del-btn yticon icon-fork" @click="deleteItem(index)"></text>
						</view>
						<button class="confirm-btn" style="float: right;margin-right: 10rpx;">再来一单</button>
					</view>
					<view class="my-card" v-else>
						<view class="cart-item">
							<view class="image-wrapper">
								<image :src="order.list[0].productPic" 
									:class="[order.list[0].loaded]"
									mode="aspectFill" 
									lazy-load 
									@load="onImageLoad('dataList', index)" 
									@error="onImageError('dataList', index)"
								></image>
							</view>
							<view class="image-wrapper">
								<image :src="order.list[0].productPic" 
									:class="[order.list[0].loaded]"
									mode="aspectFill" 
									lazy-load 
									@load="onImageLoad('dataList', index)" 
									@error="onImageError('dataList', index)"
								></image>
							</view>
							<view class="image-wrapper">
								<image :src="order.list[0].productPic" 
									:class="[order.list[0].loaded]"
									mode="aspectFill" 
									lazy-load 
									@load="onImageLoad('dataList', index)" 
									@error="onImageError('dataList', index)"
								></image>
							</view>
							<view class="image-wrapper">
								<image :src="order.list[0].productPic" 
									:class="[order.list[0].loaded]"
									mode="aspectFill" 
									lazy-load 
									@load="onImageLoad('dataList', index)" 
									@error="onImageError('dataList', index)"
								></image>
							</view>
						</view>
						<button class="confirm-btn" style="float: right;margin-right: 10rpx;">再来一单</button>
					</view>
				</view>
				
			</view>
		</view>
	</scroll-view>
	</view>
</template>

<script>
	import {
		mapState,
		mapGetters
	} from 'vuex';
	
	export default {
		components: {},
		data() {
			return {
				pageNum:1,
				pageSize:6,
				totalPage: 0,
				total: 0,
				empty: false,
				hasLogin:true,
				dataList: []
			}
		},
		props: {
		  status: {
		    type: [Number, String],
		    default: ''
		  }
		},
		watch:{
			//显示空白页
			dataList(e){
				let empty = e.length === 0 ? true: false;
				if(this.empty !== empty){
					this.empty = empty;
				}
			}
		},
		onLoad(option){
			
			this.loadData();
		},
		computed:{
			// ...mapGetters(['hasLogin']),
			...mapState(['cartInfo','orderCartInfo','addressInfo']),
			
		},
		methods: {
			//请求数据
			async loadData(){
				for(var i=0;i<this.pageSize;i++) {
					this.dataList.push(this.genItem(this.status,this.pageNum+""+i))
				}
				
				/* let data = {
					pageSize: this.pageSize,
					pageNum: this.pageNum,
					status: this.status
				}
				this.$api.getOrders(data,(res)=>{
					if(res.code) {
						let resData = res.data
						let list = resData.list
						this.total = resData.total
						this.totalPage = resData.totalPage
						this.pageNum++
						for(var i=0;i<list.length;i++) {
							
						}
						
						
					}else {
						this.$api.msg(res.message)
					}
				}) */
			},
			genItem(status,suffix="") {
				let order = {}
				order.list = []
				let item = {}
				
				item.productPic="https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=1433226119,1535949713&fm=26&gp=0.jpg"
				item.loaded=true
				
				item.attr_val="各种属性"
				item.price=1000
				switch(status){
					case 0:
						item.productName="全部"+suffix;
						break;
					case 1:
						item.productName="待付款"+suffix;
						break;
					case 2:
						item.productName="待收货"+suffix;
						break;
					case 3:
						item.productName="已完成"+suffix;
						break;
					default:
						item.productName="全部"+suffix;
				}
				order.list.push(item)
				// order.list.push(item)
				return order
			},
			deleteItem(){
				
			},
			gotoIndex(){
				this.$mUtils.goto(this.$mRoutesConfig.index)
			},
			navToLogin(){
				uni.navigateTo({
					url: '/pages/login/login'
				})
			},
			//监听image加载完成
			onImageLoad(key, index) {
				this.$set(this[key][index], 'loaded', 'loaded');
			},
			//监听image加载失败
			onImageError(key, index) {
				this[key][index].image = '/static/errorImage.jpg';
			},
			onPullDownRefresh() {
				console.log('onPullDownRegresh...')
			},
			onReachBottom() {
				console.log('onReachBottom...')
			},
			loadMore(){
				console.log('loadMore...')
				if(this.pageNum <= this.totalPage)this.loadData();
			}
			
		}
	}
</script>

<style lang='scss'>
	.container{
		padding-bottom: 134upx;
		/* 空白页 */
		.empty{
			position:fixed;
			left: 0;
			top:0;
			width: 100%;
			padding-bottom:100upx;
			display:flex;
			justify-content: center;
			flex-direction: column;
			align-items:center;
			background: #fff;
			image{
				width: 240upx;
				height: 160upx;
				margin-bottom:30upx;
			}
			.empty-tips{
				display:flex;
				font-size: $font-sm+2upx;
				color: $font-color-disabled;
				.navigator{
					color: $uni-color-primary;
					margin-left: 16upx;
				}
			}
		}
	}
	/* 购物车列表项 */
	.cart-item{
		border: 1;
		border-color: black;
		display:flex;
		position:relative;
		padding:30upx 40upx;
		.image-wrapper{
			width: 230upx;
			height: 230upx;
			flex-shrink: 0;
			image{
				width: 100%;
				height: 100%;
				border-radius:8upx;
			}
		}
		.checkbox{
			position:absolute;
			left:-16upx;
			top: -16upx;
			z-index: 8;
			font-size: 44upx;
			line-height: 1;
			padding: 4upx;
			color: $font-color-disabled;
			background:#fff;
			border-radius: 50px;
		}
		.item-right{
			display:flex;
			flex-direction: column;
			flex: 1;
			overflow: hidden;
			position:relative;
			padding-left: 30upx;
			.title,.price{
				font-size:$font-base + 2upx;
				color: $font-color-dark;
				height: auto;
				line-height: 40upx;
			}
			.attr{
				font-size: $font-sm + 2upx;
				color: $font-color-light;
				height: auto;
				line-height: 50upx;
			}
			.price{
				height: 50upx;
				line-height:50upx;
			}
		}
		.del-btn{
			padding:4upx 10upx;
			font-size:34upx; 
			height: 50upx;
			color: $font-color-light;
		}
	}
	/* 底部栏 */
	/* 复选框选中状态 */
	.action-section .checkbox.checked,
	.cart-item .checkbox.checked{
		color: $uni-color-primary;
	}
	.confirm-btn{
		margin: 0;
		border-radius: 100px;
		font-size: $font-base;
		background: $uni-color-primary;
		box-shadow: 1px 2px 5px rgba(217, 60, 93, 0.72)
	}
	
	.my-card{
		border-style: solid;
		border-color: #c8c7cc;
		border-width: 1rpx;
		border-radius: 3rpx;
		margin-top: 12rpx;
		margin-left: 12rpx;
		margin-right: 12rpx;
		
		padding-bottom: 85rpx;
	}
	
	.page-news {
	  flex: 1;
	  flex-direction: column;
	  position: absolute;
	  left: 0;
	  top: 0;
	  right: 0;
	  bottom: 0;
	}
	
	.listview {
	  position: absolute;
	  left: 0;
	  top: 0;
	  right: 0;
	  bottom: 0;
	  /* #ifndef APP-NVUE */
	  display: flex;
	  flex-direction: column;
	  /* #endif */
	  /* #ifndef MP-ALIPAY */
	  flex-direction: column;
	  /* #endif */
	}
	
	
</style>

