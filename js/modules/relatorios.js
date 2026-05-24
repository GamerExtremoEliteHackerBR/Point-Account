// js/modules/relatorios.js
const RelatoriosModule = {
    periodoSelecionado: 'semana',
    dataInicio: new Date(2026, 4, 18),
    dataFim: new Date(2026, 4, 24),
    
    atualizarPeriodo: function () {
        const hoje = new Date(2026, 4, 20);
        if (this.periodoSelecionado === 'semana') {
            const diaSemana = hoje.getDay();
            const seg = new Date(hoje);
            seg.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
            this.dataInicio = new Date(seg);
            this.dataFim = new Date(seg);
            this.dataFim.setDate(seg.getDate() + 6);
        } else if (this.periodoSelecionado === 'mes') {
            this.dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            this.dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        }
    },
    
    getDiasNoPeriodo: function () { 
        const dias = []; 
        let current = new Date(this.dataInicio); 
        while (current <= this.dataFim) { 
            dias.push(new Date(current)); 
            current.setDate(current.getDate() + 1); 
        } 
        return dias; 
    },
    
    calcularTotaisPeriodo: function () {
        const dias = this.getDiasNoPeriodo();
        let totalSegundos = 0, diasTrabalhados = 0;
        const detalhes = [];
        dias.forEach(date => {
            const registros = Storage.getRegistrosDoDia(date);
            const pontoAberto = Storage.getPontoAberto(date);
            const totalDia = Calculos.calcularTotalDia(registros, pontoAberto);
            totalSegundos += totalDia;
            if (totalDia > 0) diasTrabalhados++;
            const isDiaUtil = date.getDay() !== 0 && date.getDay() !== 6;
            detalhes.push({ 
                date: new Date(date), 
                totalSegundos: totalDia, 
                saldoSegundos: isDiaUtil ? totalDia - obterJornadaPadrao() : totalDia, 
                comentarios: registros.map(r => r.comentario).filter(c => c).join(", ") 
            });
        });
        const diasUteis = dias.filter(d => d.getDay() !== 0 && d.getDay() !== 6).length;
        return { totalSegundos, diasTrabalhados, saldoSegundos: totalSegundos - (diasUteis * obterJornadaPadrao()), detalhes };
    },
    
    avancarPeriodo: function (direcao) {
        if (this.periodoSelecionado === 'semana') { 
            this.dataInicio.setDate(this.dataInicio.getDate() + (direcao * 7)); 
            this.dataFim.setDate(this.dataFim.getDate() + (direcao * 7)); 
        } else if (this.periodoSelecionado === 'mes') { 
            this.dataInicio.setMonth(this.dataInicio.getMonth() + direcao); 
            this.dataFim.setMonth(this.dataFim.getMonth() + direcao); 
        }
        if (typeof app !== 'undefined') app.render();
    },
    
    exportarRelatorio: function () {
        const totais = this.calcularTotaisPeriodo();
        ExportService.exportarParaCSV(totais.detalhes.map(dia => ({ 
            data: Formatters.formatarDataParaCSV(dia.date), 
            diaSemana: CONSTANTS.DIAS_SEMANA[dia.date.getDay()], 
            totalHoras: Formatters.formatarDuracao(dia.totalSegundos), 
            saldo: dia.saldoSegundos >= 0 ? `+${Formatters.formatarDuracao(dia.saldoSegundos)}` : Formatters.formatarDuracao(dia.saldoSegundos), 
            comentarios: dia.comentarios 
        })), `relatorio_${this.dataInicio.toISOString().slice(0, 10)}_a_${this.dataFim.toISOString().slice(0, 10)}`);
        Toast.show("📊 Relatório exportado com sucesso!");
    },
    
    render: function () {
        const totais = this.calcularTotaisPeriodo();
        let html = `
            <div class="relatorios-container">
                <div class="relatorios-fixed">
                    <div class="relatorios-header">
                        <div class="relatorios-title">Relatórios</div>
                        <button class="download-btn" id="downloadExcelBtn">📊 Baixar .xlsx</button>
                    </div>
                    <div class="periodo-duplo">
                        <button class="periodo-nav-btn" id="prevPeriodoBtn">◀</button>
                        <div class="periodo-box" id="btnPeriodoInicio">
                            <div class="periodo-mes">${CONSTANTS.MESES[this.dataInicio.getMonth()]}-${this.dataInicio.getFullYear()}</div>
                            <div class="periodo-dia">${CONSTANTS.DIAS_SEMANA[this.dataInicio.getDay()]}, ${this.dataInicio.getDate()}</div>
                        </div>
                        <div class="separador">Até</div>
                        <div class="periodo-box" id="btnPeriodoFim">
                            <div class="periodo-mes">${CONSTANTS.MESES[this.dataFim.getMonth()]}-${this.dataFim.getFullYear()}</div>
                            <div class="periodo-dia">${CONSTANTS.DIAS_SEMANA[this.dataFim.getDay()]}, ${this.dataFim.getDate()}</div>
                        </div>
                        <button class="periodo-nav-btn" id="nextPeriodoBtn">▶</button>
                    </div>
                    <div class="periodo-selector">
                        <button class="periodo-btn ${this.periodoSelecionado === 'semana' ? 'active' : ''}" data-periodo="semana">📅 Semana</button>
                        <button class="periodo-btn ${this.periodoSelecionado === 'mes' ? 'active' : ''}" data-periodo="mes">📆 Mês</button>
                        <button class="periodo-btn ${this.periodoSelecionado === 'intervalo' ? 'active' : ''}" data-periodo="intervalo">⏱️ Intervalo</button>
                    </div>
                    <div class="totais-row">
                        <div class="total-card">
                            <div class="total-label">Total</div>
                            <div class="total-value">${Formatters.formatarDuracao(totais.totalSegundos)}</div>
                        </div>
                        <div class="total-card">
                            <div class="total-label">Dias</div>
                            <div class="total-value">${totais.diasTrabalhados}</div>
                        </div>
                        <div class="total-card">
                            <div class="total-label">Saldo</div>
                            <div class="total-value ${totais.saldoSegundos >= 0 ? 'saldo-positive' : 'saldo-negative'}">
                                ${totais.saldoSegundos >= 0 ? '+' : ''}${Formatters.formatarDuracao(totais.saldoSegundos)}
                            </div>
                        </div>
                    </div>
                    <div class="lista-titulo">📋 REGISTROS DO PERÍODO</div>
                </div>
                <div class="relatorios-scrollable">
                    <div class="lista-dias">
        `;
        
        if (totais.detalhes.length === 0) {
            html += `<div class="empty-list">Nenhum registro no período</div>`;
        } else {
            totais.detalhes.forEach((dia, idx) => { 
                html += `
                    <div class="dia-item">
                        <div class="dia-info">
                            <div class="dia-nome">${CONSTANTS.DIAS_SEMANA_ABREV[dia.date.getDay()]}, ${String(dia.date.getDate()).padStart(2, '0')}/${String(dia.date.getMonth() + 1).padStart(2, '0')}</div>
                            <div class="dia-data">${dia.comentarios.substring(0, 30) || "Sem comentários"}</div>
                        </div>
                        <div class="dia-total">${Formatters.formatarDuracao(dia.totalSegundos)}</div>
                        <div class="dia-actions">
                            <button class="icon-btn" data-comentario="${idx}">💬</button>
                            <button class="icon-btn" data-calendario="${dia.date.toISOString()}">📅</button>
                        </div>
                    </div>
                `; 
            });
        }
        
        html += `</div></div></div>`;
        return html;
    },
    
    bindEvents: function () {
        document.getElementById('downloadExcelBtn')?.addEventListener('click', () => this.exportarRelatorio());
        document.getElementById('prevPeriodoBtn')?.addEventListener('click', () => this.avancarPeriodo(-1));
        document.getElementById('nextPeriodoBtn')?.addEventListener('click', () => this.avancarPeriodo(1));
        
        document.getElementById('btnPeriodoInicio')?.addEventListener('click', () => { 
            DatePicker.abrirCalendario(this.dataInicio, (novaData) => { 
                this.dataInicio = novaData; 
                if (this.dataInicio > this.dataFim) this.dataFim = new Date(this.dataInicio); 
                if (typeof app !== 'undefined') app.render(); 
                Toast.show(`📅 Data de início alterada`); 
            }); 
        });
        
        document.getElementById('btnPeriodoFim')?.addEventListener('click', () => { 
            DatePicker.abrirCalendario(this.dataFim, (novaData) => { 
                this.dataFim = novaData; 
                if (this.dataFim < this.dataInicio) this.dataInicio = new Date(this.dataFim); 
                if (typeof app !== 'undefined') app.render(); 
                Toast.show(`📅 Data de fim alterada`); 
            }); 
        });
        
        document.querySelectorAll('.periodo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const periodo = btn.getAttribute('data-periodo');
                if (periodo === 'intervalo') {
                    DatePicker.abrirIntervalo(this.dataInicio, this.dataFim, (inicio, fim) => {
                        this.dataInicio = inicio;
                        this.dataFim = fim;
                        this.periodoSelecionado = 'intervalo';
                        if (typeof app !== 'undefined') app.render();
                        Toast.show(`📅 Período definido: ${Formatters.formatarDataParaCSV(inicio)} até ${Formatters.formatarDataParaCSV(fim)}`);
                    });
                } else {
                    this.periodoSelecionado = periodo;
                    this.atualizarPeriodo();
                    if (typeof app !== 'undefined') app.render();
                }
            });
        });
        
        document.querySelectorAll('.icon-btn[data-comentario]').forEach(btn => { 
            btn.addEventListener('click', () => { 
                const idx = parseInt(btn.getAttribute('data-comentario')), 
                      dia = this.calcularTotaisPeriodo().detalhes[idx]; 
                Modal.abrirComentario(dia.comentarios, (novo) => { 
                    const registros = Storage.getRegistrosDoDia(dia.date); 
                    if (registros.length) { 
                        registros[0].comentario = novo; 
                        Storage.salvarRegistros(dia.date, registros, null); 
                        if (typeof app !== 'undefined') app.render(); 
                        Toast.show("💬 Comentário salvo"); 
                    } else Toast.show("Nenhum registro para comentar"); 
                }, "Comentário do Dia"); 
            }); 
        });
        
        document.querySelectorAll('.icon-btn[data-calendario]').forEach(btn => { 
            btn.addEventListener('click', () => { 
                const novaData = new Date(btn.getAttribute('data-calendario')); 
                RegistrosModule.currentDate = novaData; 
                RegistrosModule.carregarDados(); 
                if (typeof app !== 'undefined') app.switchTab('registros'); 
            }); 
        });
    }
};