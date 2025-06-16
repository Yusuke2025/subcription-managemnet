// アプリケーションの状態管理
class SubscriptionManager {
    constructor() {
        this.subscriptions = [
            {id: 1, name: "Netflix", price: 15.99, cycle: "monthly", category: "streaming", status: "active", nextPayment: "2025-06-25", description: "動画ストリーミングサービス"},
            {id: 2, name: "Spotify Premium", price: 9.99, cycle: "monthly", category: "music", status: "active", nextPayment: "2025-06-20", description: "音楽ストリーミングサービス"},
            {id: 3, name: "Adobe Creative Suite", price: 52.99, cycle: "monthly", category: "software", status: "active", nextPayment: "2025-06-28", description: "デザイン・クリエイティブソフトウェア"},
            {id: 4, name: "GitHub Pro", price: 4.00, cycle: "monthly", category: "software", status: "active", nextPayment: "2025-06-18", description: "コードリポジトリホスティング"},
            {id: 5, name: "Notion Pro", price: 8.00, cycle: "monthly", category: "productivity", status: "active", nextPayment: "2025-06-22", description: "ノート・生産性アプリ"},
            {id: 6, name: "Disney+", price: 7.99, cycle: "monthly", category: "streaming", status: "paused", nextPayment: "2025-07-10", description: "Disneyコンテンツストリーミング"}
        ];
        this.categories = ["streaming", "music", "software", "productivity", "fitness", "news", "gaming", "other"];
        this.currency = "JPY";
        this.currentSection = 'dashboard';
        this.currentDate = new Date();
        this.editingId = null;
        this.isDarkMode = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateFilters();
        this.showSection('dashboard');
        this.updateDashboard();
        this.updateSubscriptionsList();
        this.updateCalendar();
        this.setupCharts();
        this.setDefaultDate();
    }

    setDefaultDate() {
        // 次回支払日のデフォルト値を設定（今日から1ヶ月後）
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const dateString = nextMonth.toISOString().split('T')[0];
        document.getElementById('serviceDate').value = dateString;
    }

    setupEventListeners() {
        // ナビゲーション
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // モバイルメニュー
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });

            // サイドバー外クリックで閉じる
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target) && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            });
        }

        // テーマ切り替え
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // サブスクリプション追加
        const addBtn = document.getElementById('addSubscriptionBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        // モーダル関連
        const modalClose = document.getElementById('modalClose');
        const cancelBtn = document.getElementById('cancelBtn');
        const subscriptionForm = document.getElementById('subscriptionForm');
        const modal = document.getElementById('subscriptionModal');

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (subscriptionForm) {
            subscriptionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSubscription();
            });
        }

        // モーダル背景クリックで閉じる
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // フィルターとソート
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const sortBy = document.getElementById('sortBy');

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.updateSubscriptionsList();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.updateSubscriptionsList();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.updateSubscriptionsList();
            });
        }

        if (sortBy) {
            sortBy.addEventListener('change', () => {
                this.updateSubscriptionsList();
            });
        }

        // カレンダーナビゲーション
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');

        if (prevMonth) {
            prevMonth.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.updateCalendar();
            });
        }

        if (nextMonth) {
            nextMonth.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.updateCalendar();
            });
        }

        // 設定
        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect) {
            currencySelect.addEventListener('change', (e) => {
                this.currency = e.target.value;
                this.updateDashboard();
                this.updateSubscriptionsList();
            });
        }
    }

    showSection(sectionName) {
        // アクティブなセクションを非表示
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // 新しいセクションを表示
        const targetSection = document.getElementById(`${sectionName}-section`);
        const targetLink = document.querySelector(`[data-section="${sectionName}"]`);
        
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        if (targetLink) {
            targetLink.classList.add('active');
        }
        
        this.currentSection = sectionName;

        // セクション固有の更新
        if (sectionName === 'dashboard') {
            this.updateDashboard();
        } else if (sectionName === 'subscriptions') {
            this.updateSubscriptionsList();
        } else if (sectionName === 'calendar') {
            this.updateCalendar();
        } else if (sectionName === 'analytics') {
            this.updateAnalytics();
        }

        // モバイルメニューを閉じる
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
    }

    populateFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const serviceCategory = document.getElementById('serviceCategory');
        
        if (categoryFilter && serviceCategory) {
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = this.getCategoryName(category);
                categoryFilter.appendChild(option.cloneNode(true));
                serviceCategory.appendChild(option);
            });
        }
    }

    getCategoryName(category) {
        const names = {
            streaming: 'ストリーミング',
            music: '音楽',
            software: 'ソフトウェア',
            productivity: '生産性',
            fitness: 'フィットネス',
            news: 'ニュース',
            gaming: 'ゲーム',
            other: 'その他'
        };
        return names[category] || category;
    }

    getStatusName(status) {
        const names = {
            active: 'アクティブ',
            paused: '一時停止',
            cancelled: 'キャンセル'
        };
        return names[status] || status;
    }

    formatCurrency(amount) {
        const symbols = { JPY: '¥', USD: '$', EUR: '€' };
        return `${symbols[this.currency] || '¥'}${Math.round(amount).toLocaleString()}`;
    }

    updateDashboard() {
        const activeSubscriptions = this.subscriptions.filter(sub => sub.status === 'active');
        const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
            return sum + (sub.cycle === 'monthly' ? sub.price : sub.price / 12);
        }, 0);
        const yearlyTotal = totalMonthly * 12;

        // 今週の支払い計算
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingPayments = activeSubscriptions.filter(sub => {
            const paymentDate = new Date(sub.nextPayment);
            return paymentDate >= today && paymentDate <= nextWeek;
        }).length;

        // 統計更新
        const totalMonthlyEl = document.getElementById('totalMonthly');
        const activeCountEl = document.getElementById('activeCount');
        const upcomingPaymentsEl = document.getElementById('upcomingPayments');
        const yearlyTotalEl = document.getElementById('yearlyTotal');

        if (totalMonthlyEl) totalMonthlyEl.textContent = this.formatCurrency(totalMonthly);
        if (activeCountEl) activeCountEl.textContent = activeSubscriptions.length;
        if (upcomingPaymentsEl) upcomingPaymentsEl.textContent = upcomingPayments;
        if (yearlyTotalEl) yearlyTotalEl.textContent = this.formatCurrency(yearlyTotal);

        // 今後の支払いリスト更新
        this.updateUpcomingList();
    }

    updateUpcomingList() {
        const upcomingList = document.getElementById('upcomingList');
        if (!upcomingList) return;

        const activeSubscriptions = this.subscriptions.filter(sub => sub.status === 'active');
        
        // 次回支払日でソート
        const sortedSubs = activeSubscriptions.sort((a, b) => new Date(a.nextPayment) - new Date(b.nextPayment));
        
        upcomingList.innerHTML = '';
        sortedSubs.slice(0, 5).forEach(sub => {
            const item = document.createElement('div');
            item.className = 'upcoming-item';
            item.innerHTML = `
                <div>
                    <div class="upcoming-name">${sub.name}</div>
                    <div class="upcoming-date">${new Date(sub.nextPayment).toLocaleDateString('ja-JP')}</div>
                </div>
                <div class="upcoming-price">${this.formatCurrency(sub.price)}</div>
            `;
            upcomingList.appendChild(item);
        });
    }

    updateSubscriptionsList() {
        const grid = document.getElementById('subscriptionsGrid');
        if (!grid) return;

        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const sortBy = document.getElementById('sortBy');

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const categoryFilterValue = categoryFilter ? categoryFilter.value : '';
        const statusFilterValue = statusFilter ? statusFilter.value : '';
        const sortByValue = sortBy ? sortBy.value : 'name';

        // フィルタリング
        let filteredSubs = this.subscriptions.filter(sub => {
            const matchesSearch = sub.name.toLowerCase().includes(searchTerm) || 
                                sub.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilterValue || sub.category === categoryFilterValue;
            const matchesStatus = !statusFilterValue || sub.status === statusFilterValue;
            
            return matchesSearch && matchesCategory && matchesStatus;
        });

        // ソート
        filteredSubs.sort((a, b) => {
            switch (sortByValue) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return b.price - a.price;
                case 'nextPayment':
                    return new Date(a.nextPayment) - new Date(b.nextPayment);
                default:
                    return 0;
            }
        });

        // レンダリング
        grid.innerHTML = '';
        filteredSubs.forEach(sub => {
            const card = this.createSubscriptionCard(sub);
            grid.appendChild(card);
        });
    }

    createSubscriptionCard(sub) {
        const card = document.createElement('div');
        card.className = 'subscription-card';
        card.innerHTML = `
            <div class="subscription-header">
                <h3 class="subscription-name">${sub.name}</h3>
                <div class="subscription-price">${this.formatCurrency(sub.price)}</div>
            </div>
            <div class="subscription-details">
                <p><strong>カテゴリ:</strong> <span class="category-${sub.category}">${this.getCategoryName(sub.category)}</span></p>
                <p><strong>請求サイクル:</strong> ${sub.cycle === 'monthly' ? '月額' : '年額'}</p>
                <p><strong>次回支払日:</strong> ${new Date(sub.nextPayment).toLocaleDateString('ja-JP')}</p>
                <p><strong>ステータス:</strong> <span class="status status--${sub.status === 'active' ? 'success' : sub.status === 'paused' ? 'warning' : 'error'}">${this.getStatusName(sub.status)}</span></p>
                <p><strong>説明:</strong> ${sub.description}</p>
            </div>
            <div class="subscription-actions">
                <button class="btn btn--sm btn--secondary" onclick="window.subscriptionManager.editSubscription(${sub.id})">編集</button>
                <button class="btn btn--sm btn--${sub.status === 'active' ? 'warning' : 'success'}" onclick="window.subscriptionManager.toggleStatus(${sub.id})">
                    ${sub.status === 'active' ? '一時停止' : '再開'}
                </button>
                <button class="btn btn--sm btn--outline" onclick="window.subscriptionManager.deleteSubscription(${sub.id})">削除</button>
            </div>
        `;
        return card;
    }

    openModal(subscription = null) {
        const modal = document.getElementById('subscriptionModal');
        const form = document.getElementById('subscriptionForm');
        
        if (!modal || !form) return;

        if (subscription) {
            // 編集モード
            this.editingId = subscription.id;
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) modalTitle.textContent = 'サブスクリプションを編集';
            
            document.getElementById('serviceName').value = subscription.name;
            document.getElementById('servicePrice').value = subscription.price;
            document.getElementById('serviceCycle').value = subscription.cycle;
            document.getElementById('serviceDate').value = subscription.nextPayment;
            document.getElementById('serviceCategory').value = subscription.category;
            document.getElementById('serviceDescription').value = subscription.description;
        } else {
            // 新規作成モード
            this.editingId = null;
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) modalTitle.textContent = 'サブスクリプションを追加';
            form.reset();
            this.setDefaultDate();
        }
        
        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('subscriptionModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.editingId = null;
    }

    saveSubscription() {
        const formData = {
            name: document.getElementById('serviceName').value,
            price: parseFloat(document.getElementById('servicePrice').value),
            cycle: document.getElementById('serviceCycle').value,
            nextPayment: document.getElementById('serviceDate').value,
            category: document.getElementById('serviceCategory').value,
            description: document.getElementById('serviceDescription').value || ''
        };

        // バリデーション
        if (!formData.name || !formData.price || !formData.nextPayment) {
            this.showToast('必須項目を入力してください');
            return;
        }

        if (this.editingId) {
            // 編集
            const index = this.subscriptions.findIndex(sub => sub.id === this.editingId);
            if (index !== -1) {
                this.subscriptions[index] = { ...this.subscriptions[index], ...formData };
                this.showToast('サブスクリプションが更新されました');
            }
        } else {
            // 新規作成
            const newSub = {
                ...formData,
                id: Math.max(...this.subscriptions.map(s => s.id), 0) + 1,
                status: 'active'
            };
            this.subscriptions.push(newSub);
            this.showToast('サブスクリプションが追加されました');
        }

        this.closeModal();
        this.updateDashboard();
        this.updateSubscriptionsList();
        this.updateCalendar();
    }

    editSubscription(id) {
        const subscription = this.subscriptions.find(sub => sub.id === id);
        if (subscription) {
            this.openModal(subscription);
        }
    }

    toggleStatus(id) {
        const subscription = this.subscriptions.find(sub => sub.id === id);
        if (subscription) {
            subscription.status = subscription.status === 'active' ? 'paused' : 'active';
            
            this.showToast(`${subscription.name}を${subscription.status === 'active' ? '再開' : '一時停止'}しました`);
            this.updateDashboard();
            this.updateSubscriptionsList();
        }
    }

    deleteSubscription(id) {
        if (confirm('本当にこのサブスクリプションを削除しますか？')) {
            const subscription = this.subscriptions.find(sub => sub.id === id);
            this.subscriptions = this.subscriptions.filter(sub => sub.id !== id);
            
            if (subscription) {
                this.showToast(`${subscription.name}を削除しました`);
            }
            this.updateDashboard();
            this.updateSubscriptionsList();
            this.updateCalendar();
        }
    }

    updateCalendar() {
        const calendar = document.getElementById('calendar');
        const currentMonthEl = document.getElementById('currentMonth');
        
        if (!calendar || !currentMonthEl) return;

        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        
        currentMonthEl.textContent = 
            `${this.currentDate.getFullYear()}年${monthNames[this.currentDate.getMonth()]}`;

        // カレンダーをクリア
        calendar.innerHTML = '';

        // 曜日ヘッダー
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });

        // 月の初日と最終日
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // カレンダーの日付を生成
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            if (date.getMonth() !== this.currentDate.getMonth()) {
                dayElement.classList.add('other-month');
            }
            
            if (this.isToday(date)) {
                dayElement.classList.add('today');
            }

            dayElement.innerHTML = `<div class="calendar-day-number">${date.getDate()}</div>`;

            // その日の支払いを追加
            const payments = this.getPaymentsForDate(date);
            payments.forEach(payment => {
                const paymentElement = document.createElement('div');
                paymentElement.className = 'calendar-payment';
                paymentElement.textContent = payment.name;
                paymentElement.style.backgroundColor = this.getCategoryColor(payment.category);
                dayElement.appendChild(paymentElement);
            });

            calendar.appendChild(dayElement);
        }
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getPaymentsForDate(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.subscriptions.filter(sub => 
            sub.nextPayment === dateString && sub.status === 'active'
        );
    }

    getCategoryColor(category) {
        const colors = {
            streaming: '#FF6B6B',
            music: '#4ECDC4',
            software: '#45B7D1',
            productivity: '#96CEB4',
            fitness: '#FFEAA7',
            news: '#DDA0DD',
            gaming: '#98D8C8',
            other: '#B0B0B0'
        };
        return colors[category] || colors.other;
    }

    setupCharts() {
        this.drawSpendingChart();
        setTimeout(() => {
            this.updateAnalytics();
        }, 100);
    }

    drawSpendingChart() {
        const canvas = document.getElementById('spendingChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // 簡単なグラフを描画
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const data = [80, 85, 90, 95, 100, 98];
        const labels = ['1月', '2月', '3月', '4月', '5月', '6月'];
        
        const padding = 40;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;
        const max = Math.max(...data);
        
        // グリッド線
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + width, y);
            ctx.stroke();
        }
        
        // データ線
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = padding + (width / (data.length - 1)) * index;
            const y = padding + height - (value / max) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // データポイント
        ctx.fillStyle = '#3B82F6';
        data.forEach((value, index) => {
            const x = padding + (width / (data.length - 1)) * index;
            const y = padding + height - (value / max) * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    updateAnalytics() {
        if (this.currentSection === 'analytics') {
            this.drawCategoryChart();
            this.drawMonthlyChart();
        }
    }

    drawCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // カテゴリ別支出を計算
        const categoryTotals = {};
        this.subscriptions.filter(sub => sub.status === 'active').forEach(sub => {
            const monthlyAmount = sub.cycle === 'monthly' ? sub.price : sub.price / 12;
            categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + monthlyAmount;
        });
        
        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
        
        if (total === 0) return;
        
        // 円グラフを描画
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        let currentAngle = 0;
        
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            const sliceAngle = (amount / total) * 2 * Math.PI;
            
            ctx.fillStyle = this.getCategoryColor(category);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            currentAngle += sliceAngle;
        });
    }

    drawMonthlyChart() {
        const canvas = document.getElementById('monthlyChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // 月別データ（計算）
        const totalMonthly = this.subscriptions
            .filter(sub => sub.status === 'active')
            .reduce((sum, sub) => sum + (sub.cycle === 'monthly' ? sub.price : sub.price / 12), 0);
        
        const monthlyData = Array(6).fill(totalMonthly);
        const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const padding = 40;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;
        const max = Math.max(...monthlyData, 1);
        
        // バーを描画
        ctx.fillStyle = '#3B82F6';
        monthlyData.forEach((value, index) => {
            const barWidth = width / monthlyData.length - 10;
            const barHeight = (value / max) * height;
            const x = padding + (width / monthlyData.length) * index + 5;
            const y = padding + height - barHeight;
            
            ctx.fillRect(x, y, barWidth, barHeight);
        });
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        const themeButton = document.getElementById('themeToggle');
        
        if (themeButton) {
            if (this.isDarkMode) {
                document.documentElement.setAttribute('data-color-scheme', 'dark');
                themeButton.textContent = '☀️ ライトモード';
            } else {
                document.documentElement.setAttribute('data-color-scheme', 'light');
                themeButton.textContent = '🌙 ダークモード';
            }
        }
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }
}

// グローバル変数として設定
let subscriptionManager;

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    subscriptionManager = new SubscriptionManager();
    window.subscriptionManager = subscriptionManager; // グローバルアクセス用
});
