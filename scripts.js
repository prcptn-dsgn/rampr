var lastStep = '';
var angle = 2; // actual angle is 45 * this
var dispAngle = 2;

function updateColor(s) {
    s.style.background = s.getAttribute('data-color');
}

function updateColors() {
    var c = document.querySelectorAll('.color');
    c.forEach(e => {
        updateColor(e);
    });
}

var c = document.querySelector('#colSet');
var toChange = document.querySelector('.color');
var doChange = true;

function setColor(s) {
    if (doChange) {
        lastStep = getHash();
        toChange = s;
        c.value = toChange.getAttribute('data-color');
        c.focus();
        c.click();
    }
    else {
        doChange = true;
        updateGradient();
    }
}

function updateGradient() {
    var s = [];
    document.querySelectorAll('.color').forEach(e => {
        s.push(e.getAttribute('data-color'));
    });
    var p = s.length > 1 ? (100 / (s.length - 1)).toFixed(2) : -1;
    var grad = "linear-gradient(" + ((angle * 45) % 360) + "deg"
    if (p < 0) {
        grad += ", " + s[0] + " 0%" + ", " + s[0] + " 100%";
    }
    else {
        for (var i = 0; i < s.length; i++) {
            grad += ", " + s[i] + " " + (p * i) + "%";
        }
    }
    grad += ")";
    document.querySelector('#preview').style.background = grad;
}

function rand16() {
    return Math.floor((Math.random() * 16) + 0);
}

function randColor() {
    var hex = '0123456789abcdef';
    var s = '#';
    for (i = 0; i < 6; i++) {
        s += hex.charAt(rand16());
    }
    return s;
}

function addColor() {
    lastStep = getHash();
    var temp = `
<span class="color" data-color="${randColor()}" onclick="setColor(this);">
  <span class="delColor" onclick="delColor(this);"></span>
</span>`;
    document.querySelector('#colors').innerHTML += temp;
    updateColors();
    updateGradient();
}

function addDColor(s) {
    var temp = `
<span class="color" data-color="${s}" onclick="setColor(this);">
  <span class="delColor" onclick="delColor(this);"></span>
</span>`;
    document.querySelector('#colors').innerHTML += temp;
    updateColors();
    updateGradient();
}

function getHash() {
    var s = [];
    document.querySelectorAll('.color').forEach(e => {
        s.push(e.getAttribute('data-color'));
    });
    var hash = '';
    s.forEach(e => {
        hash += e.substr(1);
    });
    return hash + angle.toString();
}

function fromHash(h) {
    var s = h.substring(0,h.length-1).match(/.{1,6}/g);
    for (var i = 1; i < s.length; i++) {
        addDColor('#' + s[i]);
    }
    document.querySelector('.color').setAttribute('data-color','#' + s[0]);
    angle = parseInt(h.charAt(h.length-1));
    dispAngle = angle;
    updateColors();
    updateGradient();
    rotate(document.querySelector('#rot'),0);
}

function reset() {
    document.querySelectorAll('.color:not(.nodelete)').forEach(e => {
        e.remove();
    });
}

function delColor(s) {
    lastStep = getHash();
    doChange = false;
    s.parentNode.remove();
}

function rotate(s,x) {
    lastStep = getHash();
    angle = (angle + x) % 8;
    dispAngle = dispAngle + x;
    s.style.transform = `rotate(${(45 * dispAngle)}deg)`;
    updateGradient();
}

function undo() {
    s = getHash();
    reset();
    fromHash(lastStep);
    lastStep = s;
}

function css() {
    prompt("CSS3 Gradient", document.querySelector('#preview').style.background)
}

function clipboard() {
    prompt("Permalink", "https://rampr.prcptn.us/#" + getHash());
}

window.onload = function() {
    if (window.location.hash) {
        fromHash(window.location.hash.substr(1));
    }
    else {
        fromHash(randColor().substr(1) + "2");
    }
    updateColors();
    updateGradient();
    c.addEventListener('change', function() {
        toChange.setAttribute('data-color',c.value);
        updateColor(toChange);
        updateGradient();
    });
}

function getCoords(w,h,p) {
    // Get gradient start/end coords from width, height, and phi
    // Format: [[x1,y1],[x2,y2]]
    var pr = p * Math.PI / 180;
    var H = Math.sqrt(Math.pow(w,2)+Math.pow(h,2))/2;
    // ^ change based on angle eventually. fix cropping issues
    var o = Math.round(Math.sin(pr)*H);
    var a = Math.round(Math.cos(pr)*H);
    var p1 = [w/2+o,h/2-a]; // swap +o/-o based on direction?
    var p2 = [w/2-o,h/2+a];
    return [p2,p1];
}

function toCanvas(w,h,a,cols) {
    var c = document.querySelector("#export");
    var ctx = c.getContext("2d");
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    var g = getCoords(w,h,a);
    var grd = ctx.createLinearGradient(g[0][0],g[0][1],g[1][0],g[1][1]);
    for (var i = 0; i < cols.length; i++) {
        grd.addColorStop(i,cols[i])
    }
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
}

function toImage(w,h,a,c) {
    toCanvas(w,h,a,c);
    var s = document.querySelector('#export').toDataURL("image/png")
    var link = document.createElement("a");
    link.download = 'gradient.png';
    link.href = s;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

function dlImage() {
    var s = [];
    document.querySelectorAll('.color').forEach(e => {
        s.push(e.getAttribute('data-color'));
    });
    toImage(3840,2160,angle*45,s);
}