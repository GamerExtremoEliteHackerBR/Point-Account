// js/app.js
const app = {
    activeTab: 'registros',
    
    init: function () { 
        Toast.init(); 
        carregarConfigGlobal(); 
        this.setupEventListeners(); 
        this.render(); 
    },
    
    setupEventListeners: function () {
        document.getElementById('tabRegistros').addEventListener('click', () => this.switchTab('registros'));
        document.getElementById('tabRelatorios').addEventListener('click', () => this.switchTab('relatorios'));
        document.getElementById('tabConfiguracoes').addEventListener('click', () => this.switchTab('configuracoes'));
        document.getElementById('fabPlusBtn').addEventListener('click', () => RegistrosModule.abrirModalPonto());
    },
    
    switchTab: function (tabId) {
        this.activeTab = tabId;
        this.updateNavButtons(tabId);
        this.render();
        document.getElementById('fabPlusBtn').classList.toggle('hidden', tabId !== 'registros');
        Toast.show(`📱 ${tabId === 'registros' ? 'Registros do Dia' : tabId === 'relatorios' ? 'Relatórios' : 'Configurações'}`);
    },
    
    updateNavButtons: function (activeId) { 
        document.querySelectorAll('.nav-btn').forEach(btn => { 
            if (btn.getAttribute('data-nav') === activeId) btn.classList.add('active'); 
            else btn.classList.remove('active'); 
        }); 
    },
    
    render: function () {
        const container = document.getElementById('dynamicScreen');
        if (!container) return;
        
        if (this.activeTab === 'registros') { 
            container.innerHTML = RegistrosModule.render(); 
            RegistrosModule.bindEvents(); 
        } else if (this.activeTab === 'relatorios') { 
            container.innerHTML = RelatoriosModule.render(); 
            RelatoriosModule.bindEvents(); 
        } else if (this.activeTab === 'configuracoes') { 
            container.innerHTML = ConfiguracoesModule.render(); 
            ConfiguracoesModule.bindEvents(); 
        }
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());