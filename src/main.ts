import './style.css'
import lrc from './data.ts';

interface LrcItem {
    time: number;
    text: string;
}

function getDomsOrThrow() {
    const audio = document.querySelector('audio') as HTMLAudioElement | null;
    const container = document.querySelector<HTMLElement>('.container');
    const ul = document.querySelector<HTMLUListElement>('.container ul');

    if (!audio || !container || !ul) {
        throw new Error('Required DOM elements not found: audio, .container, or .container ul');
    }

    return { audio, container, ul };
}

const doms = getDomsOrThrow();
const lrclist: LrcItem[] = [];

function parseLrc(): LrcItem[] {
    const lines = lrc.split('\n');
    lines.forEach(line => {
        const t = line.split(']')[0].substring(1);
        const tn = parseTime(t);
        const tex = line.split(']')[1] ?? '';
        lrclist.push({ time: tn, text: tex });
    });
    return lrclist;
}

function parseTime(time: string): number {
    const parts = time.split(':');
    const minutes = Number(parts[0]) * 60;
    const seconds = Number(parts[1]) || 0;
    return minutes + seconds;
}

function createLrc() {
    const fragment = document.createDocumentFragment();
    lrclist.forEach(item => {
        const li = document.createElement('li');
        li.innerText = item.text;
        fragment.appendChild(li);
    });
    doms.ul.appendChild(fragment);
}

parseLrc();
createLrc();

function findIndex(): number {
    const currentTime = doms.audio.currentTime;
    for (let i = 0; i < lrclist.length; i++) {
        if (currentTime < lrclist[i].time) {
            return Math.max(0, i - 1);
        }
    }
    return lrclist.length - 1;
}

function setOffset() {
    const index = findIndex();

    const containerHeight = doms.container.clientHeight;
    const firstLi = doms.ul.querySelector<HTMLLIElement>('li');
    if (!firstLi) return; // nothing to measure yet
    const liHeight = firstLi.clientHeight;
    const maxOffset = doms.ul.clientHeight - containerHeight;

    let offset = liHeight * index + liHeight / 2 - containerHeight / 2;
    if (offset < 0) offset = 0;
    if (offset > maxOffset) offset = maxOffset;

    const liOld = doms.ul.querySelector('.active');
    if (liOld) liOld.classList.remove('active');

    const li = doms.ul.children[index] as HTMLLIElement | undefined;
    if (li) li.classList.add('active');

    // no optional chaining on LHS; doms.ul is guaranteed non-null
    doms.ul.style.transform = `translateY(-${offset}px)`;
}

doms.audio.addEventListener('timeupdate', () => {
    setOffset();
});
