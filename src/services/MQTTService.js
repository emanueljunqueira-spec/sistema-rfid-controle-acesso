const mqtt = require('mqtt');
const { Op } = require('sequelize');
const CartaoRFID = require('../app/models/CartaoRFID');
const Participante = require('../app/models/Participante');
const RegistroAcesso = require('../app/models/RegistroAcesso');

class MQTTService {
  constructor() {
    this.client = null;
    this.topicoLeitura = 'sistema-rfid/leitura';
    this.topicoResposta = 'sistema-rfid/resposta';
    this.topicoMonitor = 'sistema-rfid/monitor';
  }

  /**
   * Inicializa a conexão MQTT
   * Chamado explicitamente em index.js para evitar side-effects
   */
  setup() {
    // Evita múltiplas inicializações
    if (this.client) {
      console.log('📡 MQTTService já inicializado.');
      return;
    }

    this.client = mqtt.connect('mqtt://broker.hivemq.com:1883');

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

    this.client.on('error', (err) => {
      console.error('❌ Erro no MQTT:', err);
    });

    this.client.on('offline', () => {
      console.log('⚠️  MQTT desconectado. Tentando reconectar...');
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
      this.publicarMonitor(novoAcesso, cartao.participante.id, cartao.participante.nome);

    } catch (error) {
      console.error('Erro no processamento MQTT:', error);
    }
  }

  publicarResposta(status, mensagem) {
    if (!this.client) return;
    const payload = JSON.stringify({ status, msg: mensagem });
    this.client.publish(this.topicoResposta, payload);
  }

  publicarMonitor(acesso, participanteId, nomeParticipante) {
    if (!this.client) return;
    const payload = JSON.stringify({
      id: acesso.id,
      participanteId: participanteId,
      participante: nomeParticipante,
      tipo: acesso.tipo_movimento,
      horario: acesso.hora_evento,
      status: 'sucesso'
    });
    this.client.publish(this.topicoMonitor, payload);
  }

  /**
   * Desconecta do MQTT de forma segura
   */
  disconnect() {
    if (this.client) {
      this.client.end(true, () => {
        console.log('📡 Desconectado do MQTT.');
        this.client = null;
      });
    }
  }
}

module.exports = new MQTTService();
