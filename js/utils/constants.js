// js/utils/constants.js
const CONSTANTS = {
    JORNADA_PADRAO_SEGUNDOS: 8 * 3600 + 48 * 60,
    SEGUNDOS_POR_DIA: 86400,
    MESES: ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"],
    DIAS_SEMANA: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
    DIAS_SEMANA_ABREV: ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"],
    STORAGE_KEYS: { 
        PONTO_PREFIX: "ponto_", 
        CONFIG: "app_configuracoes" 
    },
    DEFAULT_CONFIG: { 
        jornada: 8 * 3600 + 48 * 60, 
        jornadaTipo: "segunda_sexta", 
        notificacoes: true, 
        temaEscuro: false 
    },
    JORNADAS: {
        segunda_sexta: { 
            nome: "Segunda a Sexta", 
            desc: "Padrão - Dias úteis", 
            segundos: 8 * 3600 + 48 * 60, 
            dias: [1, 2, 3, 4, 5] 
        },
        segunda_sabado: { 
            nome: "Segunda a Sábado", 
            desc: "Inclui sábado", 
            segundos: 8 * 3600, 
            dias: [1, 2, 3, 4, 5, 6] 
        },
        domingo_sexta: { 
            nome: "Domingo a Sexta", 
            desc: "Domingo incluso", 
            segundos: 7 * 3600 + 30 * 60, 
            dias: [0, 1, 2, 3, 4, 5] 
        },
        plantao_12_36: { 
            nome: "Plantão 12x36", 
            desc: "12 horas, 36 de descanso", 
            segundos: 12 * 3600, 
            dias: [0, 1, 2, 3, 4, 5, 6] 
        },
        semana_inglesa: { 
            nome: "Semana Inglesa", 
            desc: "5h na sexta", 
            segundos: 7 * 3600 + 20 * 60, 
            dias: [1, 2, 3, 4] 
        },
        jornada_reduzida: { 
            nome: "Jornada Reduzida", 
            desc: "Meio período", 
            segundos: 6 * 3600, 
            dias: [1, 2, 3, 4, 5] 
        },
        jornada_estendida: { 
            nome: "Jornada Estendida", 
            desc: "9 horas por dia", 
            segundos: 9 * 3600, 
            dias: [1, 2, 3, 4, 5] 
        }
    }
};