// Setup event listeners
function setupEventListeners() {
    // Period selector
    document.getElementById('trendPeriod').addEventListener('change', () => {
        Toast.info('Period selection coming soon!');
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Logout?')) API.logout();
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        document.querySelector('#themeToggle i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        Storage.set('theme', isDark ? 'dark' : 'light');
        
        // Update chart colors for theme
        updateChartsTheme(isDark);
    });
    
    // Load theme
    if (Storage.get('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        document.querySelector('#themeToggle i').className = 'fas fa-sun';
    }
    
    // Mobile toggle
    document.getElementById('mobileToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });
}
