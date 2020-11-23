<template>
	<view>
		<view class="uni-padding-wrap">
			<view class="page-section swiper">
				<view class="page-section-spacing">
					<swiper class="swiper" :indicator-dots="indicatorDots" :autoplay="autoplay" :interval="interval" :duration="duration">
						<swiper-item v-for="(item,index) in imgList" :key="index">
							<view class="image-view">
								<image class="uni-product-image" :src="item.src"></image>
							</view>
						</swiper-item>
					</swiper>
				</view>
			</view>
		</view>
		<view class="price">
			<text style="color: #DD524D;flex: 1;" >￥{{productDetail.favourPrice}}</text>
			<view class="product-detail-share" @click="togglePopup('bottom', 'share')">
				<image class="product-detail-share-image" mode="scaleToFill" src="../../static/icons/share.png"></image>
			</view>
		</view>
		<text >{{productDetail.title}}￥{{productDetail.originalPrice}}</text>
		<product-card title="自定义"  thumbnail="https://img-cdn-qiniu.dcloud.net.cn/new-page/uni.png" extra="额外信息" note="Tips">
			<product-fields title="优惠"  :readOnly="true" extra="满1000减200" pFieldType="choose"></product-fields>
			<product-fields title="已选"  :readOnly="true" pfieldCode="1" :pfieldName="productDetail.unit" pFieldType="choose" :getMoreArrays="[{code:1,name:productDetail.unit}]"></product-fields>
			<product-fields title="送至"  pFieldType="location"></product-fields>
		</product-card>
		<uni-comment></uni-comment>
		<uni-goods-nav :fill="true"  :options="options" :button-group="buttonGroup"  @click="onClick" @buttonClick="buttonClick" ></uni-goods-nav>
		<!-- 底部分享弹窗 -->
		<uni-popup ref="showshare" :type="type" >
			<view class="uni-share">
				<text class="uni-share-title">分享到</text>
				<view class="uni-share-content">
					<view v-for="(item, index) in bottomData" :key="index" class="uni-share-content-box">
						<view class="uni-share-content-image">
							<image :src="item.icon" class="content-image" mode="widthFix" />
						</view>
						<text class="uni-share-content-text">{{ item.text }}</text>
					</view>
				</view>
				<text class="uni-share-btn" @click="cancel('share')">取消分享</text>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import uniGoodsNav from '@/components/uni-goods-nav/uni-goods-nav.vue'
	import uniTag from "@/components/uni-tag/uni-tag.vue"
	import uniCard from '@/components/uni-card/uni-card.vue'
	import productCard from '@/components/product-card/product-card.vue'
	import productFields from '@/components/product-fields/product-fields.vue'
	import productField from '@/components/product-fields/product-field.vue'
	import uniComment from '@/components/uni-comment/uni-comment.vue'
	import uniPopup from "@/components/uni-popup/uni-popup.vue"
	import map from "lodash/fp/map"
	import flow from "lodash/fp/flow"
	import reduce from "lodash/fp/reduce"
	import {
			mapState,
			mapGetters
		} from 'vuex';
	import moment from 'moment'
	
	export default {
		components: {
			uniGoodsNav,
			uniTag,
			uniCard,
			productCard,
			productFields,
			productField,
			uniComment,
			uniPopup
		},
		data () {
		      return {
		        options: [{
		          icon: 'https://img-cdn-qiniu.dcloud.net.cn/uniapp/uni-ui/goodsnav/kefu.png',
		          text: '客服'
		        }, /* {
		          icon: 'https://img-cdn-qiniu.dcloud.net.cn/uniapp/uni-ui/goodsnav/dianpu.png',
		          text: '店铺'
		        }, */ {
		          icon: 'https://img-cdn-qiniu.dcloud.net.cn/uniapp/uni-ui/goodsnav/carts.png',
		          text: '购物车',
				  info: 0
		        }],
		        buttonGroup: [{
		          text: '加入购物车',
		          backgroundColor: '#ff0000',
		          color: '#fff'
		        },
		        {
		          text: '立即购买',
		          backgroundColor: '#ffa200',
		          color: '#fff'
		        }
		        ],
				background: ['color1', 'color2', 'color3'],
				indicatorDots: true,
				autoplay: true,
				interval: 2000,
				duration: 500,
				type: 'bottom',
				imgList: [],
				productDetail: {},
				productDetailEx:{},
				bottomData: [{
						text: '微信',
						icon: 'https://img-cdn-qiniu.dcloud.net.cn/uni-ui/grid-2.png',
						name: 'wx'
					},
					{
						text: '支付宝',
						icon: 'https://img-cdn-qiniu.dcloud.net.cn/uni-ui/grid-8.png',
						name: 'wx'
					},
					{
						text: 'QQ',
						icon: 'https://img-cdn-qiniu.dcloud.net.cn/uni-ui/gird-3.png',
						name: 'qq'
					},
					{
						text: '新浪',
						icon: 'https://img-cdn-qiniu.dcloud.net.cn/uni-ui/grid-1.png',
						name: 'sina'
					},
					{
						text: '百度',
						icon: 'https://img-cdn-qiniu.dcloud.net.cn/uni-ui/grid-7.png',
						name: 'copy'
					},
					{
						text: '其他',
						icon: 'https://img-cdn-qiniu.dcloud.net.cn/uni-ui/grid-5.png',
						name: 'more'
					}
				]
		      }
		    },
			async onLoad(options){
				console.log('是否登录: '+this.hasLogin)
				const productDetail = JSON.parse(decodeURIComponent(options.item));
				console.log('productDetail:',productDetail)
				this.imgList = flow(
						map(x => {
							let y = {}
							y.src = x
							return y
						})
					)(productDetail.albumPics.split(','))
				this.productDetail = productDetail
				this.options[1].info = this.getCartProductCount
				let that = this
				this.$api.getProductDetailEx({
					  productId: this.productDetail.productId
				  },(res)=>{
					  console.log('商品详情扩展信息：',res.data)
					  that.productDetailEx = res.data
				})
				// this.productDetailEx
			},
			computed:{
				// ...mapState(['hasLogin'])
				...mapState(['hasLogin','userInfo','cartInfo']),
				// ...mapGetters(['hasLogin'])
				getCartProductCount() {
					if(this.cartInfo.length > 0) {
						return this.cartInfo.reduce((accumulator, currentValue)=>{
							return accumulator+currentValue.quantity
						},0)
					}
					
				}
			},
		    methods: {
		      onClick (e) {
				  console.log(e)
				if(e.index == 1) { //index 0: 客服，1：购物车
					this.$mUtils.goto(this.$mRoutesConfig.cart)
				}
		      },
		      buttonClick (e) {
		        console.log(e)
		        this.options[1].info++
				if(e.index == 0) {// index 0：添加购物车，1：立即购买
					let tmpCartInfo = this.getProductCartInfo()
					console.log("add cartInfo: "+JSON.stringify(tmpCartInfo))
					this.cartInfo.push(tmpCartInfo)
					this.$mUtils.addToCart(this.cartInfo)
				}else if(e.index == 1) {
					let tmpCartInfo = this.getProductCartInfo()
					console.log("add order: "+JSON.stringify(tmpCartInfo))
					if(tmpCartInfo.productAttr) {
						tmpCartInfo.attr_val = reduce.convert({ 'cap': false })((res,obj,index)=>{
							res += ' '+obj.value+' ';
							return res
						},"")(JSON.parse(tmpCartInfo.productAttr))
					}
					tmpCartInfo.checked = true;
					let toOrderCartInfolist = [];
					toOrderCartInfolist.push(tmpCartInfo)
					this.$store.commit("SET_ORDERCARTINFO",toOrderCartInfolist)
					this.$mUtils.goto(this.$mRoutesConfig.order)
				}
		      },
			  togglePopup(type, open) {
			  	this.type = type
			  	this.$nextTick(() => {
			  		this.$refs['show' + open].open()
			  	})
			  },
			  getProductCartInfo(){
			  	let y = {}
			  	let now = moment().format()
			  	y.createDate = now
			  	y.deleteStatus = 0
			  	// y.id = 
			  	y.memberId = this.userInfo.memberId
			  	y.memberNickname = this.userInfo.nickName
			  	y.modifyDate = now
			  	y.price = this.productDetail.favourPrice
			  	y.productAttr = JSON.stringify(this.productDetailEx.productAttributes)
			  	y.productBrand = this.productDetail.brandId
			  	y.productCategoryId = this.productDetail.productCategoryId
			  	y.productId = this.productDetail.productId
			  	y.productName = this.productDetail.name
			  	y.productPic = this.productDetail.image
			  	y.productSn = this.productDetail.productSn
			  	y.productSubTitle = this.productDetail.title
			  	y.quantity = 1
			  	if(this.productDetailEx.pmsSkuStock) {
			  		y.productSkuCode = this.productDetailEx.pmsSkuStock.skuCode
			  		y.productSkuId = this.productDetailEx.pmsSkuStock.id
			  		y.sp1 = this.productDetailEx.pmsSkuStock.sp1
			  		y.sp2 = this.productDetailEx.pmsSkuStock.sp2
			  		y.sp3 = this.productDetailEx.pmsSkuStock.sp3
			  	}
				console.log("y:",y)
			  	return y
			  },
			  cancel(type) {
			  	this.$refs['show' + type].close()
			  }
		    }
	}
</script>

<style >
	
	.price{
		display: flex;
		flex-direction: row;
	}
	
	.swiper{
		height: 660upx;
	}
	
	.image-view {
	    height: 660upx ;
	    width: 660upx ;
	    margin: 12upx 0;
	}
	.uni-product-image {
	    height: 660upx ;
	    width: 660upx ;
	}
	
	/* 底部分享 */
	.uni-share {
		/* #ifndef APP-NVUE */
		display: flex;
		flex-direction: column;
		/* #endif */
		background-color: #fff;
	}
	
	.uni-share-title {
		line-height: 60rpx;
		font-size: 24rpx;
		padding: 15rpx 0;
		text-align: center;
	}
	
	.uni-share-content {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		padding: 15px;
	}
	
	.uni-share-content-box {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		align-items: center;
		width: 200rpx;
	}
	
	.uni-share-content-image {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: center;
		align-items: center;
		width: 60rpx;
		height: 60rpx;
		overflow: hidden;
		border-radius: 10rpx;
	}
	
	.product-detail-share {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		flex-basis: 80rpx;
	}
	
	.product-detail-share-image {
		width: 40rpx;
		height: 40rpx;
	}
	
	.content-image {
		width: 60rpx;
		height: 60rpx;
	}
	
	.uni-share-content-text {
		font-size: 26rpx;
		color: #333;
		padding-top: 5px;
		padding-bottom: 10px;
	}
	
	.uni-share-btn {
		height: 90rpx;
		line-height: 90rpx;
		font-size: 14px;
		border-top-color: #f5f5f5;
		border-top-width: 1px;
		border-top-style: solid;
		text-align: center;
		color: #666;
	}
</style>
