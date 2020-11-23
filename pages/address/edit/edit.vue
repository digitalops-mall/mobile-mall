<template>
	<view>
		<view class="content">
			<view class="row">
				<view class="nominal">
					收件人
				</view>
				<view class="input">
					<input placeholder="请输入收件人姓名" type="text" v-model="name" />
				</view>
			</view>
			<view class="row">
				<view class="nominal">
					电话号码
				</view>
				<view class="input">
					<input placeholder="请输入收件人电话号码" type="text" v-model="tel" />
				</view>
			</view>
			<view class="row">
				<view class="nominal">
					所在地区
				</view>
				<view class="input" @tap="chooseCity">
					{{region.label}}
				</view>
				
			</view>
			<view class="row">
				<view class="nominal">
					详细地址
				</view>
				<view class="input">
					<textarea v-model="detailed" auto-height="true" placeholder="输入详细地址"></textarea>
				</view>
			</view>
			<view class="row">
				<view class="nominal">
					设置默认地址
				</view>
				<view class="input switch">
					<switch color="#f06c7a" :checked="isDefault" @change=isDefaultChange />
				</view>
			</view>
			<view class="row" v-if="editType=='edit'" @tap="del">
				<view class="del">
					删除收货地址
				</view>
			</view>
		</view>
		<view class="save" @tap="save">
			<view class="btn">
				保存地址
			</view>
		</view>
		<mpvue-city-picker :themeColor="themeColor" ref="mpvueCityPicker" :pickerValueDefault="cityPickerValue" @onCancel="onCancel" @onConfirm="onConfirm"></mpvue-city-picker>
	</view>
</template>

<script>
	import mpvueCityPicker from '@/components/mpvue-citypicker/mpvueCityPicker.vue'
	import {
		mapState,
		mapGetters
	} from 'vuex';
	
	export default {
		components: {
			mpvueCityPicker
		},
		data() {
			return {
				editType:'edit',
				id:'',
				name:'',
				tel:'',
				detailed:'',
				isDefault:false,
				cityPickerValue: [0, 0, 1],
				themeColor: '#007AFF',
				region:{label:"请点击选择地址",value:[],cityCode:""}
			};
		},
		computed:{
			// ...mapState(['hasLogin'])
			...mapGetters(['hasLogin']),
			...mapState(['userInfo','addressInfo'])
		},
		methods: {
			onCancel(e) {
				console.log(e)
			},
			chooseCity() {
				this.$refs.mpvueCityPicker.show()
			},
			onConfirm(e) {
				this.region = e;
				this.cityPickerValue = e.value;
			},
			isDefaultChange(e){
				this.isDefault = e.detail.value;
			},
			del(){
				uni.showModal({
					title: '删除提示',
					content: '你将删除这个收货地址',
					success: (res)=>{
						if (res.confirm) {
							this.$api.delAddress(this.id,(res)=>{
								if(res.code == 200) {
									this.$api.msg('删除地址成功',()=>{
										uni.navigateBack();
									})
								}
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
				
			},
			save(){
				let data={"name":this.name,"head":this.name.substr(0,1),"tel":this.tel,"address":{"region":this.region,"detailed":this.detailed},"isDefault":this.isDefault}
				if(this.editType=='edit'){
					data.id = this.id
				}
				if(!data.name){
					this.$api.msg('请输入收件人姓名')
					return ;
				}
				if(!data.tel){
					this.$api.msg('请输入收件人电话号码')
					return ;
				}
				if(!data.address.detailed){
					this.$api.msg('请输入收件人详细地址')
					return ;
				}
				if(data.address.region.value.length==0){
					this.$api.msg('请选择收件地址')
					return ;
				}
				let addrRegion = this.getAddrRegionInfo(data.address.region)
				let param = {}
				
				param.memberId = this.userInfo.memberId
				param.name = data.name
				param.phoneNumber = data.tel
				param.postCode = ''
				param.defaultStatus = data.isDefault?1:0
				param.city = addrRegion.city
				param.cityCode = addrRegion.cityCode
				param.detailAddress = data.address.detailed
				param.province = addrRegion.province
				param.provinceCode = addrRegion.provinceCode
				param.region = addrRegion.region
				param.regionCode = addrRegion.regionCode
				param.ext1 = addrRegion.ext1
				if(this.editType=='edit'){
					param.id = data.id
					this.$api.updateAddress(param,(res)=>{
						console.log(res)
						if(res.code == 200) {
							this.$api.msg('修改地址成功',()=>{
								uni.navigateBack();
							})
						}
					})
				}else {
					this.$api.addAddress(param,(res)=>{
						console.log(res)
						if(res.code == 200) {
							this.$api.msg('添加地址成功',()=>{
								uni.navigateBack();
							})
						}
					})
				}
				
			},
			getAddrRegionInfo(region) {
				let labels = region.label.split('-')
				let addrRegion = {}
				addrRegion.province = labels[0]
				addrRegion.provinceCode = region.cityCode.substring(0,2)
				addrRegion.city = labels[1]
				addrRegion.cityCode = region.cityCode.substring(0,4)
				addrRegion.region = labels[2]
				addrRegion.regionCode = region.cityCode
				addrRegion.ext1 = region.value.join('_')
				return addrRegion
			}
		},
		onLoad(e) {
			//获取传递过来的参数
			this.editType = e.type;
			if(e.type=='edit'){
				this.id = this.addressInfo.editAddressInfo.id;
				this.name = this.addressInfo.editAddressInfo.name;
				this.tel = this.addressInfo.editAddressInfo.tel;
				this.detailed = this.addressInfo.editAddressInfo.address.detailed;
				this.isDefault = this.addressInfo.editAddressInfo.isDefault;
				this.cityPickerValue = this.addressInfo.editAddressInfo.address.region.value;
				this.region = this.addressInfo.editAddressInfo.address.region;
			}
		},
		onBackPress() {
			if (this.$refs.mpvueCityPicker.showPicker) {
				this.$refs.mpvueCityPicker.pickerCancel();
				return true;
			}
		},
		onUnload() {
			if (this.$refs.mpvueCityPicker.showPicker) {
				this.$refs.mpvueCityPicker.pickerCancel()
			}
		}
	};
</script>
<style lang="scss">

.save{
		view{
			display: flex;
		}
		position: fixed;
		bottom: 0;
		width: 100%;
		height: 120upx;
		display: flex;
		justify-content: center;
		align-items: center;
		.btn{
			box-shadow: 0upx 5upx 10upx rgba(0,0,0,0.4);
			width: 70%;
			height: 80upx;
			border-radius: 80upx;
			background-color: #f06c7a;
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
	.content{
		display: flex;
		flex-wrap: wrap;
		view{
			display: flex;
		}
		.row{
			width: 94%;
			
			margin: 0 3%;
			border-top: solid 1upx #eee;
			.nominal{
				width: 30%;
				height: 120upx;
				font-weight: 200;
				font-size: 30upx;
				align-items: center;
			}
			.input{
				width: 70%;
				padding: 20upx 0;
				align-items: center;
				font-size: 30upx;
				&.switch{
					justify-content: flex-end;
				}
				.textarea{
					margin: 20upx 0;
					min-height: 120upx;
				}
			}
			.del{
				width: 100%;
				height: 100upx;
				justify-content: center;
				align-items: center;
				font-size: 36upx;
				color: #f06c7a;
				background-color: rgba(255,0,0,0.05);
				border-bottom: solid 1upx #eee;
			}
		}
	}
	
</style>
