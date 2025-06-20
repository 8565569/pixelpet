// ===== 游戏状态 =====
const state = {
  hunger: 70,
  happiness: 85,
  health: 100,
  cleanliness: 60,
  isSick: false,
  poopCount: 0,
  statusTimeout: null,
  petState: 'normal',
  achievements: {
    firstFeed: false,
    firstPlay: false,
    fullHealth: false,
    cleanMaster: false,
    minigame: false,
    evolved: false
  },
  gameTime: 0,
  minigameScore: 0,
  lastSaved: Date.now(),
  walletConnected: false,
  walletAddress: '',
  walletBalance: 0,
  lastFrame: Date.now()
};

// ===== DOM 元素引用 =====
const elements = {
  appContainer: document.getElementById('app-container'),
  topBar: document.getElementById('top-bar'),
  bottomNav: document.getElementById('bottom-nav'),
  walletInfo: null,
  walletAddress: null,
  walletBalance: null,
  connectWallet: null,
  pet: null,
  petDisplay: null
};

// ===== 初始化游戏 =====
function initGame() {
  // 加载组件
  loadComponents();
  
  // 设置事件监听器
  setupEventListeners();
  
  // 加载游戏状态
  loadGame();
  
  // 开始游戏主循环
  requestAnimationFrame(gameLoop);
  
  // 显示欢迎消息
  showMessage('欢迎收养你的像素宠物！', '#00adb5', 4000);
}

// ===== 组件加载 =====
function loadComponents() {
  // 默认加载首页
  loadPage('home-page');
  
  // 设置导航事件
  setupNavigationEvents();
}

// ===== 页面加载 =====
function loadPage(pageId) {
  try {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    if (pages.length > 0) {
      pages.forEach(page => {
        page.classList.remove('active');
      });
    }
    
    // 加载请求的页面
    let pageContent = '';
    
    switch(pageId) {
      case 'home-page':
        pageContent = getHomePageContent();
        break;
      case 'achievements-page':
        pageContent = getAchievementsPageContent();
        break;
      case 'minigame-page':
        pageContent = getMinigamePageContent();
        break;
      case 'settings-page':
        pageContent = getSettingsPageContent();
        break;
      default:
        pageContent = getHomePageContent();
    }
    
    elements.appContainer.innerHTML = `
      <div id="${pageId}" class="page active">
        ${pageContent}
      </div>
    `;
    
    // 设置页面特定事件
    setupPageEvents(pageId);
    
    // 更新UI
    updateUI();
  } catch (error) {
    console.error(`加载页面 ${pageId} 时出错:`, error);
    elements.appContainer.innerHTML = `
      <div class="error-page">
        <h2>页面加载失败</h2>
        <p>${error.message}</p>
        <button onclick="loadPage('home-page')">返回首页</button>
      </div>
    `;
  }
}

// 获取首页内容
function getHomePageContent() {
  return `
    <div class="pet-container">
      <div id="pet-display">
        <div id="pet" class="pet-normal float"></div>
      </div>
      <div id="status-message"></div>
    </div>
    
    <div class="stats-container">
      <div class="stat">
        <label>饥饿度:</label>
        <div class="progress-bar">
          <div id="hunger-fill" class="progress-fill" style="width: ${state.hunger}%;"></div>
          <span id="hunger-value">${Math.round(state.hunger)}%</span>
        </div>
      </div>
      <div class="stat">
        <label>快乐度:</label>
        <div class="progress-bar">
          <div id="happiness-fill" class="progress-fill" style="width: ${state.happiness}%;"></div>
          <span id="happiness-value">${Math.round(state.happiness)}%</span>
        </div>
      </div>
      <div class="stat">
        <label>健康值:</label>
        <div class="progress-bar">
          <div id="health-fill" class="progress-fill" style="width: ${state.health}%;"></div>
          <span id="health-value">${Math.round(state.health)}%</span>
        </div>
      </div>
      <div class="stat">
        <label>清洁度:</label>
        <div class="progress-bar">
          <div id="clean-fill" class="progress-fill" style="width: ${state.cleanliness}%;"></div>
          <span id="clean-value">${Math.round(state.cleanliness)}%</span>
        </div>
      </div>
    </div>
    
    <div class="actions">
      <button id="feed-btn" class="action-btn">
        <i class="fas fa-utensils"></i> 喂食
      </button>
      <button id="play-btn" class="action-btn">
        <i class="fas fa-gamepad"></i> 玩耍
      </button>
      <button id="clean-btn" class="action-btn">
        <i class="fas fa-bath"></i> 清洁
      </button>
      <button id="heal-btn" class="action-btn">
        <i class="fas fa-heartbeat"></i> 治疗
      </button>
    </div>
    
    <div class="info-box">
      <p>宠物状态: <span id="pet-status">${getPetStatus()}</span></p>
      <p>游戏时间: <span id="time-value">${state.gameTime}</span> 分钟</p>
    </div>
  `;
}

// 获取成就页内容
function getAchievementsPageContent() {
  const unlocked = Object.values(state.achievements).filter(a => a).length;
  
  return `
    <div class="page-content">
      <h2>成就系统</h2>
      <p>已解锁成就: <span id="achievements-count">${unlocked}/6</span></p>
      
      <div class="achievements-list">
        <div class="achievement ${state.achievements.firstFeed ? 'unlocked' : 'locked'}" id="ach-first-feed">
          <i class="fas ${state.achievements.firstFeed ? 'fa-check-circle' : 'fa-lock'}"></i>
          <div>
            <h3>第一次喂食</h3>
            <p>第一次给宠物喂食</p>
          </div>
        </div>
        
        <div class="achievement ${state.achievements.firstPlay ? 'unlocked' : 'locked'}" id="ach-first-play">
          <i class="fas ${state.achievements.firstPlay ? 'fa-check-circle' : 'fa-lock'}"></i>
          <div>
            <h3>第一次玩耍</h3>
            <p>第一次和宠物玩耍</p>
          </div>
        </div>
        
        <div class="achievement ${state.achievements.fullHealth ? 'unlocked' : 'locked'}" id="ach-full-health">
          <i class="fas ${state.achievements.fullHealth ? 'fa-check-circle' : 'fa-lock'}"></i>
          <div>
            <h3>完全健康</h3>
            <p>将宠物健康值恢复到100%</p>
          </div>
        </div>
        
        <div class="achievement ${state.achievements.cleanMaster ? 'unlocked' : 'locked'}" id="ach-clean-master">
          <i class="fas ${state.achievements.cleanMaster ? 'fa-check-circle' : 'fa-lock'}"></i>
          <div>
            <h3>清洁大师</h3>
            <p>清理宠物的便便</p>
          </div>
        </div>
        
        <div class="achievement ${state.achievements.minigame ? 'unlocked' : 'locked'}" id="ach-minigame">
          <i class="fas ${state.achievements.minigame ? 'fa-check-circle' : 'fa-lock'}"></i>
          <div>
            <h3>小游戏高手</h3>
            <p>在小游戏中获得10分</p>
          </div>
        </div>
        
        <div class="achievement ${state.achievements.evolved ? 'unlocked' : 'locked'}" id="ach-evolved">
          <i class="fas ${state.achievements.evolved ? 'fa-check-circle' : 'fa-lock'}"></i>
          <div>
            <h3>宠物进化</h3>
            <p>宠物进化到高级形态</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 获取小游戏页内容
function getMinigamePageContent() {
  return `
    <div class="minigame-container">
      <h2>接食物小游戏</h2>
      <p>使用左右箭头键移动宠物，接住下落的食物！</p>
      <p id="minigame-score">得分: ${state.minigameScore}</p>
      
      <canvas id="minigame-canvas" width="400" height="500"></canvas>
      
      <div class="minigame-controls">
        <button id="minigame-start" class="btn-primary">开始游戏</button>
        <button id="minigame-exit" class="btn-secondary">返回首页</button>
      </div>
      
      <div class="instructions">
        <h3>游戏说明:</h3>
        <ul>
          <li>← → : 左右移动宠物</li>
          <li>接到食物 +1分</li>
          <li>达到10分解锁成就</li>
          <li>错过食物不扣分</li>
        </ul>
      </div>
    </div>
  `;
}

// 获取设置页内容
function getSettingsPageContent() {
  return `
    <div class="settings-container">
      <h2>游戏设置</h2>
      
      <div class="setting-group">
        <h3>分享你的宠物</h3>
        <div class="share-buttons">
          <button id="share-facebook" class="share-btn">
            <i class="fab fa-facebook"></i> Facebook
          </button>
          <button id="share-twitter" class="share-btn">
            <i class="fab fa-twitter"></i> Twitter
          </button>
          <button id="share-whatsapp" class="share-btn">
            <i class="fab fa-whatsapp"></i> WhatsApp
          </button>
        </div>
      </div>
      
      <div class="setting-group">
        <h3>游戏数据</h3>
        <button id="reset-game" class="btn-warning">
          <i class="fas fa-trash-alt"></i> 重置游戏
        </button>
        <p class="warning">警告: 这将清除所有游戏数据！</p>
      </div>
      
      <div class="setting-group">
        <h3>关于游戏</h3>
        <p>像素电子宠物 v1.0</p>
        <p>开发团队: Pixel Pets</p>
        <p>© 2023 版权所有</p>
      </div>
    </div>
  `;
}

// ===== 设置事件监听器 =====
function setupEventListeners() {
  // 初始化钱包元素
  elements.walletInfo = document.getElementById('wallet-info');
  elements.walletAddress = document.getElementById('wallet-address');
  elements.walletBalance = document.getElementById('wallet-balance');
  elements.connectWallet = document.getElementById('connect-wallet');
  
  // 设置钱包事件
  if (elements.connectWallet) {
    elements.connectWallet.addEventListener('click', handleWalletConnect);
  }
}

function setupNavigationEvents() {
  const navItems = document.querySelectorAll('.nav-item');
  if (navItems.length > 0) {
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        // 更新导航状态
        navItems.forEach(nav => {
          nav.classList.remove('active');
        });
        this.classList.add('active');
        
        // 加载对应页面
        const pageId = this.getAttribute('data-page');
        loadPage(pageId);
      });
    });
  }
}

function setupPageEvents(pageId) {
  switch(pageId) {
    case 'home-page':
      setupHomeEvents();
      break;
    case 'minigame-page':
      setupMinigameEvents();
      break;
    case 'settings-page':
      setupSettingsEvents();
      break;
  }
}

function setupHomeEvents() {
  // 获取元素引用
  elements.pet = document.getElementById('pet');
  elements.petDisplay = document.getElementById('pet-display');
  
  // 添加事件监听器
  const feedBtn = document.getElementById('feed-btn');
  if (feedBtn) feedBtn.addEventListener('click', feedPet);
  
  const playBtn = document.getElementById('play-btn');
  if (playBtn) playBtn.addEventListener('click', playWithPet);
  
  const cleanBtn = document.getElementById('clean-btn');
  if (cleanBtn) cleanBtn.addEventListener('click', cleanPet);
  
  const healBtn = document.getElementById('heal-btn');
  if (healBtn) healBtn.addEventListener('click', healPet);
}

function setupMinigameEvents() {
  const startBtn = document.getElementById('minigame-start');
  if (startBtn) startBtn.addEventListener('click', startMinigame);
  
  const exitBtn = document.getElementById('minigame-exit');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      stopMinigame();
      document.querySelector('.nav-item[data-page="home-page"]').classList.add('active');
      document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-page') !== 'home-page') {
          item.classList.remove('active');
        }
      });
      loadPage('home-page');
    });
  }
}

function setupSettingsEvents() {
  const fbBtn = document.getElementById('share-facebook');
  if (fbBtn) fbBtn.addEventListener('click', () => sharePet('Facebook'));
  
  const twitterBtn = document.getElementById('share-twitter');
  if (twitterBtn) twitterBtn.addEventListener('click', () => sharePet('Twitter'));
  
  const waBtn = document.getElementById('share-whatsapp');
  if (waBtn) waBtn.addEventListener('click', () => sharePet('WhatsApp'));
  
  const resetBtn = document.getElementById('reset-game');
  if (resetBtn) resetBtn.addEventListener('click', resetGame);
}

async function handleWalletConnect() {
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
    localStorage.setItem('walletAddress', state.walletAddress);
  } catch (error) {
    console.error('钱包连接失败:', error);
    showMessage('钱包连接失败: ' + error.message, '#ff6b6b', 4000);
  }
}

// ===== 宠物交互功能 =====
function feedPet() {
  state.hunger = Math.min(100, state.hunger + 15);
  state.cleanliness = Math.max(0, state.cleanliness - 5);
  showMessage('吃得好开心！', '#80ed99');
  
  // 第一次喂食成就
  if (!state.achievements.firstFeed) {
    state.achievements.firstFeed = true;
    showMessage('成就解锁：第一次喂食！', '#ffd700', 4000);
    updateAchievementsCount();
  }
  
  // 吃东西动画
  if (elements.pet) {
    elements.pet.classList.remove('float');
    elements.pet.style.transform = 'scale(1.1)';
    setTimeout(() => {
      elements.pet.style.transform = 'scale(1)';
      elements.pet.classList.add('float');
    }, 300);
  }
  
  // 30%几率拉便便
  if (Math.random() > 0.7) {
    addPoop();
  }
  
  updateUI();
}

function playWithPet() {
  state.happiness = Math.min(100, state.happiness + 20);
  state.hunger = Math.max(0, state.hunger - 10);
  showMessage('玩得真开心！', '#4cc9f0');
  
  // 第一次玩耍成就
  if (!state.achievements.firstPlay) {
    state.achievements.firstPlay = true;
    showMessage('成就解锁：第一次玩耍！', '#ffd700', 4000);
    updateAchievementsCount();
  }
  
  // 跳跃动画
  if (elements.pet) {
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
  }
  
  updateUI();
}

function cleanPet() {
  state.cleanliness = Math.min(100, state.cleanliness + 30);
  removeAllPoop();
  showMessage('变得干干净净了！', '#f15bb5');
  
  // 清洁大师成就
  if (state.achievements.cleanMaster === false) {
    state.achievements.cleanMaster = true;
    showMessage('成就解锁：清洁大师！', '#ffd700', 4000);
    updateAchievementsCount();
  }
  
  // 清洁动画
  if (elements.petDisplay) {
    elements.petDisplay.style.backgroundColor = '#0f3460';
    setTimeout(() => {
      elements.petDisplay.style.backgroundColor = '';
    }, 500);
  }
  
  updateUI();
}

function healPet() {
  state.health = Math.min(100, state.health + 30);
  state.isSick = false;
  showMessage('恢复健康了！', '#57cc99');
  
  // 完全健康成就
  if (state.health >= 100 && !state.achievements.fullHealth) {
    state.achievements.fullHealth = true;
    showMessage('成就解锁：完全健康！', '#ffd700', 4000);
    updateAchievementsCount();
  }
  
  updateUI();
}

// ===== 游戏功能 =====
function addPoop() {
  state.poopCount++;
  state.cleanliness = Math.max(0, state.cleanliness - 15);
  
  if (elements.petDisplay) {
    const poop = document.createElement('div');
    poop.className = 'poop';
    poop.style.left = `${20 + Math.random() * 80}%`;
    poop.style.transform = `scale(${0.8 + Math.random() * 0.4})`;
    poop.dataset.id = Date.now();
    
    elements.petDisplay.appendChild(poop);
    showMessage('宠物拉便便了！', '#795548');
    updateUI();
  }
}

function removeAllPoop() {
  if (elements.petDisplay) {
    document.querySelectorAll('.poop').forEach(poop => poop.remove());
    state.poopCount = 0;
  }
}

function showMessage(text, color, duration = 3000) {
  const statusMessage = document.getElementById('status-message');
  if (!statusMessage) return;
  
  statusMessage.textContent = text;
  statusMessage.style.color = color;
  
  if (state.statusTimeout) clearTimeout(state.statusTimeout);
  state.statusTimeout = setTimeout(() => {
    statusMessage.textContent = '';
  }, duration);
}

function updateUI() {
  // 更新进度条
  if (document.getElementById('hunger-fill')) {
    document.getElementById('hunger-fill').style.width = `${state.hunger}%`;
    document.getElementById('happiness-fill').style.width = `${state.happiness}%`;
    document.getElementById('health-fill').style.width = `${state.health}%`;
    document.getElementById('clean-fill').style.width = `${state.cleanliness}%`;
    
    // 更新数值显示
    const hungerValue = document.getElementById('hunger-value');
    if (hungerValue) hungerValue.textContent = `${Math.round(state.hunger)}%`;
    
    const happinessValue = document.getElementById('happiness-value');
    if (happinessValue) happinessValue.textContent = `${Math.round(state.happiness)}%`;
    
    const healthValue = document.getElementById('health-value');
    if (healthValue) healthValue.textContent = `${Math.round(state.health)}%`;
    
    const cleanValue = document.getElementById('clean-value');
    if (cleanValue) cleanValue.textContent = `${Math.round(state.cleanliness)}%`;
  }
  
  // 更新游戏时间
  if (document.getElementById('time-value')) {
    document.getElementById('time-value').textContent = state.gameTime;
  }
  
  // 更新宠物形态
  updatePetAppearance();
  
  // 保存游戏状态
  saveGame();
  
  // 更新钱包UI
  updateWalletUI();
}

function updatePetAppearance() {
  const pet = document.getElementById('pet');
  if (!pet) return;
  
  // 移除所有宠物类
  pet.className = '';
  
  // 根据状态添加相应的类
  if (state.health < 30) {
    pet.classList.add('pet-sick');
    state.petState = 'sick';
  } else if (state.happiness > 80 && state.hunger > 70 && state.cleanliness > 70) {
    if (state.gameTime > 10 && !state.achievements.evolved) {
      pet.classList.add('pet-evolved');
      state.petState = 'evolved';
      state.achievements.evolved = true;
      showMessage('宠物进化了！', '#ffd700', 5000);
      updateAchievementsCount();
    } else if (state.gameTime > 20) {
      pet.classList.add('pet-super');
      state.petState = 'super';
    } else {
      pet.classList.add('pet-happy');
      state.petState = 'happy';
    }
  } else if (state.happiness > 60) {
    pet.classList.add('pet-happy');
    state.petState = 'happy';
  } else {
    pet.classList.add('pet-normal');
    state.petState = 'normal';
  }
  
  // 添加浮动动画
  pet.classList.add('float');
  
  // 更新宠物状态显示
  if (document.getElementById('pet-status')) {
    document.getElementById('pet-status').textContent = getPetStatus();
  }
  
  // 健康检测
  if (state.health < 30) {
    showMessage('宠物生病了！快治疗！', '#ff6b6b');
    pet.style.filter = 'grayscale(50%)';
  } else {
    pet.style.filter = 'none';
  }
  
  // 清洁度警告
  if (state.cleanliness < 30) {
    showMessage('太脏了，需要清洁！', '#9b5de5');
  }
}

function getPetStatus() {
  if (state.petState === 'sick') return '生病了 😷';
  if (state.petState === 'super') return '超级状态! 🌟';
  if (state.petState === 'evolved') return '进化了 ✨';
  if (state.petState === 'happy') return '非常开心 😄';
  return '正常状态';
}

function updateAchievementsCount() {
  const unlocked = Object.values(state.achievements).filter(a => a).length;
  const countElement = document.getElementById('achievements-count');
  if (countElement) {
    countElement.textContent = `${unlocked}/6`;
  }
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
      
      showMessage('游戏已加载！', '#00adb5', 3000);
    } catch (e) {
      console.error('加载游戏失败:', e);
    }
  }
  
  // 检查钱包连接状态
  if (localStorage.getItem('walletConnected') === 'true') {
    state.walletConnected = true;
    state.walletAddress = localStorage.getItem('walletAddress') || '';
    state.walletBalance = parseFloat(localStorage.getItem('walletBalance') || 0);
    
    // 更新钱包UI
    updateWalletUI();
  }
}

function resetGame() {
  if (confirm('确定要重置游戏吗？所有进度将被清除！')) {
    localStorage.removeItem('pixelPetGame');
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletBalance');
    
    // 重置状态
    Object.assign(state, {
      hunger: 70,
      happiness: 85,
      health: 100,
      cleanliness: 60,
      isSick: false,
      poopCount: 0,
      petState: 'normal',
      achievements: {
        firstFeed: false,
        firstPlay: false,
        fullHealth: false,
        cleanMaster: false,
        minigame: false,
        evolved: false
      },
      gameTime: 0,
      minigameScore: 0,
      walletConnected: false,
      walletAddress: '',
      walletBalance: 0
    });
    
    // 重新加载首页
    loadPage('home-page');
    showMessage('游戏已重置！', '#00adb5', 3000);
  }
}

// ===== 钱包功能 =====
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

async function getWalletBalance() {
  try {
    const balance = await ethereum.request({
      method: 'eth_getBalance',
      params: [state.walletAddress, 'latest']
    });
    
    // 将余额从wei转换为BNB
    state.walletBalance = parseInt(balance) / 1e18;
    
    // 保存余额
    localStorage.setItem('walletBalance', state.walletBalance.toString());
  } catch (error) {
    console.error('获取余额失败:', error);
  }
}

function disconnectWallet() {
  state.walletConnected = false;
  state.walletAddress = '';
  state.walletBalance = 0;
  updateWalletUI();
  showMessage('钱包已断开连接!', '#4cc9f0', 3000);
  localStorage.removeItem('walletConnected');
  localStorage.removeItem('walletAddress');
  localStorage.removeItem('walletBalance');
}

function updateWalletUI() {
  if (!elements.connectWallet) return;
  
  if (state.walletConnected) {
    elements.connectWallet.innerHTML = `
      <i class="fas fa-wallet"></i>
      断开连接
    `;
    if (elements.walletInfo) {
      elements.walletInfo.style.display = 'block';
    }
    if (elements.walletAddress) {
      elements.walletAddress.textContent = shortenAddress(state.walletAddress);
    }
    if (elements.walletBalance) {
      elements.walletBalance.textContent = `余额: ${state.walletBalance.toFixed(4)} BNB`;
    }
  } else {
    elements.connectWallet.innerHTML = `
      <i class="fas fa-wallet"></i>
      连接钱包
    `;
    if (elements.walletInfo) {
      elements.walletInfo.style.display = 'none';
    }
  }
}

function shortenAddress(address, chars = 4) {
  return address ? `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}` : '';
}

// ===== 社交分享 =====
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

// ===== 游戏主循环 =====
function gameLoop(timestamp) {
  // 计算时间增量
  const delta = timestamp - state.lastFrame;
  state.lastFrame = timestamp;
  
  // 自然消耗 (按时间增量计算)
  state.hunger = Math.max(0, state.hunger - 0.2 * (delta / 1000));
  state.happiness = Math.max(0, state.happiness - 0.1 * (delta / 1000));
  
  // 健康系统
  if (state.hunger < 20 || state.cleanliness < 20) {
    state.health = Math.max(0, state.health - 0.3 * (delta / 1000));
  } else if (state.health < 100) {
    state.health = Math.min(100, state.health + 0.1 * (delta / 1000));
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
  requestAnimationFrame(gameLoop);
}

// ===== 初始化游戏 =====
window.addEventListener('load', initGame);
