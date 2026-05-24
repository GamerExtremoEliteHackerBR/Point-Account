// js/services/storage.js
const Storage = {
    registrosPorDia: new Map(),
    
    getRegistrosDoDia: function (date) {
        const key = Formatters.formatarDataKey(date);
        if (this.registrosPorDia.has(key)) return this.registrosPorDia.get(key);
        const saved = localStorage.getItem(`${CONSTANTS.STORAGE_KEYS.PONTO_PREFIX}${date.toDateString()}`);
        let registros = [];
        if (saved) {
            const data = JSON.parse(saved);
            registros = data.registrosFinalizados || [];
            registros.forEach(r => r.totalSegundos = Calculos.calcularDiferencaHorarios(r.entrada, r.saida));
        }
        this.registrosPorDia.set(key, registros);
        return registros;
    },
    
    getPontoAberto: function (date) {
        const saved = localStorage.getItem(`${CONSTANTS.STORAGE_KEYS.PONTO_PREFIX}${date.toDateString()}`);
        if (saved) return JSON.parse(saved).registroAtual || null;
        return null;
    },
    
    salvarRegistros: function (date, registrosFinalizados, registroAtual) {
        localStorage.setItem(`${CONSTANTS.STORAGE_KEYS.PONTO_PREFIX}${date.toDateString()}`, 
            JSON.stringify({ registrosFinalizados, registroAtual }));
        this.registrosPorDia.set(Formatters.formatarDataKey(date), registrosFinalizados);
    },
    
    carregarConfiguracoes: function () {
        const saved = localStorage.getItem(CONSTANTS.STORAGE_KEYS.CONFIG);
        return saved ? JSON.parse(saved) : { ...CONSTANTS.DEFAULT_CONFIG };
    },
    
    salvarConfiguracoes: function (config) { 
        localStorage.setItem(CONSTANTS.STORAGE_KEYS.CONFIG, JSON.stringify(config)); 
    },
    
    limparTodosDados: function () { 
        localStorage.clear(); 
        this.registrosPorDia.clear(); 
    },
    
    getJornadaPadrao: function () {
        const config = this.carregarConfiguracoes();
        return config.jornada || CONSTANTS.JORNADA_PADRAO_SEGUNDOS;
    },
    
    getJornadaTipo: function () {
        const config = this.carregarConfiguracoes();
        return config.jornadaTipo || "segunda_sexta";
    }
};