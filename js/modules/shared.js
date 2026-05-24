// js/modules/shared.js
let configAtual = null;

function carregarConfigGlobal() { 
    configAtual = Storage.carregarConfiguracoes(); 
    aplicarTema(configAtual.temaEscuro); 
}

function aplicarTema(temaEscuro) { 
    if (temaEscuro) document.documentElement.setAttribute('data-theme', 'dark'); 
    else document.documentElement.removeAttribute('data-theme'); 
}

function obterJornadaPadrao() { 
    return configAtual?.jornada || CONSTANTS.JORNADA_PADRAO_SEGUNDOS; 
}

function obterJornadaTipo() { 
    return configAtual?.jornadaTipo || "segunda_sexta"; 
}

function showHelpModal() {
    const modalHtml = `
        <div class="help-modal-overlay" id="helpModal">
            <div class="help-modal">
                <div class="help-header">
                    <h3><span>❓</span> Ajuda</h3>
                    <p style="font-size:11px; margin-top:2px;">Como usar o Conta Ponto</p>
                </div>
                <div class="help-body">
                    <div class="help-section">
                        <div class="help-section-title">📋 Registrar Ponto</div>
                        <div class="help-section-content">
                            1. Toque no botão <strong>+</strong> (canto inferior direito)<br>
                            2. Selecione a <strong>hora, minuto e segundo</strong> desejados<br>
                            3. Confirme com <strong>OK</strong><br>
                            4. O sistema calcula automaticamente o total de horas
                        </div>
                    </div>
                    <div class="help-section">
                        <div class="help-section-title">✏️ Editar Registros</div>
                        <div class="help-section-content">
                            • Toque em qualquer horário para editar<br>
                            • Use os três pontinhos (⋮) para opções adicionais<br>
                            • Comentários: toque na área de comentário para adicionar
                        </div>
                    </div>
                    <div class="help-section">
                        <div class="help-section-title">🕐 Horários Especiais</div>
                        <div class="help-section-content">
                            • Para registrar <strong>meia-noite (00:00)</strong>, use 00:00:01 nos segundos<br>
                            • O sistema arredonda automaticamente para 00:00 quando necessário
                        </div>
                    </div>
                    <div class="help-tip">
                        <p><strong>💡 Dicas Importantes:</strong></p>
                        <p>• Use os segundos para maior precisão nos cálculos</p>
                        <p>• A jornada padrão é de 08:48 (segunda a sexta)</p>
                        <p>• Você pode ajustar a jornada em Configurações</p>
                        <p>• Os dados são salvos automaticamente no seu navegador</p>
                    </div>
                </div>
                <div class="help-footer">
                    <button id="closeHelpBtn">Entendi</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('helpModal');
    document.getElementById('closeHelpBtn').onclick = () => modal.remove();
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}