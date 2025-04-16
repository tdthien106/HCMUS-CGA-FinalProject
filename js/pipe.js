/**
 * Module quản lý các ống trong game
 */
import CONFIG from './config.js';
import Physics from './physics.js';

class Pipe {
	constructor(container) {
		this.container = container;
		this.topBody = null;
		this.bottomBody = null;
		this.topElement = null;
		this.bottomElement = null;
		this.scored = false;
		this.isActive = true;

		this.create();
	}

	/**
	 * Tạo một cặp ống mới
	 */
	create() {
		const pipeWidth = CONFIG.PIPE_WIDTH;
		const minGapPosition = 100;
		const maxGapPosition = CONFIG.GAME_HEIGHT - 100 - CONFIG.PIPE_GAP_START;
		const gapPosition = Math.random() * (maxGapPosition - minGapPosition) + minGapPosition;

		// Tạo ống trên
		this.topBody = Physics.Bodies.rectangle(
			CONFIG.GAME_WIDTH + pipeWidth / 2,
			gapPosition / 2,
			pipeWidth,
			gapPosition,
			{
				isStatic: true,
				render: { visible: false }
			}
		);

		// Tạo ống dưới
		this.bottomBody = Physics.Bodies.rectangle(
			CONFIG.GAME_WIDTH + pipeWidth / 2,
			gapPosition + CONFIG.PIPE_GAP_START + (CONFIG.GAME_HEIGHT - gapPosition - CONFIG.PIPE_GAP_START) / 2,
			pipeWidth,
			CONFIG.GAME_HEIGHT - gapPosition - CONFIG.PIPE_GAP_START,
			{
				isStatic: true,
				render: { visible: false }
			}
		);

		// Thêm vào thế giới vật lý
		Physics.addToWorld([this.topBody, this.bottomBody]);

		// Tạo elements
		this.topElement = document.createElement('div');
		this.topElement.className = 'pipe pipe-top';
		this.topElement.style.left = CONFIG.GAME_WIDTH + 'px';
		this.topElement.style.top = '0';
		this.topElement.style.height = gapPosition + 'px';

		this.bottomElement = document.createElement('div');
		this.bottomElement.className = 'pipe pipe-bottom';
		this.bottomElement.style.left = CONFIG.GAME_WIDTH + 'px';
		this.bottomElement.style.top = (gapPosition + CONFIG.PIPE_GAP_START) + 'px';
		this.bottomElement.style.height = (CONFIG.GAME_HEIGHT - gapPosition - CONFIG.PIPE_GAP_START) + 'px';

		// Thêm vào DOM
		this.container.appendChild(this.topElement);
		this.container.appendChild(this.bottomElement);
	}

	/**
	 * Cập nhật vị trí của ống
	 */
	update() {
		if (!this.isActive) return;

		// Di chuyển ống sang trái
		Physics.translateBody(this.topBody, { x: -CONFIG.PIPE_SPEED, y: 0 });
		Physics.translateBody(this.bottomBody, { x: -CONFIG.PIPE_SPEED, y: 0 });

		// Cập nhật vị trí DOM
		if (this.topElement && this.bottomElement) {
			this.topElement.style.left = (this.topBody.position.x - CONFIG.PIPE_WIDTH / 2) + 'px';
			this.bottomElement.style.left = (this.bottomBody.position.x - CONFIG.PIPE_WIDTH / 2) + 'px';
		}
	}

	/**
	 * Kiểm tra nếu ống đã ra khỏi màn hình
	 */
	isOffScreen() {
		return this.topBody.position.x < -CONFIG.PIPE_WIDTH;
	}

	/**
	 * Kiểm tra nếu chim đã vượt qua ống
	 */
	checkPassed(birdX) {
		if (!this.scored && this.topBody.position.x + CONFIG.PIPE_WIDTH / 2 < birdX) {
			this.scored = true;
			return true;
		}
		return false;
	}

	/**
	 * Xóa ống khỏi game
	 */
	destroy() {
		if (!this.isActive) return;

		this.isActive = false;

		// Xóa khỏi thế giới vật lý
		Physics.removeFromWorld(this.topBody);
		Physics.removeFromWorld(this.bottomBody);

		// Xóa khỏi DOM
		if (this.topElement && this.bottomElement) {
			this.container.removeChild(this.topElement);
			this.container.removeChild(this.bottomElement);
		}
	}
}

class PipeManager {
	constructor() {
		this.pipes = [];
		this.container = document.getElementById('game-container');
		this.pipeFrequency = CONFIG.PIPE_FREQUENCY;
		this.pipeGap = CONFIG.PIPE_GAP_START;
		this.lastPipeTime = 0;
	}

	/**
	 * Tạo ống mới
	 */
	createPipe() {
		const pipe = new Pipe(this.container);
		this.pipes.push(pipe);
		return pipe;
	}

	/**
	 * Cập nhật tất cả ống
	 */
	update() {
		for (let i = this.pipes.length - 1; i >= 0; i--) {
			const pipe = this.pipes[i];
			pipe.update();

			// Xóa ống ra khỏi màn hình
			if (pipe.isOffScreen()) {
				pipe.destroy();
				this.pipes.splice(i, 1);
			}
		}
	}

	/**
	 * Kiểm tra va chạm với chim
	 */
	checkCollisions(bird) {
		for (const pipe of this.pipes) {
			if (bird.checkCollision(pipe.topBody) || bird.checkCollision(pipe.bottomBody)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Kiểm tra nếu chim đã vượt qua ống nào
	 */
	checkPassed(birdX) {
		if (birdX === undefined || birdX === null) return false;

		for (const pipe of this.pipes) {
			if (pipe.checkPassed(birdX)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Xóa tất cả ống
	 */
	reset() {
		for (const pipe of this.pipes) {
			pipe.destroy();
		}
		this.pipes = [];
		this.pipeFrequency = CONFIG.PIPE_FREQUENCY;
		this.pipeGap = CONFIG.PIPE_GAP_START;
		this.lastPipeTime = 0;
	}

	/**
	 * Tăng độ khó
	 */
	increaseDifficulty() {
		this.pipeFrequency = Math.max(1000, this.pipeFrequency - CONFIG.DIFFICULTY_DECREASE_FREQ);
		this.pipeGap = Math.max(CONFIG.PIPE_GAP_MIN, this.pipeGap - CONFIG.DIFFICULTY_DECREASE_GAP);
	}
}

export default PipeManager;