# Pinia 5分钟入门不完全指北
## 安装
```bash
yarn add pinia
# 或者使用 npm
npm install pinia
# pnpm 也不错
pnpm install pinia
```
- 然后再在 main.js 加载组件
```JS
import { createPinia } from 'pinia'

// 注意这里是调用方法
app.use(createPinia())
```
至此 pinia 已加载完毕，推荐在 src 目录创建文件夹 store，将状态管理文件统一管理
> 为了保证足够简单，本文不探讨 Vue2, Nuxt, TypeScript 使用 pinia 的情况。请参考[中文文档](https://pinia.web3doc.top/introduction.html)
> 你都这么能折腾了看个官方文档应该问题不大吧
- **强烈推荐配合 setup-script 使用**

## 定义store
在 store 文件夹中新建文件：counter.js 
>counter.js 是官方示例，你也可以叫 globalState.js 之类的，只要文件名和 store 的用途一致即可

复制粘贴以下代码
```JS
import { defineStore } from 'pinia'

// useCounterStore 也可以叫 useUser、useCart 之类的任何东西
// 第一个参数是应用程序中 store 的 **唯一** id
export const useCounterStore = defineStore('main', {
// 推荐使用 完整类型推断的箭头函数
  state: () => {
    return {
      // 所有这些属性都将自动推断其类型
      counter: 0,
      name: 'Eduardo',
      isAdmin: true,
    }
  },
  // 官方直接明说了可以把 getters 和 computed 划等号来理解
  getters: {
    doubleCount: (state) => state.counter * 2,
    // 也可以使用 this，也可以直接调用其他的 getter
    // 总之就是把它当 computed
    doublePlusOne(): number {
      return this.doubleCount + 1
    },
  },
  // 官方也直说了 Actions 相当于组件中的 methods，非常好懂
  // pinia 去除了 mutation， 异步操作同样推荐在 action 中执行
  actions: {
	increment() {
		this.counter++
	},
    randomizeCounter() {
	  this.counter = Math.round(100 * Math.random())
	},
  },
})
```
## 使用store
```JS
// 引入 store, useCounterStore 是你定义的 export 方法
import { useCounterStore } from '../stores/counterStore'

export default {
  setup() {
  // 如果你使用了setup-script，忽略上面两行代码
	const couterStore = useCounterStore
	// 此时 couterStore 就等于你的 store.state 
	// 你可以直接在模板中使用 couterStore.counter
	// 也可以像使用 state 一样直接使用 action / getter

    // 如果你使用了setup-script，忽略下面的代码
	return { couterStore }
  }
}
```
对应的模板如下
```html
<template>
	<div>counter = {{ couterStore.counter }}</div>
	<div>doubleCounter = {{ couterStore.doubleCount }}</div>
	<button @click="counterStore.increment">increase counter</button>
</template>
```
至此就是 pinia 的基本操作了。是不是非常简单 ？
## 其他你应该知道的姿势
- [使用 store.$patch 批量修改 state](https://pinia.web3doc.top/core-concepts/state.html#%E6%94%B9%E5%8F%98%E7%8A%B6%E6%80%81)
- [使用 store.$state 直接替换整个 state](https://pinia.web3doc.top/core-concepts/state.html#%E6%9B%BF%E6%8D%A2state)
- [使用 store.$subscribe 订阅状态和查看变化](https://pinia.web3doc.top/core-concepts/state.html#%E8%AE%A2%E9%98%85%E7%8A%B6%E6%80%81)
- [向 getter 传递参数](https://pinia.web3doc.top/core-concepts/getters.html#%E5%B0%86%E5%8F%82%E6%95%B0%E4%BC%A0%E9%80%92%E7%BB%99-getter)
- [使用其他 store 的getter](https://pinia.web3doc.top/core-concepts/getters.html#%E8%AE%BF%E9%97%AE%E5%85%B6%E4%BB%96-store-%E7%9A%84getter)
- [使用 store.$onAction 订阅 action](https://pinia.web3doc.top/core-concepts/actions.html#%E8%AE%A2%E9%98%85-actions)
