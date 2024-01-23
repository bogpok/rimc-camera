window.onload = () => {
    console.log("dial.js ok")

    
}

function getRelativeAngle(xy, center=[0,0]) {
    // returns angle in radians
    let alpha = Math.atan2(xy[1] - center[1], xy[0] - center[0]);
    if (alpha < 0) alpha = 2*Math.PI + alpha;  
    return alpha;
}
function rad2deg(rad){
    return rad/Math.PI*180;
}
function deg2rad(deg){
    return deg*Math.PI/180;
}
class Angle {
    constructor(start){
        this.set(start);
    }
    set(rad){
        rad %= 2*Math.PI;
        if (rad < 0) rad = 2*Math.PI + rad;  
        this.rad = rad;
        this.deg = rad2deg(rad);        
    }
    from(deg){
        deg %= 2*360;
        if (deg < 0) deg = 2*360 + deg; 
        this.deg = deg;
        this.rad = deg2rad(deg);
    }
}

class Control {
    constructor(element){
        this.el = element,
        this.rect = element.getBoundingClientRect();
        this.update_center();
    }
    get_rect(){
        return this.el.getBoundingClientRect();
    }
    update_center(){
        this.rect.center = [
            this.rect.left + this.rect.width / 2,
            this.rect.top + this.rect.height / 2
        ]
    }
    set_rotate(ang_deg){
        this.el.style.transform = `rotate(${ang_deg}deg)`;
    }
    set_topleft(xy){
        this.el.style.top = xy[1] + 'px';
        this.el.style.left = xy[0] + 'px';
        this.update_center();
    }
    set_topright(xy){
        this.el.style.top = xy[1] + 'px';
        this.el.style.right = xy[0] + 'px';
        this.update_center();
    }
    set_width(width){
        this.el.style.width = width + 'px';
    }
}

class Knob extends Control {
    constructor(element) {
        super(element);

        this.ang = new Angle(0);
        this.ang_prev = new Angle(0);

        this.el.addEventListener('mousedown', this.mouse_drag_start.bind(this));
        this.el.addEventListener('touchstart', this.touch_drag_start.bind(this), { passive: false });
        
    }
    /* when an event listener is called, the 'this' keyword inside the event handler function refers to the element that triggered the event, not the instance of the class. 
    To fix this issue, bind the common_start method to the current instance of the class in the constructor.*/
    mouse_drag_start(e){
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        this.common_start(startX, startY);
    }
    touch_drag_start(e) {
        e.preventDefault();
        if (e.targetTouches.length === 1) {
            const touch = e.targetTouches[0];
            const startX = touch.clientX;
            const startY = touch.clientY;            
            this.common_start(startX, startY);
        }
    }
    common_start(x0, y0){
        let center = this.rect.center;        
        const mang_start = new Angle(getRelativeAngle([x0, y0], center));
        
        // By using arrow functions for move and stop, the lexical scoping of 
        // arrow functions will capture the this value from the surrounding scope
        const move = (e) => {
            e.preventDefault();
            const currentX = e.clientX || e.touches[0].clientX;
            const currentY = e.clientY || e.touches[0].clientY;
            const mang_curr = new Angle(getRelativeAngle([currentX, currentY], center));
            const mand_delta = new Angle(mang_curr.rad - mang_start.rad);
            
            this.ang.set(this.ang_prev.rad + mand_delta.rad);                
            this.updatePosition(this.ang);
            // updateValueDisplay();
        }
        const stop = () => {   
            // recalculate - for a given range set a fixed position
            this.ang.from(knobrecipes.get_item_coline_ang(this.ang.deg));             
            
            this.updatePosition(this.ang);
            this.ang_prev.set(this.ang.rad);

            this.onstop(this.ang.deg);            

            window.removeEventListener('mousemove', move);        
            window.removeEventListener('mouseup', stop);
    
            window.removeEventListener('touchmove', move);
            window.removeEventListener('touchend', stop);
        }
    
        window.addEventListener('mousemove', move);    
        window.addEventListener('mouseup', stop);
    
        window.addEventListener('touchmove', move, { passive: false });
        window.addEventListener('touchend', stop);
    }
    updatePosition(ang){
        // rotates from absolute position
        this.set_rotate(this.ang.deg);        
    }    
    onstop(ang_deg){
        const dialvalue = document.getElementsByName("dialvalue")[0];
        if (dialvalue) {
            dialvalue.value = knobrecipes.which_item_short(ang_deg);
        } else {
            console.error("Element with name 'dialvalue' not found.");
        }
    }
}

class KnobCollection {
    constructor(collection_list) {
        this.N = collection_list.length;
        this.diff_deg = 360/this.N;
        this.link = {};

        for (let i = 0; i < this.N; i++){
            let coll_item = collection_list[i]
            this.link[i] = coll_item;
            this.link[i].knobpos_deg = 360 - this.diff_deg*i;            
        }
    }
    which_item(ang_deg){
        ang_deg -= 30;        
        if (ang_deg < 0) ang_deg = 360 + ang_deg;         
        const item_n = 5 - Math.floor(ang_deg / 360 * this.N)
        return item_n;
    }
    which_item_short(ang_deg){
        let i = this.which_item(ang_deg);
        return this.link[i].short;
    }
    get_item_coline_ang(ang_deg){
        let i = this.which_item(ang_deg);
        return this.link[i].knobpos_deg;
    }
}







