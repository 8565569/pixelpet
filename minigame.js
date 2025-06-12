// ===== 小游戏功能 =====
function startMinigame() {
  const canvas = document.getElementById('minigame-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // 游戏状态
  const minigameState = {
    petX: width / 2 - 25,
    petWidth: 50,
    petHeight: 20,
    food: [],
    score: 0,
    gameActive: true,
    lastFrame: Date.now()
  };
  
  // 重置分数
  state.minigameScore = 0;
  document.getElementById('minigame-score').textContent = `得分: ${state.minigameScore}`;
  
  // 键盘控制
  const keys = {};
  window.addEventListener('keydown', e => {
    keys[e.key] = true;
  });
  
  window.addEventListener('keyup', e => {
    keys[e.key] = false;
  });
  
  // 游戏循环
  function minigameLoop() {
    const now = Date.now();
    const delta = now - minigameState.lastFrame;
    minigameState.lastFrame = now;
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制背景
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制网格
    ctx.strokeStyle = 'rgba(0, 173, 181, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // 移动宠物
    if (keys['ArrowLeft'] && minigameState.petX > 0) {
      minigameState.petX -= 5;
    }
    if (keys['ArrowRight'] && minigameState.petX < width - minigameState.petWidth) {
      minigameState.petX += 5;
    }
    
    // 绘制宠物
    ctx.fillStyle = '#00adb5';
    ctx.fillRect(minigameState.petX, height - minigameState.petHeight - 10, minigameState.petWidth, minigameState.petHeight);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(minigameState.petX + 15, height - minigameState.petHeight, 5, 0, Math.PI * 2);
    ctx.arc(minigameState.petX + minigameState.petWidth - 15, height - minigameState.petHeight, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 生成食物
    if (Math.random() < 0.03) {
      minigameState.food.push({
        x: Math.random() * (width - 20),
        y: 0,
        width: 15,
        height: 15,
        speed: 1 + Math.random() * 2,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      });
    }
    
    // 更新和绘制食物
    for (let i = minigameState.food.length - 1; i >= 0; i--) {
      const food = minigameState.food[i];
      food.y += food.speed;
      
      // 检测碰撞
      if (food.y + food.height > height - minigameState.petHeight - 10 && 
          food.x + food.width > minigameState.petX && 
          food.x < minigameState.petX + minigameState.petWidth) {
        minigameState.food.splice(i, 1);
        minigameState.score++;
        state.minigameScore++;
        document.getElementById('minigame-score').textContent = `得分: ${state.minigameScore}`;
        
        // 小游戏成就
        if (minigameState.score >= 10 && !state.achievements.minigame) {
          state.achievements.minigame = true;
          if (document.getElementById('ach-minigame')) {
            document.getElementById('ach-minigame').classList.add('unlocked');
          }
          showMessage('成就解锁：小游戏高手！', '#ffd700', 4000);
          if (document.getElementById('achievements-count')) {
            const unlocked = Object.values(state.achievements).filter(a => a).length;
            document.getElementById('achievements-count').textContent = `${unlocked}/6`;
          }
        }
        continue;
      }
      
      // 移出屏幕
      if (food.y > height) {
        minigameState.food.splice(i, 1);
        continue;
      }
      
      // 绘制食物
      ctx.fillStyle = food.color;
      ctx.beginPath();
      ctx.arc(food.x + food.width/2, food.y + food.height/2, food.width/2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 绘制分数
    ctx.fillStyle = '#fff';
    ctx.font = '20px Pixel, Courier New, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`得分: ${minigameState.score}`, 10, 30);
    
    // 继续游戏
    if (minigameState.gameActive) {
      requestAnimationFrame(minigameLoop);
    }
  }
  
  // 开始游戏
  minigameLoop();
}
