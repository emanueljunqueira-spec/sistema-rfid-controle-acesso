const sequelize = require('./src/config/database');
const Usuario = require('./src/app/models/Usuario');

async function seed() {
  try {
    console.log('🔄 Conectando ao banco...');
    await sequelize.authenticate();
    await sequelize.sync(); // Garante que as tabelas existem

    console.log('🌱 Verificando usuários...');
    const adminExiste = await Usuario.findOne({ where: { email: 'admin@evento.com' } });

    if (adminExiste) {
      console.log('⚠️ O usuário Admin já existe!');
    } else {
      // O Hook do seu Model vai criptografar a senha automaticamente!
      await Usuario.create({
        nome: 'Super Administrador',
        email: 'admin@evento.com',
        senha: 'admin', // Senha inicial
        cargo: 'administrador'
      });
      console.log('✅ Usuário Admin criado com sucesso!');
      console.log('📧 Email: admin@evento.com');
      console.log('🔑 Senha: admin');
    }

  } catch (err) {
    console.error('❌ Erro no seed:', err);
  } finally {
    await sequelize.close();
    console.log('👋 Conexão encerrada.');
  }
}

seed();