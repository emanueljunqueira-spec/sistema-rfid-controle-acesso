const mqtt = require('mqtt');
const { Op } = require('sequelize');
const CartaoRFID = require('../app/models/CartaoRFID');
const Participante = require('../app/models/Participante');
const RegistroAcesso = require('../app/models/RegistroAcesso');

class MQTTService {
  constructor() {
    this.client = mqtt.connect('mqtt://broker.hivemq.com:1883');
    
    this.topicoLeitura = 'sistema-rfid/leitura';
    this.topicoResposta = 'sistema-rfid/resposta';
    this.topicoMonitor = 'sistema-rfid/monitor';

    this.setup();
  }

  setup() {
    this.client.on('connect', () => {
      console.log('📡 Conectado ao Broker MQTT!');
      this.client.subscribe(this.topicoLeitura, (err) => {
        if (!err) console.log(`👂 Ouvindo tópico: ${this.topicoLeitura}`);
      });
    });

    this.client.on('message', async (topic, message) => {
      if (topic === this.topicoLeitura) {
        const codigoRfid = message.toString();
        console.log(`📥 Cartão recebido via MQTT: ${codigoRfid}`);
        await this.processarAcesso(codigoRfid);
      }
    });
  }

  async processarAcesso(codigo_rfid) {
    try {
      const cartao = await CartaoRFID.findOne({
        where: { codigo_rfid },
        include: { model: Participante, as: 'participante' },
      });

      if (!cartao) {
        await RegistroAcesso.create({
          tipo_movimento: 'negado',
          mensagem: 'Cartão desconhecido (MQTT)',
        });
        this.publicarResposta('negado', 'Cartao desconhecido');
        return;
      }

      // Debounce (10s)
      const dezSegundosAtras = new Date(new Date() - 10000);
      const registroRecente = await RegistroAcesso.findOne({
        where: {
          cartao_id: cartao.id,
          hora_evento: { [Op.gte]: dezSegundosAtras }
        }
      });

      if (registroRecente) {
        console.log('Ignorando leitura duplicada (MQTT)');
        return; 
      }

      if (!cartao.ativo || !cartao.participante) {
        await RegistroAcesso.create({
          cartao_id: cartao.id,
          tipo_movimento: 'negado',
          mensagem: 'Inativo/Sem vinculo',
        });
        this.publicarResposta('negado', 'Bloqueado');
        return;
      }

      const ultimoRegistro = await RegistroAcesso.findOne({
        where: {
          cartao_id: cartao.id,
          tipo_movimento: { [Op.in]: ['entrada', 'saida'] },
        },
        order: [['hora_evento', 'DESC']],
      });

      let movimento = 'entrada';
      if (ultimoRegistro && ultimoRegistro.tipo_movimento === 'entrada') {
        movimento = 'saida';
      }

      // Atualiza Status
      const estaDentro = (movimento === 'entrada');
      await cartao.participante.update({ status: estaDentro });

      // Salva Registro
      const novoAcesso = await RegistroAcesso.create({
        cartao_id: cartao.id,
        tipo_movimento: movimento,
        mensagem: `Acesso via MQTT`,
      });

      this.publicarResposta('autorizado', movimento);

      // === CORREÇÃO AQUI ===
      // Agora passamos os 3 argumentos: (Acesso, ID do Participante, Nome)
      this.publicarMonitor(novoAcesso, cartao.participante.id, cartao.participante.nome);

    } catch (error) {
      console.error('Erro no processamento MQTT:', error);
    }
  }

  publicarResposta(status, mensagem) {
    const payload = JSON.stringify({ status, msg: mensagem });
    this.client.publish(this.topicoResposta, payload);
  }

  publicarMonitor(acesso, participanteId, nomeParticipante) {
    const payload = JSON.stringify({
      id: acesso.id,
      participanteId: participanteId, // Agora isso não será undefined
      participante: nomeParticipante,
      tipo: acesso.tipo_movimento,
      horario: acesso.hora_evento,
      status: 'sucesso'
    });
    this.client.publish(this.topicoMonitor, payload);
  }
}

module.exports = new MQTTService();