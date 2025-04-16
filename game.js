// Khởi tạo engine
const Engine = Matter.Engine,
	Render = Matter.Render,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Body = Matter.Body,
	Events = Matter.Events,
	Composite = Matter.Composite;

// Tạo engine
const engine = Engine.create({
	gravity: { x: 0, y: 0.8 }
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
let pipeFrequency = 2000; // ms
let lastPipeTime = 0;
let ground, ceiling;
let animationFrameId;
let gameStarted = false;

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
			friction: 0.01,
			render: {
				visible: false
			}
		}
	);

	World.add(engine.world, bird);

	// Cập nhật vị trí bird element
	Events.on(engine, 'afterUpdate', function () {
		if (!bird) return;

		birdElem.style.left = (bird.position.x - 15) + 'px';
		birdElem.style.top = (bird.position.y - 15) + 'px';

		// Kiểm tra va chạm với ground/ceiling
		if (bird.position.y > gameHeight - 30 || bird.position.y < 30) {
			gameOver();
		}
	});
}

// Tạo ống
function createPipe() {
	const pipeWidth = 60;
	const minGapPosition = 100;
	const maxGapPosition = gameHeight - 100 - pipeGap;
	const gapPosition = Math.random() * (maxGapPosition - minGapPosition) + minGapPosition;

	// Ống trên
	const topPipe = Bodies.rectangle(
		gameWidth + pipeWidth / 2,
		gapPosition / 2,
		pipeWidth,
		gapPosition,
		{
			isStatic: true,
			render: {
				visible: false
			}
		}
	);

	// Ống dưới
	const bottomPipe = Bodies.rectangle(
		gameWidth + pipeWidth / 2,
		gapPosition + pipeGap + (gameHeight - gapPosition - pipeGap) / 2,
		pipeWidth,
		gameHeight - gapPosition - pipeGap,
		{
			isStatic: true,
			render: {
				visible: false
			}
		}
	);

	World.add(engine.world, [topPipe, bottomPipe]);

	// Tạo pipe elements
	const topPipeElem = document.createElement('div');
	topPipeElem.className = 'pipe pipe-top';
	topPipeElem.style.left = gameWidth + 'px';
	topPipeElem.style.top = '0';
	topPipeElem.style.height = gapPosition + 'px';

	const bottomPipeElem = document.createElement('div');
	bottomPipeElem.className = 'pipe pipe-bottom';
	bottomPipeElem.style.left = gameWidth + 'px';
	bottomPipeElem.style.top = (gapPosition + pipeGap) + 'px';
	bottomPipeElem.style.height = (gameHeight - gapPosition - pipeGap) + 'px';

	document.getElementById('game-container').appendChild(topPipeElem);
	document.getElementById('game-container').appendChild(bottomPipeElem);

	const pipe = {
		top: topPipe,
		bottom: bottomPipe,
		topElem: topPipeElem,
		bottomElem: bottomPipeElem,
		scored: false
	};

	pipes.push(pipe);
	return pipe;
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
		if (!pipe.scored && pipe.top.position.x + 30 < bird.position.x) {
			pipe.scored = true;
			score++;
			document.getElementById('score').textContent = score;

			// Hiệu ứng điểm
			const scoreElem = document.getElementById('score');
			scoreElem.style.transform = 'scale(1.5)';
			setTimeout(() => {
				scoreElem.style.transform = 'scale(1)';
			}, 200);
		}

		// Xóa pipes khi ra khỏi màn hình
		if (pipe.top.position.x < -60) {
			World.remove(engine.world, [pipe.top, pipe.bottom]);
			if (pipe.topElem && pipe.bottomElem) {
				document.getElementById('game-container').removeChild(pipe.topElem);
				document.getElementById('game-container').removeChild(pipe.bottomElem);
			}
			pipes.splice(i, 1);
		}
	}
}

// Kiểm tra va chạm
function checkCollisions() {
	if (!gameRunning || !bird) return;

	for (let pipe of pipes) {
		if (
			Matter.Collision.collides(bird, pipe.top) ||
			Matter.Collision.collides(bird, pipe.bottom)
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
	cancelAnimationFrame(animationFrameId);

	document.getElementById('final-score').textContent = score;
	document.getElementById('game-over').style.display = 'block';

	// Hiệu ứng rơi khi game over
	if (bird) {
		Body.setVelocity(bird, { x: 0, y: 5 });
		Body.setAngularVelocity(bird, 0.1);
	}
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
	if (bird) {
		World.remove(engine.world, bird);
	}
	createBird();

	// Reset game state
	gameRunning = true;
	gameStarted = false;
	lastPipeTime = 0;

	// Reset difficulty
	pipeGap = 150;
	pipeFrequency = 2000;

	// KHÔNG khởi động lại engine ở đây, nó đã chạy rồi
	// Engine.run(engine);

	// Khởi động lại game
	startGame();
}

// Bắt đầu game
function startGame() {
	if (gameStarted) return;
	gameStarted = true;

	// Đảm bảo hủy bất kỳ animation frame nào đang chạy
	if (animationFrameId) {
		cancelAnimationFrame(animationFrameId);
	}

	function gameLoop() {
		if (gameRunning) {
			const currentTime = Date.now();
			if (currentTime - lastPipeTime > pipeFrequency) {
				createPipe();
				lastPipeTime = currentTime;

				// Tăng độ khó theo điểm
				if (score > 0 && score % 5 === 0) {
					pipeFrequency = Math.max(1000, pipeFrequency - 100);
					pipeGap = Math.max(100, pipeGap - 5);
				}
			}

			updatePipes();
			checkCollisions();
			animationFrameId = requestAnimationFrame(gameLoop);
		}
	}

	lastPipeTime = Date.now();
	gameLoop();
}

// Khởi tạo game
function init() {
	// Tạo ground và ceiling cho physics
	ground = Bodies.rectangle(gameWidth / 2, gameHeight, gameWidth, 20, {
		isStatic: true,
		render: { visible: false }
	});

	ceiling = Bodies.rectangle(gameWidth / 2, 0, gameWidth, 20, {
		isStatic: true,
		render: { visible: false }
	});

	World.add(engine.world, [ground, ceiling]);

	createBird();

	// Xử lý điều khiển
	function jump() {
		if (!gameRunning) return;

		if (!gameStarted) {
			startGame();
		}

		Body.setVelocity(bird, { x: 0, y: -8 });

		// Hiệu ứng nhảy
		const birdElem = document.getElementById('bird');
		birdElem.style.transform = 'scale(1.1, 0.9)';
		setTimeout(() => {
			birdElem.style.transform = 'scale(1)';
		}, 100);
	}

	document.addEventListener('keydown', function (e) {
		if (e.code === 'Space') {
			jump();
		}
	});

	document.getElementById('game-container').addEventListener('click', jump);

	// Nút restart
	document.getElementById('restart-btn').addEventListener('click', resetGame);

	// Chạy engine
	Engine.run(engine);
}

// Khởi động game khi trang load xong
window.onload = init;