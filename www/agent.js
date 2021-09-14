
//import {fillTrans} from "./genEngine.js"
import {masse} from "./MASSE-RE.js"

function complement(r){

    var str = ""
    for(var i=0;i<r.length;i++){
        str+= r[i]=="1"?"0":"1"
    }
    return str;
}

function randGenerate(n){
    var str = ""
    for(var i=0;i<n;i++){
        str+= Math.random()>0.4?"1":"0"
    }
    return str;
}

// silence: 0
// full: 127
function silence(arr){
	let zeroes = arr.filter(function(el){
		return el[1] == 0
	})
	return zeroes.length == arr.length? 1 : 0
}


export var agent_c = function ( constraints ){

    var agent = {}

    agent.internal_sequences =[]

    //agent stores only the last sixteen beats
    agent.input = "64,0,0-".repeat(16).split("-").map(function(s){return s.split(",").map(parseFloat)})
	agent.input.length = agent.input.length-1
	
    agent.output = "0000000000000000"
    agent.state = 0;
    agent.last_played = "0000000000000000"
    agent.constraints = constraints;
    agent.history = 16
    
    //PARAMS
    agent.alpha = 0 // 0 t0 1, density
    agent.beta = 0 // 0 to 1
    agent.gamma = 0 // 0 to 1
    agent.delta = 0 // 0 to 1, vary parameters
    agent.soft = true
    agent.unique = false
    agent.repeat = true
    agent.sliders = []
    agent.toggle = 0


    agent.listen = function( input, beat){
        
        var value = input[beat];
        agent.input = input; 
        //agent.external_sequences.push(hit);
        return agent.respond(agent.input, beat); //send the current value of sequence

    }

    agent.state = function(){
    }

    // input comes from the listening loop
    agent.respond = function( input, beat){

    	if( beat >= 8 && beat % 16 == 0){
            //state changes only every 16 beats
       		agent.state_change()
    	}

       	if( beat >= 8 && beat % 8 == 0){

            // the beginning of the bar where the agent makes a split second
            // decison to reveal its commitment to particular rhythmic aspect of
            // the input
            if( silence(input) ){
                agent.output = "0000000000000000".split("").map(parseFloat);
                agent.last_played = "0000000000000000".split("").map(parseFloat);
                //the agent remains silent if the musician has not played at all
            }
            // else if( full(input) ){
            //     agent.output = "10101010";
            //     agent.last_played = "10101010";
            //     //the agent remains silent if the musician has not played at all
            // }
            else{
                // The agent selects a new pattern to reveal its commitment
                let velocities = input.map(function(v){return v[1]})
            	//console.log("INPUT " + velocities)

                var out = masse(velocities, {"density": agent.alpha, "v_complement": agent.beta, "complexity": agent.gamma, "similarity": agent.beta})
                //fillTrans(input, complement(input), agent.alpha, agent.beta, agent.gamma)
                // agent.soft, agent.unique);
	            if( out.length == 0){
	            	agent.output = "0000000000000000".split("").map(parseFloat);
	                agent.last_played = "0000000000000000".split("").map(parseFloat);
	            }
	            else{
		            //agent.output = out[Math.floor(Math.random()*out.length)].seq
		            agent.output = out.map(function(el){return el})
		            agent.last_played = agent.output;
	            }
            }
        }
        else if( beat < 8 && beat % 8 == 0) {

            agent.output = "0000000000000000".split("").map(parseFloat);
            agent.last_played = "0000000000000000".split("").map(parseFloat);
        }
        else{
        	//no new response
        	//console.log("NO NEW RESPONSE")
        }

        //choose the value of the response from the stored response
        // or the already stored response
        //console.log("agents response @" + beat + " is " + agent.output)
        var hit = agent.output[beat%16]
        return hit;
    }

    //right not has density
    agent.state_change = function(){

 		//agent.alpha = 0.5*Math.random() // random density

		//agent.alpha = Mapping between 0 to 16 and -1 to 1 // adaptive density 		
		//agent.alpha = Mapping between 0 to 16 and -1 to 1 // adaptive density		
        let value = agent.delta ; //parseFloat(document.getElementById("varyParams").value)
        agent.alpha += Math.random()<0.3? -value : (Math.random() < 0.4 ? value: 0)
        agent.beta += Math.random()<0.3? -value : (Math.random() < 0.4 ? value: 0)
        //agent.gamma +=  Math.random()>0.6? -value : value
        agent.alpha = limiter(agent.alpha, 0, 1)
        agent.beta = limiter(agent.beta, 0, 1)

		//console.log(agent.sliders)
		agent.sliders[0][0].value = agent.alpha
		agent.sliders[0][1].innerText = agent.alpha.toFixed(2)
        agent.sliders[1][0].value = agent.beta
        agent.sliders[1][1].innerText = agent.beta.toFixed(2)
    }

    agent.set_sliders = function(arr){
    	agent.sliders = arr;
    	//console.log(agent.sliders)
    }

    agent.alphaUpdate = function(key, uislider){
        //console.log("updating" + key)
		if( key == "gamma"){
            agent[key] = uislider    
        }
        else agent[key] = parseFloat(uislider)    	
    }
 
    agent.generate_new = function(){
         var out = masse(velocities, {"density": agent.alpha, "v_complement": agent.beta, "complexity": agent.gamma, "similarity": agent.beta})
         return out
    }
   
    return agent;
}

function limiter( val, MIN, MAX ){
    return val <= MIN ? MIN : (val >= MAX? MAX : val)
}