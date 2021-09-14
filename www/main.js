
//loop to call agent
import { playsound, synth_context, sel_rand_sound} from "./synth.js"
import {createAudioMeter} from "./volume-meter.js"

var canvasContext = null;
var WIDTH=500;
var HEIGHT=50;

var lookaheadTime = 0.1 //50ms
let last = Date.now();

var audioContext = null
var meter = null
var playMetSound = playsound();

/// LOOP VARIABLES
var rafId = null;

// RHYTHM VARIABLES
var metronome =  './sounds/metronome.wav';


function drawLoop(){

    let now = Date.now();
    console.log(meter.volume)

    canvasContext.clearRect(0,0,WIDTH,HEIGHT);

        // check if we're currently clipping
        if (meter.checkClipping())
            canvasContext.fillStyle = "red";
        else
            canvasContext.fillStyle = "green";

        console.log(meter.volume);

        // draw a bar based on the current volume
        canvasContext.fillRect(0, 0, meter.volume * WIDTH * 1.4, HEIGHT);

        // set up the next visual callback

    rafId = requestAnimationFrame(drawLoop);
}


//Recieves new response
//Updates the queue four notes from the (current16thnote+4 to current16thnote-1)
socket.on("generate_new", function(out){
    console.log("Call to the AI agent to generate new response")
    updatePlaycircle(systemOut) //play time depends on server response time
})

window.addEventListener("keypress", function(c){

	//console.log("char code" + c.keyCode)

    if( c.keyCode == 115){

        canvasContext = document.getElementById( "meter" ).getContext("2d");
    
        if(rafId == null){

            audioContext = new AudioContext();

            audioContext.resume().then(() => {
                //console.log('Playback resumed successfully');
            });

            // monkeypatch getUserMedia
            navigator.getUserMedia =
                    navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia;

            navigator.getUserMedia({
                    "audio": {
                            "mandatory": {
                                    "googEchoCancellation": "false",
                                    "googAutoGainControl": "false",
                                    "googNoiseSuppression": "false",
                                    "googHighpassFilter": "false"
                            },
                            "optional": []
                    }
            }, gotStream, didntGetStream);

            function didntGetStream() {
                    alert('Stream generation failed.');
            }

            function gotStream(stream, resolve) {

                console.log("got stream");
                    // Create an AudioNode from the stream.
                    let mediaStreamSource = audioContext.createMediaStreamSource(stream);
                    // Create a new volume meter and connect it.
                    meter = createAudioMeter(audioContext);
                    mediaStreamSource.connect(meter);
                //resolve(meter);
                console.log(meter)
                synth_context(audioContext); //load sounds
                drawLoop();            

            }

        } 

    }

	if( c.keyCode == 114){
      cancelAnimationFrame(rafId);
      nextListenTime = 0
      nextNoteTime = 0
	  rafId = null;
  }
})


function setup(){
    
}

// EVENT LISTENERS

function updateText(idval){
    //console.log(idval)
    idval[1].innerText = idval[0];
}


document.getElementById("temperature").addEventListener("input", function(e){
    socket.emit('generate_new', {"value": e.target.value, "name": "alpha"})
    //ws.send(JSON.stringify({"codecontrol": "agent", "value": e.target.value, "name": "alpha"}))

});

document.getElementById("loadjson").addEventListener("click", function(e){
	//console.log("sldiler value " + e.target.value)
	userInput = eval(document.getElementById("rhythmin").value)	
});


window.onload = setup()