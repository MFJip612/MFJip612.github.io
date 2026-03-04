
阅读完本文章，你将了解 JavaScript 中 `call()`、`apply()` 与 `bind()` 的区别以及常见用法。

## 情景描述

```js
const zhangsan = {
    name: 'San Zhang',
    money: 10000,
    machine: function (power) {
        this.money = this.money + power;
    }
}

const lisi = {
    name: 'Si Li',
    money: 4000
}
```

上面代码表示张三和李四。张三有一台可以赚钱的机器（`machine` 方法），李四没有机器但想借用张三的机器来赚钱。

```js
console.log(zhangsan)
zhangsan.machine(1000)
console.log(zhangsan)
```

我们演示一下：
![](https://vip.123pan.cn/1812581465/ymjew503t0n000d9i8lgcqv3e8bfnpvdDIYPDqJ1DIFzAGxxDIrP.png)

可以看到张三成功赚到 1000 块。

李四也想赚钱，但不想买机器，于是他可以借用张三的方法。下面分别介绍 `call`、`apply` 和 `bind` 的用法。

## call

张三自己用机器是这样写的：`zhangsan.machine(1000)`。

如果要让李四使用这台机器，可以用 `call`：

```js
zhangsan.machine.call(thisArg, ...args);
```

其中 `thisArg` 表示函数执行时的 `this` 值，在这个例子中即为 `lisi`；`...args` 是原函数的参数列表（本例中是 `power`）。

所以可以这样调用：

```js
zhangsan.machine.call(lisi, 100);
```

![](https://vip.123pan.cn/1812581465/ymjew503t0n000d9i8t4lxdf8gbiw82xDIYPDqJ1DIFzAGxxDIrP.png)

李四成功赚到 100 块。

## apply

`apply` 与 `call` 类似，区别在于第二个参数是参数数组。

例如为张三添加一个示例方法：

```js
const zhangsan = {
    name: 'San Zhang',
    money: 10000,
    machine: function (power) {
        this.money = this.money + power;
    },
    getMoney: function (first, added) {
        this.money = first + added;
    }
}
```

假设李四最开始有 300 块钱，想通过 `getMoney` 增加 100 块，可以这样调用：

```js
zhangsan.getMoney.apply(thisArg, [...args]);
```

`thisArg` 与上面相同，`[...args]` 是把原函数的参数按顺序放入数组中。本例中 `getMoney` 接收两个参数，所以传入 `[first, added]`：

```js
zhangsan.getMoney.apply(lisi, [300, 100]);
```

![](https://vip.123pan.cn/1812581465/yk6baz03t0m000d9jmisa5cgqagbdxksDIYPDqJ1DIFzAGxxDIrP.png)

李四的金额从 300 增加到 400。

## bind

`bind` 与前两者不同，它返回一个新的函数，并把 `this` 绑定到指定对象。

需要用一个变量接收返回的函数，例如：

```js
const lisiGetMoney = zhangsan.machine.bind(lisi);
lisiGetMoney(300)
```

以后李四只要调用 `lisiGetMoney`，内部的 `this` 都会指向 `lisi`。

![](https://vip.123pan.cn/1812581465/ymjew503t0n000d9ia5my1dyn2buppluDIYPDqJ1DIFzAGxxDIrP.png)

李四成功赚到 300 块。

## 另请参阅
- [MDN: Function.prototype.call()](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
- [MDN: Function.prototype.apply()](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
- [MDN: Function.prototype.bind()](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)