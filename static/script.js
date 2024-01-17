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

let videoSelect = null;
let nextButton = null;

const main = () => {
    console.log("loaded");

    CANVAS=document.getElementById("camerabox");
    CONTEXT=CANVAS.getContext("2d");  

    videoSelect = document.querySelector('select#videoSource');
    take_button = document.getElementById("take");
    nextButton = document.getElementById('changemedia');

    getAvailableMedia();
    
    
    // TAKE Button
    
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

    // CHANGE MEDIA / NEXT Button
    
    nextButton.addEventListener('click', () => {
        // Get the current selected index
        const currentIndex = videoSelect.selectedIndex;

        // Calculate the next index, and loop back to the beginning if necessary
        const nextIndex = (currentIndex + 1) % videoSelect.options.length;

        // Set the selectedIndex to the next index
        videoSelect.selectedIndex = nextIndex;

        startCamera(videoSelect.value);
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
    // CONTEXT.drawImage(
    //     VIDEO, 
    //     0, 0,
    //     window.innerWidth, window.innerHeight
    // );
    // CONTEXT.drawImage(
    //     VIDEO, 
    //     0, 0,
    //     VIDEO.videoWidth, VIDEO.videoHeight
    // );
    CONTEXT.drawImage(VIDEO, 
        SIZE.x, SIZE.y,
        SIZE.width, SIZE.height
    );    

    window.requestAnimationFrame(updateCanvas);
}



// getStream().then(getDevices).then(gotDevices);

function getDevices() {
    // Check if the browser supports navigator.mediaDevices.enumerateDevices
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        return navigator.mediaDevices.enumerateDevices();
    } else {
        console.error('mediaDevices is not supported in this browser.');
        return null;
    }
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




const show_cams = () => {
    // Check if the browser supports navigator.mediaDevices.enumerateDevices
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        // Define custom constraints to include both front and rear cameras
        // const constraints = {
        //     video: {
        //         facingMode: { exact: 'environment' } 
        //         // 'environment' for rear camera, 
        //         // 'user' for front camera
        //     }
        // };

        const videolist = document.querySelector('#list-devices');

        // Call getUserMedia with the custom constraints
        navigator.mediaDevices.getUserMedia({ video:{} })
            .then(stream => {
                // Access the stream to get device information                
                const devices = stream.getVideoTracks();
                window.alldevices_ = devices;

                devices.forEach(device => {
                    let deviceid = device.getSettings().deviceId;
                    console.log('Device ID:', deviceid);
                    console.log('Device Label:', device.label);

                    const li = document.createElement('li');

                    li.textContent = "\nLabel: " + device.label + "\nfacingMode: " + device.getSettings().facingMode;

                    videolist.appendChild(li);
                    console.log(videolist);
                });

                // You can use the device information as needed
            })
            .catch(error => {
                console.error('Error accessing devices:', error);
            });
    } else {
        console.error('getUserMedia is not supported in this browser.');
    }
}

function getAvailableMedia() {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            // Filter only video input devices (cameras)
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            // Populate the cameraSelector dropdown with available cameras
            videoDevices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${videoSelect.options.length + 1}`;
                videoSelect.add(option);
            });

            // Add event listener to update camera stream when selection changes
            videoSelect.addEventListener('change', () => {
                const selectedDeviceId = videoSelect.value;
                startCamera(selectedDeviceId);
            });

            // Start the default camera stream
            if (videoDevices.length > 0) {
                const defaultDeviceId = videoDevices[0].deviceId;
                startCamera(defaultDeviceId);


                if (videoDevices.length == 1) {
                    nextButton.setAttribute("disabled", true)
                }
            }
        })
        .catch(error => {
            console.error('Error accessing devices:', error);
        });
}


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

            setSourceText(stream.getVideoTracks()[0].label);
            console.log(stream)
        })
        .catch(error => {
            alert("Camera error: "+err);
            console.error('Error accessing camera:', error);
        });
}


function setSourceText(text) {
    document.getElementById('videoSourceText').value = text;
}