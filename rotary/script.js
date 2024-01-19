const rotaryContainer = document.getElementById('rotaryContainer');
const rotaryKnob = document.getElementById('rotaryKnob');
const valueDisplay = document.getElementById('valueDisplay');

const values = ['Value 1', 'Value 2', 'Value 3', 'Value 4', 'Value 5'];

const filters = [
    'classic vintage', // as it is now in rimc engine
    'gold', // kodak gold
    'portrait', // portra
    'super', // superia
    'silver bw', //silvertone99
    'retro bw', //claunch 72
]

class Recipe {
    constructor(
        name,
        short,
        description,
        url        
    ) {
        this.name = name;
        this.short = short;
        this.description = description;
        this.url = url;
    }    
}

const recipes = [
    new Recipe('classic vintage', 'CLSC', 'as it is now in rimc engine', null),
    new Recipe('gold', 'GOLD', 'kodak gold', 'https://film.recipes/2022/07/01/classic-gold-like-expired-film-kodak-gold/'),
    new Recipe('portrait', 'PORT', 'portra', 'https://film.recipes/2022/05/15/kodak-portra-grainy-for-a-portra-400-look/'),
    new Recipe('super', 'SUPR', 'superia', 'https://film.recipes/2022/05/24/mother-superia-the-anytime-fujicolor-film/'),
    new Recipe('silver bw', 'bwSV', 'silvertone99', 'https://film.recipes/2022/09/15/silvertone-99-for-deep-metallic-mono/'),
    new Recipe('retro bw', 'bwRE', 'silvertone99', 'https://film.recipes/2022/08/22/claunch-72-monotone-hipstamagic/'),
]

console.log(recipes.length)


const rotPosAngles = calcRotPosAngles(values.length);

let angle = 0;
updateKnobPosition();

rotaryKnob.addEventListener('mousedown', startDragging);
rotaryContainer.addEventListener('touchstart', handleTouch, { passive: false });

window.addEventListener('mousemove', drag);
window.addEventListener('mouseup', stopDragging);

window.addEventListener('touchmove', handleTouchMove, { passive: false });
window.addEventListener('touchend', stopDragging);


function startDragging(e) {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;

    startCommon(startX, startY);
}

function handleTouch(e) {
    if (e.targetTouches.length === 1) {
        const touch = e.targetTouches[0];
        const startX = touch.clientX;
        const startY = touch.clientY;
        
        startCommon(startX, startY);
    }
}

function getRelativeAngle(xy, center=[0,0]) {
    let alpha = Math.atan2(xy[1] - center[1], xy[0] - center[0]);
    if (alpha < 0) alpha = 2*Math.PI + alpha;  
    return alpha;
}

function startCommon(startX, startY) {
    const knobRect = rotaryContainer.getBoundingClientRect();
    const knobX = knobRect.left + knobRect.width / 2;
    const knobY = knobRect.top + knobRect.height / 2;
    

    // let startAngle = 0//Math.atan2(startY - knobY, startX - knobX);
    

    function move(e) {
        const currentX = e.clientX || e.touches[0].clientX;
        const currentY = e.clientY || e.touches[0].clientY;

        // const currentAngle = Math.atan2(currentY - knobY, currentX - knobX);
        // const angleDiff = currentAngle - startAngle;
        // startAngle = currentAngle;

        // angle += angleDiff;
        // if (angle < 0) angle = 2*Math.PI - angle;           
        
        angle = getRelativeAngle([currentX, currentY], [knobX, knobY]);
        

        

        updateKnobPosition();
        updateValueDisplay();
    }
    function stop() {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('touchmove', move);
        window.removeEventListener('mouseup', stop);
        window.removeEventListener('touchend', stop);
    }

    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
}

function drag(e) {
    e.preventDefault();
}

function handleTouchMove(e) {
    e.preventDefault();
}

function stopDragging() {
    window.removeEventListener('mousemove', drag);
    window.removeEventListener('touchmove', handleTouchMove);
}

function updateKnobPosition() {
    const radius = 70;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    rotaryKnob.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
}

function updateValueDisplay() {
    const totalValues = values.length;
    const valueIndex = Math.floor((angle % (2 * Math.PI)) / (2 * Math.PI) * totalValues) % totalValues;
    
    // Clear existing items in the carousel
    valueDisplay.innerHTML = '';

    // Add a new item with the selected value

    const item = document.createElement('div');
    item.className = 'carousel-item active';
    item.textContent = values[valueIndex];
    valueDisplay.appendChild(item);

    // for (let i = -1; i <= 1; i++) {
    //     const index = (valueIndex + i) % totalValues;
    //     const item = document.createElement('div');
    //     item.className = 'carousel-item active';
    //     // item.className = i === 0 ? 'carousel-item active' : 'carousel-item';
    //     item.textContent = values[index];
    //     valueDisplay.appendChild(item);
    // }
    

    // Update the position of the carousel to simulate animation
    const carouselInner = document.querySelector('.carousel-inner');
    // carouselInner.style.transform = `translateX(${-valueIndex * 100}%)`;
}

window.onload = () => {
    console.log('good')
    spreadnum();    
}


const spreadnum = () => {
    clockdiv = document.getElementById("clock");
    const knobRect = rotaryContainer.getBoundingClientRect();
    const knobX = knobRect.left + knobRect.width / 2;
    const knobY = knobRect.top + knobRect.height / 2;
    for (let i = 0; i < values.length; i++) {
        const item = document.createElement('div');
        item.textContent = i+1;
        clockdiv.appendChild(item);

        angle = rotPosAngles[i]/180.*Math.PI;
        
        item.style.position = 'absolute';
        itemRect = item.getBoundingClientRect();
        const radius = 120;
        const x = Math.cos(angle) * radius + knobX - itemRect.width /2 ;
        const y = Math.sin(angle) * radius + knobY - itemRect.height /2 ;

        item.style.top = `${y}px`;
        item.style.left = `${x}px`;
        // item.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    } 
}

function calcRotPosAngles(n){
    let angs = []
    const section_ang = 360/n
    
    for (let i=0; i<=n; i++){
        angs.push(section_ang*i)
    }
    return angs
}


