/**
 * Module quản lý vật lý Matter.js
 */
import CONFIG from './config.js';

// Import Matter.js components
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;
const Composite = Matter.Composite;

// Tạo engine cho game
const engine = Engine.create({
	gravity: { x: 0, y: CONFIG.GRAVITY }
});

/**
 * Khởi tạo và chạy engine vật lý
 */
function initPhysics() {
	// Tạo ground và ceiling
	const ground = Bodies.rectangle(
		CONFIG.GAME_WIDTH / 2,
		CONFIG.GAME_HEIGHT,
		CONFIG.GAME_WIDTH,
		20,
		{
			isStatic: true,
			render: { visible: false }
		}
	);

	const ceiling = Bodies.rectangle(
		CONFIG.GAME_WIDTH / 2,
		0,
		CONFIG.GAME_WIDTH,
		20,
		{
			isStatic: true,
			render: { visible: false }
		}
	);

	// Thêm vào thế giới vật lý
	World.add(engine.world, [ground, ceiling]);

	// Chạy engine
	Engine.run(engine);

	return { ground, ceiling };
}

/**
 * Kiểm tra va chạm giữa hai vật thể
 */
function checkCollision(objectA, objectB) {
	if (!objectA || !objectB) return false;
	const collision = Matter.Collision.collides(objectA, objectB);
	return collision !== null;
}

/**
 * Set vận tốc cho một vật thể
 */
function setVelocity(body, velocity) {
	Body.setVelocity(body, velocity);
}

/**
 * Thêm vật thể vào thế giới vật lý
 */
function addToWorld(body) {
	// Cho phép thêm một mảng các vật thể hoặc một vật thể đơn lẻ
	if (Array.isArray(body)) {
		World.add(engine.world, body);
	} else {
		World.add(engine.world, body);
	}
}

/**
 * Xóa vật thể khỏi thế giới vật lý
 */
function removeFromWorld(body) {
	World.remove(engine.world, body);
}

/**
 * Di chuyển vật thể
 */
function translateBody(body, translation) {
	Body.translate(body, translation);
}

/**
 * Đăng ký sự kiện engine
 */
function onEngineUpdate(callback) {
	Events.on(engine, 'afterUpdate', callback);
}

export default {
	engine,
	Events,
	Bodies,
	Body,
	initPhysics,
	checkCollision,
	setVelocity,
	addToWorld,
	removeFromWorld,
	translateBody,
	onEngineUpdate
};