// ===== Canvas =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ===== フレーム =====
let frame = 0;

// ===== 背景 =====
const maps = {
  map1: new Image(),
  map2: new Image(),
	map3: new Image()
};

maps.map1.src = "home_2F.png";
maps.map2.src = "home_1F.png";   
maps.map3.src = "masara_town.png";

let currentMap = "map1";

// ===== プレイヤー画像 =====
const playerImages = {
  down: [new Image(), new Image()],
  up: [new Image(), new Image()],
  left: [new Image(), new Image()],
  right: [new Image(), new Image()]
};

playerImages.down[0].src = "player_down_1.png";
playerImages.down[1].src = "player_down_2.png";

playerImages.up[0].src = "player_up_1.png";
playerImages.up[1].src = "player_up_2.png";

playerImages.left[0].src = "player_left_1.png";
playerImages.left[1].src = "player_left_2.png";

playerImages.right[0].src = "player_right_1.png";
playerImages.right[1].src = "player_right_2.png";

// ===== プレイヤー =====
let player = {
  x: 150,
  y: 300,
  targetX: 150,
  targetY: 300,
  moving: false
};

let direction = "down";
let walkFrame = 0;

let tileSize = 50;
const speed = 4;


// ===== 当たり判定 =====

//壁
const walls = {
  map1: [
    {x:0,y:50},{x:50,y:50},{x:100,y:50},//画面左上の机とパソコン
    {x:150,y:0},{x:200,y:0},{x:250,y:0},{x:300,y:0},//画面上部の壁
    {x:150,y:200},{x:150,y:250},//画面中央テレビとファミコン
    {x:0,y:300},{x:0,y:350},//画面左下のベッド
    {x:300,y:300},{x:300,y:350}//画面右下の草木
  ],
  map2: [
    {x:100,y:0},{x:150,y:0},{x:200,y:0},{x:250,y:0},{x:300,y:0},//画面上部の壁
		{x:0,y:50},{x:50,y:50},//画面左上の本棚
		{x:150,y:50},//画面上部のテレビ
		{x:150,y:200},{x:200,y:200},{x:150,y:250},{x:200,y:250}//画面中央のテーブル
  ],
  map3: [
    {x:0,y:0}
  ]
};

//マップ移動用
const warps = [
  {
    map: "map1",
    x: 350,
    y: 50,
    toMap: "map2",
    toX: 300,
    toY: 50
  },
  {
    map: "map2",
    x: 350,
    y: 50,
    toMap: "map1",
    toX: 300,
    toY: 50
  },
	{
		map: "map2",
		x: 100,
		y: 350,
		toMap: "map3",
		toX: 100,
		toY: 120
	},
	{
		map: "map3",
		x: 100,
		y: 100,
		toMap: "map2",
		toX: 150,
		toY: 350
	}
];

//草むら（敵出る）
const grass = {
  map1: [
    // 自宅はエンカウントないので空
  ],

  map2: [
    //　同じく自宅はエンカウントないので空
  ],
  map3: [
    //　画面上部草むらにエンカウント発生判定入れる
    {x:200,y:0},{x:220,y:0},{x:200,y:20},{x:220,y:20}
  ]
};

// ===== 状態 =====
let state = "field";

let playerHp = 30;
let enemyHp = 20;

let battleState = "start";
let message = "";

let shake = 0;

// ===== 入力 =====
document.addEventListener("keydown", e=>{
  if(state !== "field") return;
  if(player.moving) return;

  let nx = player.targetX;
  let ny = player.targetY;

  if(e.key==="ArrowUp"){
    ny -= tileSize;
    direction="up";
  }
  if(e.key==="ArrowDown"){
    ny += tileSize;
    direction="down";
  }
  if(e.key==="ArrowLeft"){
    nx -= tileSize;
    direction="left";
  }
  if(e.key==="ArrowRight"){
    nx += tileSize;
    direction="right";
  }

  if(nx<0||nx>368||ny<0||ny>368) return;
  if(isWall(nx,ny)) return;

  player.targetX = nx;
  player.targetY = ny;
  player.moving = true;
});

// ===== 移動 =====
function updatePlayer(){
  if(!player.moving) return;

  if(player.x < player.targetX) player.x += speed;
  if(player.x > player.targetX) player.x -= speed;
  if(player.y < player.targetY) player.y += speed;
  if(player.y > player.targetY) player.y -= speed;

  walkFrame++;

  if(Math.abs(player.x - player.targetX) < speed &&
     Math.abs(player.y - player.targetY) < speed){

    player.x = player.targetX;
    player.y = player.targetY;
    player.moving = false;

		//マップ移動処理
    warps.forEach(w => {
			if(currentMap === w.map &&
				player.x === w.x &&
				player.y === w.y){

				currentMap = w.toMap;
        tileSize = (currentMap === "map3") ? 20 : 50;
				player.x = w.toX;
				player.y = w.toY;
				player.targetX = w.toX;
				player.targetY = w.toY;
      }
    });

		//草むらエンカウント処理
    if(isGrass(player.x, player.y) && Math.random()<0.3){
      state="battle";
      battleState="start";
      message="敵が現れた！";
      playerHp=30;
      enemyHp=20;
    }
  }
}

// ===== クリック =====
canvas.addEventListener("click",()=>{
  if(state!=="battle") return;

  if(battleState==="start"){
    battleState="command";
    message="どうする？";
  }

  else if(battleState==="command"){
    let dmg=Math.floor(Math.random()*6)+1;
    enemyHp-=dmg;
    message="あなたの攻撃 "+dmg;
    shake=5;

    setTimeout(()=>{
      if(enemyHp<=0){
        message="勝った！";
        setTimeout(()=>state="field",1000);
        return;
      }

      let edmg=Math.floor(Math.random()*5)+1;
      playerHp-=edmg;
      message="敵の攻撃 "+edmg;
      shake=5;

      setTimeout(()=>{
        if(playerHp<=0){
          message="負けた";
          setTimeout(()=>state="field",1000);
        } else {
          message="どうする？";
        }
      },600);

    },600);
  }
});

// ===== 判定 =====

//壁ぶつかり判定
function isWall(x,y){
	return (walls[currentMap] || []).some(w=>w.x===x && w.y===y);
}
//草むらエンカウント判定
function isGrass(x,y){
  return (grass[currentMap] || []).some(g=>g.x===x && g.y===y);
}

// ===== 描画 =====
function drawField(){

  const imgMap = maps[currentMap];
  if(imgMap.complete){
    ctx.drawImage(imgMap,0,0,400,400);
  }

  const frameIndex = Math.floor(walkFrame / 10) % 2;
  const img = playerImages[direction][frameIndex];

  if(img.complete){
    const size = (currentMap === "map3") ? 20 : 50;
    ctx.drawImage(img, player.x, player.y, size, size);
  }
}

function drawBattle(){
  let offsetX = shake>0 ? (Math.random()*6-3) : 0;
  let offsetY = shake>0 ? (Math.random()*6-3) : 0;

  ctx.save();
  ctx.translate(offsetX,offsetY);

  ctx.fillStyle="#9bbc0f";
  ctx.fillRect(0,0,400,400);

  ctx.fillStyle="#0f380f";
  ctx.fillRect(250,50,100,40);

  ctx.fillStyle="white";
  ctx.fillText("ENEMY "+enemyHp,255,75);

  ctx.fillStyle="#306230";
  ctx.fillRect(270,100,60,60);

  ctx.fillStyle="#0f380f";
  ctx.fillRect(50,220,100,40);

  ctx.fillStyle="white";
  ctx.fillText("YOU "+playerHp,55,245);

  const frameIndex = Math.floor(walkFrame / 10) % 2;
  const img = playerImages[direction][frameIndex];

  if(img.complete){
    ctx.drawImage(img, 80,160,48,48);
  }

  ctx.fillStyle="#c7f464";
  ctx.fillRect(0,280,400,50);

  ctx.fillStyle="black";
  ctx.fillText(message,10,310);

  ctx.fillStyle="#0f380f";
  ctx.fillRect(0,330,400,70);

  ctx.fillStyle="#9bbc0f";
  ctx.fillText("クリックで攻撃",20,360);

  ctx.restore();

  if(shake>0) shake--;
}

// ===== ループ =====
function loop(){
  frame++;

  updatePlayer();

  if(state==="field"){
    drawField();
  } else {
    drawBattle();
  }

  requestAnimationFrame(loop);
}

loop();