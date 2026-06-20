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
    const radioDinheiro = document.getElementById('pag-dinheiro');
    const radioPix = document.getElementById('pag-pix');
    const radioCartao = document.getElementById('pag-cartao');

    const containerTroco = document.getElementById('container-troco');
    const inputTroco = document.getElementById('txt-troco');

    const itensCardapio = document.querySelectorAll('.item-cardapio');

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
    };

    const controlarCampoTroco = () => {
        if (!containerTroco || !inputTroco || !radioDinheiro) return;

        if (radioDinheiro.checked) {
            containerTroco.classList.remove('oculto');
        } else {
            containerTroco.classList.add('oculto');
            inputTroco.value = '';
        }
    };

    const mostrarCardapio = (modo) => {
        modoAtivo = modo;

        telaBoasVindas.classList.add('oculto');
        cabecalhoPrincipal.classList.remove('oculto');
        cardapioPrincipal.classList.remove('oculto');

        document.body.classList.toggle('modo-quiosque', modo === 'quiosque');
        setCamposEnderecoAtivos(modo === 'delivery');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    btnDelivery?.addEventListener('click', () => mostrarCardapio('delivery'));
    btnQuiosque?.addEventListener('click', () => mostrarCardapio('quiosque'));

    inputTelefone?.addEventListener('input', (e) => {
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

    radioDinheiro?.addEventListener('change', controlarCampoTroco);
    radioPix?.addEventListener('change', controlarCampoTroco);
    radioCartao?.addEventListener('change', controlarCampoTroco);

    function atualizarTotalPedido() {
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
    }

    itensCardapio.forEach(item => {
        const btnMenos = item.querySelector('.btn-menos');
        const btnMais = item.querySelector('.btn-mais');
        const inputQtd = item.querySelector('input[type="number"]');
        const textareaObs = item.querySelector('.observacao-item');

        const atualizarObservacao = () => {
            if (!textareaObs || !inputQtd) return;

            const qtd = parseInt(inputQtd.value, 10) || 0;

            if (qtd > 0) {
                textareaObs.classList.remove('oculto');
            } else {
                textareaObs.classList.add('oculto');
                textareaObs.value = '';
            }
        };

        btnMenos?.addEventListener('click', () => {
            const qtdAtual = parseInt(inputQtd.value, 10) || 0;

            if (qtdAtual > 0) {
                inputQtd.value = qtdAtual - 1;
                atualizarTotalPedido();
                atualizarObservacao();
            }
        });

        btnMais?.addEventListener('click', () => {
            const qtdAtual = parseInt(inputQtd.value, 10) || 0;
            inputQtd.value = qtdAtual + 1;
            atualizarTotalPedido();
            atualizarObservacao();
        });

        atualizarObservacao();
    });

    formPedido?.addEventListener('submit', (e) => {
        e.preventDefault();

        const nomeCliente = document.getElementById('txt-nome')?.value.trim() || '';
        const telCliente = document.getElementById('txt-tel')?.value.trim() || '';
        const formaPagamento =
            document.querySelector('input[name="forma_pagamento"]:checked')?.value || 'Não informado';

        let itensPedidos = '';
        let totalFinal = 0;
        const inputsPreco = document.querySelectorAll('input[data-preco]');

        inputsPreco.forEach(input => {
            const qtd = parseInt(input.value, 10) || 0;

            if (qtd > 0) {
                const preco = parseFloat(input.dataset.preco) || 0;
                const itemCardapio = input.closest('.item-cardapio');
                const produto = itemCardapio?.querySelector('strong')?.textContent || 'Produto';
                const nomeProduto = produto.split(' - ')[0];
                const subtotalItem = qtd * preco;

                itensPedidos += `*${qtd}x* ${nomeProduto} (R$ ${subtotalItem.toFixed(2).replace('.', ',')})\n`;

                const observacaoItem = itemCardapio
                    ?.querySelector('.observacao-item')
                    ?.value
                    .trim();

                if (observacaoItem) {
                    itensPedidos += `📝 Obs: ${observacaoItem}\n`;
                }

                itensPedidos += '\n';
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
        mensagemWhatsApp += `🛒 *ITENS DO PEDIDO:*\n${itensPedidos}`;
        mensagemWhatsApp += `----------------------------------------\n`;

        if (modoAtivo === 'delivery') {
            const rua = document.getElementById('txt-rua')?.value.trim() || '';
            const bairro = document.getElementById('txt-bairro')?.value.trim() || '';
            const numero = document.getElementById('num-casa')?.value.trim() || '';
            const referencia = document.getElementById('txt-referencia')?.value.trim() || '';

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

        if (formaPagamento.toLowerCase() === 'dinheiro') {
            const troco = inputTroco?.value.trim() || '';
            if (troco) {
                mensagemWhatsApp += `💵 *Troco para:* R$ ${troco}\n`;
                mensagemWhatsApp += `----------------------------------------\n`;
            }
        }

        mensagemWhatsApp += `💳 *Forma de Pagamento:* ${formaPagamento}\n`;
        mensagemWhatsApp += `💰 *TOTAL DO PEDIDO:* *R$ ${totalFinal.toFixed(2).replace('.', ',')}*\n`;

        const numeroTelefoneEmpresa = '5581995666335';
        const urlFinal = `https://wa.me/${numeroTelefoneEmpresa}?text=${encodeURIComponent(mensagemWhatsApp)}`;

        window.location.href = urlFinal;
    });

    const status = document.querySelector('.status-funcionamento');

    const hora = new Date().getHours();

    if (hora >= 18 && hora < 23) {
        status.textContent = '🟢 Aberto';
        status.style.color = '#25D366';
    } else {
        status.textContent = '🔴 Fechado - Abre às 18h';
    }

    function atualizarCarrinho() {
        let totalItens = 0;
        let valorTotal = 0;

        document.querySelectorAll('input[type="number"][data-preco]')
            .forEach(input => {

                const qtd = parseInt(input.value) || 0;
                const preco = parseFloat(input.dataset.preco);

                totalItens += qtd;
                valorTotal += qtd * preco;
            });

        document.getElementById('total-itens').textContent = totalItens;

        document.getElementById('valor-total').textContent =
            valorTotal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
    }

    controlarCampoTroco();
    atualizarTotalPedido();
});