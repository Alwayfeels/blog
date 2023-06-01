# Key-Value的复用方式

---

<aside>
💡 TL;DR: 本文讨论前端工程中，key-value配置的缓存和封装。以及如何通过工程设计方案最大程度的增加 key-value 键值对的可拓展性，简约性，可复用性。

</aside>

## 🎬 业务场景

在前端工程的许多地方存在 key-value 转换：以下是一些常见例子

```html
<el-option label='typeA' value='1'>
<el-option label='typeB' value='2'>

<div>{{ data.isActive === 0 ? '否' : '是' }}</div>

<div v-if="status === 0">未生效</div>
<div v-else-if="status === 1">生效中</div>
<div v-else-if="status === 2">已过期</div>
<div v-else>--</div>
```

以上的代码都是 key-value 转换的例子，但是这些代码的可复用性，可拓展性都不佳。每次增加或删除一个键值对，都需要在各个地方修改。

统一管理枚举能减少冗余代码，提升开发效率，减少出错概率。是前端工程化中必要的步骤

## 📂 解决方案

对于不用场景下的 key-value 值使用，存在一些不同的方案。

### 1. 后端转换

部分展示类的内容使用此种解决方案，后端返回数据中同时包含 key 和 value，例如

```jsx
{
	status: 1,
	statusStr: '已完成',
	roleType: 0,
	roleTypeStr: '管理员',
	isActive: 0,
	isActiveStr: '未激活'
}
```

- 优点
    - 后端处理映射，保证了所有的key-value和后端数据库一致
    - 在需要变动时，只需要修改后端配置文件即可，无需前端重新发布
    - 对于前端来说很方便，随取随用
- 缺点
    - 因为数据中只有当前key-value的值，而没有全部的，只能用于展示数据
    - 需要返回双倍的字段，数量一多会难以维护
    - 返回数据会向用户暴露key-value的映射关系，可能造成一些安全问题
    - 如果在项目中存在需要使用所有的key-value，那此处的转换其实是多余的。如果使用的key-value是前端单独维护的，那么甚至有前后端不统一的风险（比如后端改了前端没改）
- 总结
    
    后端转换在一些仅展示性的场景是可行的，但是限制非常多。
    

### 2. 接口提供

对于同时存取，或者带状态的key-value通常会提供映射接口

```jsx
const res = await getUserTypeOptions()
if (res.code === 200) {
	this.userTypeOptions = res.data.map(e => {  // [{ code: 1, name: '管理员' }, ...]
	  return {
			label: e.name,
			value: e.code
		}
	})
}
```

- 优点
    - 能够带参数存取，对一些权限类，实时数据类的key-value存取，不可避免使用接口
    - 保证了所有的key-value和后端数据库一致
    - 在需要变动时，只需要修改后端配置文件即可，无需前端重新发布
    - 前端可以同时在展示和修改中使用
- 缺点
    - 每次需要调用接口，增加网络消耗。若接口错误会直接阻塞业务
    - 前端需要额外处理请求和转换这些 key-value
    - 在存在大量的下拉列表筛选的情况下，可能会有非常多的接口请求（可以通过封装统一的映射查询接口解决）
    - 可能存在不同组件相同接口的重复调用（可以通过缓存解决）
    - 不同的接口可能由不同的后端开发，提供的key-value名称可能不一致（ `code` `status` `name` `value` `key` ），需要单独处理（可通过后端规范解决）
- 总结
    
    接口提供 key-value 是通用的方法，存在的一些问题也有对应的解决方案。但是目前大部分解决方案没有具体的规范和通用的实现。导致key-value接口依然存在大量可优化的问题。
    

### 3. 前端维护

将 key-value 完全存储在前端，对于一些不常变动的数据，前端维护是一种开销最小的方案

```jsx
// 存在组件中
data() {
	return {
		statusOptions: [
			{ label: '启用', value: 1 },
			{ label: '禁用', value: 0 },
		]
	}
}

// 存在全局变量中
Vue.prototype.$enums.status = {
	0: '禁用',
	1: '启用',
}

<el-option 
	v-for="(key, index) in Object.keys($enums.status)"
	:key='index'
	:label='$enums.status[key]'
	:value='key'>
</el-option>
```

- 优点
    - 无需接口，降低代码复杂度，不依赖网络请求
    - 全局使用，依赖单一，静态查找方便（需要统一存储）
    - 代码提示友好（需要配置插件）
    - 易于封装，使用JSON格式存储，使用统一的转换函数即可（需要封装）
    - 使用范围广，可以同时在展示和修改中使用
- 缺点
    - 可变性差，只适合长期不变的数据
    - 无法保证key-value和后端数据库一致（可能存在前后端数据不一致的隐患）
    - 需要临时变更key-value时，需要前端发版
    - 对于某些带状态过滤的key-value，过滤逻辑同样需要前端维护

## 🚀 最佳实践

### 使用后端转换：

对于仅展示，或是提供有详情查询接口的一些常见 `Table` 数据，可以使用后端转换方式，但不是必须的。

### 使用接口查询：

大部分动态和即时性较强的key-value应该主要使用接口查询。

- 利用**浏览器缓存机制**，即http 304 状态码缓存不变的接口数据
- 后端应规范所有的key-value接口入参出参格式，方便统一处理
- 前端应该存在统一的loading封装，在UI侧提示用户该key-value还在加载中（例如el-select中的remote-loading）
- 后端最好能提供一个合成接口，根据入参一次性查询所有需要的key-value值，避免重复请求
    - 💡 但是若使用了304缓存机制，提供该接口反而会不利于调用缓存中的数据，容易存在重复请求浪费资源

### 使用前端存储

若可预见变动较少的key-value，前端维护能够减少开发成本，提升效率

- 所有的 key-value 应该统一使用 `JSON` 格式存储在指定的位置，并提供全局转换方法，和全局变量访问
- 所有的前端维护的 key-value 应该支持代码提示，增加开发效率

## 🔑 关键技术

### http 304缓存方案介绍

- 该方案不需要前端额外维护存储数据代码，符合业界标准，易于维护，并且速度很快。
- **Cache-Control / Expires**
    - http/1.0 使用 Expires 字段，http/1.1+ 使用 Cache-Control 字段（Expires 仍然有效）
- 常见Cache-Control的值（所有值见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cache-Control)）
    
    
    | 常见Cache-Control值 | 含义 |
    | --- | --- |
    | no-cache | 不用本地缓存，正常的向服务端请求，服务端怎么处理我们不用管 |
    | no-store | 简单粗暴，直接从服务端拉取缓存 |
    | private | 只能允许最终用户做缓存，最终用户即电脑、手机等等 |
    | public | 允许中间路由或中间代理做缓存 |
    | max-age | 设置缓存的最大过期时间 |
    | must-revalidate | 一旦资源过期（比如已经超过max-age），在成功向原始服务器验证之前，缓存不能用该资源响应后续请求。 |
    | … | … |
- 强缓存和协商缓存
    - 强缓存不发送请求，浏览器端直接调用缓存资源（from cache）
    - 协商缓存不查询数据，服务端比对Hash值或token后，若数据相同返回304，不同查询新数据返回200
    - 缓存失效规则
        - 跳转链接，前进后退是，强缓存和协商缓存都有效
        - F5 刷新时，强缓存失效，协商缓存有效
        - ctrl+F5 强制刷新时，强缓存和协商缓存都失效

## 📚 阅读清单

- [从304浅谈http缓存](https://juejin.cn/post/7001758820259069988)
- [MDN: Cache-Control](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cache-Control)