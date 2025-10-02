import './style.css'
import lrc from './data.ts';

interface lrcs {
    time: number;
    text: string;
}

const doms = {
    audio: document.querySelector('audio'),
    ul: document.querySelector<HTMLElement>('.container ul'),
    container: document.querySelector<HTMLElement>('.container'),
}

const lrclist: lrcs[] = [];

function parseLrc(): lrcs[] {
    const lines = lrc.split('\n');
    lines.map(
        line => {
            const t = line.split(']')[0].substring(1);
            const tn = parseTime(t);
            const tex = line.split(']')[1];
            const obj = {time: tn, text: tex};
            lrclist.push(obj);
        });
    return lrclist;
}
/**
 * 解析时间
 * @param time 00:00.00 string
 * @return 秒数 number
 */

function parseTime(time: String) : number {
    const parts = time.split(':');
    const minutes = +parts[0]*60;
    const seconds = +parts[1];
    setTimeout(()=>{},)
    return minutes + seconds;

}




function createLrc() {
    const fragment = document.createDocumentFragment();
    lrclist.map((lrc)=>{
        const li = document.createElement('li');
        li.innerText = lrc.text;
        // doms.ul?.appendChild(li);
        fragment.appendChild(li);
        // 70多条dom改动dom树，效率影响忽略不计，暂不优化。
        // 优化方式 先append到文档片段上，再append到ul上。
    })
    doms.ul?.appendChild(fragment);
}

parseLrc();
createLrc();

function findIndex(): number{
    // console.log(doms.audio?.currentTime);
    const currentTime = doms.audio?.currentTime;
    for (let i = 0; i < lrclist.length; i++) {
        if (currentTime! < lrclist[i].time) {
            if (i-1 < 0) {
                return 0;
            }
            return i - 1;
        }
    }
    return lrclist.length;
}

const containerHeight = doms.container.clientHeight;
const liHeight = doms.ul.querySelector('li').clientHeight;
const maxOffset = doms.ul.clientHeight - containerHeight;

function setOffset() {
    let index = findIndex();
    console.log(index);
    let offset = liHeight * index + liHeight /2 - containerHeight / 2;
    console.log(offset);
    if (offset <0 ) {
        offset = 0;
    }
    if (offset >= maxOffset) {
        offset = maxOffset;
    }
    let liOld = doms.ul.querySelector('.active')
    if (liOld) {
        liOld.classList.remove('active');
    }
    let li = doms.ul.children[index];
    if (li) {
        li.classList.add('active');
    }
    doms.ul.style.transform = `translateY(-${offset}px)`;
}

doms.audio.addEventListener('timeupdate',()=>{
    setOffset();
})











// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//   </div>
// `