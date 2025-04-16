/**
 * Module quản lý giao diện người dùng
 */
import CONFIG from './config.js';

class UI {
	constructor() {
		this.scoreElement = document.getElementById('score');
		this.finalScoreElement = document.getElementById('final-score');
		this.gameOverElement = document.getElementById('game-over');
		this.startMessageElement = document.getElementById('start-message');
		this.restartButton = document.getElementById('restart-btn');
		this.gameContainer = document.getElementById('game-container');

		// Đăng ký sự kiện nút restart
		this.restartButton.addEventListener('click', () => {
			if (this.onRestart) this.onRestart();
		});
	}

	/**
	 * Đặt callback cho sự kiện restart
	 */
	setRestartCallback(callback) {
		this.onRestart = callback;
	}

	/**
	 * Hiển thị màn hình bắt đầu
	 */
	showStartMessage() {
		this.startMessageElement.style.display = 'block';
		this.gameOverElement.style.display = 'none';
	}

	/**
	 * Ẩn màn hình bắt đầu
	 */
	hideStartMessage() {
		this.startMessageElement.style.display = 'none';
	}

	/**
	 * Cập nhật điểm số
	 */
	updateScore(score) {
		this.scoreElement.textContent = score;

		// Hiệu ứng khi có điểm
		this.scoreElement.style.transform = 'scale(1.5)';
		setTimeout(() => {
			this.scoreElement.style.transform = 'scale(1)';
		}, 200);
	}

	/**
	 * Hiển thị màn hình game over
	 */
	showGameOver(score) {
		this.finalScoreElement.textContent = score;
		this.gameOverElement.style.display = 'block';
	}

	/**
	 * Đặt lại UI về trạng thái ban đầu
	 */
	reset() {
		this.scoreElement.textContent = '0';
		this.gameOverElement.style.display = 'none';
		this.showStartMessage();
	}
}

export default UI;