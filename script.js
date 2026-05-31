function verificarFuncionamento() {
    const agora = new Date();
    const hora = agora.getHours();
    const minutos = agora.getMinutes();
    
    // Transforma o horário atual em um número de 4 dígitos fácil de comparar (Ex: 18:05 vira 1805)
    const horarioFormatado = (hora * 100) + minutos;

    // Defina os horários limite (Ex: 18h00 às 23h30)
    const horarioAbertura = 1800; 
    const horarioFechamento = 2330;

    const statusElemento = document.querySelector('.status-funcionamento');
    const btnEnviar = document.getElementById('btn-enviar');

    if (horarioFormatado >= horarioAbertura && horarioFormatado <= horarioFechamento) {
        statusElemento.textContent = "🟢 Aberto - Faça seu pedido!";
        statusElemento.classList.remove('fechado'); // Caso use classes no CSS
        btnEnviar.disabled = false;
        btnEnviar.style.opacity = "1";
        btnEnviar.style.cursor = "pointer";
    } else {
        statusElemento.textContent = "🔴 Fechado - Abre às 18h";
        
        // Desativa o botão para impedir que o cliente monte o pedido e envie com o quiosque fechado
        btnEnviar.disabled = true;
        btnEnviar.style.opacity = "0.5";
        btnEnviar.style.cursor = "not-allowed";
    }
}

// Executa a checagem ao carregar a página
verificarFuncionamento();




// Aguarda o DOM estar completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    const formPedido = document.getElementById('form-pedido');

    // 1. GERENCIAMENTO DE QUANTIDADES (Event Delegation)
    formPedido.addEventListener('click', (event) => {
        const alvo = event.target;

        // Verifica se o clique foi em um botão de mais ou menos
        if (alvo.classList.contains('btn-mais') || alvo.classList.contains('btn-menos')) {
            // Encontra o container de controle mais próximo do botão clicado
            const controleQtd = alvo.closest('.controle-qtd');
            // Encontra o input de número dentro desse container específico
            const inputQtd = controleQtd.querySelector('input[type="number"]');
            
            let quantidadeAtual = parseInt(inputQtd.value) || 0;

            if (alvo.classList.contains('btn-mais')) {
                quantidadeAtual++;
            } else if (alvo.classList.contains('btn-menos')) {
                // Impede que a quantidade fique menor que zero
                if (quantidadeAtual > 0) {
                    quantidadeAtual--;
                }
            }

            // Atualiza o valor na tela
            inputQtd.value = quantidadeAtual;
        }
    });
});