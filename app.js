const venom = require("venom-bot");
const axios = require("axios");
const banco = require("./src/banco")

const treinamento = `
Você é um chatbot de uma frutaria
seu nome é Carol a assistente virtual
o nome da frutaria é: NOSSA FRUTEIRA

sua mensagem de boas vindas será: 
Olá tudo bem?
eu sou a Carol, assistente virtual da NOSSA FRUTEIRA ❤️🥰
em que posso te ajudar?

caso você receba algo diferente de texto informe que você é uma assistente e portanto trabalha apenas com texto, seja cordial

O que você tem:
Sistema de pedido: O assistente deve ser capaz de receber pedidos e encaminhá-los para o número principal da frutaria. Isso pode incluir a fruta, legume, verdura ou produto, valor, quantidade, método de pagamento e endereço

responda sempre com emoji de coração ou sorriso

Menu: o assistente deve ser capaz de se apresentar e fornecer informacoes de tudo o que é vendido da frutaria e fornecer informacoes sobre fruta, legume, verdura ou produto

Atendimento ao cliente: O assistente deve ser capaz de responder as perguntas comuns dos clientes sobre a frutaria como horários de funcionamento, localização, opções de pagamentos, produtos disponíveis entre outros

promoções e descontos: O assistente deve ser capaz de informar sobre promoções e descontos atuais da frutaria

feedback dos clientes: O sistema pode incluir uma seção de feedback permitindo que os clientes fornecam sugestões e comentários sobre a experiência de comprar na NOSSA FRUTEIRA

responda conforme for perguntado
`

venom
  .create({
    session: "chatGPT_BOT",
    multidevice: true,
  })
  .then((client) => start(client))
  .catch((err) => console.log(err));

const header = {
  "Content-Type": "application/json",
  "Authorization": "Bearer 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",
};

const start = (client) => {
  client.onMessage((message) => {
    const userCadastrado = banco.db.find(numero => numero.num === message.from);
    if (!userCadastrado) {
      console.log("Cadastrando usuário...")
      banco.db.push({num: message.from, historico : []})
    }
    else{
      console.log("Usuário já cadastrado")
    }

    const historico = banco.db.find(num => num.num === message.from);
    historico.historico.push("user: " + message.body);
    console.log(historico.historico)

    console.log(banco.db)
    axios.post("https://api.openai.com/v1/chat/completions",
        {
          "model": "gpt-3.5-turbo",
          "messages": [
            {"role": "system", "content": treinamento},
            {"role": "system", "content":"historico de conversas: " + historico.historico},
            {"role": "user", "content": message.body}
          ]
        },
        {
          headers: header,
        }
      )
      .then((response) => {
        console.log("teste ++++" + response.data.choices[0].message.content);
        historico.historico.push("assistent: " + response.data.choices[0].message.content)
        client.sendText(message.from, response.data.choices[0].message.content)
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
