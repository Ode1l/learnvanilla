// function createUIGoods(goods) {
//     return {
//         data: goods,
//         choose: 0,
//     }
// }

// function UIGoods(goods) {
//     this.data = goods;
//     this.choose = 0;
// }
//
// // 写成函数原型的形式
// UIGoods.prototype.getTotalPrice = function(){
//     return this.data.price * this.choose;
// }
//
// UIGoods.prototype.isChoose = function(){
//     return this.choose > 0;
// }

// ES6的类写法 更高级 效果与上面一致 class专用与构造器构造方法，function专用于普通函数
class UIGoods {
    constructor(goods) {
        this.data = goods;
        this.choose = 0;
    }

    getTotalPrice() {
        return this.data.price * this.choose;
    }

    isChoose() {
        return this.choose > 0;
    }

    // 增加和减少方法，预留，为了做数据校验。如果将来添加库存，可以在increase中做库存校验
    increase() {
        this.choose++;
    }

    decrease() {
        if (this.choose > 0) {
            this.choose--;
        }
    }

    editChoose(num) {
        if (num < 0) {
            this.choose = 0;
        } else {
            this.choose = num;
        }
    }
}

// 再包装一次，保证新的arraylist里有自定义的uiGoods对象
class UIData {
    constructor() {
        const uiGoods = [];
        for (let i = 0; i < goods.length; i++) {
            uiGoods.push(new UIGoods(goods[i]));
        }
        this.uiGoods = uiGoods;
        this.deliveryThreshold = 30; // 满30起送
        this.deliveryPrice = 5;  // 配送费5元
        // 未来数据来自服务器
    }

    // 计算总价
    getTotalPrice() {
        // var total = 0;
        // for (let i = 0; i < this.uiGoods.length; i++) {
        //     total += this.uiGoods[i].getTotalPrice();
        // }
        // return total;

        // reduce方法更简洁
        return this.uiGoods.reduce((total, item) => total + item.getTotalPrice(), 0);
    }

    // 增加某件商品选中数量
    increase(index) {
        this.uiGoods[index].increase();
    }

    decrease(index) {
        this.uiGoods[index].decrease();
    }

    getTotalChoose() {
        return this.uiGoods.reduce((total, item) => total + item.choose, 0);
    }

    editChoose(index, num) {
        this.uiGoods[index].editChoose(num);
    }

    // 是否有选中商品
    hasChooseInCart() {
        return this.getTotalChoose() > 0;
    }

    // 是否满足起送价
    isMeetThreshold() {
        return this.getTotalPrice() >= this.deliveryThreshold;
    }

    isChoose(index) {
        return this.uiGoods[index].isChoose();
    }
}

// 整个界面
class UI {
    constructor() {
        this.uiData = new UIData();
        this.doms = {
            goodsContainer: document.querySelector('.goods-list'),
            deliveryPrice: document.querySelector('.footer-car-tip'),
            footerPay: document.querySelector('.footer-pay'),
            footerPayInnerSpan: document.querySelector('.footer-pay span'),
            totalPrice: document.querySelector('.footer-car-total'),
            cart: document.querySelector('.footer-car'),
            cartNum: document.querySelector('.footer-car-badge'),
        }
        // 由于UI界面可能会很大，所以单独拆一个方法。
        this.createHTML();
        this.refreshFooter();
        this.listenEvent();
        const cartRect = this.doms.cart.getBoundingClientRect();
        this.jumpTarget = {
            x: cartRect.left + cartRect.width / 2,
            y: cartRect.top + cartRect.height / 5,
        }
    };

    createHTML() {
        // 1. 生成html字符串，es6，模板字符串，（执行效率低，因为要走HTMLparse，消耗1步渲染主线程。开发效率高）
        // 2. 创建节点，appendChild（执行效率高，直接创建节点，少1步渲染主线程。开发效率低）
        // 这里用第一种，商品数量太少了，不会影响性能
        let html = '';
        for (let i = 0; i < this.uiData.uiGoods.length; i++) {
            let g = this.uiData.uiGoods[i];
            html += `<div class="goods-item">
            <img src="${g.data.pic}" alt="" class="goods-pic" />
            <div class="goods-info">
                <h2 class="goods-title">${g.data.title}</h2>
                <p class="goods-desc">
                    ${g.data.desc}
                </p>
                <p class="goods-sell">
                    <span>月售 ${g.data.sellNumber}</span>
                    <span>好评率${g.data.favorRate}%</span>
                </p>
                <div class="goods-confirm">
                    <p class="goods-price">
                        <span class="goods-price-unit">￥</span>
                        <span>${g.data.price}</span>
                    </p>
                    <div class="goods-btns">
                        <i index="${i}" class="iconfont i-jianhao"></i>
                        <span>${g.choose}</span>
                        <i index="${i}" class="iconfont i-jiajianzujianjiahao"></i>
                    </div>
                </div>
            </div>
        </div>`;
        }
        this.doms.goodsContainer.innerHTML = html;
    };

    increase(index) {
        this.uiData.increase(index);
        this.refreshGoodsItem(index);
        this.refreshFooter();
    };

    decrease(index) {
        this.uiData.decrease(index);
        this.refreshGoodsItem(index);
        this.refreshFooter();
    };

    editChoose(index, num) {
        this.uiData.editChoose(index, num);
        this.refreshGoodsItem(index);
        this.refreshFooter();
    };

    // 更新某个商品元素的显示状态
    refreshGoodsItem(index) {
        const goodsDom = this.doms.goodsContainer.children[index];
        if (this.uiData.isChoose(index)) {
            goodsDom.classList.add('active');
        } else {
            goodsDom.classList.remove('active');
        }
        goodsDom.querySelector('.goods-btns span').innerText = this.uiData.uiGoods[index].choose;
    };

    // 更新底部栏
    refreshFooter() {
        this.doms.deliveryPrice.textContent = `配送费 ￥ ${this.uiData.deliveryPrice}`;
        if (this.uiData.isMeetThreshold()) {
            // 到达起送价
            this.doms.footerPay.classList.add('active');
        } else {
            this.doms.footerPay.classList.remove('active');
            // 还差多少起送
            let diff = this.uiData.deliveryThreshold - this.uiData.getTotalPrice();
            // 浮点数运算会有精度问题，保留两位小数
            // diff = diff.toFixed(2);
            diff = Math.round(diff);
            this.doms.footerPayInnerSpan.textContent = `还差￥${diff} 起送`;
        }
        // 设置总价
        this.doms.totalPrice.textContent = this.uiData.getTotalPrice().toFixed(2)
        // 设置购物车ui
        if (this.uiData.hasChooseInCart()) {
            this.doms.cart.classList.add('active');
            this.doms.cartNum.textContent = this.uiData.getTotalChoose();
        } else {
            this.doms.cart.classList.remove('active');
            this.doms.cartNum.textContent = this.uiData.getTotalChoose();
        }
    }

    // 购物车动画
    playCartAnimation() {
        this.doms.cart.classList.add('animate');
        // setTimeout(() => {
        //     this.doms.cart.classList.remove('animate');
        // }, 500);
        // 用setTimeout不好用，还得算500ms，万一动画时间改了，这里也得改

        // 用事件监听动画结束


        // 由于还会写别的监听器，监听器最好都写在一个地方 所以拿走
    }

    // 跳跃动画
    jumpAnimation(index) {
        const goodsBtn = this.doms.goodsContainer.children[index].querySelector('.i-jiajianzujianjiahao');
        const goodsBtnRect = goodsBtn.getBoundingClientRect();
        // console.log(goodsBtnRect);
        const jumpStart = {
            x: goodsBtnRect.left + goodsBtnRect.width / 2,
            y: goodsBtnRect.top + goodsBtnRect.height / 2,
        }

        const jumpEl = document.createElement('div');
        jumpEl.className = 'add-to-car';
        const i = document.createElement('i');
        i.className = 'iconfont i-jiajianzujianjiahao';
        jumpEl.appendChild(i);
        jumpEl.style.transform = `translateX(${jumpStart.x}px)`;
        i.style.transform = `translateY(${jumpStart.y}px)`;
        document.body.appendChild(jumpEl);
        // 强制渲染
        jumpEl.clientHeight;
        i.clientHeight;
        jumpEl.style.transform = `translateX(${this.jumpTarget.x}px)`;
        i.style.transform = `translateY(${this.jumpTarget.y}px)`;
        // h5新特性，requestAnimationFrame 也可以强制渲染
        // requestAnimationFrame(() => {
        //     jumpEl.style.transform = `translate(${this.jumpTarget.x}px, ${this.jumpTarget.y}px)`;
        // })

        jumpEl.addEventListener('transitionend', () => {
            jumpEl.remove();
            this.playCartAnimation();
        }, {once: true}) // 只监听一次
    }

    // 事件监听
    listenEvent() {
        this.doms.cart.addEventListener('animationend', () => {
            this.doms.cart.classList.remove('animate');
        })
    }
}

const ui = new UI();

ui.doms.goodsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('i-jiajianzujianjiahao')) {
        // 增加
        // 这里使用了自定义属性传值
        // 在h5中可以使用data-index
        const index = e.target.getAttribute('index');
        ui.increase(index);
        ui.jumpAnimation(index);
    }
    if (e.target.classList.contains('i-jianhao')) {
        // 减少
        const index = e.target.getAttribute('index');
        ui.decrease(index);
    }
})