<template>
	<view :class="{ 'product-card--full': isFull === true || isFull === 'true', 'product-card--shadow': isShadow === true || isShadow === 'true' }"
	 class="product-card" @click="onClick">
		
		<slot></slot>
		<!-- 内容 -->
		<!-- <view class="product-card__content product-card__content--pd">
			<view v-if="mode === 'style' && extra" class=""><text class="product-card__content-extra">{{ extra }}</text></view>
			<slot />
		</view> -->
		<!-- 底部 -->
		<!-- <view v-if="note" class="product-card__footer"> -->
			<!-- <slot name="footer">
				<text class="product-card__footer-text"></text>
			</slot> -->
		<!-- </view> -->
	</view>
</template>

<script>
	/**
	 * Card 卡片
	 * @description 卡片视图组件
	 * @tutorial https://ext.dcloud.net.cn/plugin?id=22
	 * @property {String} title 标题文字
	 * @property {String} extra 标题额外信息
	 * @property {String} note 标题左侧缩略图
	 * @property {String} thumbnail 底部信息
	 * @property {String} mode = [basic|style|title] 卡片模式
	 * 	@value basic 基础卡片
	 * 	@value style 图文卡片
	 * 	@value title 标题卡片
	 * @property {Boolean} isFull = [true | false] 卡片内容是否通栏，true 时将去除padding值
	 * @property {Boolean} isShadow = [true | false] 卡片内容是否开启阴影
	 * @event {Function} click 点击 Card 触发事件
	 * @example <product-card title="标题文字" thumbnail="https://img-cdn-qiniu.dcloud.net.cn/new-page/uni.png" extra="额外信息" note="Tips">内容主体，可自定义内容及样式</product-card>
	 */
	export default {
		name: 'ProductCard',
		props: {
			title: {
				type: String,
				default: ''
			}, // 标题
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
			}
		},
		methods: {
			onClick() {
				this.$emit('click')
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
		margin-top: 5rpx;
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
		flex: 1;
		/* #ifndef APP-NVUE */
		white-space: nowrap;
		/* #endif */
		/* #ifdef APP-NVUE */
		lines: 1;
		/* #endif */
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.product-card__header-extra-img {
		height: $uni-img-size-sm;
		width: $uni-img-size-sm;
		margin-right: $uni-spacing-col-base;
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
</style>
