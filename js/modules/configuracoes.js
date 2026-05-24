// js/modules/configuracoes.js
const ConfiguracoesModule = {
    config: null,
    
    carregarConfig: function () { 
        this.config = Storage.carregarConfiguracoes(); 
    },
    
    salvarConfig: function () { 
        Storage.salvarConfiguracoes(this.config); 
        carregarConfigGlobal(); 
    },
    
    abrirJornadaModal: function () {
        Modal.abrirJornadaModal((jornadaKey) => {
            if (jornadaKey === 'custom') {
                Modal.abrirCustomJornada(this.config.jornada, (novosSegundos) => {
                    this.config.jornada = novosSegundos;
                    this.config.jornadaTipo = 'custom';
                    this.salvarConfig();
                    if (typeof app !== 'undefined') app.render();
                    Toast.show(`✅ Jornada personalizada: ${Formatters.formatarHorario(novosSegundos)}`);
                });
            } else {
                const jornada = CONSTANTS.JORNADAS[jornadaKey];
                if (jornada) {
                    this.config.jornada = jornada.segundos;
                    this.config.jornadaTipo = jornadaKey;
                    this.salvarConfig();
                    if (typeof app !== 'undefined') app.render();
                    Toast.show(`✅ Jornada alterada para ${jornada.nome}: ${Formatters.formatarHorario(jornada.segundos)}`);
                }
            }
        }, this.config);
    },
    
    toggleNotificacoes: function () { 
        this.config.notificacoes = !this.config.notificacoes; 
        this.salvarConfig(); 
        if (typeof app !== 'undefined') app.render(); 
        Toast.show(this.config.notificacoes ? "🔔 Notificações ativadas" : "🔕 Notificações desativadas"); 
    },
    
    toggleTema: function () { 
        this.config.temaEscuro = !this.config.temaEscuro; 
        this.salvarConfig(); 
        if (typeof app !== 'undefined') app.render(); 
        Toast.show(this.config.temaEscuro ? "🌙 Modo escuro ativado" : "☀️ Modo claro ativado"); 
    },
    
    exportarBackup: function () { 
        ExportService.exportarBackup(); 
        Toast.show("💾 Backup exportado com sucesso!"); 
    },
    
    importarBackup: function () { 
        const input = document.createElement("input"); 
        input.type = "file"; 
        input.accept = "application/json"; 
        input.onchange = (e) => { 
            const file = e.target.files[0]; 
            if (!file) return; 
            ExportService.importarBackup(file, (success) => { 
                if (success) { 
                    Storage.registrosPorDia.clear(); 
                    RegistrosModule.carregarDados(); 
                    this.carregarConfig(); 
                    if (typeof app !== 'undefined') app.render(); 
                    Toast.show("📥 Backup restaurado com sucesso!"); 
                } else Toast.show(`❌ Erro ao restaurar`); 
            }); 
        }; 
        input.click(); 
    },
    
    limparTodosDados: function () { 
        if (confirm("⚠️ ATENÇÃO! Isso apagará TODOS os registros de TODOS os dias. Esta ação não pode ser desfeita. Deseja continuar?")) { 
            Storage.limparTodosDados(); 
            Storage.registrosPorDia.clear(); 
            RegistrosModule.registroAtual = { entrada: null, saida: null, totalSegundos: 0, comentario: "" }; 
            RegistrosModule.registrosFinalizados = []; 
            RegistrosModule.isFolga = false; 
            this.config = { ...CONSTANTS.DEFAULT_CONFIG }; 
            this.salvarConfig(); 
            if (typeof app !== 'undefined') app.render(); 
            Toast.show("🗑️ Todos os dados foram apagados!"); 
        } 
    },
    
    render: function () {
        this.carregarConfig();
        const horasJornada = Math.floor(this.config.jornada / 3600);
        const minutosJornada = Math.floor((this.config.jornada % 3600) / 60);
        const jornadaNome = this.config.jornadaTipo === 'custom' ? "Personalizada" : (CONSTANTS.JORNADAS[this.config.jornadaTipo]?.nome || "Segunda a Sexta");
        
        return `
            <div class="config-header">
                <div class="config-title">⚙️ Configurações</div>
                <div class="config-sub">Personalize sua experiência</div>
            </div>
            <div class="config-card">
                <div class="config-item" id="configJornada">
                    <div class="config-item-left">
                        <div class="config-icon">⏰</div>
                        <div>
                            <div class="config-text">Jornada padrão</div>
                            <div class="config-desc">${jornadaNome} • ${Formatters.formatarHorario(this.config.jornada)} por dia útil</div>
                        </div>
                    </div>
                    <div class="config-value">${String(horasJornada).padStart(2, '0')}:${String(minutosJornada).padStart(2, '0')} ▶</div>
                </div>
                <div class="config-item" id="configNotificacoes">
                    <div class="config-item-left">
                        <div class="config-icon">🔔</div>
                        <div>
                            <div class="config-text">Notificações</div>
                            <div class="config-desc">Receber alertas de registro</div>
                        </div>
                    </div>
                    <div class="toggle-switch ${this.config.notificacoes ? 'active' : ''}" id="toggleNotificacoes">
                        <div class="toggle-knob"></div>
                    </div>
                </div>
                <div class="config-item" id="configTema">
                    <div class="config-item-left">
                        <div class="config-icon">🌙</div>
                        <div>
                            <div class="config-text">Modo escuro</div>
                            <div class="config-desc">Alterar tema do aplicativo</div>
                        </div>
                    </div>
                    <div class="toggle-switch ${this.config.temaEscuro ? 'active' : ''}" id="toggleTema">
                        <div class="toggle-knob"></div>
                    </div>
                </div>
                <div class="config-item help-item" id="configHelp">
                    <div class="config-item-left">
                        <div class="config-icon">❓</div>
                        <div>
                            <div class="config-text">Ajuda</div>
                            <div class="config-desc">Como usar o sistema</div>
                        </div>
                    </div>
                    <div class="config-value">📖 Abrir</div>
                </div>
            </div>
            <div class="config-card">
                <div class="config-item" id="configBackup">
                    <div class="config-item-left">
                        <div class="config-icon">💾</div>
                        <div>
                            <div class="config-text">Backup dos dados</div>
                            <div class="config-desc">Exportar todos os registros</div>
                        </div>
                    </div>
                    <div class="config-value">📤 Exportar</div>
                </div>
                <div class="config-item" id="configRestore">
                    <div class="config-item-left">
                        <div class="config-icon">🔄</div>
                        <div>
                            <div class="config-text">Restaurar backup</div>
                            <div class="config-desc">Importar dados salvos</div>
                        </div>
                    </div>
                    <div class="config-value">📥 Importar</div>
                </div>
            </div>
            <button class="danger-btn" id="btnLimparTudo">⚠️ APAGAR TODOS OS DADOS</button>
            <div class="config-info">
                <div>📱 Conta Ponto v2.0</div>
                <div>Sistema completo de ponto eletrônico</div>
                <div>Dados salvos localmente no seu navegador</div>
            </div>
        `;
    },
    
    bindEvents: function () {
        document.getElementById('configJornada')?.addEventListener('click', () => this.abrirJornadaModal());
        document.getElementById('configNotificacoes')?.addEventListener('click', () => this.toggleNotificacoes());
        document.getElementById('configTema')?.addEventListener('click', () => this.toggleTema());
        document.getElementById('configHelp')?.addEventListener('click', showHelpModal);
        document.getElementById('configBackup')?.addEventListener('click', () => this.exportarBackup());
        document.getElementById('configRestore')?.addEventListener('click', () => this.importarBackup());
        document.getElementById('btnLimparTudo')?.addEventListener('click', () => this.limparTodosDados());
    }
};