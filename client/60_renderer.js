// ================== DRAW ==================
function draw() {
	ctx.clearRect(0, 0, screenW, screenH);

	ctx.fillStyle = "red";
	ctx.fillRect(dot.x, dot.y, 10, 10);

	ctx.fillStyle = "blue";
	players.forEach(p => ctx.fillRect(p.x, p.y, 20, 20));

	requestAnimationFrame(draw);
}
