// Khởi tạo engine
const Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Events = Matter.Events;

const engine = Engine.create({
    gravity: { x: 0, y: 0.5 }
});

// Kích thước game
const gameWidth = 400;
const gameHeight = 600;

// Biến game
let bird;
let pipes = [];
let score = 0;
let gameRunning = true;
let pipeGap = 150;
let pipeFrequency = 1500; // ms
let lastPipeTime = 0;
let ground;
let ceiling;

// Tạo bird
function createBird() {
    const birdElem = document.getElementById('bird');
    bird = Bodies.rectangle(
        gameWidth / 4, 
        gameHeight / 2, 
        30, 
        30, 
        { 
            restitution: 0.5,
            render: {
                visible: false // Ẩn hình ảnh mặc định của Matter.js
            }
        }
    );
    World.add(engine.world, bird);
    
    // Cập nhật vị trí bird element
    Events.on(engine, 'afterUpdate', function() {
        birdElem.style.left = (bird.position.x - 15) + 'px';
        birdElem.style.top = (bird.position.y - 15) + 'px';
        
        // Kiểm tra va chạm với ground/ceiling
        if (bird.position.y > gameHeight || bird.position.y < 0) {
            gameOver();
        }
    });
}

// Tạo ống
function createPipe() {
    const pipeWidth = 60;
    const gapPosition = Math.random() * (gameHeight - pipeGap - 100) + 50;
    
    // Ống trên
    const topPipe = Bodies.rectangle(
        gameWidth, 
        gapPosition - pipeGap/2, 
        pipeWidth, 
        gapPosition - pipeGap/2, 
        { 
            isStatic: true,
            render: {
                fillStyle: '#4caf50',
                visible: false
            }
        }
    );
    
    // Ống dưới
    const bottomPipe = Bodies.rectangle(
        gameWidth, 
        gapPosition + pipeGap/2 + (gameHeight - gapPosition - pipeGap/2)/2, 
        pipeWidth, 
        gameHeight - gapPosition - pipeGap/2, 
        { 
            isStatic: true,
            render: {
                fillStyle: '#4caf50',
                visible: false
            }
        }
    );
    
    World.add(engine.world, [topPipe, bottomPipe]);
    pipes.push({ top: topPipe, bottom: bottomPipe, scored: false });
    
    // Tạo pipe elements
    const topPipeElem = document.createElement('div');
    topPipeElem.className = 'pipe';
    topPipeElem.style.left = gameWidth + 'px';
    topPipeElem.style.top = '0';
    topPipeElem.style.height = (gapPosition - pipeGap/2) + 'px';
    
    const bottomPipeElem = document.createElement('div');
    bottomPipeElem.className = 'pipe';
    bottomPipeElem.style.left = gameWidth + 'px';
    bottomPipeElem.style.top = (gapPosition + pipeGap/2) + 'px';
    bottomPipeElem.style.height = (gameHeight - gapPosition - pipeGap/2) + 'px';
    
    document.getElementById('game-container').appendChild(topPipeElem);
    document.getElementById('game-container').appendChild(bottomPipeElem);
    
    return { top: topPipe, bottom: bottomPipe, topElem: topPipeElem, bottomElem: bottomPipeElem };
}

// Cập nhật pipes
function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        
        // Di chuyển pipes sang trái
        Body.translate(pipe.top, { x: -2, y: 0 });
        Body.translate(pipe.bottom, { x: -2, y: 0 });
        
        // Cập nhật vị trí elements
        if (pipe.topElem && pipe.bottomElem) {
            pipe.topElem.style.left = (pipe.top.position.x - 30) + 'px';
            pipe.bottomElem.style.left = (pipe.bottom.position.x - 30) + 'px';
        }
        
        // Kiểm tra nếu bird đã vượt qua pipe
        if (!pipe.scored && pipe.top.position.x < bird.position.x) {
            pipe.scored = true;
            score++;
            document.getElementById('score').textContent = score;
        }
        
        // Xóa pipes khi ra khỏi màn hình
        if (pipe.top.position.x < -60) {
            World.remove(engine.world, [pipe.top, pipe.bottom]);
            document.getElementById('game-container').removeChild(pipe.topElem);
            document.getElementById('game-container').removeChild(pipe.bottomElem);
            pipes.splice(i, 1);
        }
    }
}

// Kiểm tra va chạm
function checkCollisions() {
    for (let pipe of pipes) {
        if (
            Matter.Collision.collides(bird, pipe.top, 1) || 
            Matter.Collision.collides(bird, pipe.bottom, 1)
        ) {
            gameOver();
            break;
        }
    }
}

// Game over
function gameOver() {
    if (!gameRunning) return;
    
    gameRunning = false;
    Engine.clear(engine);
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').style.display = 'block';
}

// Reset game
function resetGame() {
    // Xóa tất cả pipes
    for (let pipe of pipes) {
        World.remove(engine.world, [pipe.top, pipe.bottom]);
        if (pipe.topElem && pipe.bottomElem) {
            document.getElementById('game-container').removeChild(pipe.topElem);
            document.getElementById('game-container').removeChild(pipe.bottomElem);
        }
    }
    pipes = [];
    
    // Reset score
    score = 0;
    document.getElementById('score').textContent = '0';
    document.getElementById('game-over').style.display = 'none';
    
    // Tạo lại bird
    World.remove(engine.world, bird);
    createBird();
    
    // Reset game state
    gameRunning = true;
    lastPipeTime = 0;
    
    // Khởi động lại engine
    Engine.run(engine);
}

// Khởi tạo game
function init() {
    createBird();
    
    // Xử lý nhấn phím/click để bird nhảy
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && gameRunning) {
            Body.setVelocity(bird, { x: 0, y: -8 });
        }
    });
    
    document.getElementById('game-container').addEventListener('click', function() {
        if (gameRunning) {
            Body.setVelocity(bird, { x: 0, y: -8 });
        }
    });
    
    // Nút restart
    document.getElementById('restart-btn').addEventListener('click', resetGame);
    
    // Game loop
    function gameLoop() {
        if (gameRunning) {
            const currentTime = Date.now();
            if (currentTime - lastPipeTime > pipeFrequency) {
                createPipe();
                lastPipeTime = currentTime;
            }
            
            updatePipes();
            checkCollisions();
        }
        requestAnimationFrame(gameLoop);
    }
    
    // Bắt đầu game loop
    gameLoop();
    Engine.run(engine);
}

// Khởi động game khi trang load xong
window.onload = init;