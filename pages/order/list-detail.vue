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
				<view >
					<!-- 订单列表 -->
					<view 
						v-for="(order, index) in dataList" :key="index"
						class="order-item">
						<view class="i-top b-b">
							<text class="time">{{order.createTime}}</text>
							<text class="state" :style="{color: order.stateTipColor}">{{order.statusName}}</text>
							<text 
								v-if="order.status===9" 
								class="del-btn yticon icon-iconfontshanchu1"
								@click="deleteOrder(index)"
							></text>
						</view>
						
						<scroll-view v-if="order.list.length > 1" class="goods-box" scroll-x>
							<view
								v-for="(goodsItem, goodsIndex) in order.list" :key="goodsIndex"
								class="goods-item"
							>
								<image class="goods-img" :src="goodsItem.image" mode="aspectFill" @click="goToDetailPage(goodsItem)"></image>
							</view>
						</scroll-view>
						<view 
							v-if="order.list.length === 1" 
							class="goods-box-single"
							v-for="(goodsItem, goodsIndex) in order.list" :key="goodsIndex"
						>
							<image class="goods-img" :src="goodsItem.image" mode="aspectFill" @click="goToDetailPage(goodsItem)"></image>
							<view class="right">
								<text class="title clamp">{{goodsItem.name}}</text>
								<text class="attr-box">{{goodsItem.title}}</text>
								<text class="price">{{goodsItem.favourPrice}}</text>
							</view>
						</view>
						
						<view class="price-box">
							共
							<text class="num">{{order.list.length}}</text>
							种商品 实付款
							<text class="price">{{order.payAmount}}</text>
						</view>
						<view class="action-box b-t" v-if="order.status == 0">
							<button class="action-btn" @click="cancelOrder(item)">取消订单</button>
							<button class="action-btn recom">立即支付</button>
						</view>
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
	import map from "lodash/fp/map"
	import flow from "lodash/fp/flow"
	import filter from "lodash/fp/filter"
	
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
				/* for(var i=0;i<this.pageSize;i++) {
					this.dataList.push(this.genItem(this.status,this.pageNum+""+i))
				} */
				
				let data = {
					pageSize: this.pageSize,
					pageNum: this.pageNum,
					status: this.status
				}
				this.$api.getOrders(data,(res)=>{
					//console.log(JSON.stringify(res))
					if(res.code) {
						let resData = res.data
						let list = resData.list
						this.total = resData.total
						this.totalPage = resData.totalPage
						this.pageNum++
						for(var i=0;i<list.length;i++) {
							let orderData = list[i]
							let order = {}
							order.id=orderData.id
							order.orderSn=orderData.orderSn
							order.payAmount=orderData.payAmount
							order.status=orderData.status
							order.statusName=this.getOrderStatusName(orderData.status)
							order.createTime=orderData.createTime
							order.recInfo=orderData.receiverProvince+orderData.receiverCity+orderData.receiverRegion+orderData.receiverDetailAddress+" "+orderData.receiverName+" "+orderData.receiverPhone
							order.list = []
							orderData.products.forEach(x => {
								console.log(JSON.stringify(x))
								let y = {}
								y.loaded=true
								y.image = x.pic
								y.title = x.subTitle
								y.originalPrice = x.originalPrice
								y.favourPrice = x.price
								// y.tip: '自营'
								y.tip = x.productCategoryName
								//below is the information the product-detail page need
								y.productId = x.id
								y.albumPics = x.albumPics
								y.stock = x.stock
								y.unit = x.unit
								y.productSn = x.productSn
								y.productCategoryId = x.productCategoryId
								y.name = x.name
								y.brandId = x.brandId
								order.list.push(y)
							})
							this.dataList.push(order)
						}
					}else {
						this.$api.msg(res.message)
					}
				})
			},
			getOrderStatusName(status) {
				//订单状态：0->待付款；1->待发货；2->已发货；3->已完成；4->已关闭；5->无效订单
				switch(status){
					case 0:
						return "待付款"
					case 1:
						return "待发货"
					case 2:
						return "已发货"
					case 3:
						return "已完成"
					case 4:
						return "已关闭"
					case 5:
						return "无效订单"
					default:
						return "全部"
				}
			},
			genItem(status,suffix="") {
				let order = {}
				order.list = []
				order.payAmount=2000
				
				let item = {}
				
				item.image="https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=1433226119,1535949713&fm=26&gp=0.jpg"
				item.loaded=true
				item.createTime='2020年8月22日 上午12:13:04'
				item.title="各种属性"
				item.favourPrice=1000
				switch(status){
					case 0:
						item.name="全部"+suffix;
						item.stateTip="全部";
						break;
					case 1:
						item.name="待付款"+suffix;
						item.stateTip="待付款";
						break;
					case 2:
						item.name="待收货"+suffix;
						item.stateTip="待收货";
						break;
					case 3:
						item.name="已完成"+suffix;
						item.stateTip="已完成";
						break;
					default:
						item.name="全部"+suffix;
						item.stateTip="全部";
				}
				order.list.push(item)
				order.list.push(item)
				return order
			},
			goToDetailPage(x) {
				uni.navigateTo({
					url:"../product-detail/product-simple?item="+encodeURIComponent(JSON.stringify(x))
				})
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
	
	.order-item{
		display: flex;
		flex-direction: column;
		padding-left: 30upx;
		background: #fff;
		margin-top: 16upx;
		.i-top{
			display: flex;
			align-items: center;
			height: 80upx;
			padding-right:30upx;
			font-size: $font-base;
			color: $font-color-dark;
			position: relative;
			.time{
				flex: 1;
			}
			.state{
				color: $base-color;
			}
			.del-btn{
				padding: 10upx 0 10upx 36upx;
				font-size: $font-lg;
				color: $font-color-light;
				position: relative;
				&:after{
					content: '';
					width: 0;
					height: 30upx;
					border-left: 1px solid $border-color-dark;
					position: absolute;
					left: 20upx;
					top: 50%;
					transform: translateY(-50%);
				}
			}
		}
		/* 多条商品 */
		.goods-box{
			height: 160upx;
			padding: 20upx 0;
			white-space: nowrap;
			.goods-item{
				width: 120upx;
				height: 120upx;
				display: inline-block;
				margin-right: 24upx;
			}
			.goods-img{
				display: block;
				width: 100%;
				height: 100%;
				cursor: pointer;
			}
		}
		/* 单条商品 */
		.goods-box-single{
			display: flex;
			padding: 20upx 0;
			.goods-img{
				display: block;
				width: 120upx;
				height: 120upx;
			}
			.right{
				flex: 1;
				display: flex;
				flex-direction: column;
				padding: 0 30upx 0 24upx;
				overflow: hidden;
				.title{
					font-size: $font-base + 2upx;
					color: $font-color-dark;
					line-height: 1;
				}
				.attr-box{
					font-size: $font-sm + 2upx;
					color: $font-color-light;
					padding: 10upx 12upx;
				}
				.price{
					font-size: $font-base + 2upx;
					color: $font-color-dark;
					&:before{
						content: '￥';
						font-size: $font-sm;
						margin: 0 2upx 0 8upx;
					}
				}
			}
		}
		
		.price-box{
			display: flex;
			justify-content: flex-end;
			align-items: baseline;
			padding: 20upx 30upx;
			font-size: $font-sm + 2upx;
			color: $font-color-light;
			.num{
				margin: 0 8upx;
				color: $font-color-dark;
			}
			.price{
				font-size: $font-lg;
				color: $font-color-dark;
				&:before{
					content: '￥';
					font-size: $font-sm;
					margin: 0 2upx 0 8upx;
				}
			}
		}
		.action-box{
			display: flex;
			justify-content: flex-end;
			align-items: center;
			height: 100upx;
			position: relative;
			padding-right: 30upx;
		}
		.action-btn{
			width: 160upx;
			height: 60upx;
			margin: 0;
			margin-left: 24upx;
			padding: 0;
			text-align: center;
			line-height: 60upx;
			font-size: $font-sm + 2upx;
			color: $font-color-dark;
			background: #fff;
			border-radius: 100px;
			&:after{
				border-radius: 100px;
			}
			&.recom{
				background: #fff9f9;
				color: $base-color;
				&:after{
					border-color: #f7bcc8;
				}
			}
		}
	}
	
	
</style>

