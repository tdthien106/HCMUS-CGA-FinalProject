/**
 * File chính điều khiển toàn bộ game
 */
import CONFIG from './config.js';
import Physics from './physics.js';
import Bird from './bird.js';
import PipeManager from './pipe.js';
import UI from './ui.js';

class Game {
	constructor() {
		this.bird = null;
		this.pipeManager = null;
		this.ui = null;
		this.score = 0;
		this.gameRunning = true; // Thay đổi từ false thành true
		this.gameStarted = false;
		this.animationFrameId = null;

		this.init();
	}

	/**
	 * Khởi tạo game
	 */
	init() {
		// Khởi tạo vật lý
		const { ground, ceiling } = Physics.initPhysics();
		this.boundaries = { ground, ceiling };

		// Khởi tạo các thành phần
		this.bird = new Bird();
		this.pipeManager = new PipeManager();
		this.ui = new UI();

		// Đăng ký sự kiện restart
		this.ui.setRestartCallback(() => this.reset());

		// Đăng ký sự kiện đầu vào
		this.setupControls();
	}

	/**
	 * Thiết lập điều khiển
	 */
	setupControls() {
		// Điều khiển bàn phím
		document.addEventListener('keydown', (e) => {
			if (e.code === 'Space') {
				this.handleJump();
			}
		});

		// Điều khiển chuột
		document.getElementById('game-container').addEventListener('click', () => {
			this.handleJump();
		});
	}

	/**
	 * Xử lý khi nhảy
	 */
	handleJump() {
		if (!this.gameRunning) return;

		if (!this.gameStarted) {
			this.startGame();
		}

		this.bird.jump();
	}

	/**
	 * Bắt đầu game
	 */
	startGame() {
		if (this.gameStarted) return;

		this.gameStarted = true;
		this.ui.hideStartMessage();

		// Hủy animation frame trước đó nếu có
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}

		// Đặt thời gian tạo ống đầu tiên
		this.pipeManager.lastPipeTime = Date.now();

		// Bắt đầu game loop
		this.gameLoop();
	}

	/**
	 * Vòng lặp game
	 */
	gameLoop() {
		if (this.gameRunning) {
			const currentTime = Date.now();

			// Tạo ống mới theo thời gian
			if (currentTime - this.pipeManager.lastPipeTime > this.pipeManager.pipeFrequency) {
				this.pipeManager.createPipe();
				this.pipeManager.lastPipeTime = currentTime;

				// Tăng độ khó dựa vào điểm
				if (this.score > 0 && this.score % CONFIG.DIFFICULTY_INCREASE_SCORE === 0) {
					this.pipeManager.increaseDifficulty();
				}
			}

			// Cập nhật ống
			this.pipeManager.update();

			// Kiểm tra va chạm
			this.checkCollisions();

			// Kiểm tra vượt qua ống
			if (this.bird && this.bird.body && this.pipeManager.checkPassed(this.bird.body.position.x)) {
				this.score++;
				this.ui.updateScore(this.score);
			}

			// Tiếp tục vòng lặp
			this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
		}
	}

	/**
	 * Kiểm tra va chạm
	 */
	checkCollisions() {
		if (!this.bird || !this.bird.body) return;

		// Kiểm tra va chạm với ground/ceiling
		if (
			this.bird.body.position.y > CONFIG.GAME_HEIGHT - 30 ||
			this.bird.body.position.y < 30 ||
			this.pipeManager.checkCollisions(this.bird)
		) {
			this.gameOver();
		}
	}

	/**
	 * Game over
	 */
	gameOver() {
		if (!this.gameRunning) return;

		this.gameRunning = false;
		cancelAnimationFrame(this.animationFrameId);

		this.bird.die();
		this.ui.showGameOver(this.score);
	}

	/**
	 * Reset game
	 */
	reset() {
		// Reset các thành phần
		this.pipeManager.reset();
		this.bird.reset();
		this.ui.reset();

		// Reset các biến
		this.score = 0;
		this.gameRunning = true;
		this.gameStarted = false;
	}
}

// Khởi động game khi trang tải xong
window.onload = () => {
	const game = new Game();
};

export default Game;