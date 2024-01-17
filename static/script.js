let previewImage = (event) => {
    let image = document.getElementById("preview_img");
    let input = event.target
    console.log(input)
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
           image.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}





window.onload = function() {
    main();
};

let VIDEO=null;
let CANVAS=null;
let CONTEXT=null;

let SCALER = 1;
let SIZE={x:0,y:0,width:0,height:0};

const main = () => {
    console.log("loaded");

    CANVAS=document.getElementById("camerabox");
    CONTEXT=CANVAS.getContext("2d");    

    let prom = navigator.mediaDevices.getUserMedia({video:true});

    // # get access to camera content
    prom.then((signal)=>{
        VIDEO=document.createElement("video");
        VIDEO.srcObject=signal;
        VIDEO.play();

        VIDEO.onloadeddata=function(){
            handleResize();
            // window.addEventListener('resize', handleResize);         

            updateCanvas();
        }        
    }).catch((err)=>{
        alert("Camera error: "+err);
    })

    var videoSelect = document.querySelector('select#videoSource');
    const videolist = document.querySelector('#list-devices');
    getDevices().then(deviceInfos=>{
        window.deviceInfos = deviceInfos; // make available globally
        console.log('Available input and output devices:', deviceInfos);

        for (const deviceInfo of deviceInfos) {
            const option = document.createElement('option');
            option.value = deviceInfo.deviceId;
        
            if (deviceInfo.kind === 'videoinput') {
                option.text = deviceInfo.label || `${videoSelect.length + 1} сamera`;
                videoSelect.appendChild(option);

                const li = document.createElement('li');
                li.textContent = `${videolist.length + 1} сamera` + deviceInfo.deviceId + "|" + deviceInfo.label;
                videolist.appendChild(li);
                console.log(videolist);
            }
        }
    });

    
    
    take_button = document.getElementById("take");

    take_button.addEventListener('click', function() {
        // take snapshot
        CONTEXT.drawImage(VIDEO,
            SIZE.x, SIZE.y,
            SIZE.width, SIZE.height);
        let image_data_url = CANVAS.toDataURL('image/jpeg');
    
        // data url of the image
        // console.log(image_data_url);
        
        const snap = document.getElementById("snap");
        snap.src = image_data_url;
        snap.removeAttribute("hidden"); 

        toggleVideoPlayback();
    });
}

const handleResize = () => {
    let resizer=SCALER*Math.min(
        window.innerWidth/VIDEO.videoWidth,
        window.innerHeight/VIDEO.videoHeight
    );

    SIZE.width=resizer*VIDEO.videoWidth;
    SIZE.height=resizer*VIDEO.videoHeight;

    CANVAS.width=SIZE.width;
    CANVAS.height=SIZE.height;

    // SIZE.x = window.innerWidth/2 - SIZE.width/2;
    // SIZE.y = window.innerHeight/2 - SIZE.height/2;
}

const updateCanvas = () => {    
    CONTEXT.drawImage(
        VIDEO, 
        0, 0,
        window.innerWidth, window.innerHeight
    );
    CONTEXT.drawImage(
        VIDEO, 
        0, 0,
        VIDEO.videoWidth, VIDEO.videoHeight
    );
    CONTEXT.drawImage(VIDEO, 
        SIZE.x, SIZE.y,
        SIZE.width, SIZE.height
    );    

    window.requestAnimationFrame(updateCanvas);
}



// getStream().then(getDevices).then(gotDevices);

function getDevices() {
    return navigator.mediaDevices.enumerateDevices();
}



const retake = () => {
    const snap = document.getElementById("snap");
    snap.setAttribute("hidden", "true");
    toggleVideoPlayback();
}


const toggleVideoPlayback = () => {
    if (VIDEO.paused) {
        VIDEO.play();
        document.getElementById("retake").setAttribute("disabled", true);
    } else {
        VIDEO.pause();
        document.getElementById("retake").removeAttribute("disabled");
    }
};