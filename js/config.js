/**
 * Cấu hình chung cho trò chơi
 */

const CONFIG = {
	// Kích thước game
	GAME_WIDTH: 400,
	GAME_HEIGHT: 600,

	// Thiết lập chim
	BIRD_START_X: 100,  // 1/4 của game width
	BIRD_START_Y: 300,  // 1/2 của game height
	BIRD_WIDTH: 40,
	BIRD_HEIGHT: 30,
	BIRD_JUMP_FORCE: -8,

	// Thiết lập ống
	PIPE_WIDTH: 70,
	PIPE_SPEED: 2,
	PIPE_FREQUENCY: 2000, // ms
	PIPE_GAP_START: 150,
	PIPE_GAP_MIN: 100,

	// Thiết lập vật lý
	GRAVITY: 0.8,

	// Thiết lập độ khó
	DIFFICULTY_INCREASE_SCORE: 5, // Tăng độ khó sau mỗi 5 điểm
	DIFFICULTY_DECREASE_GAP: 5,   // Giảm khoảng cách ống 5px
	DIFFICULTY_DECREASE_FREQ: 100 // Giảm thời gian tạo ống 100ms
};

export default CONFIG;