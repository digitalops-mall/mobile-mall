/* 
 * 路由表对象：
 * 该文件挂载在Vue原型中 $mRoutesConfig
 * 作用：调用$mRouter对象的方法 传入以下对应的路由对象，详细见common目录下的router.js
 * 示例：this.$mRouter.push({route:this.$mRoutesConfig.main,query:{a:1}})
 * 注意：所有在pages目录下新建的页面都必须在"路由表"中进行声明，并且在框架的pages.json注册。
 * 
 * 配置参数项说明： 
 * name:可选配置 （路由名称）
 * path:必填配置 （路由地址）
 * requiresAuth:可选配置 （是否权限路由）
 */

export default {
	// 权限路由
	cart: {
		name: "购物车",
		path: "/pages/cart/cart",
		requiresAuth: true
	},
	user: {
		name: "用户中心",
		path: "/pages/user/user",
		requiresAuth: true
	},
	login: {
		name: "登录",
		path: "/pages/login/login"
	},
	index: {
		name: "首页",
		path: "/pages/index/index"
	},
	order: {
		name: "订单",
		path: "/pages/order/order",
		requiresAuth: true
	},
	orderList: {
		name: "订单列表",
		path: "/pages/order/list",
		requiresAuth: true
	},
	address: {
		name: "地址管理页面",
		path: "/pages/address/address",
		requiresAuth: true
	}

}
