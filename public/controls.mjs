function controls(player, socket) {
    document.addEventListener('keydown', e => {
        let dir = getKey(e);
        if (dir) {
            player.moveDir(dir);
            socket.emit('move-player', dir, { x: player.x, y: player.y });
        }
    });

    document.addEventListener('keyup', e => {
        let dir = getKey(e);
        if (dir) {
            player.stopDir(dir);
            socket.emit('stop-player', dir, { x: player.x, y: player.y });
        }
    });

    function getKey(e) {
        if (e.keyCode === 87 || e.keyCode === 38) return 'up';
        if (e.keyCode === 83 || e.keyCode === 40) return 'down';
        if (e.keyCode === 65 || e.keyCode === 37) return 'left';
        if (e.keyCode === 68 || e.keyCode === 39) return 'right';
    }
}

export default controls;