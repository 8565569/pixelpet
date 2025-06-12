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
  // 加载顶部栏
  fetch('components/header.html')
    .then(response => response.text())
    .then(html => {
      elements.topBar.innerHTML = html;
      elements.connectWallet = document.getElementById('connect-wallet');
      elements.walletInfo = document.getElementById('wallet-info');
      elements.walletAddress = document.getElementById('wallet-address');
      elements.walletBalance = document.getElementById('wallet-balance');
      setupWalletEvents();
    })
    .catch(error => {
      console.error('加载顶部栏失败:', error);
      elements.topBar.innerHTML = '<div class="error">顶部栏加载失败</div>';
    });
  
  // 加载底部导航
  fetch('components/bottom-nav.html')
    .then(response => response.text())
    .then(html => {
      elements.bottomNav.innerHTML = html;
      setupNavigationEvents();
      // 默认激活首页
      const homeNav = document.querySelector('.nav-item[data-page="home-page"]');
      if (homeNav) {
        homeNav.classList.add('active');
      }
      loadPage('home-page');
    })
    .catch(error => {
      console.error('加载底部导航失败:', error);
      elements.bottomNav.innerHTML = '<div class="error">导航栏加载失败</div>';
    });
}

// ===== 页面加载 =====
function loadPage(pageId) {
  try {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    
    // 加载请求的页面
    fetch(`components/${pageId}.html`)
      .then(response => response.text())
      .then(html => {
        elements.appContainer.innerHTML = html;
        const pageElement = document.getElementById(pageId);
        if (pageElement) {
          pageElement.classList.add('active');
          
          // 设置页面特定事件
          setupPageEvents(pageId);
          
          // 更新UI
          updateUI();
        }
      })
      .catch(error => {
        console.error(`加载页面 ${pageId} 失败:`, error);
        elements.appContainer.innerHTML = `
          <div class="error-page">
            <h2>页面加载失败</h2>
            <p>${error.message}</p>
            <button onclick="loadPage('home-page')">返回首页</button>
          </div>
        `;
      });
  } catch (error) {
    console.error(`加载页面 ${pageId} 时出错:`, error);
  }
}

// ===== 设置事件监听器 =====
function setupEventListeners() {
  // 钱包事件在加载顶部栏后设置
}

function setupWalletEvents() {
  if (!elements.connectWallet) return;
  
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
      localStorage.setItem('walletAddress', state.walletAddress);
    } catch (error) {
      console.error('钱包连接失败:', error);
      showMessage('钱包连接失败: ' + error.message, '#ff6b6b', 4000);
    }
  });
}

function setupNavigationEvents() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
      // 更新导航状态
      document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
      });
      this.classList.add('active');
      
      // 加载对应页面
      const pageId = this.getAttribute('data-page');
      loadPage(pageId);
    });
  });
}

function setupPageEvents(pageId) {
  switch(pageId) {
    case 'home-page':
      setupHomeEvents();
      break;
    case 'achievements-page':
      setupAchievementsEvents();
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

function setupAchievementsEvents() {
  // 成就页不需要额外事件
}

function setupMinigameEvents() {
  const startBtn = document.getElementById('minigame-start');
  if (startBtn) startBtn.addEventListener('click', startMinigame);
  
  const exitBtn = document.getElementById('minigame-exit');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      stopMinigame();
      document.querySelector('.nav-item[data-page="home-page"]')?.click();
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
}

// ===== 宠物交互功能 =====
function feedPet() {
  state.hunger = Math.min(100, state.hunger + 15);
  state.cleanliness = Math.max(0, state.cleanliness - 5);
  showMessage('吃得好开心！', '#80ed99');
  
  // 第一次喂食成就
  if (!state.achievements.firstFeed) {
    state.achievements.firstFeed = true;
    const achElement = document.getElementById('ach-first-feed');
    if (achElement) achElement.classList.add('unlocked');
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
    const achElement = document.getElementById('ach-first-play');
    if (achElement) achElement.classList.add('unlocked');
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
    const achElement = document.getElementById('ach-clean-master');
    if (achElement) achElement.classList.add('unlocked');
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
    const achElement = document.getElementById('ach-full-health');
    if (achElement) achElement.classList.add('unlocked');
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
      const achElement = document.getElementById('ach-evolved');
      if (achElement) {
        achElement.classList.add('unlocked');
      }
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
    if (elements.walletBalance) {
      elements.walletBalance.textContent = `余额: ${state.walletBalance.toFixed(4)} BNB`;
    }
    
    // 保存余额
    localStorage.setItem('walletBalance', state.walletBalance.toString());
  } catch (error) {
    console.error('获取余额失败:', error);
    if (elements.walletBalance) {
      elements.walletBalance.textContent = '余额: 获取失败';
    }
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
