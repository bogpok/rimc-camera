window.onload = function() {
    main();
};

let VIDEO=null;
let CANVAS=null;
let CONTEXT=null;

let SCALER = 1;
let SIZE={x:0,y:0,width:0,height:0};

let videoSelect = null;
let changeMeButton = null;

const main = () => {

    CANVAS=document.getElementById("camerabox");
    CONTEXT=CANVAS.getContext("2d");  

    videoSelect = document.querySelector('select#videoSource');
    take_button = document.getElementById("take");
    changeMeButton = document.getElementById('changemedia');

    // populate html selector and start camera
    getAvailableMedia();    
    
    // TAKE Button    
    take_button.addEventListener('click', shutterRelease);

    // CHANGE MEDIA / NEXT Button    
    changeMeButton.addEventListener('click', changemedia);   

    set_retake_slider();

    document.getElementsByName("dialvalue")[0].value = knobrecipes.link[0].short;
};

const changemedia = () => {
    // Get the current selected index
    const currentIndex = videoSelect.selectedIndex;
    // Calculate the next index, and loop back to the beginning if necessary
    const nextIndex = (currentIndex + 1) % videoSelect.options.length;
    // Set the selectedIndex to the next index
    videoSelect.selectedIndex = nextIndex;
    // launch selected camera
    startCamera(videoSelect.value);
}

const shutterRelease = () => {
    // take snapshot
    CONTEXT.drawImage(VIDEO,
        SIZE.x, SIZE.y,
        SIZE.width, SIZE.height);
    let image_data_url = CANVAS.toDataURL('image/jpeg');

    // data url of the image
    document.getElementsByName("imgsrcurl")[0].value = image_data_url;
    
    const snap = document.getElementById("snap");
    snap.src = image_data_url;
    snap.removeAttribute("hidden"); 

    toggleVideoPlayback();
    document.getElementById("shutter").setAttribute("hidden", "true");
    document.getElementById("shutter_pressed").removeAttribute("hidden");
    take_button.setAttribute("disabled", true);

    move_retake_button();

    changeMeButton.setAttribute("disabled", true);
}

const shutterLoad = () => {
    toggleVideoPlayback();
    document.getElementById("shutter").removeAttribute("hidden");
    document.getElementById("shutter_pressed").setAttribute("hidden", "true");
    take_button.removeAttribute("disabled");

    move_retake_button(true);

    changeMeButton.removeAttribute("disabled");
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

    
};

const updateCanvas = () => {    
    CONTEXT.drawImage(VIDEO, 
        SIZE.x, SIZE.y,
        SIZE.width, SIZE.height
    );    
    
    window.requestAnimationFrame(updateCanvas);
};

const retake = () => {
    const snap = document.getElementById("snap");
    snap.setAttribute("hidden", "true");

    shutterLoad();
};

const toggleVideoPlayback = () => {
    if (VIDEO.paused) {
        VIDEO.play();
        document.getElementById("retake_button").setAttribute("disabled", true);
    } else {
        VIDEO.pause();
        document.getElementById("retake_button").removeAttribute("disabled");
    }
};

function getAvailableMedia() {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            // Filter only video input devices (cameras)
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            // Populate the cameraSelector dropdown with available cameras
            videoDevices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                let label;
                if (device.label.toLowerCase().includes('back')) {
                    label = 'back';
                } else if (device.label.toLowerCase().includes('front')) {
                    label = 'front';
                } else {
                    label = 'integrated';
                }

                option.text = `src: ${label} [${videoSelect.options.length + 1}]`
                
                videoSelect.add(option);
            });

            
            // Add event listener to update camera stream when selection changes
            videoSelect.addEventListener('change', () => {
                const selectedDeviceId = videoSelect.value;
                startCamera(selectedDeviceId);
            });

            // Start the default camera stream
            if (videoDevices.length > 0) {   
                // Find the back camera (if available)
                const backCamera = videoDevices.find(device => device.label.toLowerCase().includes('back'));

                if (backCamera) videoSelect.selectedIndex = 1;

                const defaultDeviceId = backCamera ? backCamera.deviceId : videoDevices[0].deviceId;

                startCamera(defaultDeviceId);

                if (videoDevices.length == 1) {
                    changeMeButton.setAttribute("disabled", true)
                }
            }
        })
        .catch(error => {
            console.error('Error accessing devices:', error);
        });
};


function startCamera(deviceId) {
    const constraints = {
        video: {
            deviceId: deviceId
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {            
            VIDEO=document.createElement("video");
            VIDEO.srcObject=stream;
            VIDEO.play();

            VIDEO.onloadeddata=function(){
                handleResize();
                updateCanvas();
            }  

            setSourceText(videoSelect.options[videoSelect.selectedIndex].text);
        })
        .catch(error => {
            alert("Camera error: "+error);
            console.error('Error accessing camera:', error);
        });
};

function setSourceText(text) {
    document.getElementById('videoSourceText').innerHTML = text;
};


const set_retake_slider = () => {
    const retakewidth = 100;

    const retakecontainer = document.getElementById("retakecontainer");
    const retakecontRect = retakecontainer.getBoundingClientRect();
    
    const canvrect = CANVAS.getBoundingClientRect();    

    const retake_button = document.getElementById("retake_button")
    retake_button.style.width = retakewidth + 'px';
    retake_button.style.height = retakecontRect.height*0.9 + 'px'; 
    
    move_retake_button(true);
}


const move_retake_button = (back=false) => {
    const retakecontainer = document.getElementById("retakecontainer");
    const retakecontRect = retakecontainer.getBoundingClientRect();

    const retake_button = document.getElementById("retake_button");

    if (back) retake_button.style.left = retakecontRect.left - 10 + 'px';
    else retake_button.style.left = retakecontRect.left + 48 + 'px';
}



