/**
 * Module quản lý nhân vật chim
 */
import CONFIG from './config.js';
import Physics from './physics.js';

class Bird {
	constructor() {
		this.element = document.getElementById('bird');
		this.body = null;
		this.angle = 0;
		this.isAlive = true;
		this.init();
	}

	/**
	 * Khởi tạo vật thể chim
	 */
	init() {
		// Tạo vật lý cho chim
		this.body = Physics.Bodies.rectangle(
			CONFIG.BIRD_START_X,
			CONFIG.BIRD_START_Y,
			CONFIG.BIRD_WIDTH - 10, // Phạm vi va chạm nhỏ hơn một chút so với kích thước hiển thị
			CONFIG.BIRD_HEIGHT - 10,
			{
				restitution: 0.5,
				friction: 0.01,
				render: { visible: false }
			}
		);

		// Thêm vào thế giới vật lý
		Physics.addToWorld(this.body);

		// Cập nhật vị trí DOM element theo vật lý
		Physics.onEngineUpdate(() => this.update());
	}

	/**
	 * Cập nhật vị trí và góc xoay của chim
	 */
	update() {
		if (!this.body || !this.isAlive) return;

		// Cập nhật vị trí
		this.element.style.left = (this.body.position.x - CONFIG.BIRD_WIDTH / 2) + 'px';
		this.element.style.top = (this.body.position.y - CONFIG.BIRD_HEIGHT / 2) + 'px';

		// Cập nhật góc xoay theo vận tốc
		if (this.isAlive) {
			const yVelocity = this.body.velocity.y;
			this.angle = Math.min(Math.max(yVelocity * 0.2, -0.5), 0.5);
			this.element.style.transform = `rotate(${this.angle}rad)`;
		}
	}

	/**
	 * Nhảy lên
	 */
	jump() {
		if (!this.isAlive) return;

		Physics.setVelocity(this.body, { x: 0, y: CONFIG.BIRD_JUMP_FORCE });

		// Hiệu ứng nhảy
		this.element.style.transform = `rotate(-0.4rad) scale(1.1, 0.9)`;

		setTimeout(() => {
			if (!this.isAlive) return;
			this.element.style.transform = `rotate(${this.angle}rad)`;
		}, 100);
	}

	/**
	 * Xử lý chim khi game over
	 */
	die() {
		this.isAlive = false;

		// Hiệu ứng rơi
		Physics.setVelocity(this.body, { x: 0, y: 5 });
		Physics.Body.setAngularVelocity(this.body, 0.1);
	}

	/**
	 * Reset chim về vị trí ban đầu
	 */
	reset() {
		if (this.body) {
			Physics.removeFromWorld(this.body);
		}

		this.init();
		this.isAlive = true;
		this.angle = 0;
		this.element.style.transform = 'rotate(0)';
	}

	/**
	 * Kiểm tra va chạm với đối tượng khác
	 */
	checkCollision(otherBody) {
		return Physics.checkCollision(this.body, otherBody);
	}
}

export default Bird;