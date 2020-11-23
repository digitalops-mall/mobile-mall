<template>
	<view>
		<view class="header">
			<uni-nav-bar leftIcon="list" @clickLeft="show('left')">
				<block slot="right" style="display: flex;">
					<view class="flex uni-tab__cart-button-left" >
						<view class="uni-tab__icon">
							<uni-icons type="cart" size="23" @click="goToCart"></uni-icons>
						</view>
						<view class="flex uni-tab__dot-box">
							<text :class="{ 'uni-tab__dots': getCartProductCount > 999 }" class="uni-tab__dot ">{{getCartProductCount >999 ? '...':getCartProductCount}}</text>
						</view>
					</view>
					<uni-icons type="contact" size="23" @click="goToContact"></uni-icons>
				</block>
				<view class="input-view">
					<uni-icons class="input-uni-icon" type="search" size="22" color="#666666" />
					<input confirm-type="search" class="nav-bar-input" type="text" placeholder="输入搜索关键词" @confirm="confirm">
				</view>
			</uni-nav-bar>
		</view>
		<view>
			<view class="example-body" @touchmove.stop="">
				<!-- style="overflow-y: auto;" to solve the scroll or can use scrollerview component -->
				<uni-drawer :visible="showLeft" mode="left" @close="closeDrawer('left')" style="overflow-y: auto;">
					<product-category @close="closeDrawer('left')"></product-category>
				</uni-drawer>
				
			</view>
			
		</view>
		<view class="uni-product-list">
		    <view class="uni-product" v-for="(product,index) in productList" :key="index" @click="goToProductDetail(product)">
		        <view class="image-view">
		            <image v-if="renderImage" class="uni-product-image" :src="product.image"></image>
		        </view>
		        <view class="uni-product-title">{{product.title}}</view>
		        <view class="uni-product-price">
		            <text class="uni-product-price-favour">￥{{product.originalPrice}}</text>
		            <text class="uni-product-price-original">￥{{product.favourPrice}}</text>
		            <text class="uni-product-tip">{{product.tip}}</text>
		        </view>
		    </view>
		</view>
	</view>
</template>
<script>
	import uniDrawer from '@/components/uni-drawer/uni-drawer.vue'
	import uniList from '@/components/uni-list/uni-list.vue'
	import uniListItem from '@/components/uni-list-item/uni-list-item.vue'
	import uniSection from '@/components/uni-section/uni-section.vue'
	import uniIcons from '@/components/uni-icons/uni-icons.vue'
	import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue"
	import uniGrid from "@/components/uni-grid/uni-grid.vue"
	import uniGridItem from "@/components/uni-grid-item/uni-grid-item.vue"
	import productCategory from "@/components/product-category/product-category.vue"
	import http from '@/utils/http.js'
	
	/**
	 * do not use the chain methos in lodash, cause it need to import the whole lodash file, 
	 * which will bring performance issue.
	 * turn below:
	 * 
	 * import _ from "lodash"
	 * _.chain([1,2,3])
	 *  .map(x=>[x,x*2])
	 *  .flatten()
	 *  .sort()
	 *  .value()
	 * 
	 * into:
	 * 
	 * import map from "lodash/fp/map"
	 * import flatten from "lodash/fp/flatten"
	 * import sortBy from "lodash/fp/sortBy"
	 * import flow from "lodash/fp/flow"
	 * flow(
	 *  sortBy(x=>x),
	 *  flatten,
	 *  map(x=>[x,x*2])
	 * )([1,2,3])
	 */
	import map from "lodash/fp/map"
	import flow from "lodash/fp/flow"
	import {
		mapState,
		mapGetters
	} from 'vuex';
	
	export default {
		components: {
			uniNavBar,
			uniIcons,
			uniDrawer,
			uniList,
			uniListItem,
			uniSection,
			uniGrid,
			uniGridItem,
			productCategory
		},
		data() {
			return {
				showRight: false,
				showLeft: false,
				productList: [],
				renderImage: false,
				pageNum: 1,
				pageSize: 6,
				totalPage: 0,
				total: 0,
			}
		},
		computed:{
			...mapGetters(['hasLogin']),
			...mapState(['cartInfo']),
			getCartProductCount() {
				if(this.cartInfo.length > 0) {
					return this.cartInfo.reduce((accumulator, currentValue)=>{
						return accumulator+currentValue.quantity
					},0)
				}
			}
		},
		methods: {
			show(e) {
				console.log("show", e);
				if (e === 'left') {
					this.showLeft = true
				} else {
					this.showRight = true
				}
			},
			hide() {
				console.log("hide");
				this.showLeft = false
				this.showRight = false
			},
			closeDrawer(e) {
				if (e === 'left' || !e) {
					this.showLeft = false
				} else {
					this.showRight = false
				}
			},
			confirm() {}, 
			async loadData(action = 'add') {
				if (action === 'refresh') {
				    this.productList = [];
					this.pageNum=1;
					this.pageSize=6;
				}
				let that = this;
				let data = null;
				let url = this.$mConfig.baseUrl + "/home/recommendProductList?pageSize="+this.pageSize+"&pageNum="+this.pageNum
				console.log('url:'+url)
				http.GET(url,data,{},(res)=>{
					that.total = res.data.total
					that.totalPage = res.data.totalPage
					that.pageNum++
					data = flow(
						map(x => {
							let y = {}
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
							
							return y
						})
					)(res.data.list)
					
					data.forEach(item => {
					    this.productList.push(item);
					});
				},(r)=>{console.log('fail')})
				//以下是登录后才有的逻辑
				if(!this.hasLogin)return
				//获取购物车数据
				let cartInfos = []
				this.$api.getCartInfo((res)=>{
					if(res.code == 200) {
						let list = res.data
						if(list != null && list.length > 0) {
							if(list.length == 1) {
								cartInfos.push(list[0])
							}else {
								cartInfos.push(...res.data)
							}
						}
						this.$api.syncCartInfo(cartInfos,this.cartInfo)
						if(!this.cartInfo || !this.cartInfo.length || this.cartInfo.length == 0) {
							this.$store.commit("SET_CARTINFO", cartInfos || []);
						}
					}else {
						this.$api.msg(res.message)
					}
				})
			},
			goToProductDetail(e) {
				if('Apple iPhone X 256GB 深空灰色 移动联通电信4G手机' == e) {
					uni.navigateTo({
						url:"../product-detail/product-detail"
					})
				}else {
					uni.navigateTo({
						url:"../product-detail/product-simple?item="+encodeURIComponent(JSON.stringify(e))
					})
				}
			},
			goToCart(e){
				/* uni.navigateTo({
					url:"../cart/cart"
				}) */
				this.$mUtils.goto(this.$mRoutesConfig.cart)
			},
			goToContact(e){
				/* uni.navigateTo({
					url:"../user/user"
				}) */
				this.$mUtils.goto(this.$mRoutesConfig.user)
			},
		},
		onNavigationBarButtonTap(e) {
			this.showRight = !this.showRight
		},
		onBackPress() {
			if (this.showRight || this.showLeft) {
				this.hide()
				return true
			}
		},
		onLoad() {
			console.log('onLoad...')
		    this.loadData();
		    setTimeout(() => {
		        this.renderImage = true;
		    }, 300);
		},
		onPullDownRefresh() {
			console.log('onPullDownRegresh...')
		    this.loadData('refresh');
		    // 实际开发中通常是网络请求，加载完数据后就停止。这里仅做演示，加延迟为了体现出效果。
		    setTimeout(() => {
		        uni.stopPullDownRefresh();
		    }, 2000);
		},
		onReachBottom() {
			console.log('onReachBottom...')
			if(this.pageNum <= this.totalPage)this.loadData();
		}
		
	}
</script>

<style  lang="scss" scoped>
	/* 头条小程序组件内不能引入字体 */
	/* #ifdef MP-TOUTIAO */
	@font-face {
		font-family: uniicons;
		font-weight: normal;
		font-style: normal;
		src: url('~@/static/uni.ttf') format('truetype');
	}

	/* #endif */

	/* #ifndef APP-NVUE */
	page {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #efeff4;
		min-height: 100%;
		height: auto;
	}

	view {
		font-size: 28rpx;
		line-height: inherit;
	}
	
	/deep/ .uni-drawer { 
		.uni-drawer__content { 
			display: flex !important;
			flex-direction: row;
			width: 100% !important; 
		} 
	}
	
	
	.uni-list{
		width: 6em;
	}

	.example {
		padding: 0 30rpx 30rpx;
	}

	.example-info {
		padding: 30rpx;
		color: #3b4144;
		background: #ffffff;
	}

	.example-body {
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		padding: 0;
		font-size: 14rpx;
		background-color: #ffffff;
		overflow-y: auto;
	}

	/* #endif */
	.example {
		padding: 0 30rpx;
	}

	.example-info {
		/* #ifndef APP-NVUE */
		display: block;
		/* #endif */
		padding: 30rpx;
		color: #3b4144;
		background-color: #ffffff;
		font-size: 30rpx;
	}

	.example-info-text {
		font-size: 28rpx;
		line-height: 36rpx;
	}


	.example-body {
		flex-direction: column;
		padding: 30rpx;
		background-color: #ffffff;
	}

	.word-btn-white {
		font-size: 18px;
		color: #FFFFFF;
	}

	.word-btn {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		height: 48px;
		margin: 15px;
		background-color: #007AFF;
	}

	.word-btn--hover {
		background-color: #4ca2ff;
	}


	

	.input-view {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		align-items: center;
		flex-direction: row;
		background-color: #e7e7e7;
		height: 30px;
		border-radius: 15px;
		padding: 0 10px;
		flex: 1;
		background-color: #f5f5f5;
	}

	.uni-drawer-info {
		background-color: #ffffff;
		padding: 30rpx;
		padding-top: 10rpx;
		color: #3b4144;
	}

	.uni-padding-wrap {
		padding: 0 15px;
		line-height: 1.8;
	}

	.input {
		flex: 1;
		padding: 0 5px;
		height: 24px;
		line-height: 24px;
		font-size: 28rpx;
		background-color: transparent;
	}

	.close {
		padding: 30rpx;
	}

	.example-body {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		padding: 0;
	}

	.draw-cotrol-btn {
		flex: 1;
	}
	
	.uni-product-list {
	    display: flex;
	    width: 100%;
	    flex-wrap: wrap;
	    flex-direction: row;
	}
	
	.uni-product {
	    padding: 20upx;
	    display: flex;
	    flex-direction: column;
	}
	
	.image-view {
	    height: 330upx;
	    width: 330upx;
	    margin: 12upx 0;
	}
	
	.uni-product-image {
	    height: 330upx;
	    width: 330upx;
	}
	
	.uni-product-title {
	    width: 300upx;
	    word-break: break-all;
	    display: -webkit-box;
	    overflow: hidden;
	    line-height: 1.5;
	    text-overflow: ellipsis;
	    -webkit-box-orient: vertical;
	    -webkit-line-clamp: 2;
	}
	
	.uni-product-price {
	    margin-top: 10upx;
	    font-size: 28upx;
	    line-height: 1.5;
	    position: relative;
	}
	
	.uni-product-price-original {
	    color: #e80080;
	}
	
	.uni-product-price-favour {
	    color: #888888;
	    text-decoration: line-through;
	    margin-left: 10upx;
	}
	
	.uni-product-tip {
	    position: absolute;
	    right: 10upx;
	    background-color: #ff3333;
	    color: #ffffff;
	    padding: 0 10upx;
	    border-radius: 5upx;
	}
	
	.flex {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
	}
	
	.uni-tab__cart-button-left {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex: 1;
		position: relative;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	
	.uni-tab__icon {
		/* #ifdef MP-WEIXIN */
		width: 60rpx;
		height: 115rpx;
		/* #endif */
		/* #ifndef MP-WEIXIN */
		width: 50rpx;
		height: 90rpx;
		/* #endif */
	}
	
	.uni-tab__dot-box {
		/* #ifndef APP-NVUE */
		display: flex;
		flex-direction: column;
		/* #endif */
		position: absolute;
		right: 4px;
		top: 5px;
		justify-content: center;
		align-items: center;
		// width: 0;
		// height: 0;
	}
	
	.uni-tab__dot {
		// width: 30rpx;
		// height: 30rpx;
		padding: 0 4px;
		line-height: 15px;
		color: #ffffff;
		text-align: center;
		font-size: 12px;
		background-color: #ff0000;
		border-radius: 15px;
	}
	
	.uni-tab__dots {
		padding: 0 4px;
		// width: auto;
		border-radius: 15px;
	}
	
	
	
</style>