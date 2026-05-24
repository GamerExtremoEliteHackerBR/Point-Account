// js/modules/registros.js
const RegistrosModule = {
    currentDate: new Date(2026, 4, 20),
    registroAtual: { entrada: null, saida: null, totalSegundos: 0, comentario: "" },
    registrosFinalizados: [],
    isFolga: false,
    
    carregarDados: function () {
        const saved = localStorage.getItem(`${CONSTANTS.STORAGE_KEYS.PONTO_PREFIX}${this.currentDate.toDateString()}`);
        if (saved) {
            const data = JSON.parse(saved);
            this.registroAtual = data.registroAtual || { entrada: null, saida: null, totalSegundos: 0, comentario: "" };
            this.registrosFinalizados = data.registrosFinalizados || [];
            this.registrosFinalizados.forEach(r => r.totalSegundos = Calculos.calcularDiferencaHorarios(r.entrada, r.saida));
        } else {
            this.registroAtual = { entrada: null, saida: null, totalSegundos: 0, comentario: "" };
            this.registrosFinalizados = [];
        }
    },
    
    salvarDados: function () {
        localStorage.setItem(`${CONSTANTS.STORAGE_KEYS.PONTO_PREFIX}${this.currentDate.toDateString()}`, 
            JSON.stringify({ registroAtual: this.registroAtual, registrosFinalizados: this.registrosFinalizados }));
        const key = Formatters.formatarDataKey(this.currentDate);
        Storage.registrosPorDia.set(key, this.registrosFinalizados);
    },
    
    getDateInfo: function () { 
        return { 
            mesAno: `${CONSTANTS.MESES[this.currentDate.getMonth()]}, ${this.currentDate.getFullYear()}`, 
            diaSemana: CONSTANTS.DIAS_SEMANA[this.currentDate.getDay()], 
            diaNumero: this.currentDate.getDate() 
        }; 
    },
    
    calcularTotalDia: function () {
        let total = this.registrosFinalizados.reduce((acc, r) => acc + (r.totalSegundos || 0), 0);
        if (this.registroAtual.entrada && !this.registroAtual.saida) {
            const agora = new Date();
            total += Calculos.calcularDiferencaHorarios(this.registroAtual.entrada, 
                agora.getHours() * 3600 + agora.getMinutes() * 60 + agora.getSeconds());
        }
        return total;
    },
    
    calcularSaidaPrevista: function () {
        if (this.isFolga) return "00:00";
        let primeiraEntrada = this.registroAtual.entrada;
        this.registrosFinalizados.forEach(r => { 
            if (primeiraEntrada === null || r.entrada < primeiraEntrada) primeiraEntrada = r.entrada; 
        });
        return Calculos.calcularSaidaPrevista(primeiraEntrada, this.isFolga, obterJornadaPadrao());
    },
    
    calcularSaldo: function () {
        const diaSemana = this.currentDate.getDay();
        const totalDia = this.calcularTotalDia();
        if (diaSemana === 0 || diaSemana === 6 || this.isFolga) return totalDia;
        return totalDia - obterJornadaPadrao();
    },
    
    editPontoAberto: function (tipo) {
        if (tipo === 'entrada' && this.registroAtual.entrada !== null) {
            Modal.abrirTimeEdit(this.registroAtual.entrada, (novo) => {
                if (this.registroAtual.saida !== null && novo === this.registroAtual.saida) {
                    Toast.show("⚠️ Entrada e saída não podem ser iguais! (Incluindo segundos)", 2500);
                    return;
                }
                this.registroAtual.entrada = novo;
                if (this.registroAtual.saida) 
                    this.registroAtual.totalSegundos = Calculos.calcularDiferencaHorarios(this.registroAtual.entrada, this.registroAtual.saida);
                this.salvarDados();
                if (typeof app !== 'undefined') app.render();
                Toast.show(`✅ Entrada alterada para ${Formatters.formatarHorario(novo)}`);
            }, "Editar Entrada", true, this.registroAtual.saida, null);
        } else if (tipo === 'saida' && this.registroAtual.saida !== null) {
            Modal.abrirTimeEdit(this.registroAtual.saida, (novo) => {
                if (novo === this.registroAtual.entrada) {
                    Toast.show("⚠️ Saída e entrada não podem ser iguais! (Incluindo segundos)", 2500);
                    return;
                }
                this.registroAtual.saida = novo;
                this.registroAtual.totalSegundos = Calculos.calcularDiferencaHorarios(this.registroAtual.entrada, this.registroAtual.saida);
                this.salvarDados();
                if (typeof app !== 'undefined') app.render();
                Toast.show(`✅ Saída alterada para ${Formatters.formatarHorario(novo)}`);
            }, "Editar Saída", false, this.registroAtual.entrada, null);
        }
    },
    
    abrirModalPonto: function () {
        if (this.isFolga) { 
            Toast.show("🌿 Dia de folga, não é possível registrar ponto"); 
            return; 
        }

        Toast.show("💡 Dica: Use segundos para maior precisão", 2500);

        const agora = new Date();
        const segundosAtual = agora.getHours() * 3600 + agora.getMinutes() * 60 + agora.getSeconds();

        Modal.abrirTimeEdit(segundosAtual, (segundos) => {
            if (this.registroAtual.entrada === null) {
                this.registroAtual.entrada = segundos;
                this.registroAtual.saida = null;
                this.registroAtual.totalSegundos = 0;
                Toast.show(`✅ Entrada: ${Formatters.formatarHorario(segundos)}`);
            } else {
                if (segundos === this.registroAtual.entrada) {
                    Toast.show("⚠️ Saída não pode ser igual à entrada! (Incluindo segundos)", 2500);
                    return;
                }
                this.registroAtual.saida = segundos;
                this.registroAtual.totalSegundos = Calculos.calcularDiferencaHorarios(this.registroAtual.entrada, this.registroAtual.saida);
                this.registrosFinalizados.unshift({
                    entrada: this.registroAtual.entrada,
                    saida: this.registroAtual.saida,
                    totalSegundos: this.registroAtual.totalSegundos,
                    comentario: this.registroAtual.comentario || ""
                });
                Toast.show(`✅ Saída registrada! Total: ${Formatters.formatarDuracao(this.registroAtual.totalSegundos)}`);
                this.registroAtual = { entrada: null, saida: null, totalSegundos: 0, comentario: "" };
            }
            this.salvarDados();
            if (typeof app !== 'undefined') app.render();
        }, this.registroAtual.entrada === null ? 'Registrar Entrada' : 'Registrar Saída', 
        this.registroAtual.entrada === null, this.registroAtual.entrada, this.registroAtual.saida);
    },
    
    render: function () {
        const dateInfo = this.getDateInfo(), 
              totalDia = this.calcularTotalDia(), 
              saidaPrevista = this.calcularSaidaPrevista(), 
              saldo = this.calcularSaldo();
        
        let html = `
            <div class="registros-container">
                <div class="registros-fixed">
                    <div class="top-fixed">
                        <div class="top-nav">
                            <div class="top-tab-title">
                                <span class="nav-icon">📋</span>
                                <span class="nav-label">Registros Dia</span>
                            </div>
                            <button class="folga-top-btn ${this.isFolga ? 'active-folga' : ''}" id="folgaToggleBtn">
                                <span class="check-icon">${this.isFolga ? '✓' : '☐'}</span>
                                <span class="btn-text">Folga</span>
                            </button>
                        </div>
                        <div class="date-nav-container">
                            <button class="arrow-btn" id="prevDayBtn">◀</button>
                            <div class="date-content" id="dateClickArea">
                                <div class="month-year">${dateInfo.mesAno}</div>
                                <div class="day-week">${dateInfo.diaSemana}, ${dateInfo.diaNumero}</div>
                            </div>
                            <button class="arrow-btn" id="nextDayBtn">▶</button>
                        </div>
                    </div>
                    <div class="info-sticky">
                        <div class="info-row-horizontal">
                            <div class="info-item">
                                <div class="info-label">TOTAL</div>
                                <div class="info-value">${Formatters.formatarDuracao(totalDia)}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">SAÍDA PREVISTA</div>
                                <div class="info-value">${saidaPrevista}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">SALDO</div>
                                <div class="info-value ${saldo >= 0 ? 'saldo-value' : 'saldo-negative'}">
                                    ${saldo >= 0 ? `+${Formatters.formatarDuracao(saldo)}` : Formatters.formatarDuracao(saldo)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="registros-scrollable">
        `;
        
        if (this.registroAtual.entrada !== null) {
            html += `
                <div class="registro-atual-card">
                    <div class="card-header">
                        <div class="registro-atual-title">📌 PONTO ABERTO</div>
                        <div class="menu-dots" id="menuPontoAberto">⋮</div>
                    </div>
                    <div class="ponto-row-horizontal">
                        <div class="ponto-item" data-edit="entrada">
                            <div class="ponto-label">ENTRADA</div>
                            <div class="ponto-valor entrada">${Formatters.formatarHorario(this.registroAtual.entrada)}</div>
                        </div>
                        <div class="ponto-item" data-edit="saida">
                            <div class="ponto-label">SAÍDA</div>
                            <div class="ponto-valor saida">${this.registroAtual.saida ? Formatters.formatarHorario(this.registroAtual.saida) : "--:--"} ${!this.registroAtual.saida ? '<span class="ponto-status">(pendente)</span>' : ''}</div>
                        </div>
                        <div class="ponto-item">
                            <div class="ponto-label">TOTAL</div>
                            <div class="ponto-valor total">${this.registroAtual.totalSegundos ? Formatters.formatarDuracao(this.registroAtual.totalSegundos) : "00:00"}</div>
                        </div>
                    </div>
                    <div class="comentario-area">
                        <div class="comentario-label">💬 COMENTÁRIO</div>
                        <div class="${this.registroAtual.comentario ? 'comentario-texto' : 'comentario-placeholder'}" id="comentarioPontoAberto">
                            ${this.registroAtual.comentario || 'Toque para adicionar comentário...'}
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="registro-atual-card" style="background:var(--card-secondary);">
                    <div class="registro-atual-title">⏰ NENHUM PONTO ABERTO</div>
                    <div style="text-align:center; padding:10px; color:var(--text-secondary);">Toque no botão + para registrar entrada</div>
                </div>
            `;
        }
        
        html += `<div class="lista-registros"><div class="lista-titulo">📋 REGISTROS DO DIA (${dateInfo.diaSemana}, ${dateInfo.diaNumero})</div>`;
        
        if (this.registrosFinalizados.length === 0) {
            html += `<div class="empty-list">Nenhum registro finalizado neste dia</div>`;
        } else {
            this.registrosFinalizados.forEach((reg, idx) => { 
                html += `
                    <div class="registro-item">
                        <div class="registro-header">
                            <div class="registro-info-horizontal">
                                <div class="registro-info-item" data-edit="entrada" data-index="${idx}">
                                    <div class="registro-info-label">ENTRADA</div>
                                    <div class="registro-info-value entrada">${Formatters.formatarHorario(reg.entrada)}</div>
                                </div>
                                <div class="registro-info-item" data-edit="saida" data-index="${idx}">
                                    <div class="registro-info-label">SAÍDA</div>
                                    <div class="registro-info-value saida">${Formatters.formatarHorario(reg.saida)}</div>
                                </div>
                                <div class="registro-info-item">
                                    <div class="registro-info-label">TOTAL</div>
                                    <div class="registro-info-value total">${Formatters.formatarDuracao(reg.totalSegundos)}</div>
                                </div>
                            </div>
                            <div class="menu-dots" data-menu-index="${idx}">⋮</div>
                        </div>
                        <div class="comentario-area">
                            <div class="comentario-label">💬 COMENTÁRIO</div>
                            <div class="${reg.comentario ? 'comentario-texto' : 'comentario-placeholder'}" data-comentario-index="${idx}">
                                ${reg.comentario || 'Toque para adicionar comentário...'}
                            </div>
                        </div>
                    </div>
                `; 
            });
        }
        
        html += `</div></div></div>`;
        return html;
    },
    
    bindEvents: function () {
        document.getElementById('folgaToggleBtn')?.addEventListener('click', () => { 
            this.isFolga = !this.isFolga; 
            this.salvarDados(); 
            if (typeof app !== 'undefined') app.render(); 
            Toast.show(this.isFolga ? "🌿 Folga ativada" : "📆 Trabalho ativado"); 
        });
        
        document.getElementById('prevDayBtn')?.addEventListener('click', () => { 
            this.currentDate.setDate(this.currentDate.getDate() - 1); 
            this.carregarDados(); 
            if (typeof app !== 'undefined') app.render(); 
        });
        
        document.getElementById('nextDayBtn')?.addEventListener('click', () => { 
            this.currentDate.setDate(this.currentDate.getDate() + 1); 
            this.carregarDados(); 
            if (typeof app !== 'undefined') app.render(); 
        });
        
        document.getElementById('dateClickArea')?.addEventListener('click', () => { 
            DatePicker.abrirCalendario(this.currentDate, (novaData) => { 
                this.currentDate = novaData; 
                this.carregarDados(); 
                if (typeof app !== 'undefined') app.render(); 
                Toast.show(`📅 ${CONSTANTS.DIAS_SEMANA[novaData.getDay()]}, ${novaData.getDate()}/${novaData.getMonth() + 1}`); 
            }); 
        });
        
        document.querySelectorAll('.ponto-item[data-edit]').forEach(el => { 
            el.addEventListener('click', () => this.editPontoAberto(el.getAttribute('data-edit'))); 
        });
        
        document.getElementById('menuPontoAberto')?.addEventListener('click', () => { 
            Modal.abrirOpcoes((action) => { 
                if (action === 'clear') { 
                    this.registroAtual.comentario = ""; 
                    this.salvarDados(); 
                    if (typeof app !== 'undefined') app.render(); 
                    Toast.show("🧹 Comentário removido"); 
                } else if (action === 'remove') { 
                    if (confirm("Remover ponto aberto?")) { 
                        this.registroAtual = { entrada: null, saida: null, totalSegundos: 0, comentario: "" }; 
                        this.salvarDados(); 
                        if (typeof app !== 'undefined') app.render(); 
                        Toast.show("🗑️ Removido"); 
                    } 
                } else { 
                    Toast.show("🚫 Ignorado"); 
                } 
            }); 
        });
        
        document.getElementById('comentarioPontoAberto')?.addEventListener('click', () => { 
            Modal.abrirComentario(this.registroAtual.comentario, (novo) => { 
                this.registroAtual.comentario = novo; 
                this.salvarDados(); 
                if (typeof app !== 'undefined') app.render(); 
                Toast.show("💬 Comentário salvo"); 
            }, "Comentário do Ponto Aberto"); 
        });
        
        document.querySelectorAll('.registro-info-item[data-edit]').forEach(el => {
            const idx = parseInt(el.getAttribute('data-index')), tipo = el.getAttribute('data-edit'); 
            el.addEventListener('click', () => {
                const registro = this.registrosFinalizados[idx];
                if (tipo === 'entrada') {
                    Modal.abrirTimeEdit(registro.entrada, (novo) => {
                        if (novo === registro.saida) {
                            Toast.show("⚠️ Entrada não pode ser igual à saída! (Incluindo segundos)", 2500);
                            return;
                        }
                        registro.entrada = novo;
                        registro.totalSegundos = Calculos.calcularDiferencaHorarios(registro.entrada, registro.saida);
                        this.salvarDados();
                        if (typeof app !== 'undefined') app.render();
                        Toast.show(`✅ Entrada alterada para ${Formatters.formatarHorario(novo)}`);
                    }, `Editar Entrada`, true, registro.saida, null);
                } else if (tipo === 'saida') {
                    Modal.abrirTimeEdit(registro.saida, (novo) => {
                        if (novo === registro.entrada) {
                            Toast.show("⚠️ Saída não pode ser igual à entrada! (Incluindo segundos)", 2500);
                            return;
                        }
                        registro.saida = novo;
                        registro.totalSegundos = Calculos.calcularDiferencaHorarios(registro.entrada, registro.saida);
                        this.salvarDados();
                        if (typeof app !== 'undefined') app.render();
                        Toast.show(`✅ Saída alterada para ${Formatters.formatarHorario(novo)}`);
                    }, `Editar Saída`, false, registro.entrada, null);
                }
            });
        });
        
        document.querySelectorAll('.menu-dots[data-menu-index]').forEach(el => { 
            const idx = parseInt(el.getAttribute('data-menu-index')); 
            el.addEventListener('click', () => { 
                Modal.abrirOpcoes((action) => { 
                    if (action === 'clear') { 
                        this.registrosFinalizados[idx].comentario = ""; 
                        this.salvarDados(); 
                        if (typeof app !== 'undefined') app.render(); 
                        Toast.show("🧹 Comentário removido"); 
                    } else if (action === 'remove') { 
                        if (confirm("Remover registro?")) { 
                            this.registrosFinalizados.splice(idx, 1); 
                            this.salvarDados(); 
                            if (typeof app !== 'undefined') app.render(); 
                            Toast.show("🗑️ Removido"); 
                        } 
                    } else { 
                        Toast.show("🚫 Ignorado"); 
                    } 
                }); 
            }); 
        });
        
        document.querySelectorAll('[data-comentario-index]').forEach(el => { 
            const idx = parseInt(el.getAttribute('data-comentario-index')); 
            el.addEventListener('click', () => { 
                Modal.abrirComentario(this.registrosFinalizados[idx].comentario, (novo) => { 
                    this.registrosFinalizados[idx].comentario = novo; 
                    this.salvarDados(); 
                    if (typeof app !== 'undefined') app.render(); 
                    Toast.show("💬 Comentário salvo"); 
                }, "Comentário do Registro"); 
            }); 
        });
    }
};