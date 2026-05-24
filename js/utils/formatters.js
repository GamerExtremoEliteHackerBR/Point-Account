// js/utils/formatters.js
const Formatters = {
    formatarHorario: (segundos) => {
        if (segundos === null || segundos === undefined) return "--:--";
        let segundosNorm = segundos % CONSTANTS.SEGUNDOS_POR_DIA;
        if (segundosNorm < 0) segundosNorm += CONSTANTS.SEGUNDOS_POR_DIA;
        const horas = Math.floor(segundosNorm / 3600);
        const minutos = Math.floor((segundosNorm % 3600) / 60);
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    },
    
    formatarDuracao: (segundos) => {
        if (segundos === null || segundos === undefined) return "--:--";
        const negativo = segundos < 0;
        const absSeg = Math.abs(segundos);
        const horas = Math.floor(absSeg / 3600);
        const minutos = Math.floor((absSeg % 3600) / 60);
        if (!negativo && horas === 23 && minutos === 59 && absSeg > 86340) {
            return "24:00";
        }
        return `${negativo ? "-" : ""}${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    },
    
    formatarDataKey: (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    
    formatarDataParaCSV: (date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`,
    
    formatarDataParaDisplay: (date) => `${CONSTANTS.DIAS_SEMANA[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
    
    formatarMesAno: (date) => `${CONSTANTS.MESES[date.getMonth()]}, ${date.getFullYear()}`
};