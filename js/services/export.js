// js/services/export.js
const ExportService = {
    exportarParaCSV: (dados, nomeArquivo) => {
        let csv = "Data,Dia da Semana,Total Horas,Saldo,Comentários\n";
        dados.forEach(item => { 
            csv += `"${item.data}","${item.diaSemana}","${item.totalHoras}","${item.saldo}","${item.comentarios.replace(/"/g, '""')}"\n`; 
        });
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${nomeArquivo}_${new Date().toISOString().slice(0, 19)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    },
    
    exportarBackup: () => {
        const todosDados = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(CONSTANTS.STORAGE_KEYS.PONTO_PREFIX) || key === CONSTANTS.STORAGE_KEYS.CONFIG) {
                todosDados[key] = localStorage.getItem(key);
            }
        }
        const blob = new Blob([JSON.stringify(todosDados, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `contaponto_backup_${new Date().toISOString().slice(0, 19)}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    },
    
    importarBackup: (file, onSuccess) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const dados = JSON.parse(event.target.result);
                for (const [key, value] of Object.entries(dados)) {
                    localStorage.setItem(key, value);
                }
                onSuccess(true);
            } catch (err) { 
                onSuccess(false, err.message); 
            }
        };
        reader.readAsText(file);
    }
};