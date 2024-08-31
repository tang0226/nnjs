class Ninja {
  constructor(obj) {
    this.layerSizes = obj.layerSizes;
    this.numLayers = obj.layerSizes.length;
    this.activation = obj.activation;
    this.biases = obj.biases ? obj.biases : [[]];
    this.weights = obj.weights ? obj.weights : [[]];

    // Initialize weights and biases based on activation type
    switch (this.activation) {
      case "sigmoid":
        this.af = function(x) {
          return 1 / (1 + Math.exp(-x));
        }
        
        this.daf = function(x) {
          let s = 1 / (1 + Math.exp(-x));
          return s * (1 - s);
        }

        if (!obj.biases) {
          let r = obj.bRange ? obj.bRange : 0;
          for (let i = 1; i < this.numLayers; i++) {
            let lb = [];
            for (let j = 0; j < obj.layerSizes[i]; j++) {
              lb.push(Math.random() * r * 2 - r);
            }
            this.biases.push(lb);
          }
        }

        if (!obj.weights) {
          for (let i = 1; i < this.numLayers; i++) {
            let r = obj.wRange ? obj.wRange : 1 / Math.sqrt(this.layerSizes[i - 1]);
            let wl = [];
            for (let to = 0; to < this.layerSizes[i]; to++) {
              let wn = [];
              for (let from = 0; from < this.layerSizes[i - 1]; from++) {
                wn.push(Math.random() * r * 2 - r);
              }
              wl.push(wn);
            }
            this.weights.push(wl);
          }
        }      
    }

    this.activations = [];
    for (let i of obj.layerSizes) {
      let al = [];
      for (let j = 0; j < i; j++) {
        al.push(0);
      }
      this.activations.push(al);
    }
  }

  feedForward(inputs) {
    let a = [inputs];
    for (let l = 1; l < this.numLayers; l++) {
      let al = [];
      for (let i = 0; i < this.layerSizes[l]; i++) {
        al.push(this.af(dot(a[l - 1], this.weights[l][i]) + this.biases[l][i]));
      }
      a.push(al);
    }

    this.activations = a;
    return a;
  }

  copy() {
    return new Ninja({
      layerSizes: this.layerSizes,
      activation: this.activation,
      weights: copy3d(this.weights),
      biases: copy2d(this.biases)
    });
  }
}