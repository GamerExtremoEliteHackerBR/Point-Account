// js/utils/datePicker.js
const DatePicker = {
    abrirCalendario: (dataAtual, onConfirm) => {
        let tempDate = new Date(dataAtual), 
            currentYear = dataAtual.getFullYear(), 
            currentMonth = dataAtual.getMonth();
            
        const renderCalendar = (year, month, containerId) => {
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            let html = '';
            for (let i = 0; i < firstDay; i++) html += '<div class="calendar-day empty"></div>';
            for (let d = 1; d <= daysInMonth; d++) {
                const isSelected = (year === tempDate.getFullYear() && month === tempDate.getMonth() && d === tempDate.getDate());
                html += `<div class="calendar-day ${isSelected ? 'selected' : ''}" data-day="${d}">${d}</div>`;
            }
            document.getElementById(containerId).innerHTML = html;
            document.querySelectorAll(`#${containerId} .calendar-day[data-day]`).forEach(el => {
                el.addEventListener('click', () => {
                    const day = parseInt(el.getAttribute('data-day'));
                    tempDate = new Date(year, month, day);
                    document.querySelectorAll(`#${containerId} .calendar-day`).forEach(d => d.classList.remove('selected'));
                    el.classList.add('selected');
                });
            });
        };
        
        const modalHtml = `
            <div class="modal-overlay" id="calendarModal">
                <div class="calendar-modal">
                    <div class="calendar-header">
                        <button id="calPrevMonth">◀</button>
                        <span class="calendar-month-year" id="calMonthYear"></span>
                        <button id="calNextMonth">▶</button>
                    </div>
                    <div class="calendar-weekdays">
                        <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
                    </div>
                    <div class="calendar-days" id="calendarDays"></div>
                    <div class="calendar-footer">
                        <button id="calCancelBtn">Cancelar</button>
                        <button id="calConfirmBtn">OK</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('calendarModal');
        
        const updateCalendarView = () => { 
            document.getElementById('calMonthYear').textContent = `${CONSTANTS.MESES[currentMonth]} ${currentYear}`; 
            renderCalendar(currentYear, currentMonth, 'calendarDays'); 
        };
        
        document.getElementById('calPrevMonth').onclick = () => { 
            currentMonth--; 
            if (currentMonth < 0) { currentMonth = 11; currentYear--; } 
            updateCalendarView(); 
        };
        document.getElementById('calNextMonth').onclick = () => { 
            currentMonth++; 
            if (currentMonth > 11) { currentMonth = 0; currentYear++; } 
            updateCalendarView(); 
        };
        document.getElementById('calCancelBtn').onclick = () => modal.remove();
        document.getElementById('calConfirmBtn').onclick = () => { 
            onConfirm(tempDate); 
            modal.remove(); 
        };
        updateCalendarView();
    },
    
    abrirIntervalo: (dataInicioAtual, dataFimAtual, onConfirm) => {
        let tempInicio = new Date(dataInicioAtual), 
            tempFim = new Date(dataFimAtual);
            
        const atualizarDisplay = () => {
            document.getElementById('intervalInicioDate').textContent = `${CONSTANTS.DIAS_SEMANA[tempInicio.getDay()]}, ${tempInicio.getDate()}/${tempInicio.getMonth() + 1}/${tempInicio.getFullYear()}`;
            document.getElementById('intervalFimDate').textContent = `${CONSTANTS.DIAS_SEMANA[tempFim.getDay()]}, ${tempFim.getDate()}/${tempFim.getMonth() + 1}/${tempFim.getFullYear()}`;
        };
        
        const abrirCalendarioInterno = (tipo) => {
            let currentYear = tipo === 'inicio' ? tempInicio.getFullYear() : tempFim.getFullYear();
            let currentMonth = tipo === 'inicio' ? tempInicio.getMonth() : tempFim.getMonth();
            let tempDate = tipo === 'inicio' ? new Date(tempInicio) : new Date(tempFim);
            
            const renderCal = (year, month, containerId) => {
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                let html = '';
                for (let i = 0; i < firstDay; i++) html += '<div class="calendar-day empty"></div>';
                for (let d = 1; d <= daysInMonth; d++) {
                    const isSelected = (year === tempDate.getFullYear() && month === tempDate.getMonth() && d === tempDate.getDate());
                    html += `<div class="calendar-day ${isSelected ? 'selected' : ''}" data-day="${d}">${d}</div>`;
                }
                document.getElementById(containerId).innerHTML = html;
                document.querySelectorAll(`#${containerId} .calendar-day[data-day]`).forEach(el => {
                    el.addEventListener('click', () => {
                        const day = parseInt(el.getAttribute('data-day'));
                        tempDate = new Date(year, month, day);
                        document.querySelectorAll(`#${containerId} .calendar-day`).forEach(d => d.classList.remove('selected'));
                        el.classList.add('selected');
                    });
                });
            };
            
            const modalHtml = `
                <div class="modal-overlay" id="subCalendarModal">
                    <div class="calendar-modal">
                        <div class="calendar-header">
                            <button id="subCalPrevMonth">◀</button>
                            <span class="calendar-month-year" id="subCalMonthYear"></span>
                            <button id="subCalNextMonth">▶</button>
                        </div>
                        <div class="calendar-weekdays">
                            <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
                        </div>
                        <div class="calendar-days" id="subCalendarDays"></div>
                        <div class="calendar-footer">
                            <button id="subCalCancelBtn">Cancelar</button>
                            <button id="subCalConfirmBtn">OK</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            const modalSub = document.getElementById('subCalendarModal');
            
            const updateView = () => { 
                document.getElementById('subCalMonthYear').textContent = `${CONSTANTS.MESES[currentMonth]} ${currentYear}`; 
                renderCal(currentYear, currentMonth, 'subCalendarDays'); 
            };
            
            document.getElementById('subCalPrevMonth').onclick = () => { 
                currentMonth--; 
                if (currentMonth < 0) { currentMonth = 11; currentYear--; } 
                updateView(); 
            };
            document.getElementById('subCalNextMonth').onclick = () => { 
                currentMonth++; 
                if (currentMonth > 11) { currentMonth = 0; currentYear++; } 
                updateView(); 
            };
            document.getElementById('subCalCancelBtn').onclick = () => modalSub.remove();
            document.getElementById('subCalConfirmBtn').onclick = () => {
                if (tipo === 'inicio') tempInicio = new Date(tempDate);
                else tempFim = new Date(tempDate);
                if (tempInicio > tempFim) tempFim = new Date(tempInicio);
                atualizarDisplay();
                modalSub.remove();
            };
            updateView();
        };
        
        const modalHtml = `
            <div class="modal-overlay" id="intervalModal">
                <div class="modal-container">
                    <div class="modal-header"><h3>Selecionar Intervalo</h3></div>
                    <div class="modal-body">
                        <div class="interval-container">
                            <div class="interval-box" id="selectInicio">
                                <div class="interval-label">DATA DE INÍCIO</div>
                                <div class="interval-date" id="intervalInicioDate"></div>
                            </div>
                            <div class="interval-box" id="selectFim">
                                <div class="interval-label">DATA DE FIM</div>
                                <div class="interval-date" id="intervalFimDate"></div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button id="cancelIntervalBtn">Cancelar</button>
                        <button id="confirmIntervalBtn">OK</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('intervalModal');
        document.getElementById('selectInicio').onclick = () => abrirCalendarioInterno('inicio');
        document.getElementById('selectFim').onclick = () => abrirCalendarioInterno('fim');
        document.getElementById('cancelIntervalBtn').onclick = () => modal.remove();
        document.getElementById('confirmIntervalBtn').onclick = () => { 
            onConfirm(tempInicio, tempFim); 
            modal.remove(); 
        };
        atualizarDisplay();
    }
};