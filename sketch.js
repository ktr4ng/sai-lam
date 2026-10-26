// ======================================================
// SCENE & GLOBAL STATES
// ======================================================
let scene = 0;
let startTime;
let hover = false;
let progress = 0;
let introAlpha = 255;
let showIntro = true;
let cracks = [];
let arrowStartTime = 0;
let particles = [];
let experienceStarted = false;
let btnHoverAlpha = 0;

let showInstructions = false;
let cursorX = 0;
let cursorY = 0;

let sliderGlitch, sliderVolume;

// --- DỮ LIỆU BUBBLE ---
let revealedDiseases = [];
let diseaseList = [
  { t: "Chronic Stress & Anxiety", s: "Constant monitoring of danger signs" },
  { t: "Mood Disorders", s: "Irritability, frustration, and anger" },
  { t: "Sleep Disturbance", s: "Difficulty falling asleep and reduced REM" },
  { t: "Cognitive Fatigue", s: "Decreased concentration and focus" },
  { t: "Hearing Impairment", s: "Tinnitus, distorted hearing, and loss" },
  { t: "Cardiovascular Issues", s: "High blood pressure and viscosity" },
  { t: "Heart Disease", s: "Linked to long-term stress hormones" },
  { t: "Pregnancy Risks", s: "Increased risk of preeclampsia" },
  { t: "Developmental Delays", s: "Impaired speech and communication" },
  { t: "Learning Difficulties", s: "Poor concentration and performance" },
  { t: "Permanent Damage", s: "Inability to hear specific frequencies" },
  { t: "Behavioral Issues", s: "Loss of confidence and social difficulty" },
];
let clickCount = 0;
let scene2StartTime = 0;

// --- DỮ LIỆU CÁT BỤI (SAND EFFECT) ---
let sandParticles = [];
let showFinalQuestion = true;
let questionDissolved = false;

// ======================================================
// SOUND & MEDIA
// ======================================================
const FONT_MAIN = "Zalando Sans Expanded";
let soundCho, soundCoiXe, soundMayKhoan;
let videoMorning, videoNight;
let videoCam, handposeModel;
let glitchBuffer;
let predictions = [];
let alphaMorning = 0;
let alphaNight = 255;
const FADE_SPEED = 0.25;
let scene1StartTime = 0;
let lastVolProgress = -1;
let lastVolM = -1;
let lastVolN = -1;

function preload() {
  soundCho = loadSound("cho.wav");
  soundCoiXe = loadSound("coi xe.wav");
  soundMayKhoan = loadSound("may_khoan.wav");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noCursor();
  textAlign(CENTER, CENTER);
  textFont(FONT_MAIN);

  glitchBuffer = createGraphics(160, 90);
  glitchBuffer.pixelDensity(1);

  for (let i = 0; i < 150; i++) {
    particles.push(new DustParticle());
  }

  const sliderStyle = `
    appearance: none;
    background: rgba(255, 255, 255, 0.1);
    height: 12px;
    border-radius: 10px;
    outline: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &::-webkit-slider-thumb {
      appearance: none;
      width: 150px; 
      height: 12px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 0 15px rgba(255,255,255,0.6);
    }
  `;

  sliderGlitch = createSlider(0, 50, 20);
  sliderGlitch.position(width - 210, height - 110);
  sliderGlitch.style("width", "180px");
  sliderGlitch.style(sliderStyle);
  sliderGlitch.hide();

  sliderVolume = createSlider(0, 100, 50);
  sliderVolume.position(width - 210, height - 60);
  sliderVolume.style("width", "180px");
  sliderVolume.style(sliderStyle);
  sliderVolume.hide();

  initCracks();

  videoMorning = createVideo(["morning.mov"]);
  videoNight = createVideo(["night.mov"]);
  videoMorning.hide();
  videoNight.hide();
  videoMorning.volume(0);
  videoNight.volume(0);
  videoMorning.elt.setAttribute("playsinline", "");
  videoNight.elt.setAttribute("playsinline", "");
  videoMorning.elt.setAttribute("webkit-playsinline", "");
  videoNight.elt.setAttribute("webkit-playsinline", "");

  videoCam = createCapture(VIDEO, () => {
    console.log("Webcam ready");
    if (videoCam && videoCam.elt && scene !== 1) {
      videoCam.elt.pause();
    }
  });
  videoCam.size(320, 240);
  videoCam.hide();
  handposeModel = ml5.handpose(videoCam, { flipHorizontal: false }, () => {
    console.log("Handpose Ready");
  });
  handposeModel.on("predict", (r) => {
    if (scene === 1) predictions = r;
  });
}

function draw() {
  background(10);
  cursorX = mouseX;
  cursorY = mouseY;

  if (scene === 0) {
    drawQuietScene();
  } else if (scene === 1) {
    drawVideoScene();
    drawUI();
    drawInfoBtn();
    if (millis() - scene1StartTime > 15000) {
      drawNavigationText(200);
    }
    if (showInstructions) drawInstructionModal();
  } else if (scene === 2) {
    drawDiagnosticScene();
    drawRestartUI();
    drawFinalQuestionEffect();
  }
  drawCustomCursor();
}

// ======================================================
// CLASSES
// ======================================================

class DustParticle {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.vx = random(-0.5, 0.5);
    this.vy = random(-0.5, 0.5);
    this.size = random(1.5, 4);
    const palette = [
      [186, 210, 91],
      [140, 80, 255],
      [255, 120, 50],
      [50, 200, 255],
      [255, 255, 255],
    ];
    let c = random(palette);
    this.r = c[0];
    this.g = c[1];
    this.b = c[2];
    this.noiseOffset = random(1000);
  }

  update() {
    let n = noise(this.noiseOffset + frameCount * 0.01);
    this.x += this.vx + map(n, 0, 1, -1, 1);
    this.y += this.vy;
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  display(a) {
    if (a < 1) return;
    noStroke();
    // Soft outer glow halo (fast & GPU friendly, no shadowBlur stall)
    fill(this.r, this.g, this.b, a * 0.15);
    ellipse(this.x, this.y, this.size * 2.8);
    // Core particle
    fill(this.r, this.g, this.b, a * 0.7);
    ellipse(this.x, this.y, this.size);
  }
}

class SandParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1.5, 1.5);
    this.vy = random(-2.5, 0.5);
    this.ay = -0.05;
    this.alpha = 255;
    this.size = random(1.5, 3);
  }
  update() {
    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 4;
  }
  display() {
    noStroke();
    fill(255, this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}

// ======================================================
// SCENE DRAWING FUNCTIONS
// ======================================================

function drawQuietScene() {
  for (let p of particles) {
    p.update();
    p.display(introAlpha);
  }

  if (!experienceStarted) {
    fill(240);
    noStroke();
    textFont(FONT_MAIN);
    textSize(35);
    text("Wear headphone for a better experience", width / 2, height / 2 - 20);

    let btnY = height / 2 + 50;
    let isMouseOverBtn = dist(mouseX, mouseY, width / 2, btnY) < 60;
    btnHoverAlpha = lerp(btnHoverAlpha, isMouseOverBtn ? 255 : 100, 0.1);
    let breathe = map(sin(frameCount * 0.05), -1, 1, 150, 255);

    push();
    rectMode(CENTER);
    fill(255, map(btnHoverAlpha, 100, 255, 0, 40));
    stroke(255, btnHoverAlpha);
    strokeWeight(1.5);
    rect(width / 2, btnY, 200, 45, 20);
    noStroke();
    fill(255, max(breathe, btnHoverAlpha));
    textSize(14);
    text("CLICK TO START", width / 2, btnY + 2);
    pop();

    if (mouseIsPressed && isMouseOverBtn) startExperience();
    return;
  }

  if (showIntro) {
    introAlpha = lerp(introAlpha, 0, 0.05);
    if (introAlpha < 1) {
      showIntro = false;
      arrowStartTime = millis();
    }
  }

  if (hover) progress = min(progress + 0.003, 1);
  else progress = lerp(progress, 0, 0.05);

  if (abs(progress - lastVolProgress) > 0.01) {
    soundCho.setVolume(progress * 0.7, 0.05);
    soundCoiXe.setVolume(progress * 0.6, 0.05);
    soundMayKhoan.setVolume(progress * 0.8, 0.05);
    lastVolProgress = progress;
  }

  for (let c of cracks) c.draw(progress);

  textFont(FONT_MAIN);
  textSize(32);
  fill(245);
  text("This is a quiet space.", width / 2, height * 0.48);

  textSize(18);
  let subW = textWidth("How long can it remain quiet?");
  let isOverSub =
    mouseX > width / 2 - subW / 2 &&
    mouseX < width / 2 + subW / 2 &&
    mouseY > height * 0.48 + 40 &&
    mouseY < height * 0.48 + 60;
  fill(isOverSub ? color(186, 210, 91) : 245);
  text("How long can it remain quiet?", width / 2, height * 0.48 + 50);
  detectHover(width / 2, height * 0.48 + 50);

  if (!showIntro && millis() - arrowStartTime > 5000) {
    drawNavigationText(200);
  }
}

function drawFinalQuestionEffect() {
  if (showFinalQuestion) {
    push();
    textFont(FONT_MAIN);

    // --- Dòng 1: Câu hỏi chính ---
    textSize(20);
    let q = "Have you ever wondered how noise pollution affects humans?";
    let tw = textWidth(q);
    let qY = height - 120;
    let isHoverQ =
      mouseX > width / 2 - tw / 2 &&
      mouseX < width / 2 + tw / 2 &&
      mouseY > qY - 20 &&
      mouseY < qY + 20;

    // --- Dòng 2: Gợi ý click ---
    textSize(13);
    let hint = "click random on the screen to see";
    let th = textWidth(hint);
    let hY = height - 90;
    let isHoverH =
      mouseX > width / 2 - th / 2 &&
      mouseX < width / 2 + th / 2 &&
      mouseY > hY - 15 &&
      mouseY < hY + 15;

    if (questionDissolved) {
      for (let i = sandParticles.length - 1; i >= 0; i--) {
        sandParticles[i].update();
        sandParticles[i].display();
        if (sandParticles[i].alpha <= 0) sandParticles.splice(i, 1);
      }
      if (sandParticles.length === 0) showFinalQuestion = false;
    } else {
      fill(isHoverQ ? color(186, 210, 91) : 200);
      text(q, width / 2, qY);

      fill(isHoverH ? color(186, 210, 91) : 140);
      text(hint, width / 2, hY);
    }
    pop();
  }
}

function dissolveQuestion() {
  if (!questionDissolved) {
    questionDissolved = true;
    textFont(FONT_MAIN);

    // Hạt cho câu hỏi chính
    textSize(20);
    let q = "Have you ever wondered how noise pollution affects humans?";
    let tw = textWidth(q);
    for (let i = 0; i < 400; i++) {
      sandParticles.push(
        new SandParticle(
          width / 2 + random(-tw / 2, tw / 2),
          height - 120 + random(-10, 10),
        ),
      );
    }

    // Hạt cho dòng gợi ý
    textSize(13);
    let hint = "click random on the screen to see";
    let th = textWidth(hint);
    for (let i = 0; i < 200; i++) {
      sandParticles.push(
        new SandParticle(
          width / 2 + random(-th / 2, th / 2),
          height - 90 + random(-8, 8),
        ),
      );
    }
  }
}

function drawRestartUI() {
  push();
  let x = 60,
    y = 50;
  let txt = "RESTART THE JOURNEY";
  textFont(FONT_MAIN);
  textSize(11);
  textStyle(BOLD);
  let tw = textWidth(txt);
  let isHover =
    mouseX > x - 20 &&
    mouseX < x + tw + 40 &&
    mouseY > y - 20 &&
    mouseY < y + 20;
  translate(x, y);
  stroke(255, isHover ? 255 : 150);
  strokeWeight(1.5);
  noFill();
  push();
  if (isHover) rotate(sin(frameCount * 0.1) * 0.2);
  arc(0, 0, 18, 18, -PI, HALF_PI);
  line(9, 0, 12, -3);
  line(9, 0, 6, -3);
  pop();
  noStroke();
  fill(255, isHover ? 255 : 150);
  textAlign(LEFT, CENTER);
  text(txt, 20, 1);
  if (isHover) {
    stroke(186, 210, 91);
    strokeWeight(1);
    line(20, 10, 20 + tw, 10);
  }
  pop();
}

function resetExperience() {
  scene = 0;
  progress = 0;
  experienceStarted = false;
  revealedDiseases = [];
  clickCount = 0;
  introAlpha = 255;
  showIntro = true;
  showFinalQuestion = true;
  questionDissolved = false;
  sandParticles = [];
  initCracks();
  soundCho.stop();
  soundCoiXe.stop();
  soundMayKhoan.stop();
  videoMorning.stop();
  videoNight.stop();
  if (videoCam && videoCam.elt) videoCam.elt.pause();
}

function drawNavigationText(fixedAlpha) {
  let posX = width / 2;
  let posY = height - 60;
  push();
  textAlign(CENTER, CENTER);
  textFont(FONT_MAIN);
  noStroke();
  let txt = "click here to continue";
  textSize(12);
  let isOverCont =
    mouseX > posX - 100 &&
    mouseX < posX + 100 &&
    mouseY > posY - 20 &&
    mouseY < posY + 20;
  let flicker = map(sin(frameCount * 0.08), -1, 1, 120, 255);
  if (isOverCont) {
    fill(186, 210, 91);
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = "rgba(186, 210, 91, 0.5)";
  } else {
    fill(255, min(fixedAlpha, flicker));
  }
  text(txt, posX, posY);
  stroke(isOverCont ? color(186, 210, 91) : color(255, 50));
  strokeWeight(1);
  line(posX - 20, posY + 12, posX + 20, posY + 12);
  pop();
}

function drawInfoBtn() {
  push();
  let x = 50,
    y = height - 50,
    r = 40;
  let isHover = dist(mouseX, mouseY, x, y) < r / 2;
  if (isHover) {
    drawingContext.shadowBlur = 25;
    drawingContext.shadowColor = "rgba(0, 255, 255, 0.6)";
    fill(255, 60);
  } else {
    fill(255, 20);
  }
  stroke(255, 180);
  strokeWeight(1.5);
  ellipse(x, y, r);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textFont(FONT_MAIN);
  textStyle(BOLD);
  textSize(18);
  text("i", x, y - 2);
  pop();
}

function drawInstructionModal() {
  push();
  fill(0, 180);
  rect(0, 0, width, height);
  rectMode(CENTER);
  fill(255, 30);
  stroke(255, 100);
  strokeWeight(1.5);
  rect(width / 2, height / 2, 400, 220, 30);
  noStroke();
  fill(255);
  textFont(FONT_MAIN);
  textSize(20);
  textStyle(BOLD);
  text("HOW TO INTERACT", width / 2, height / 2 - 60);
  textStyle(NORMAL);
  textSize(15);
  text("🖐 Open palm", width / 2, height / 2 - 10);
  text("✊ Clenched fist", width / 2, height / 2 + 30);
  fill(186, 210, 91);
  textSize(12);
  text("Click anywhere to close", width / 2, height / 2 + 80);
  pop();
}

function drawUI() {
  sliderGlitch.show();
  sliderVolume.show();
  push();
  rectMode(CORNER);
  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = "rgba(0, 0, 0, 0.4)";
  fill(255, 25);
  stroke(255, 150);
  strokeWeight(1.5);
  rect(width - 230, height - 150, 215, 120, 30);
  noStroke();
  drawingContext.shadowBlur = 0;
  fill(255);
  textAlign(LEFT);
  textFont(FONT_MAIN);
  textStyle(BOLD);
  textSize(10);
  text("FILTER INTENSITY", width - 210, height - 125);
  text("AUDIO VOLUME", width - 210, height - 75);
  pop();
}

function drawVideoScene() {
  let targetMorning = 255,
    targetNight = 0;
  if (predictions.length > 0) {
    let landmarks = predictions[0].landmarks;
    let handSize = dist(
      landmarks[0][0],
      landmarks[0][1],
      landmarks[12][0],
      landmarks[12][1],
    );
    let d1 = dist(
      landmarks[8][0],
      landmarks[8][1],
      landmarks[0][0],
      landmarks[0][1],
    );
    let d2 = dist(
      landmarks[12][0],
      landmarks[12][1],
      landmarks[0][0],
      landmarks[0][1],
    );
    if ((d1 + d2) / 2 > handSize * 1.1) {
      targetMorning = 0;
      targetNight = 255;
    } else {
      targetMorning = 255;
      targetNight = 0;
    }
  }
  alphaMorning = lerp(alphaMorning, targetMorning, FADE_SPEED);
  alphaNight = lerp(alphaNight, targetNight, FADE_SPEED);
  let intensity = sliderGlitch.value();
  let masterVol = sliderVolume.value() / 100;
  push();
  if (intensity === 0) {
    if (alphaMorning > 1) {
      tint(255, alphaMorning);
      image(videoMorning, 0, 0, width, height);
    }
    if (alphaNight > 1) {
      tint(255, alphaNight);
      image(videoNight, 0, 0, width, height);
    }
  } else {
    applyPixelatedGlitch(intensity);
  }
  pop();
  let targetVolM = (alphaMorning / 255) * masterVol;
  let targetVolN = (alphaNight / 255) * masterVol;
  if (abs(targetVolM - lastVolM) > 0.015) {
    videoMorning.volume(targetVolM);
    lastVolM = targetVolM;
  }
  if (abs(targetVolN - lastVolN) > 0.015) {
    videoNight.volume(targetVolN);
    lastVolN = targetVolN;
  }
}

function applyPixelatedGlitch(intensity) {
  let activeVid = alphaMorning > alphaNight ? videoMorning : videoNight;
  let activeAlpha = alphaMorning > alphaNight ? alphaMorning : alphaNight;

  let gw = 160;
  let gh = 90;
  glitchBuffer.image(activeVid, 0, 0, gw, gh);

  let stepSize = floor(map(intensity, 1, 50, 8, 40));
  let rows = ceil(height / stepSize);

  // Render base pixelated mosaic via GPU in 0.02ms
  drawingContext.imageSmoothingEnabled = false;
  tint(255, activeAlpha);
  image(glitchBuffer, 0, 0, width, height);

  // Row-level horizontal jitter exactly mimicking the mosaic block offset
  for (let r = 0; r < rows; r++) {
    let y = r * stepSize;
    let xOffset = random(-intensity, intensity) * 1.5;
    let sgy = floor(map(y, 0, height, 0, gh));
    let sgh = max(1, floor(map(stepSize, 0, height, 0, gh)));
    copy(glitchBuffer, 0, sgy, gw, sgh, xOffset, y, width, stepSize);
  }

  // Block-level jitter for randomized glitch blocks
  let numBlocks = floor(map(intensity, 1, 50, 4, 30));
  for (let i = 0; i < numBlocks; i++) {
    let bx = random(width);
    let by = random(height);
    let bw = random(stepSize * 1.5, stepSize * 4 + intensity);
    let bh = stepSize;
    let offX = random(-intensity, intensity) * 2;
    copy(
      glitchBuffer,
      floor(map(bx, 0, width, 0, gw)),
      floor(map(by, 0, height, 0, gh)),
      max(1, floor(map(bw, 0, width, 0, gw))),
      max(1, floor(map(bh, 0, height, 0, gh))),
      bx + offX,
      by,
      bw,
      bh
    );
  }
}

function drawDiagnosticScene() {
  background(5);
  sliderGlitch.hide();
  sliderVolume.hide();
  for (let b of revealedDiseases) {
    b.scale = lerp(b.scale, 1, 0.15);
    b.alpha = lerp(b.alpha, 255, 0.1);
    let fy = sin(frameCount * 0.05 + b.seed) * 5;
    drawFixedBubble(b.x, b.y + fy, b.info.t, b.info.s, b.alpha, b.scale);
  }
}

function drawFixedBubble(x, y, title, status, a, s) {
  push();
  translate(x, y);
  scale(s);
  let w = 340;
  let h = 100;
  fill(186, 210, 91, a);
  noStroke();
  beginShape();
  vertex(0, 0);
  vertex(15, -15);
  vertex(30, -15);
  endShape(CLOSE);
  push();
  translate(0, -h - 13);
  let grad = drawingContext.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, `rgba(186, 210, 91, ${a / 255})`);
  grad.addColorStop(1, `rgba(180, 150, 230, ${a / 255})`);
  drawingContext.fillStyle = grad;
  rect(0, 0, w, h, 20);
  textAlign(LEFT, TOP);
  textFont(FONT_MAIN);
  fill(30, a * 0.9);
  textSize(16);
  textStyle(BOLD);
  text(title, 22, 18);
  textSize(12);
  textStyle(NORMAL);
  fill(50, a * 0.8);
  text(status, 22, 45, w - 44);
  pop();
  pop();
}

function mousePressed() {
  if (showInstructions) {
    showInstructions = false;
    return;
  }
  let posX = width / 2;
  let posY = height - 60;

  if (scene === 2) {
    // Logic restart
    let restartX = 60,
      restartY = 50;
    let twRestart = textWidth("RESTART THE JOURNEY");
    if (
      mouseX > restartX - 20 &&
      mouseX < restartX + twRestart + 40 &&
      mouseY > restartY - 20 &&
      mouseY < restartY + 20
    ) {
      resetExperience();
      return;
    }

    // Logic tan biến chữ
    if (showFinalQuestion && !questionDissolved) {
      textSize(20);
      let twQ = textWidth(
        "Have you ever wondered how noise pollution affects humans?",
      );
      textSize(13);
      let twH = textWidth("click random on the screen to see");

      let inQ =
        mouseX > width / 2 - twQ / 2 &&
        mouseX < width / 2 + twQ / 2 &&
        mouseY > height - 120 - 20 &&
        mouseY < height - 120 + 20;
      let inH =
        mouseX > width / 2 - twH / 2 &&
        mouseX < width / 2 + twH / 2 &&
        mouseY > height - 90 - 15 &&
        mouseY < height - 90 + 15;

      if (inQ || inH) {
        dissolveQuestion();
        return;
      }
    }

    // Tạo bubble mới
    let index = clickCount % diseaseList.length;
    revealedDiseases.push({
      x: mouseX,
      y: mouseY,
      info: diseaseList[index],
      alpha: 0,
      scale: 0.2,
      seed: random(1000),
    });
    clickCount++;
  }

  if (scene === 0 && !showIntro && millis() - arrowStartTime > 5000) {
    if (
      mouseX > posX - 100 &&
      mouseX < posX + 100 &&
      mouseY > posY - 20 &&
      mouseY < posY + 20
    ) {
      scene = 1;
      scene1StartTime = millis();
      soundCho.stop();
      soundCoiXe.stop();
      soundMayKhoan.stop();
      videoMorning.time(0);
      videoNight.time(0);
      videoMorning.loop();
      videoNight.loop();
      if (videoCam && videoCam.elt) videoCam.elt.play();
      return;
    }
  }

  if (scene === 1 && millis() - scene1StartTime > 1000) {
    if (dist(mouseX, mouseY, 50, height - 50) < 25) {
      showInstructions = true;
      return;
    }
    if (millis() - scene1StartTime > 15000) {
      if (
        mouseX > posX - 100 &&
        mouseX < posX + 100 &&
        mouseY > posY - 20 &&
        mouseY < posY + 20
      ) {
        scene = 2;
        scene2StartTime = millis();
        videoMorning.stop();
        videoNight.stop();
        if (videoCam && videoCam.elt) videoCam.elt.pause();
        return;
      }
    }
  }
}

function drawCustomCursor() {
  push();
  let gradSize = 35;
  let grad = drawingContext.createRadialGradient(
    cursorX,
    cursorY,
    0,
    cursorX,
    cursorY,
    gradSize,
  );
  grad.addColorStop(0, "rgba(186, 210, 91, 0.9)");
  grad.addColorStop(0.3, "rgba(255, 240, 150, 0.7)");
  grad.addColorStop(0.6, "rgba(230, 160, 230, 0.4)");
  grad.addColorStop(1, "rgba(180, 200, 255, 0)");
  drawingContext.fillStyle = grad;
  noStroke();
  ellipse(cursorX, cursorY, gradSize * 2, gradSize * 2);
  fill(255, 200);
  ellipse(cursorX, cursorY, 4, 4);
  pop();
}

function startExperience() {
  userStartAudio();
  soundCho.loop();
  soundCoiXe.loop();
  soundMayKhoan.loop();
  soundCho.setVolume(0);
  soundCoiXe.setVolume(0);
  soundMayKhoan.setVolume(0);
  startTime = millis();
  experienceStarted = true;
}

function detectHover(x, y) {
  textSize(18);
  let w = textWidth("How long can it remain quiet?");
  hover =
    mouseX > x - w / 2 &&
    mouseX < x + w / 2 &&
    mouseY > y - 20 &&
    mouseY < y + 20;
}

class Crack {
  constructor(x, y, a) {
    this.ptsX = [];
    this.ptsY = [];
    let px = x,
      py = y;
    for (let i = 0; i < 600; i += 6) {
      px += cos(a) * 6 + random(-1.2, 1.2);
      py += sin(a) * 6 + random(-1.2, 1.2);
      this.ptsX.push(px);
      this.ptsY.push(py);
    }
    this.r = random(150, 255);
    this.g = random(150, 255);
    this.b = random(200, 255);
  }
  draw(p) {
    if (p < 0.01) return;
    let n = floor(this.ptsX.length * p);
    if (n < 2) return;
    push();
    noFill();
    stroke(this.r, this.g, this.b, 35);
    strokeWeight(3);
    beginShape();
    for (let j = 0; j < n; j++) vertex(this.ptsX[j], this.ptsY[j]);
    endShape();
    stroke(this.r, this.g, this.b, 210);
    strokeWeight(1);
    beginShape();
    for (let j = 0; j < n; j++) vertex(this.ptsX[j], this.ptsY[j]);
    endShape();
    pop();
  }
}

function initCracks() {
  cracks = [];
  for (let i = 0; i < 35; i++)
    cracks.push(new Crack(width / 2, height * 0.48, random(TWO_PI)));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sliderGlitch.position(width - 210, height - 110);
  sliderVolume.position(width - 210, height - 60);
}
