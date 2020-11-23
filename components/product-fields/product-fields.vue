<template>
	<view>
		<view v-if="mode === 'style'" class="product-card__thumbnailimage">
			<view class="product-card__thumbnailimage-box">
				<image class="product-card__thumbnailimage-image" :src="thumbnail" mode="aspectFill" />
			</view>
			<view v-if="title" class="product-card__thumbnailimage-title"><text class="product-card__thumbnailimage-title-text">{{ title }}</text></view>
		</view>
		<view v-if="mode === 'title'" class="product-card__title">
			<view class="product-card__title-header">
				<image class="product-card__title-header-image" :src="thumbnail" mode="scaleToFill" />
			</view>
			<view class="product-card__title-content">
				<text class="product-card__title-content-title">{{ title }}</text>
				<view class="product-card__title-moreicon-image-view" v-if="moreicon && !readOnly">
					<image class="product-card__title-moreicon-image" :src="moreicon" mode="scaleToFill" @click="onClick()"/>
				</view>
				<text v-if="extra" class="product-card__header-extra-text">{{ extra }}</text>
			</view>
		</view>
		<!-- 标题 -->
		<view v-if="mode === 'basic' && title" class="product-card__header">
			<view v-if="thumbnail" class="product-card__header-extra-img-view">
				<image :src="thumbnail" class="product-card__header-extra-img" />
			</view>
			<text class="product-card__header-title-text">{{ title }}</text>
			<view class="product-card__header-field-view">
				<text class="product-card__header-field-text">{{pfieldName}}</text>
			</view>
			<view class="product-card__title-moreicon-image-view" v-if="moreicon && !readOnly">
				<image class="product-card__title-moreicon-image" :src="moreicon" mode="scaleToFill" @click="onClick()"/>
			</view>
			<text v-if="extra" class="product-card__header-extra-text">{{ extra }}</text>
		</view>
		<view v-if="mode === 'title'" class="product-card__title">
			<view class="product-card__title-header">
				<image class="product-card__title-header-image" :src="thumbnail" mode="scaleToFill" />
			</view>
			<view class="product-card__title-content">
				<text class="product-card__title-content-title">{{ title }}</text>
				<view class="product-card__title-moreicon-image-view" v-if="moreicon && !readOnly">
					<image class="product-card__title-moreicon-image" :src="moreicon" mode="scaleToFill" @click="onClick()"/>
				</view>
				<text v-if="extra" class="product-card__header-extra-text">{{ extra }}</text>
			</view>
		</view>
		<product-popup :ref="pFieldType" type="bottom" title="配送至" v-if="pFieldType === 'location'">
			<view class="product-card__moreinfo">
				<uni-list scrollY="true">
				    <uni-list-item title="广东省广州市天河区桥源大街47号亚桥楼" :show-arrow="false" showExtraIcon="true" :extraIcon="{color:'#8f8f94',size:15,type:'location'}"></uni-list-item>
				    <uni-list-item title="广东广州市黄埔区城区科学大道绿地中央广场C3栋" :show-arrow="false" showExtraIcon="true" :extraIcon="{color:'#8f8f94',size:15,type:'location'}"></uni-list-item>
				    <uni-list-item title="广东广州市黄埔区城区科学大道绿地中央广场C3栋" :show-arrow="false" showExtraIcon="true" :extraIcon="{color:'#8f8f94',size:15,type:'location'}"></uni-list-item>
				</uni-list>
				<button type="warn" style="line-height: normal;font-size: 14rpx;margin-top: 10rpx;">添加其他地址</button>
			</view>
		</product-popup>
		<product-popup :ref="pFieldType" type="bottom" title="已选" v-if="pFieldType === 'choose'">
			<view class="product-card__choose">
				<uni-tag v-for="(item,index) in moreDatas" :key="index" :text="item.name" ></uni-tag>
			</view>
		</product-popup>
	</view>
</template>

<script>
	import productPopup from "@/components/product-popup/product-popup.vue"
	import uniList from "@/components/uni-list/uni-list.vue"
	import uniListItem from "@/components/uni-list-item/uni-list-item.vue"
	import uniTag from "@/components/uni-tag/uni-tag.vue"
	
	export default {
		name: 'ProductFields',
		components:{
			productPopup,
			uniList,
			uniListItem,
			uniTag
		},
		props: {
			title: {
				type: String,
				default: ''
			}, // 标题
			pFieldType: {
				type:String,
				default:'location'
			},//产品属性类型：优惠 coupon，已选 choose，送至 location
			extra: {
				type: String,
				default: ''
			}, // 扩展信息
			note: {
				type: String,
				default: ''
			}, // Tips
			thumbnail: {
				type: String,
				default: ''
			}, // 缩略图
			moreicon: {
				type: String,
				default: '../../static/icons/ellipsis.png'
			}, //更多选项图标
			// 卡片模式 ， 可选值 basic：基础卡片 ；style ：图文卡片 ； title ：标题卡片
			mode: {
				type: String,
				default: 'basic'
			},
			isFull: {
				// 内容区域是否通栏
				type: Boolean,
				default: false
			},
			isShadow: {
				// 是否开启阴影
				type: Boolean,
				default: false
			},
			pfieldCode: {
				type: String,
				default: ''
			},//属性键值
			pfieldName:{
				type:String,
				default:''
			},//显示到页面的名称
			getMoreApi: {
				type:String,
				default:''
			},//获取更多信息的API
			readOnly: {
				//是否只读
				type: Boolean,
				default: false
			},
			getMoreFunc: {
				type: Function
			},
			getMoreArrays: {
				type: Array
			}
		},
		data() {
			return {
				moreDatas: []
			}
		},
		mounted() {
			this.getMoreData()
		},
		methods: {
			onClick() {
				console.log('product-fields.vue')
				if(this.$refs[this.pFieldType]) {
					this.$refs[this.pFieldType].open()
				}else {
					this.$api.msg('没有更多了')
				}
				this.$emit('click')
			},
			getMoreData() {
				console.log('getMoreData')
				if(this.getMoreArrays) {
					this.$data.moreDatas =  this.getMoreArrays;
				}
			}
			
		}
	}
</script>

<style lang="scss" scoped>
	.product-card {
		/* #ifndef APP-NVUE */
		display: flex;
		flex: 1;
		box-shadow: 0 0 0 rgba(0, 0, 0, 0);
		/* #endif */
		margin-bottom: 5rpx;
		background-color: $uni-bg-color;
		position: relative;
		flex-direction: column;
		border-color: $uni-border-color;
		border-style: solid;
		border-width: 1px;
		border-radius: 3px;
		overflow: hidden;

	}

	.product-card__thumbnailimage {
		position: relative;
		flex-direction: column;
		justify-content: center;
		height: 150px;
		overflow: hidden;
	}

	.product-card__thumbnailimage-box {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex: 1;
		flex-direction: row;
		overflow: hidden;
	}

	.product-card__thumbnailimage-image {
		flex: 1;
	}

	.product-card__thumbnailimage-title {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		flex-direction: row;
		padding: $uni-spacing-col-base $uni-spacing-col-lg;
		background-color: $uni-bg-color-mask;
	}

	.product-card__thumbnailimage-title-text {
		flex: 1;
		font-size: $uni-font-size-base;
		color: #fff;
		font-weight: bold;
	}

	.product-card__title {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		padding: 10px;
		border-bottom-color: #F5F5F5;
		border-bottom-style: solid;
		border-bottom-width: 1px;
	}

	.product-card__title-header {
		width: 40px;
		height: 40px;
		overflow: hidden;
		border-radius: 5px;
	}

	.product-card__title-header-image {
		width: 40px;
		height: 40px;
	}

	.product-card__title-content {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		justify-content: center;
		padding-left: 10px;
		height: 40px;
		overflow: hidden;
		


	}

	.product-card__title-content-title {
		font-size: $uni-font-size-base;
		line-height: 22px;
		lines: 1;
		font-weight: bold;
	}

	.product-card__title-content-extra {
		font-size: 26rpx;
		line-height: 35rpx;
		color: #999;
	}

	.product-card__header {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		position: relative;
		flex-direction: row;
		padding: $uni-spacing-col-lg;
		align-items: center;
		border-bottom-color: $uni-border-color;
		border-bottom-style: solid;
		border-bottom-width: 1px;
	}

	.product-card__header-title {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		margin-right: $uni-spacing-col-base;
		justify-content: flex-start;
		align-items: center;
	}

	.product-card__header-title-text {
		font-size: $uni-font-size-lg;
		//flex: 1;
		/* #ifndef APP-NVUE */
		white-space: nowrap;
		/* #endif */
		/* #ifdef APP-NVUE */
		lines: 1;
		/* #endif */
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: bold;
		width: 100rpx;
	}
	.product-card__header-extra-img {
		height: $uni-img-size-sm;
		width: $uni-img-size-sm;
		margin-right: $uni-spacing-col-base;
	}
	
	.product-card__title-moreicon-image-view {
		margin-left: auto;
	}
	.product-card__title-moreicon-image {
		width: 40px;
		height: 40px;
	}

	.product-card__header-field-view {
		display: flex;
	}
	.product-card__header-field-text {
		flex: 1;
		margin-left: $uni-spacing-col-base;
		font-size: $uni-font-size-base;
		text-align: right;
	}
	.product-card__header-extra-text {
		flex: 1;
		margin-left: $uni-spacing-col-base;
		font-size: $uni-font-size-base;
		text-align: right;
		color: $uni-text-color-grey;
	}

	.product-card__content {
		color: $uni-text-color;
	}

	.product-card__content--pd {
		padding: $uni-spacing-col-lg;
	}

	.product-card__content-extra {
		font-size: $uni-font-size-base;
		padding-bottom: 10px;
		color: #999;
	}

	.product-card__footer {
		justify-content: space-between;
		padding: 10px;
		border-top-color: $uni-border-color;
		border-top-style: solid;
		border-top-width: 1px;
	}

	.product-card__footer-text {
		color: $uni-text-color-grey;
		font-size: $uni-font-size-base;
	}

	.product-card--shadow {
		border-color: $uni-border-color;
		border-style: solid;
		border-width: 1px;
		/* #ifndef APP-NVUE */
		box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.2);
		/* #endif */
	}

	.product-card--full {
		margin: 0;
		border-radius: 0;
	}
	
	.product-card__moreinfo {
		background-color: #FFFFFF;
		border-radius: 10rpx;
	}
	.product-card__choose {
		background-color: #FFFFFF;
		border-radius: 10rpx;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}
	
	/deep/ .uni-list-item__content-title {
		font-size: 12rpx;
	}
	/deep/ .uni-list-item__container {
		padding: 6rpx 8rpx;
	}
</style>
