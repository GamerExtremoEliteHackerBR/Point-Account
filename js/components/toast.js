// js/components/toast.js
const Toast = {
    element: null, 
    timeout: null,
    
    init: function () {
        const appCard = document.querySelector('.app-card');
        if (appCard && !document.getElementById('toastGlobal')) {
            const toast = document.createElement('div');
            toast.id = 'toastGlobal';
            toast.className = 'toast-message';
            appCard.style.position = 'relative';
            appCard.appendChild(toast);
            this.element = toast;
        } else { 
            this.element = document.getElementById('toastGlobal'); 
        }
    },
    
    show: function (message, duration = 2000) {
        if (!this.element) this.init();
        if (!this.element) return;
        clearTimeout(this.timeout);
        this.element.style.opacity = '1';
        this.element.textContent = message;
        this.timeout = setTimeout(() => { 
            this.element.style.opacity = '0'; 
        }, duration);
    }
};