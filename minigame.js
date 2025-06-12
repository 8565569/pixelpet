// ===== 小游戏功能 =====
let minigameState = null;
let minigameAnimationId = null;

function startMinigame() {
  const canvas = document.getElementById('minigame-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // 游戏状态
  minigameState = {
    petX: width / 2 - 25,
    petWidth: 50,
    petHeight: 20,
    food: [],
    score: 0,
    gameActive: true,
    lastFrame: Date.now(),
    animationFrameId: null,
    gridCanvas: null
  };
  
  // 重置分数
  state.minigameScore = 0;
  const scoreElement = document.getElementById('minigame-score');
  if (scoreElement) {
    scoreElement.textContent = `得分: ${state.minigameScore}`;
  }
  
  // 键盘控制
  const keys = {};
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      keys[e.key] = true;
    }
  });
  
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      keys[e.key] = false;
    }
  });
  
  // 移动端触摸控制
  let touchStartX = 0;
  canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    e.preventDefault();
  });
  
  canvas.addEventListener('touchmove', e => {
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    
    if (diff < -10) keys['ArrowLeft'] = true;
    else if (diff > 10) keys['ArrowRight'] = true;
    
    e.preventDefault();
  });
  
  canvas.addEventListener('touchend', () => {
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
  });
  
  // 创建离屏canvas用于网格背景
  minigameState.gridCanvas = document.createElement('canvas');
  minigameState.gridCanvas.width = width;
  minigameState.gridCanvas.height = height;
  const gridCtx = minigameState.gridCanvas.getContext('2d');
  
  // 绘制网格到离屏canvas
  gridCtx.fillStyle = '#0f3460';
  gridCtx.fillRect(0, 0, width, height);
  
  gridCtx.strokeStyle = 'rgba(0, 173, 181, 0.2)';
  gridCtx.lineWidth = 1;
  for (let x = 0; x <= width; x += 20) {
    gridCtx.beginPath();
    gridCtx.moveTo(x, 0);
    gridCtx.lineTo(x, height);
    gridCtx.stroke();
  }
  for (let y = 0; y <= height; y += 20) {
    gridCtx.beginPath();
    gridCtx.moveTo(0, y);
    gridCtx.lineTo(width, y);
    gridCtx.stroke();
  }
  
  // 游戏循环
  function minigameLoop() {
    const now = Date.now();
    const delta = now - minigameState.lastFrame;
    minigameState.lastFrame = now;
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制背景和网格
    ctx.drawImage(minigameState.gridCanvas, 0, 0);
    
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
        
        const scoreElement = document.getElementById('minigame-score');
        if (scoreElement) {
          scoreElement.textContent = `得分: ${state.minigameScore}`;
        }
        
        // 小游戏成就
        if (minigameState.score >= 10 && !state.achievements.minigame) {
          state.achievements.minigame = true;
          const achElement = document.getElementById('ach-minigame');
          if (achElement) {
            achElement.classList.add('unlocked');
          }
          showMessage('成就解锁：小游戏高手！', '#ffd700', 4000);
          updateAchievementsCount();
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
      minigameState.animationFrameId = requestAnimationFrame(minigameLoop);
    }
  }
  
  // 开始游戏
  minigameState.animationFrameId = requestAnimationFrame(minigameLoop);
}

// 停止小游戏
function stopMinigame() {
  if (minigameState && minigameState.animationFrameId) {
    cancelAnimationFrame(minigameState.animationFrameId);
    minigameState.gameActive = false;
    minigameState = null;
  }
}
