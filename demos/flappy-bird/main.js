function rgbToString(c) {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function rgbaToString(c, a) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
}

function lerpColor(c1, c2, r) {
  return [
    c1[0] + (c2[0] - c1[0]) * r,
    c1[1] + (c2[1] - c1[1]) * r,
    c1[2] + (c2[2] - c1[2]) * r,
  ];
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function dSigmoid(x) {
  let s = 1 / (1 + Math.exp(-x));
  return s * (1 - s);
}




var canvas = document.getElementById("main-canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;


const backgroundColor = [255, 255, 255];

const zeroWeightColor = [0, 0, 0];
const posWeightColor = [0, 255, 255];
const negWeightColor = [255, 0, 0];

const nodeStrokeColor = [0, 0, 0];

function drawNN(nn, x, y, node, sx, sy) {
  let layerX = [];
  let lx = x - (node + sx) * (nn.numLayers - 1) / 2;
  for (let i = 0; i < nn.numLayers; i++) {
    layerX.push(lx);
    lx += node + sx;
  }
  
  let nodeY = [];
  for (let i = 0; i < nn.numLayers; i++) {
    let ly = [];
    let ny = y - (node + sy) * (nn.layerSizes[i] - 1) / 2;
    for (let j = 0; j < nn.layerSizes[i]; j++) {
      ly.push(ny);
      ny += node + sy;
    }
    nodeY.push(ly);
  }

  // Weights
  for (let i = 1; i < layerX.length; i++) {
    for (let j = 0; j < nn.layerSizes[i - 1]; j++) {
      for (let k = 0; k < nn.layerSizes[i]; k++) {
        let w = nn.weights[i][k][j];
        if (w > 0) {
          ctx.strokeStyle = rgbToString(lerpColor(
            zeroWeightColor, posWeightColor, Math.min(w, 1)
          ));
        }
        else {
          ctx.strokeStyle = rgbToString(lerpColor(
            zeroWeightColor, negWeightColor, Math.min(Math.abs(w), 1)
          ));
        }
        ctx.beginPath();
        ctx.moveTo(layerX[i - 1], nodeY[i - 1][j]);
        ctx.lineTo(layerX[i], nodeY[i][k]);
        ctx.stroke();
      }
    }
  }

  // Nodes
  ctx.strokeStyle = rgbToString(nodeStrokeColor);
  for (let i = 0; i < layerX.length; i++) {
    let x = layerX[i];
    for (let j = 0; j < nodeY[i].length; j++) {
      let bw = Math.round(nn.activations[i][j] * 255);
      ctx.fillStyle = rgbToString([bw, bw, bw]);
      ctx.beginPath();
      ctx.arc(x, nodeY[i][j], (node / 2), 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  }
}




class Obstacle {
  constructor(x, t, g, gy) {
    this.x = x;
    this.t = t;
    this.g = g;
    this.gy = gy;
  }
  draw() {
    // Top
    ctx.fillRect(this.x, 0, this.t, this.gy);
    // Bottom
    ctx.fillRect(this.x, this.gy + this.g, this.t, height - this.gy - this.g);
  }
  update() {
    this.x -= speed;
  }
}

function createObstacle(x = width) {
  return new Obstacle(x, obstacleThickness, gapSize, Math.floor(Math.random() * maxGapY));
}




class Agent {
  constructor(y, nn) {
    this.y = y;
    this.vel = 0;
    this.nn = nn || new Ninja({layerSizes: agentStructure, activation: "sigmoid", wRange: 1, bRange: 2});
    this.lifetime = 0;
  }

  draw() {
    ctx.fillStyle = this.focused ? rgbToString([0, 0, 0]) : agentColor;
    ctx.beginPath();
    ctx.arc(agentX, this.y, agentR, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    this.vel -= gravity;
    this.y -= this.vel;
    this.lifetime++;
  }

}

function createAgent() {
  return new Agent(500);
};


// Obstacles
const obstacleColor = rgbToString([200, 0, 0]);
var gapSize = 250,
  obstacleThickness = 25,
  maxGapY = height - gapSize,
  gapY = Math.floor(Math.random() * maxGapY),
  speed = 3,
  interval = 300;

// Agents
const agentStructure = [6, 3, 1],
  agentColor = rgbaToString([255, 100, 0], 0.5),
  agentX = 25,
  agentR = 25,
  gravity = 0.5,
  yLimits = Math.floor(agentR / 2);
  jumpStrength = 10;


// View speed
var viewSpeed = 1;
var viewSpeedInput = document.getElementById("view-speed");
viewSpeedInput.value = viewSpeed;
viewSpeedInput.addEventListener("change", function() {
  viewSpeed = Number(viewSpeedInput.value);
});
var clock = 0;

ctx.font = "50px sans-serif";


// Score and distance
var score = 0;
var distanceTraveled = 0;
var spawnTargetDistance = interval;

var obstacles = [createObstacle(), createObstacle(width + interval)];

// Agent evolution
var numAgents = 100;
var pick = 3;
var mutationsPerClone = 10;
var mutationRange = 0.2;

var livingAgents = [];
var deadAgents = [];
var pickedAgents = [];
for (var i = 0; i < numAgents; i++) {
  livingAgents.push(createAgent());
}
livingAgents[Math.floor(Math.random() * livingAgents.length)].focused = true;


var windowSize = 300;


function draw() {
  // Background
  ctx.fillStyle = rgbToString(backgroundColor);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let focusedAi = null;
  for (let counter = 0; counter < viewSpeed; counter++) {
    // Agent updates
    for (let i = 0; i < livingAgents.length; i++) {
      let a = livingAgents[i];
      a.update();
      let activations = a.nn.feedForward([
        (height - a.y) / height, // y encoded within (0, 1)
        sigmoid(a.vel / 4), // velocity encoded to (0, 1)
        obstacles[0].x / width, // obstacle x
        (height - obstacles[0].gy) / height, // obstacle gap position
        obstacles[1].x / width, // second obstacle x
        (height - obstacles[1].gy) / height // second obstacle position
      ]);
  
      if (activations[1][0] > 0.5) {
        a.vel = jumpStrength;
      }
  
      if (a.focused) {
        focusedAi = a;
      }
    }
  
    // Obstacle updates
    for (let i = 0; i < obstacles.length; i++) {
      obstacles[i].update();
    }
  
    if (obstacles[0].x <= -obstacleThickness) {
      obstacles = obstacles.slice(1);
      score++;
    }
  
    // Check for collisions or hitting ground
  
    let newLivingAgents = [];
    let ob0 = obstacles[0];
  
    let r1 = {
      x: ob0.x,
      y: 0,
      w: ob0.t,
      h: ob0.gy,
    },
  
    r2 = {
      x: ob0.x,
      y: ob0.gy + ob0.g,
      w: ob0.t,
      h: width - ob0.gy - ob0.g,
    };
  
    let focusedDead = false;
    for (let a of livingAgents) {
      let c = {x: agentX, y: a.y, r: agentR};
  
      if (
        rectCircleColliding(r1, c) || rectCircleColliding(r2, c) ||
        a.y > height - yLimits || a.y < yLimits
      ) {
        deadAgents.push(a);
        if (a.focused) {
          a.focused = false;
          focusedDead = true;
        }
      }
      else {
        newLivingAgents.push(a);
      }
    }
    livingAgents = newLivingAgents;

    // mutate and restart
    if (livingAgents.length == 0) {
      deadAgents.sort(function(a, b) {
        if (a.lifetime > b.lifetime) {
          return 1;
        }
        else if (a.lifetime < b.lifetime) {
          return -1;
        }
        return 0;
      });
  
      pickedAgents = deadAgents.slice(-pick);
      deadAgents = [];
      livingAgents = [];
      
      for (let a of pickedAgents) {
        livingAgents.push(a);
        a.lifetime = 0;
        a.y = 500;
        a.vel = 0;
      }
  
      let cloningI = 0;
      while (livingAgents.length < numAgents) {
        let mutated = new Agent(500, pickedAgents[cloningI].nn.copy());
        let nn = mutated.nn;
        for (let i = 0; i < mutationsPerClone; i++) {
          if (Math.random() < 0.5) {
            // Mutate weight
            // 3-dimensional, so narrow down three times
            let arr = nn.weights[Math.floor(Math.random() * (nn.weights.length - 1)) + 1];
            arr = arr[Math.floor(Math.random() * arr.length)];
            arr[Math.floor(Math.random() * arr.length)] +=
              Math.random() * mutationRange * 2 - mutationRange;
          }
          else {
            // Mutate bias
            // 2-dimensional, so narrow down twice
            let arr = nn.biases[Math.floor(Math.random() * (nn.biases.length - 1)) + 1];
            arr[Math.floor(Math.random() * arr.length)] +=
              Math.random() * mutationRange * 2 - mutationRange;
          }
        }
  
        livingAgents.push(mutated);
  
        cloningI++;
        if (cloningI == pickedAgents.length) {
          cloningI = 0;
        }
      }
  
      // new focus
      livingAgents[Math.floor(Math.random() * livingAgents.length)].focused = true;
  
      obstacles = [createObstacle(), createObstacle(width + interval)];
      distanceTraveled = 0;
      spawnTargetDistance = interval;
      score = 0;
    }
    else {
      if (focusedDead) {
        livingAgents[Math.floor(Math.random() * livingAgents.length)].focused = true;
      }

      // Timing
      clock++
      distanceTraveled += speed;
      if (distanceTraveled >= spawnTargetDistance) {
        spawnTargetDistance += interval;
        obstacles.push(createObstacle(width + interval));
      }
    }
  

  
  

  
  }

  // Obstacle draw
  ctx.fillStyle = obstacleColor;
  for (let o of obstacles) {
    o.draw();
  }

  // Agents draw
  for (let a of livingAgents) {
    a.draw();
  }

  if (focusedAi) {
    // Neural network window
    ctx.fillStyle = "#00000033";
    ctx.fillRect(width - windowSize, 0, windowSize, windowSize);

    drawNN(focusedAi.nn, width - windowSize / 2, windowSize / 2, 30, 40, 10);
  }

  ctx.fillStyle = "#000000";
  ctx.fillText(score.toString(), 100, 100);


  window.requestAnimationFrame(draw);
}

draw();