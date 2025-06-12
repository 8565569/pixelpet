// script.js
// ===== 游戏状态 =====
const state = {
  hunger: 70,
  happiness: 85,
  health: 100,
  cleanliness: 60,
  isSick: false,
  poopCount: 0,
  statusTimeout: null,
  petState: 'normal', // 'normal', 'happy', 'sick', 'evolved', 'super'
  achievements: {
    firstFeed: false,
    firstPlay: false,
    fullHealth: false,
    cleanMaster: false,
    minigame: false,
    evolved: false
  },
  gameTime: 0, // 游戏时间（分钟）
  minigameScore: 0,
  lastSaved: Date.now(),
  walletConnected: false,
  walletAddress: '',
  walletBalance: 0
};

// ===== DOM 元素 =====
const elements = {
  hungerFill: document.getElementById('hunger-fill'),
  happinessFill: document.getElementById('happiness-fill'),
  healthFill: document.getElementById('health-fill'),
  cleanFill: document.getElementById('clean-fill'),
  hungerValue: document.getElementById('hunger-value'),
  happinessValue: document.getElementById('happiness-value'),
  healthValue: document.getElementById('health-value'),
  cleanValue: document.getElementById('clean-value'),
  pet: document.getElementById('pet'),
  petDisplay: document.getElementById('pet-display'),
  statusMessage: document.getElementById('status-message'),
  achievementsContainer: document.getElementById('achievements-container'),
  minigameContainer: document.getElementById('minigame-container'),
  minigameCanvas: document.getElementById('minigame-canvas'),
  minigameScore: document.getElementById('minigame-score'),
  timeValue: document.getElementById('time-value'),
  connectWallet: document.getElementById('connect-wallet'),
  walletInfo: document.getElementById('wallet-info'),
  walletAddress: document.getElementById('wallet-address'),
  walletBalance: document.getElementById('wallet-balance')
};

// ===== MetaMask 钱包连接 =====
elements.connectWallet.addEventListener('click', async () => {
  if (state.walletConnected) {
    disconnectWallet();
    return;
  }
  
  if (typeof window.ethereum === 'undefined') {
    showMessage('请安装MetaMask钱包!', '#ff6b6b', 4000);
    return;
  }
  
  try {
    // 请求账户访问
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    state.walletAddress = accounts[0];
    
    // 切换到BSC链
    await switchToBSC();
    
    // 获取余额
    await getWalletBalance();
    
    // 更新UI
    state.walletConnected = true;
    updateWalletUI();
    showMessage('钱包已连接!', '#80ed99', 3000);
    
    // 保存连接状态
    localStorage.setItem('walletConnected', 'true');
  } catch (error) {
    console.error('钱包连接失败:', error);
    showMessage('钱包连接失败: ' + error.message, '#ff6b6b', 4000);
  }
});

// 切换到BSC链
async function switchToBSC() {
  const chainId = '0x38'; // BSC主网链ID
  
  if (ethereum.chainId !== chainId) {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      });
    } catch (switchError) {
      // 如果用户没有添加BSC链，则添加它
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x38',
                chainName: 'Binance Smart Chain',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'bnb',
                  decimals: 18
                },
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com']
              }
            ]
          });
        } catch (addError) {
          console.error('添加BSC链失败:', addError);
          showMessage('添加BSC链失败: ' + addError.message, '#ff6b6b', 4000);
        }
      } else {
        console.error('切换链失败:', switchError);
        showMessage('切换链失败: ' + switchError.message, '#ff6b6b', 4000);
      }
    }
  }
}

// 获取钱包余额
async function getWalletBalance() {
  try {
    const balance = await ethereum.request({
      method: 'eth_getBalance',
      params: [state.walletAddress, 'latest']
    });
    
    // 将余额从wei转换为BNB
    state.walletBalance = parseInt(balance) / 1e18;
    elements.walletBalance.textContent = `余额: ${state.walletBalance.toFixed(4)} BNB`;
  } catch (error) {
    console.error('获取余额失败:', error);
    elements.walletBalance.textContent = '余额: 获取失败';
  }
}

// 断开钱包连接
function disconnectWallet() {
  state.walletConnected = false;
  state.walletAddress = '';
  state.walletBalance = 0;
  updateWalletUI();
  showMessage('钱包已断开连接!', '#4cc9f0', 3000);
  localStorage.removeItem('walletConnected');
}

// 更新钱包UI
function updateWalletUI() {
  if (state.walletConnected) {
    elements.connectWallet.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 8H19C20.1046 8 21 8.89543 21 10V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V10C3 8.89543 3.89543 8 5 8Z" stroke="#1a1a2e" stroke-width="2"/>
        <path d="M6 8V4.5C6 3.67157 6.67157 3 7.5 3H16.5C17.3284 3 18 3.67157 18 4.5V8" stroke="#1a1a2e" stroke-width="2"/>
        <path d="M12 15C13.1046 15 14 14.1046 14 13C14 11.8954 13.1046 11 12 11C10.8954 11 10 11.8954 10 13C10 14.1046 10.8954 15 12 15Z" fill="#1a1a2e"/>
      </svg>
      断开连接
    `;
    elements.walletInfo.style.display = 'block';
    elements.walletAddress.textContent = shortenAddress(state.walletAddress);
  } else {
    elements.connectWallet.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 8H19C20.1046 8 21 8.89543 21 10V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V10C3 8.89543 3.89543 8 5 8Z" stroke="#1a1a2e" stroke-width="2"/>
        <path d="M6 8V4.5C6 3.67157 6.67157 3 7.5 3H16.5C17.3284 3 18 3.67157 18 4.5V8" stroke="#1a1a2e" stroke-width="2"/>
        <path d="M12 15C13.1046 15 14 14.1046 14 13C14 11.8954 13.1046 11 12 11C10.8954 11 10 11.8954 10 13C10 14.1046 10.8954 15 12 15Z" fill="#1a1a2e"/>
      </svg>
      连接钱包
    `;
    elements.walletInfo.style.display = 'none';
  }
}

// 缩短地址显示
function shortenAddress(address, chars = 4) {
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

// ===== 按钮功能 =====
document.getElementById('feed-btn').addEventListener('click', () => {
  state.hunger = Math.min(100, state.hunger + 15);
  state.cleanliness = Math.max(0, state.cleanliness - 5);
  showMessage('吃得好开心！', '#80ed99');
  
  // 第一次喂食成就
  if (!state.achievements.firstFeed) {
    state.achievements.firstFeed = true;
    document.getElementById('ach-first-feed').classList.add('unlocked');
    showMessage('成就解锁：第一次喂食！', '#ffd700', 4000);
  }
  
  // 吃东西动画
  elements.pet.classList.remove('float');
  elements.pet.style.transform = 'scale(1.1)';
  setTimeout(() => {
    elements.pet.style.transform = 'scale(1)';
    elements.pet.classList.add('float');
  }, 300);
  
  // 30%几率拉便便
  if (Math.random() > 0.7) {
    addPoop();
  }
  
  updateUI();
});

document.getElementById('play-btn').addEventListener('click', () => {
  state.happiness = Math.min(100, state.happiness + 20);
  state.hunger = Math.max(0, state.hunger - 10);
  showMessage('玩得真开心！', '#4cc9f0');
  
  // 第一次玩耍成就
  if (!state.achievements.firstPlay) {
    state.achievements.firstPlay = true;
    document.getElementById('ach-first-play').classList.add('unlocked');
    showMessage('成就解锁：第一次玩耍！', '#ffd700', 4000);
  }
  
  // 跳跃动画
  elements.pet.classList.remove('float');
  let jumpCount = 0;
  const jumpInterval = setInterval(() => {
    elements.pet.style.transform = `translateY(${-20 + 20 * Math.abs(Math.sin(jumpCount))}px)`;
    jumpCount += 0.5;
    if (jumpCount > 3) {
      clearInterval(jumpInterval);
      elements.pet.style.transform = 'translateY(0)';
      elements.pet.classList.add('float');
    }
  }, 100);
  
  updateUI();
});

document.getElementById('clean-btn').addEventListener('click', () => {
  state.cleanliness = Math.min(100, state.cleanliness + 30);
  removeAllPoop();
  showMessage('变得干干净净了！', '#f15bb5');
  
  // 清洁大师成就（清理5次便便）
  if (state.achievements.cleanMaster === false) {
    state.achievements.cleanMaster = true;
    document.getElementById('ach-clean-master').classList.add('unlocked');
    showMessage('成就解锁：清洁大师！', '#ffd700', 4000);
  }
  
  // 清洁动画
  elements.petDisplay.style.backgroundColor = '#0f3460';
  setTimeout(() => {
    elements.petDisplay.style.backgroundColor = '';
  }, 500);
  
  updateUI();
});

document.getElementById('heal-btn').addEventListener('click', () => {
  state.health = Math.min(100, state.health + 30);
  state.isSick = false;
  showMessage('恢复健康了！', '#57cc99');
  
  // 完全健康成就
  if (state.health >= 100 && !state.achievements.fullHealth) {
    state.achievements.fullHealth = true;
    document.getElementById('ach-full-health').classList.add('unlocked');
    showMessage('成就解锁：完全健康！', '#ffd700', 4000);
  }
  
  updateUI();
});

// ===== 成就按钮 =====
document.getElementById('achievements-btn').addEventListener('click', () => {
  elements.achievementsContainer.style.display = 
    elements.achievementsContainer.style.display === 'block' ? 'none' : 'block';
});

// ===== 小游戏按钮 =====
document.getElementById('minigame-btn').addEventListener('click', () => {
  elements.minigameContainer.style.display = 'flex';
});

document.getElementById('minigame-exit').addEventListener('click', () => {
  elements.minigameContainer.style.display = 'none';
});

document.getElementById('minigame-start').addEventListener('click', startMinigame);

// ===== 社交分享 =====
document.getElementById('share-facebook').addEventListener('click', () => {
  sharePet('Facebook');
});

document.getElementById('share-twitter').addEventListener('click', () => {
  sharePet('Twitter');
});

document.getElementById('share-whatsapp').addEventListener('click', () => {
  sharePet('WhatsApp');
});

// ===== 游戏功能 =====
function addPoop() {
  state.poopCount++;
  state.cleanliness = Math.max(0, state.cleanliness - 15);
  
  const poop = document.createElement('div');
  poop.className = 'poop';
  poop.style.left = `${20 + Math.random() * 80}%`;
  poop.style.transform = `scale(${0.8 + Math.random() * 0.4})`;
  poop.dataset.id = Date.now();
  
  elements.petDisplay.appendChild(poop);
  showMessage('宠物拉便便了！', '#795548');
  updateUI();
}

function removeAllPoop() {
  document.querySelectorAll('.poop').forEach(poop => poop.remove());
  state.poopCount = 0;
}

function showMessage(text, color, duration = 3000) {
  elements.statusMessage.textContent = text;
  elements.statusMessage.style.color = color;
  
  if (state.statusTimeout) clearTimeout(state.statusTimeout);
  state.statusTimeout = setTimeout(() => {
    elements.statusMessage.textContent = '';
  }, duration);
}

function updateUI() {
  // 更新进度条
  elements.hungerFill.style.width = `${state.hunger}%`;
  elements.happinessFill.style.width = `${state.happiness}%`;
  elements.healthFill.style.width = `${state.health}%`;
  elements.cleanFill.style.width = `${state.cleanliness}%`;
  
  // 更新数值显示
  elements.hungerValue.textContent = `${Math.round(state.hunger)}%`;
  elements.happinessValue.textContent = `${Math.round(state.happiness)}%`;
  elements.healthValue.textContent = `${Math.round(state.health)}%`;
  elements.cleanValue.textContent = `${Math.round(state.cleanliness)}%`;
  
  // 更新游戏时间
  elements.timeValue.textContent = state.gameTime;
  
  // 更新宠物形态
  updatePetAppearance();
  
  // 保存游戏状态
  saveGame();
}

function updatePetAppearance() {
  // 移除所有宠物类
  elements.pet.className = '';
  
  // 根据状态添加相应的类
  if (state.health < 30) {
    elements.pet.classList.add('pet-sick');
    state.petState = 'sick';
  } else if (state.happiness > 80 && state.hunger > 70 && state.cleanliness > 70) {
    if (state.gameTime > 10 && !state.achievements.evolved) {
      elements.pet.classList.add('pet-evolved');
      state.petState = 'evolved';
      state.achievements.evolved = true;
      document.getElementById('ach-evolved').classList.add('unlocked');
      showMessage('宠物进化了！', '#ffd700', 5000);
    } else if (state.gameTime > 20) {
      elements.pet.classList.add('pet-super');
      state.petState = 'super';
    } else {
      elements.pet.classList.add('pet-happy');
      state.petState = 'happy';
    }
  } else if (state.happiness > 60) {
    elements.pet.classList.add('pet-happy');
    state.petState = 'happy';
  } else {
    elements.pet.classList.add('pet-normal');
    state.petState = 'normal';
  }
  
  // 添加浮动动画
  elements.pet.classList.add('float');
  
  // 健康检测
  if (state.health < 30) {
    showMessage('宠物生病了！快治疗！', '#ff6b6b');
    elements.pet.style.filter = 'grayscale(50%)';
  } else {
    elements.pet.style.filter = 'none';
  }
  
  // 清洁度警告
  if (state.cleanliness < 30) {
    showMessage('太脏了，需要清洁！', '#9b5de5');
  }
}

// ===== 小游戏功能 =====
function startMinigame() {
  const canvas = elements.minigameCanvas;
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
  elements.minigameScore.textContent = `得分: ${state.minigameScore}`;
  
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
        elements.minigameScore.textContent = `得分: ${state.minigameScore}`;
        
        // 小游戏成就
        if (minigameState.score >= 10 && !state.achievements.minigame) {
          state.achievements.minigame = true;
          document.getElementById('ach-minigame').classList.add('unlocked');
          showMessage('成就解锁：小游戏高手！', '#ffd700', 4000);
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

// ===== 社交分享功能 =====
function sharePet(platform) {
  const status = getPetStatus();
  let message = `我正在玩像素电子宠物游戏！我的宠物状态：\n`;
  message += `🍎 饥饿度: ${Math.round(state.hunger)}%\n`;
  message += `😄 快乐度: ${Math.round(state.happiness)}%\n`;
  message += `❤️ 健康值: ${Math.round(state.health)}%\n`;
  message += `🧼 清洁度: ${Math.round(state.cleanliness)}%\n`;
  message += `状态: ${status}\n`;
  message += `快来一起玩吧！`;
  
  let url = '';
  switch(platform) {
    case 'Facebook':
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}`;
      break;
    case 'Twitter':
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
      break;
    case 'WhatsApp':
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      break;
  }
  
  window.open(url, '_blank', 'width=600,height=400');
  showMessage(`分享到${platform}成功！`, '#4cc9f0', 3000);
}

function getPetStatus() {
  if (state.petState === 'sick') return '生病了 😷';
  if (state.petState === 'super') return '超级状态! 🌟';
  if (state.petState === 'evolved') return '进化了 ✨';
  if (state.petState === 'happy') return '非常开心 😄';
  return '正常状态';
}

// ===== 本地存储功能 =====
function saveGame() {
  // 每分钟保存一次
  if (Date.now() - state.lastSaved > 60000) {
    const gameData = {
      state: state,
      timestamp: Date.now()
    };
    localStorage.setItem('pixelPetGame', JSON.stringify(gameData));
    state.lastSaved = Date.now();
  }
}

function loadGame() {
  const savedData = localStorage.getItem('pixelPetGame');
  if (savedData) {
    try {
      const gameData = JSON.parse(savedData);
      
      // 计算游戏时间（分钟）
      const timePassed = Math.floor((Date.now() - gameData.timestamp) / 60000);
      state.gameTime = gameData.state.gameTime + timePassed;
      
      // 更新其他状态
      Object.assign(state, gameData.state);
      
      // 更新成就显示
      if (state.achievements.firstFeed) document.getElementById('ach-first-feed').classList.add('unlocked');
      if (state.achievements.firstPlay) document.getElementById('ach-first-play').classList.add('unlocked');
      if (state.achievements.fullHealth) document.getElementById('ach-full-health').classList.add('unlocked');
      if (state.achievements.cleanMaster) document.getElementById('ach-clean-master').classList.add('unlocked');
      if (state.achievements.minigame) document.getElementById('ach-minigame').classList.add('unlocked');
      if (state.achievements.evolved) document.getElementById('ach-evolved').classList.add('unlocked');
      
      showMessage('游戏已加载！', '#00adb5', 3000);
    } catch (e) {
      console.error('加载游戏失败:', e);
    }
  }
  
  // 检查钱包连接状态
  if (localStorage.getItem('walletConnected') === 'true') {
    elements.connectWallet.click();
  }
}

// ===== 游戏主循环 =====
function gameLoop() {
  // 自然消耗
  state.hunger = Math.max(0, state.hunger - 0.2);
  state.happiness = Math.max(0, state.happiness - 0.1);
  
  // 健康系统
  if (state.hunger < 20 || state.cleanliness < 20) {
    state.health = Math.max(0, state.health - 0.3);
  } else if (state.health < 100) {
    state.health = Math.min(100, state.health + 0.1);
  }
  
  // 随机事件
  if (Math.random() < 0.005) {
    addPoop();
  }
  
  // 每10分钟增加1分钟游戏时间
  if (Date.now() - state.lastSaved > 600000) {
    state.gameTime++;
    state.lastSaved = Date.now();
  }
  
  updateUI();
  setTimeout(gameLoop, 1000); // 每秒更新一次
}

// ===== 初始化游戏 =====
window.addEventListener('load', () => {
  loadGame();
  gameLoop();
  showMessage('欢迎收养你的像素宠物！', '#00adb5', 4000);
});