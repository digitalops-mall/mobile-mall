const CONFIG = {
        //开发环境配置
        development: {
                loginTitleTxt: "欢迎使用中付便民", // 登录页标题
                copyrightTxt: "中付便民v1.0", // 版本信息
                assetsPath: "http://liuup.com/img", // 静态资源路径
                baseUrl: "http://mall-portal-api-local.oliver.com",
				opspayUrl: "http://192.168.1.51:8091",
				wxApiUrl: "http://192.168.1.51:8088",
                tokenKey: "WECHAT_TRADE", // 登录标识
                testOpenId: "oEjRxwy7jL9PgG0kWeb4VcDTZEas", // 小程序测试openId
				appid: "wxefcd61158d190214", // 小程序app id
                forcedLogin: false, // touristMode游客模式下APP是否强制用户登录 场景：当用户进入登录页面后无法后退。
                touristMode: true, // APP是否开启游客模式， 游客模式true开启：APP打开后可以进入首页和无权限的页面，游客模式false关闭：APP打开后首先需要登录才能进入， 此时forcedLogin配置项失效。
        },
		//uat环境配置
        uat: {
                loginTitleTxt: "欢迎使用中付便民", // 登录页标题
                copyrightTxt: "中付便民v1.0", // 版本信息
                assetsPath: "http://liuup.com/img", // 静态资源路径
                baseUrl: "http://mall-portal-web.oliver.com:81/uat",
				opspayUrl: "http://192.168.1.249:8091",
				wxApiUrl: "http://192.168.1.51:8088",
                tokenKey: "WECHAT_TRADE", // 登录标识
                testOpenId: "oEjRxwy7jL9PgG0kWeb4VcDTZEas", // 小程序测试openId
				appid: "wxefcd61158d190214", // 小程序app id
                forcedLogin: false, // touristMode游客模式下APP是否强制用户登录 场景：当用户进入登录页面后无法后退。
                touristMode: true, // APP是否开启游客模式， 游客模式true开启：APP打开后可以进入首页和无权限的页面，游客模式false关闭：APP打开后首先需要登录才能进入， 此时forcedLogin配置项失效。
        },
        //生产环境配置
        production: {
                loginTitleTxt: "欢迎使用中付便民", // 登录页标题
                copyrightTxt: "中付便民v1.0", // 版本信息
                assetsPath: "/static/img", // 静态资源路径
                baseUrl: "https://portal-api.mall.huozaigz.com",
				opspayUrl: "https://pay-shop.mall.huozaigz.com",
				wxApiUrl: "https://oliver.mall.huozaigz.com/wx",
                tokenKey: "WECHAT_TRADE", // 登录标识
                // testOpenId: "oEjRxwy7jL9PgG0kWeb4VcDTZEas", // 小程序测试openId
				appid: "wxefcd61158d190214", // 小程序app id
                forcedLogin: false, // touristMode游客模式下APP是否强制用户登录 场景：当用户进入登录页面后无法后退。
                touristMode: true, // APP是否开启游客模式， 游客模式true开启：APP打开后可以进入首页和无权限的页面，游客模式false关闭：APP打开后首先需要登录才能进入， 此时forcedLogin配置项失效。
        }

}
export default CONFIG[(process && process.env.NODE_ENV)?process.env.NODE_ENV:'production'];
