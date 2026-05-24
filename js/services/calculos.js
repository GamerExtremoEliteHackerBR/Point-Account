// js/services/calculos.js
const Calculos = {
    calcularDiferencaHorarios: (entradaSeg, saidaSeg) => {
        if (!entradaSeg || !saidaSeg) return 0;
        if (entradaSeg === saidaSeg) return 0;

        let diferenca;
        if (saidaSeg >= entradaSeg) {
            diferenca = saidaSeg - entradaSeg;
        } else {
            diferenca = (CONSTANTS.SEGUNDOS_POR_DIA - entradaSeg) + saidaSeg;
        }

        if (diferenca > 86340 && diferenca < CONSTANTS.SEGUNDOS_POR_DIA) {
            return CONSTANTS.SEGUNDOS_POR_DIA;
        }
        return diferenca;
    },
    
    calcularTotalDia: (registros, pontoAberto) => {
        let total = registros.reduce((acc, r) => acc + (r.totalSegundos || 0), 0);
        if (pontoAberto && pontoAberto.entrada && !pontoAberto.saida) {
            const agora = new Date();
            total += Calculos.calcularDiferencaHorarios(pontoAberto.entrada, agora.getHours() * 3600 + agora.getMinutes() * 60 + agora.getSeconds());
        }
        return total;
    },
    
    calcularSaldo: (totalDia, diaSemana, isFolga, jornadaPadrao, jornadaTipo) => {
        if (diaSemana === 0 || diaSemana === 6 || isFolga) return totalDia;
        const jornadas = CONSTANTS.JORNADAS;
        let jornadaAtual = jornadas[jornadaTipo] || jornadas.segunda_sexta;
        if (jornadaAtual.dias && !jornadaAtual.dias.includes(diaSemana)) return totalDia;
        return totalDia - jornadaPadrao;
    },
    
    calcularSaidaPrevista: (primeiraEntrada, isFolga, jornadaPadrao) => {
        if (isFolga) return "00:00";
        if (!primeiraEntrada) return "--:--";
        let saida = primeiraEntrada + jornadaPadrao;
        if (saida >= CONSTANTS.SEGUNDOS_POR_DIA) saida -= CONSTANTS.SEGUNDOS_POR_DIA;
        return Formatters.formatarHorario(saida);
    }
};