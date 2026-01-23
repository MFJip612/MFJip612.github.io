阅读完本文章，你将了解JavaScript中的call(), apply(), bind()区别以及用法。

## 情景描述
```js
const zhangsan = {
    name: 'San Zhang',
    money: '10000',
    machine: function(power) {
        this.money = this.money - -(power);
    }
}

const lisi = {
    name: 'Si Li',
    money: '4000'
}
```

如代码所示，有张三，李四两人。其中张三有一部机器，通过此机器可以赚钱。

```js
console.log(zhangsan)
zhangsan.machine(1000)
console.log(zhangsan)
```

我们演示一下：
![](https://vip.123pan.cn/1812581465/ymjew503t0n000d9i8lgcqv3e8bfnpvdDIYPDqJ1DIFzAGxxDIrP.png)
可以看到，张三成功的赚取到了1000块。
李四也想赚钱，但是李四并不想购买机器。
于是李四便借用张三的机器来赚钱。

## call

在上文中，张三自己赚钱调用的是`zhangsan.machine(1000)`。
那么李四使用机器就要更改一下写法：
```js
zhangsan.machine.call(thisArg, ...args);
```
`thisArg`指的是对象，在这个场景里通俗地说，就是谁使用张三的机器，场景中是李四，自然而然对象就是李四。
`...args`就是原来方法要的参数，在`zhangsan.machine(power)`中，只需要一个`power`参数。
因此调用的方式为
```js
zhangsan.machine.call(lisi, 100);
```
![](https://vip.123pan.cn/1812581465/ymjew503t0n000d9i8t4lxdf8gbiw82xDIYPDqJ1DIFzAGxxDIrP.png)
李四成功的赚到了100块。

## apply
为张三创建一个金额相加的函数：
```js
const zhangsan = {
    name: 'San Zhang',
    money: '10000',
    machine: function(power) {
        this.money = this.money - -(power);
    },
    getMoney: function(first, added) {
        this.money = first + added;
    }
}
```
假设现在李四最开始有300块钱，调用`getMoney`函数为他赚取100块：
```js
zhangsan.getMoney.apply(thisArg, [...args]);
```
`thisArg`同上。
`[...args]`就是把原来方法要的参数用数组传入。例如，本情景中`getMoney`函数接收两个参数，那么传入的参数就是`[first, added]`。
因此调用的方式为
```js
zhangsan.getMoney.apply(lisi, [300, 100]);
```
![](https://vip.123pan.cn/1812581465/yk6baz03t0m000d9jmisa5cgqagbdxksDIYPDqJ1DIFzAGxxDIrP.png)
李四成功地从300增加到了400块。

## bind
`bind`函数有所不同，它返回的是一个函数。
所以我们需要用一个变量接收返回的函数。
```js
const lisiGetMoney = zhangsan.machine.bind(lisi);
lisiGetMoney(300)
```
接下来，如果李四要赚钱，只需要调用`lisiGetMoney`就可以了。
![](https://vip.123pan.cn/1812581465/ymjew503t0m000d9ia5my1dyn2buppluDIYPDqJ1DIFzAGxxDIrP.png)
李四成功地赚到300块。

## 另请参阅
- [MDN: Function.prototype.call()](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
- [MDN: Function.prototype.apply()](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
- [MDN: Function.prototype.bind()](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)