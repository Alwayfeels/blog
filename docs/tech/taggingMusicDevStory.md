# TaggingMusic 开发日志

## TaggingMusic 中 Tags 数据存储方案对比

### 目标
- 【core】同一首歌标记 tags 以后，能在不同歌单中展示和修改同一首歌的 tags 数据
- 尽可能小的存储 tags 信息，不存储无 tags 的歌曲
- 尽可能加快首屏速度
- 尽可能保证数据来源的唯一性，减少数据同步成本

### 方案一 (当前使用)
- table 数据：songlist 中的 songItem 不含 tags
- 新建 taggedSongs 变量保存含 tags 属性的 songItem 
- tagInput 初始化，根据 songid 在 taggedSongs 查找 tags，使得每一个表单行在渲染时，都能从 taggedSongs 中取得 tags 数据
- tagList 使用计算属性从 taggedSongs 中自动计算
- indexedDB 中分别保存 songList 和 taggedSongs，分离歌单和标签歌曲 
- globalState 和 globalData 中都保存了 songlist, taggedSongs 数据

#### 设计初衷
区分 globalState 和 globalData
- globalData 中包含所有需要增删查改 indexedDB 数据和方法。
- 【core】globalState 表示整个应用的 ViewModel 的映射，table 数据，loading 状态，player 状态等 view 信息都与 globalState 中的数据同步，实现完整的 ViewModel

#### 缺点
- 由于早期实现以数据全部本地保存为目标，导致部分可以使用 Store Api 的功能重叠。
- table 中展示了 tags 但是 tableData 数据不含 tags，tagInput 组件需要从 taggedSongs 中查找数据。
- globalData 和 globalState 都存有 taggedSongs 和 songlist。数据来源失去唯一性，增加了数据同步成本。
- taggedSongs 和 songList 的数据结构过于相似，（taggedSongs 只多一个 tags 属性其余一致）

### 方案二（废弃）
- table 数据：songList 中的 songItem 包含 tags 数据
- 新建 taggedSongs 变量保存含 tags 属性的 songItem ，在每次初始化 songList 时，从 taggedSongs 查询每首歌的 tags

#### 缺点
- 【core】随着 taggedSongs 增多，每次都需要比对 songList 和 taggedSongs，初始化 songlist 的时间增加（每次 taggedSongs 变化后，切换 songList 都需要重新初始化，无法缓存）

### 方案三（废弃）

> 这个方案可能更适用于 React 这类函数式框架，而非 Vue

遵循下面规则尝试重新设计 TaggingMusic 的状态管理
> [大型应用程序中的大多数状态管理都可以通过遵循状态不变性原则和纯函数式方法来更好地实现。](https://www.epineda.net/javascript-programming-paradigms/)

#### 状态不变性原则
- 例如 Array.slice 比 Array.splice 能更体现不变性原则，因为 slice 不会改变原数组，而是创建新数组。
- 同理，Array.map 也比 Array.forEach 要更能体现数据不变性


#### 纯函数式方法

#### 依赖注入和控制转移
也叫`依赖倒置原则`
> 依赖于抽象，而不是实体

一种解耦的基本方法，需要依赖的代码块不直接控制依赖本身。而是控制一个抽象的实例，抽象实例由其他代码块控制。

```JS
// 不解耦
require('axios').get('business/api', {});

// 解耦
const api = require('axios');
api.get('business/api', {});

// 解耦结果
require('fetch').get('business/api', {});

const api = require('fetch');
api.get('business/api', {});
```


## TaggingMusic 中 TagsHistory 状态设计实现撤销和反撤销

### intro
本文是关于实现 Tags 输入的撤销和保留的方案讨论

感谢 Martin Fowler 的文章 [事件溯源](https://martinfowler.com/eaaDev/EventSourcing.html)

### 方案一（当前使用）

#### 实现
1. 在 `globalState.songlist` 中，添加 `tagsHistory` 属性记录 tags 添加或删除的历史记录
	1. tagsHistory 的结构为：Array 或者 Map，其元素属性值和 taggedSongs 的元素保持一致（要能够互相替换）
2. 在 `TagInputGroup` 组件中的 `onTagsChange` 事件中，`globalData.setTagsInTaggedSongs` 方法为 tags 变化的唯一接口。
3. 所以捕获状态操作可以在 `globalData.setTagsInTaggedSongs` 方法和 `onTagsChange` 中执行。将携带最新 tags 的目标 `Song` 对象推入 tagsHistory 中。
4. 在撤销操作后，弹出最近一次操作的 `Song` 对象，根据 id 值覆盖 `taggedSong` 对应的 `Song` 对象，再在  `TagInputGroup` 组件中 订阅 $onAction `tagsHistoryChange` 事件，重新获取最新的 tags 值即可完成撤销。

#### 难点和缺陷
1. 反撤销问题：每次写入会将 `Song` 对象 push 到 history 中，每次撤销会将最末端的 `Song` 对象 pop 出设为最新数据，那反撤销操作无法进行。
	1. ~~fix: 创建状态 index 指示器，每次新纪录 unshift 至 history 开头，index 初始为 0 ，每次撤销后，复制 history[index] 数据覆盖当前值，并将 index++，反撤销时 index-- 。~~
	2. fix: 修改 `tagsHistory` 结构为 [{ id, newTags, oldTags }, ...]，并设置 Index 初始为 0，每次 `tagsHistory` 写入数据后 unshift 至 history，每次撤销后取 history[index] 数据的 old 属性。在 `taggedSongs` 中查询对应的 id，将 tags 属性覆盖掉，然后 index++ 。每次反撤销时，将 index--，然后取 new 属性覆盖。
2. 撤销后创建数据分叉问题：撤销后再创建或删除操作，会直接剪切 history 序列 < index 的值丢弃。并重新 unshift 新操作值至 history
3. tags 赋值覆盖后，$onAction 重新触发 onTagsChange 事件，导致事件循环触发问题。
	1. setTaggedSong 时，增加 saveHistory 字段解决循环问题