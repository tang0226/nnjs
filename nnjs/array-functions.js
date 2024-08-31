function apply(a, f) {
  let arr = [];
  for (let i of a) {
    arr.push(f(i));
  }
  return arr;
}

function apply2d(a, f) {
  let arr = [];
  for (let i of a) {
    let sub = [];
    for (let j of i) {
      sub.push(f(j));
    }
    arr.push(sub);
  }
  return arr;
}

function copy2d(a) {
  let arr = [];
  for (let i of a) {
    arr.push([...i]);
  }
  return arr;
}

function copy3d(a) {
  let arr = []
  for (let i of a) {
    let sub = [];
    for (let j of i) {
      sub.push([...j])
    }
    arr.push(sub);
  }
  return arr;
}

function add(a1, a2) {
  let arr = [];
  for (let i = 0; i < a1.length; i++) {
    arr.push(a1[i] + a2[i]);
  }
  return arr;
}

function addScal(a, s) {
  let arr = [];
  for (let i of a) {
    arr.push(i + s);
  }
  return arr;
}

function addScal2d(a, s) {
  let arr = [];
  for (let i of a) {
    let sub = [];
    for (let j of i) {
      sub.push(j + s);
    }
    arr.push(sub);
  }
  return arr;
}

function add2d(a1, a2) {
  let arr = [];
  for (let i = 0; i < a1.length; i++) {
    let sub = [];
    for (let j = 0; j < a1[i].length; j++) {
      sub.push(a1[i][j] + a2[i][j]);
    }
    arr.push(sub);
  }
  return arr;
}

function mul(a1, a2) {
  let arr = [];
  for (let i = 0; i < a1.length; i++) {
    arr.push(a1[i] * a2[i]);
  }
  return arr;
}

function mulScal(a, s) {
  let arr = [];
  for (let i of a) {
    arr.push(i * s);
  }
  return arr;
}

function mulScal2d(a, s) {
  let arr = [];
  for (let i of a) {
    let sub = [];
    for (let j of i) {
      sub.push(j * s);
    }
    arr.push(sub);
  }
  return arr;
}

function mul2d(a1, a2) {
  let arr = [];
  for (let i = 0; i < a1.length; i++) {
    let sub = [];
    for (let j = 0; j < a1[i].length; j++) {
      sub.push(a1[i][j] * a2[i][j]);
    }
    arr.push(sub);
  }
  return arr;
}

function dot(a1, a2) {
  let sum = 0;
  for (let i = 0; i < a1.length; i++) {
    sum += a1[i] * a2[i];
  }
  return sum;
}

function outer(a1, a2) {
  let arr = [];
  for (let i of a1) {
    let sub = [];
    for (let j of a2) {
      sub.push(i * j);
    }
    arr.push(sub);
  }
  return arr;
}
