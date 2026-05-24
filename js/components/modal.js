// js/components/modal.js
const Modal = {
    criarModal: (conteudo, titulo, onConfirm, onCancel) => {
        const modalHtml = `
            <div class="modal-overlay" id="dynamicModal">
                <div class="modal-container">
                    <div class="modal-header"><h3>${titulo}</h3></div>
                    <div class="modal-body">${conteudo}</div>
                    <div class="modal-actions">
                        <button id="modalCancelBtn">Cancelar</button>
                        <button id="modalConfirmBtn">OK</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('dynamicModal');
        document.getElementById('modalCancelBtn').onclick = () => { 
            if (onCancel) onCancel(); 
            modal.remove(); 
        };
        document.getElementById('modalConfirmBtn').onclick = () => { 
            if (onConfirm) onConfirm(); 
            modal.remove(); 
        };
        return modal;
    },
    
    abrirTimeEdit: (valorAtualSeg, onConfirm, titulo, isEntrada = true, entradaReferencia = null, saidaReferencia = null) => {
        let horaAtual = Math.floor(valorAtualSeg / 3600);
        let minutoAtual = Math.floor((valorAtualSeg % 3600) / 60);
        let segundoAtual = valorAtualSeg % 60;

        let hourOptions = '';
        for (let i = 0; i <= 23; i++) {
            hourOptions += `<option value="${i}" ${i === horaAtual ? 'selected' : ''}>${String(i).padStart(2, '0')}</option>`;
        }

        let minuteOptions = '';
        for (let i = 0; i <= 59; i++) {
            minuteOptions += `<option value="${i}" ${i === minutoAtual ? 'selected' : ''}>${String(i).padStart(2, '0')}</option>`;
        }

        let secondOptions = '';
        for (let i = 0; i <= 59; i++) {
            secondOptions += `<option value="${i}" ${i === segundoAtual ? 'selected' : ''}>${String(i).padStart(2, '0')}</option>`;
        }

        const modalHtml = `
            <div class="modal-overlay" id="editModal">
                <div class="modal-container">
                    <div class="modal-header"><h3>${titulo}</h3></div>
                    <div class="modal-body">
                        <div style="text-align:center;">
                            <div class="time-selectors">
                                <div class="time-selector-group">
                                    <label>Horas</label>
                                    <select id="hourSelect" class="time-select">
                                        ${hourOptions}
                                    </select>
                                </div>
                                <div class="time-selector-group">
                                    <label>Minutos</label>
                                    <select id="minuteSelect" class="time-select">
                                        ${minuteOptions}
                                    </select>
                                </div>
                                <div class="time-selector-group">
                                    <label>Segundos</label>
                                    <select id="secondSelect" class="time-select">
                                        ${secondOptions}
                                    </select>
                                </div>
                            </div>
                            <p style="font-size:11px; color:var(--text-secondary); margin-top:12px;">💡 Para horários após meia-noite, use 00:00:xx</p>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button id="cancelModalBtn">Cancelar</button>
                        <button id="confirmModalBtn">OK</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('editModal');
        const hourSelect = document.getElementById('hourSelect');
        const minuteSelect = document.getElementById('minuteSelect');
        const secondSelect = document.getElementById('secondSelect');

        document.getElementById('cancelModalBtn').onclick = () => modal.remove();
        document.getElementById('confirmModalBtn').onclick = () => {
            let horas = parseInt(hourSelect.value) || 0;
            let minutos = parseInt(minuteSelect.value) || 0;
            let segundos = parseInt(secondSelect.value) || 0;

            if (horas < 0 || horas > 23) {
                Toast.show("❌ Horas inválidas! Use 00 a 23", 2000);
                return;
            }
            if (minutos < 0 || minutos > 59) {
                Toast.show("❌ Minutos inválidos! Use 0 a 59", 2000);
                return;
            }
            if (segundos < 0 || segundos > 59) {
                Toast.show("❌ Segundos inválidos! Use 0 a 59", 2000);
                return;
            }

            let segundosTotal = horas * 3600 + minutos * 60 + segundos;

            if (entradaReferencia !== null && segundosTotal === entradaReferencia) {
                Toast.show("⚠️ Entrada e saída não podem ser iguais! (Incluindo segundos)", 2500);
                return;
            }
            if (saidaReferencia !== null && segundosTotal === saidaReferencia) {
                Toast.show("⚠️ Saída e entrada não podem ser iguais! (Incluindo segundos)", 2500);
                return;
            }

            onConfirm(segundosTotal);
            modal.remove();
        };
    },
    
    abrirComentario: (textoAtual, onConfirm, titulo) => {
        Modal.criarModal(
            `<textarea id="comentarioText" class="modal-textarea" maxlength="300" placeholder="Digite seu comentário...">${textoAtual || ""}</textarea>
             <div style="font-size:10px; text-align:right; margin-top:5px;">
                 <span id="charCount">${(textoAtual || "").length}</span>/300
             </div>`, 
            titulo, 
            () => onConfirm(document.getElementById('comentarioText').value.substring(0, 300))
        );
        const textarea = document.getElementById('comentarioText');
        const charCount = document.getElementById('charCount');
        if (textarea) textarea.oninput = () => charCount.textContent = textarea.value.length;
    },
    
    abrirOpcoes: (onSelect) => {
        const modalHtml = `
            <div class="modal-overlay" id="optionsModal">
                <div class="modal-container" style="max-width:280px;">
                    <div style="padding:8px 0;">
                        <button class="option-btn" data-action="ignore" style="width:100%; padding:14px; text-align:left; border:none; background:transparent; font-size:16px; border-bottom:0.5px solid var(--border-color);">🚫 Ignorar</button>
                        <button class="option-btn" data-action="clear" style="width:100%; padding:14px; text-align:left; border:none; background:transparent; font-size:16px; border-bottom:0.5px solid var(--border-color);">🧹 Limpar comentário</button>
                        <button class="option-btn" data-action="remove" style="width:100%; padding:14px; text-align:left; border:none; background:transparent; font-size:16px; color:var(--error-color);">🗑️ Remover registro</button>
                    </div>
                    <div class="modal-actions">
                        <button id="cancelOptionsBtn" style="width:100%;">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('optionsModal');
        document.querySelectorAll('.option-btn').forEach(btn => { 
            btn.onclick = () => { 
                onSelect(btn.getAttribute('data-action')); 
                modal.remove(); 
            }; 
        });
        document.getElementById('cancelOptionsBtn').onclick = () => modal.remove();
    },
    
    abrirJornadaModal: (onSelectJornada, configAtual) => {
        const jornadas = CONSTANTS.JORNADAS;
        let html = `<div class="jornada-list">`;
        for (const [key, value] of Object.entries(jornadas)) {
            const isActive = configAtual?.jornadaTipo === key;
            const horas = Math.floor(value.segundos / 3600);
            const mins = Math.floor((value.segundos % 3600) / 60);
            html += `<div class="jornada-item" data-jornada="${key}">
                        <div class="jornada-info">
                            <div class="jornada-nome">${value.nome}${isActive ? '<span class="jornada-badge">Atual</span>' : ''}</div>
                            <div class="jornada-desc">${value.desc}</div>
                        </div>
                        <div class="jornada-valor">${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}</div>
                     </div>`;
        }
        html += `<div class="jornada-item" data-jornada="custom" style="border-top: 1px solid var(--border-color); margin-top: 8px;">
                    <div class="jornada-info">
                        <div class="jornada-nome">✏️ Personalizar</div>
                        <div class="jornada-desc">Definir horário personalizado</div>
                    </div>
                    <div class="jornada-valor">Ajustar</div>
                 </div></div>`;
        
        Modal.criarModal(html, "⏰ Selecionar Jornada", () => {
            const selected = document.querySelector('.jornada-item.selected');
            if (selected) onSelectJornada(selected.getAttribute('data-jornada'));
        });
        
        document.querySelectorAll('.jornada-item').forEach(el => {
            el.addEventListener('click', () => {
                document.querySelectorAll('.jornada-item').forEach(i => i.style.background = 'transparent');
                el.style.background = 'var(--accent-bg)';
                el.classList.add('selected');
            });
        });
    },
    
    abrirCustomJornada: (currentSegundos, onConfirm) => {
        const horas = Math.floor(currentSegundos / 3600);
        const minutos = Math.floor((currentSegundos % 3600) / 60);
        const modalHtml = `
            <div class="modal-overlay" id="customJornadaModal">
                <div class="modal-container">
                    <div class="modal-header"><h3>✏️ Jornada Personalizada</h3></div>
                    <div class="modal-body">
                        <div style="text-align:center;">
                            <div style="display:flex; gap:12px; justify-content:center; margin-bottom:16px;">
                                <div>
                                    <label style="font-size:12px; color:var(--text-secondary);">Horas</label>
                                    <input type="number" id="customHoras" min="0" max="12" value="${horas}" step="1" style="font-size:28px; width:70px; text-align:center; border:0.5px solid var(--border-color); border-radius:12px; padding:8px;">
                                </div>
                                <div>
                                    <label style="font-size:12px; color:var(--text-secondary);">Minutos</label>
                                    <input type="number" id="customMinutos" min="0" max="59" value="${minutos}" step="1" style="font-size:28px; width:70px; text-align:center; border:0.5px solid var(--border-color); border-radius:12px; padding:8px;">
                                </div>
                            </div>
                            <p style="font-size:12px; color:var(--text-secondary);">Defina sua jornada personalizada</p>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button id="cancelCustomBtn">Cancelar</button>
                        <button id="confirmCustomBtn">OK</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('customJornadaModal');

        document.getElementById('cancelCustomBtn').onclick = () => {
            Toast.show("❌ Alteração cancelada", 1000);
            modal.remove();
        };
        document.getElementById('confirmCustomBtn').onclick = () => {
            const h = parseInt(document.getElementById('customHoras').value) || 0;
            const m = parseInt(document.getElementById('customMinutos').value) || 0;
            onConfirm(h * 3600 + m * 60);
            Toast.show("✅ Jornada personalizada salva!", 1000);
            modal.remove();
        };
    }
};