let businesses = [];
let boss, store, upgrades;

let businessHeight = 100;
let progressMax;
let buyButtonWidth;
let theFont;
const percentPadding = 20;
const detailSpacing = 28;
const fps = 60;
const bossPanelHeight = 150;
const closePanelHeight = 40;

function preload() {
  theFont = loadFont("theFont.otf");
}

function setup() {
  //style
  createCanvas(500, windowHeight - 20);
  noStroke();
  textFont(theFont);

  //vars
  progressMax = width * 0.75;
  buyButtonWidth = width - progressMax;

  //create boss
  boss = new Boss();

  //create store
  store = new Store();

  //create upgrades
  upgrades = new Upgrades();

  //create starting businesses
  businesses.push(new Business(5, 100, 50));

  if (localStorage.getItem("money") !== null) {
    boss.money = localStorage.getItem("money");
  }
}

let iterations = 0;
function draw() {
  if ((iterations / fps) % 5 == 0) {
    localStorage.setItem("money", boss.money);
    iterations = 0;
    console.log("saved");
  }
  iterations++;

  background(0);

  // DRAW BUSINESSES
  for (let i in businesses) {
    businesses[i].update();
    businesses[i].show(i);
  }

  // DRAW BOSS and STORE
  boss.show();

  if (store.status) {
    store.show();
  }
  if (upgrades.status) {
    upgrades.show();
  }
}

class Business {
  constructor(time, money, cost) {
    //time to make in seconds
    this.s = time;
    //profit
    this.m = money;
    //cost to make
    this.c = cost;
    //progess
    this.p = 0;
    this.status = false;

    this.stepsPerLoop = 1 / (this.s * fps);
  }
  show(y) {
    //progress bar
    this.progressColor = round(map(this.p, 0, 1, 0, 120));
    fill(color("hsl(" + this.progressColor + ",100%,50%)"));
    rect(0, y * businessHeight, this.p * progressMax, businessHeight);
    //percent
    fill(color("#3D3D3D"));
    textSize(24);
    textAlign(LEFT, CENTER);
    text(
      floor(this.p * 100) + "%",
      percentPadding,
      y * businessHeight + businessHeight / 2
    );

    //buy
    fill(color("#3D3D3D"));
    rect(progressMax, y * businessHeight, buyButtonWidth, businessHeight);
    //seconds
    fill(color("#1CDFF8"));
    textSize(13);
    textAlign(CENTER, CENTER);
    text(
      formatSeconds(this.s),
      progressMax + buyButtonWidth / 2,
      y * businessHeight + detailSpacing
    );
    //profit
    fill(color("#F8E71C"));
    textSize(18);
    text(
      nfc(this.m) + "€",
      progressMax + buyButtonWidth / 2,
      y * businessHeight + businessHeight / 2
    );
    //cost
    fill(color("#1CF82F"));
    textSize(13);
    text(
      "-" + nfc(this.c) + "€",
      progressMax + buyButtonWidth / 2,
      y * businessHeight + businessHeight - detailSpacing
    );
  }
  update() {
    if (this.status) {
      if (this.p < 1) {
        this.p += this.stepsPerLoop;
      } else {
        // DONE
        this.p = 1;
        this.status = false;
        boss.money += this.m;
      }
    }
  }
  buy() {
    if (!this.status && boss.money >= this.c) {
      this.status = true;
      this.p = 0;
      boss.money -= this.c;
    }
  }
}

class Boss {
  constructor() {
    this.money = 50;
  }
  show() {
    fill(color("#3D3D3D"));
    rect(0, height - bossPanelHeight, width, bossPanelHeight);
    fill(color("#00ff00"));
    textSize(64);
    textAlign(LEFT, CENTER);
    text(nfc(this.money) + "€", percentPadding, height - bossPanelHeight / 2);
    fill(150, 0, 0);
    rect(
      width - buyButtonWidth,
      height - bossPanelHeight,
      buyButtonWidth,
      bossPanelHeight / 2
    );
    fill(0);
    textSize(18);
    textAlign(CENTER, CENTER);
    text(
      "STORE",
      width - buyButtonWidth / 2,
      height - bossPanelHeight + bossPanelHeight / 4
    );
    fill(color("#1CDFF8"));
    rect(
      width - buyButtonWidth,
      height - bossPanelHeight / 2,
      buyButtonWidth,
      bossPanelHeight / 2
    );
    fill(0);
    textSize(18);
    textAlign(CENTER, CENTER);
    text(
      "UPGRADE",
      width - buyButtonWidth / 2,
      height - bossPanelHeight + bossPanelHeight * 0.75
    );
  }
}

class Store {
  constructor() {
    this.status = false;
    this.items = [
      {
        time: 20,
        money: 300,
        cost: 100,
        pcost: 1000,
        owned: false,
      },
      {
        time: 60 + 20,
        money: 1000,
        cost: 100,
        pcost: 3502,
        owned: false,
      },
      {
        time: 60 * 10,
        money: 1000,
        cost: 5,
        pcost: 10009,
        owned: false,
      },
      {
        time: 60 * 30,
        money: 8000,
        cost: 3000,
        pcost: 25001,
        owned: false,
      },
      {
        time: 60 * 60,
        money: 12000,
        cost: 2000,
        pcost: 60300,
        owned: false,
      },
      {
        time: 60 * 60 * 4,
        money: 50000,
        cost: 10000,
        pcost: 99999,
        owned: false,
      },
      {
        time: 60 * 60 * 24,
        money: 1000000,
        cost: 1,
        pcost: 800000,
        owned: false,
      },
    ];
  }
  buy(i) {
    if (boss.money >= this.items[i].pcost && this.items[i].owned == false) {
      businesses.push(
        new Business(
          this.items[i].time,
          this.items[i].money,
          this.items[i].cost
        )
      );
      boss.money -= this.items[i].pcost;
      this.items[i].owned = true;
    }
  }
  open() {
    this.status = true;
  }
  close() {
    this.status = false;
  }
  show() {
    this.height = (height - closePanelHeight) / this.items.length;
    for (let i in this.items) {
      fill(i % 2 == 0 ? color("#3D3D3D") : color("#333333"));
      rect(0, i * this.height, width, this.height);

      fill(200);
      textSize(18);
      textAlign(LEFT, CENTER);
      text(
        "BUY FOR " + nfc(this.items[i].pcost) + "€",
        percentPadding,
        i * this.height + this.height / 2
      );

      fill(color("#1CDFF8"));
      textSize(13);
      textAlign(CENTER, CENTER);
      text(
        formatSeconds(this.items[i].time),
        progressMax + buyButtonWidth / 2,
        i * this.height + detailSpacing
      );
      //profit
      fill(color("#F8E71C"));
      textSize(18);
      text(
        nfc(this.items[i].money) + "€",
        progressMax + buyButtonWidth / 2,
        i * this.height + this.height / 2
      );
      //cost
      fill(color("#1CF82F"));
      textSize(13);
      text(
        "-" + nfc(this.items[i].cost) + "€",
        progressMax + buyButtonWidth / 2,
        i * this.height + this.height - detailSpacing
      );

      if (this.items[i].owned) {
        fill(color("rgba(0,0,0,0.6)"));
        rect(0, i * this.height, width, this.height);
        stroke(150, 0, 0);
        strokeWeight(5);
        line(0, i * this.height, width, i * this.height + this.height);
        line(0, i * this.height + this.height, width, i * this.height);
        noStroke();
      }
    }
    fill(150, 0, 0);
    rect(0, height - closePanelHeight, width, closePanelHeight);
    fill(0);
    textAlign(LEFT, CENTER);
    text("Click to close.", percentPadding, height - closePanelHeight / 2);
    textAlign(RIGHT, CENTER);
    text(
      "My money: " + nfc(boss.money) + "€",
      width - percentPadding,
      height - closePanelHeight / 2
    );
  }
}

class Upgrades {
  constructor() {
    this.status = false;
    this.items = [
      {
        name: "double",
        description: "Double the profit for all owned businesses.",
        cost: 5000,
        increaseFactor: 2,
        owned: 0,
        func: () => {
          for (let b of businesses) {
            b.m *= 2;
          }
        },
      },
    ];
  }
  open() {
    this.status = true;
  }
  close() {
    this.status = false;
  }
  show() {
    fill(0);
    rect(0, 0, width, height);

    this.height = 80;
    for (let i in this.items) {
      fill(i % 2 == 0 ? color("#3D3D3D") : color("#333333"));
      rect(0, 0, width, this.height);
      fill(200);
      textAlign(LEFT, CENTER);
      textSize(12);
      text(
        this.items[i].description,
        percentPadding,
        this.height * i + this.height / 2
      );

      textAlign(RIGHT, CENTER);
      textSize(18);
      text(
        nfc(this.items[i].cost) + "€",
        width - percentPadding,
        this.height * i + this.height / 2
      );
    }

    // money and close
    fill(150, 0, 0);
    rect(0, height - closePanelHeight, width, closePanelHeight);
    fill(0);
    textAlign(LEFT, CENTER);
    text("Click to close.", percentPadding, height - closePanelHeight / 2);
    textAlign(RIGHT, CENTER);
    text(
      "My money: " + nfc(boss.money) + "€",
      width - percentPadding,
      height - closePanelHeight / 2
    );
  }
  buy(i) {
    if (boss.money >= this.items[i].cost) {
      boss.money -= this.items[i].cost;

      this.items[i].func();
      this.items[i].cost *= this.items[i].increaseFactor;
    }
  }
}

function mousePressed() {
  if (mouseX <= width && mouseY <= height) {
    // close store or upgrades if open
    if (
      (store.status || upgrades.status) &&
      mouseY > height - closePanelHeight
    ) {
      store.close();
      upgrades.close();
    }
    // buy from store if open
    if (store.status) {
      let realY = floor(mouseY / store.height);
      if (store.items[realY] !== undefined) {
        store.buy(realY);
      }
    }
    //buy from upgrades if open
    else if (upgrades.status) {
      let realY = floor(mouseY / upgrades.height);
      if (upgrades.items[realY] !== undefined) {
        upgrades.buy(realY);
      }
    }
    // if in boss panel
    else if (mouseY > height - bossPanelHeight) {
      if (mouseX > width - buyButtonWidth) {
        // if in right side
        if (mouseY < height - bossPanelHeight / 2) {
          // if press store
          store.open();
        } else {
          // if press upgrades
          upgrades.open();
        }
      }
    }
    // buy business if click on progress bar
    else if (mouseY < height - bossPanelHeight) {
      let realY = floor(mouseY / businessHeight);
      if (businesses[realY] !== undefined) {
        businesses[realY].buy();
      }
    }
  }
}

function hack(x = 1000) {
  boss.money += x;
}

function formatSeconds(s = 0) {
  let days = (s - (s % 86400)) / 86400;
  s -= days * 86400;
  let hours = (s - (s % 3600)) / 3600;
  s -= hours * 3600;
  let minutes = (s - (s % 60)) / 60;
  s -= minutes * 60;
  let seconds = s;
  let formatting;

  if (days > 0) {
    formatting = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    formatting = `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    formatting = `${minutes}m ${seconds}s`;
  } else {
    formatting = `${seconds}s`;
  }
  return formatting;
}
