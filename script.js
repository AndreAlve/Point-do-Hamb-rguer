document.addEventListener('DOMContentLoaded', () => {
    const telaBoasVindas = document.getElementById('tela-boas-vindas');
    const cabecalhoPrincipal = document.getElementById('cabecalho-principal');
    const cardapioPrincipal = document.getElementById('cardapio-principal');
    const formPedido = document.getElementById('form-pedido');
    const btnEnviar = document.getElementById('btn-enviar');


    const btnDelivery = document.getElementById('btn-escolha-delivery');
    const btnQuiosque = document.getElementById('btn-escolha-quiosque');

    const camposEndereco = document.querySelectorAll(
        '.container-endereco-delivery input, .container-endereco-delivery textarea'
    );

    const inputTelefone = document.getElementById('txt-tel');

    let modoAtivo = 'delivery';

    const setCamposEnderecoAtivos = (ativo) => {
        camposEndereco.forEach(campo => {
            campo.required = ativo;
            campo.disabled = !ativo;
        });

        const containerEndereco = document.querySelector('.container-endereco-delivery');
        if (containerEndereco) {
            containerEndereco.style.display = ativo ? '' : 'none';
        }
    }

    const mostrarCardapio = (modo) => {
        modoAtivo = modo;

        telaBoasVindas.classList.add('oculto');
        cabecalhoPrincipal.classList.remove('oculto');
        cardapioPrincipal.classList.remove('oculto');

        document.body.classList.toggle('modo-quiosque', modo === 'quiosque');
        setCamposEnderecoAtivos(modo === 'delivery');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    btnDelivery.addEventListener('click', () => mostrarCardapio('delivery'));
    btnQuiosque.addEventListener('click', () => mostrarCardapio('quiosque'));

    inputTelefone.addEventListener('input', (e) => {
        let valor = e.target.value.replace(/\D/g, '').slice(0, 11);

        if (valor.length > 10) {
            valor = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (valor.length > 6) {
            valor = valor.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, '($1) $2-$3');
        } else if (valor.length > 2) {
            valor = valor.replace(/^(\d{2})(\d+)/, '($1) $2');
        }

        e.target.value = valor;
    });

    const itensCardapio = document.querySelectorAll('.item-cardapio');

    const atualizarTotalPedido = () => {
        let total = 0;
        const inputsPreco = document.querySelectorAll('input[data-preco]');

        inputsPreco.forEach(input => {
            const qtd = parseInt(input.value, 10) || 0;
            const preco = parseFloat(input.dataset.preco) || 0;
            total += qtd * preco;
        });

        btnEnviar.textContent = total > 0
            ? `🚀 Enviar Pedido para o WhatsApp (Total: R$ ${total.toFixed(2).replace('.', ',')})`
            : '🚀 Enviar Pedido para o WhatsApp';
    };

    const mostrarCardapioOriginal = mostrarCardapio;
    mostrarCardapio = (modo) => {
        mostrarCardapioOriginal(modo);
    };

    itensCardapio.forEach(item => {
        const btnMenos = item.querySelector('.btn-menos');
        const btnMais = item.querySelector('.btn-mais');
        const inputQtd = item.querySelector('input[type="number"]');

        btnMenos.addEventListener('click', () => {
            const qtdAtual = parseInt(inputQtd.value, 10) || 0;
            if (qtdAtual > 0) {
                inputQtd.value = qtdAtual - 1;
                atualizarTotalPedido();
            }
        });

        btnMais.addEventListener('click', () => {
            const qtdAtual = parseInt(inputQtd.value, 10) || 0;
            inputQtd.value = qtdAtual + 1;
            atualizarTotalPedido();
        });
    });

    formPedido.addEventListener('submit', (e) => {
        e.preventDefault();

        const nomeCliente = document.getElementById('txt-nome').value.trim();
        const telCliente = document.getElementById('txt-tel').value.trim();
        const observacao = document.getElementById('txt-observacao').value.trim();
        const formaPagamento = document.querySelector('input[name="forma_pagamento"]:checked')?.value || 'Não informado';

        let itensPedidos = '';
        let totalFinal = 0;
        const inputsPreco = document.querySelectorAll('input[data-preco]');

        inputsPreco.forEach(input => {
            const qtd = parseInt(input.value, 10) || 0;

            if (qtd > 0) {
                const preco = parseFloat(input.dataset.preco) || 0;
                const produto = input.closest('.item-cardapio')?.querySelector('strong')?.textContent || 'Produto';
                const nomeProduto = produto.split(' - ')[0];
                const subtotalItem = qtd * preco;

                itensPedidos += `*${qtd}x* ${nomeProduto} (R$ ${subtotalItem.toFixed(2).replace('.', ',')})\n`;
                totalFinal += subtotalItem;
            }
        });

        if (totalFinal === 0) {
            alert('Adicione pelo menos um item ao pedido.');
            return;
        }

        if (!nomeCliente || !telCliente) {
            alert('Preencha seu nome e telefone.');
            return;
        }

        let mensagemWhatsApp = `🍔 *NOVO PEDIDO - POINT DO HAMBÚRGUER* 🍔\n`;
        mensagemWhatsApp += `----------------------------------------\n`;
        mensagemWhatsApp += `📌 *MODO:* ${modoAtivo === 'quiosque' ? '🏠 NO QUIOSQUE / BALCÃO' : '🛵 QUERO DELIVERY'}\n\n`;
        mensagemWhatsApp += `👤 *Cliente:* ${nomeCliente}\n`;
        mensagemWhatsApp += `📞 *Telefone:* ${telCliente}\n`;
        mensagemWhatsApp += `----------------------------------------\n`;
        mensagemWhatsApp += `🛒 *ITENS DO PEDIDO:*\n${itensPedidos}\n`;
        mensagemWhatsApp += `----------------------------------------\n`;

        if (modoAtivo === 'delivery') {
            const rua = document.getElementById('txt-rua').value.trim();
            const bairro = document.getElementById('txt-bairro').value.trim();
            const numero = document.getElementById('num-casa').value.trim();
            const referencia = document.getElementById('txt-referencia').value.trim();

            if (!rua || !bairro || !numero) {
                alert('Preencha rua, bairro e número da casa para delivery.');
                return;
            }

            mensagemWhatsApp += `📍 *ENDEREÇO DE ENTREGA:*\n`;
            mensagemWhatsApp += `*Rua:* ${rua}, Nº ${numero}\n`;
            mensagemWhatsApp += `*Bairro:* ${bairro}\n`;

            if (referencia) {
                mensagemWhatsApp += `*Ref:* ${referencia}\n`;
            }

            mensagemWhatsApp += `----------------------------------------\n`;
        }

        if (observacao) {
            mensagemWhatsApp += `📝 *OBSERVAÇÕES:*\n`;
            mensagemWhatsApp += `${observacao}\n`;
            mensagemWhatsApp += `----------------------------------------\n`;
        }

        mensagemWhatsApp += `💳 *Forma de Pagamento:* ${formaPagamento}\n`;
        mensagemWhatsApp += `💰 *TOTAL DO PEDIDO:* *R$ ${totalFinal.toFixed(2).replace('.', ',')}*\n`;

        const numeroTelefoneEmpresa = '5581995666335'; // troque pelo número real
        const urlFinal = `https://wa.me/${numeroTelefoneEmpresa}?text=${encodeURIComponent(mensagemWhatsApp)}`;

        window.open(urlFinal, '_blank');
    });

    atualizarTotalPedido();
});