const http = require('http');

const PORT = 8080; // Default Spring Boot port
const HOST = 'localhost';
const DURATION_MS = 2 * 60 * 1000; // 2 minutos
const USERS = 5;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        } catch(e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function simulateUser(id) {
  let createdCount = 0;
  let queriedCount = 0;
  console.log(`[Usuário ${id}] Iniciando login...`);
  
  try {
    const loginRes = await request('POST', '/api/auth/login', { email: 'admin@sigtef.com.br', password: '123456' });
    if (loginRes.status !== 200 || !loginRes.data.token) {
      console.error(`[Usuário ${id}] Erro no login:`, loginRes.data);
      return;
    }
    const token = loginRes.data.token;
    console.log(`[Usuário ${id}] Login realizado com sucesso.`);

    // Pegar uma categoria para criar o Item
    const catRes = await request('GET', '/api/items/categories', null, token);
    let categoryId = null;
    if (catRes.status === 200 && catRes.data.length > 0) {
      categoryId = catRes.data[0].id;
    } else {
      console.error(`[Usuário ${id}] Não foi possível carregar categorias.`);
      return;
    }

    const endTime = Date.now() + DURATION_MS;
    
    while (Date.now() < endTime) {
      // 1. Criar item genérico
      const dummyItem = {
        categoryId: categoryId,
        name: `Item de Carga Teste ${id} - ${Date.now()}`,
        unitOfMeasurement: 'UN'
      };
      
      const createRes = await request('POST', '/api/items', dummyItem, token);
      if (createRes.status === 200 || createRes.status === 201) {
        createdCount++;
      } else {
        console.error(`[Usuário ${id}] Erro ao criar item:`, createRes.status, createRes.data);
      }

      // 2. Aguardar 500ms
      await new Promise(r => setTimeout(r, 500));
      
      // 3. Consultar items criados (para simular carga)
      const queryRes = await request('GET', '/api/items', null, token);
      if (queryRes.status === 200) {
        queriedCount++;
      } else {
        console.error(`[Usuário ${id}] Erro ao consultar itens:`, queryRes.status, queryRes.data);
      }
      
      // 4. Aguardar entre 1 e 2 segundos
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
    }
    
    console.log(`[Usuário ${id}] Finalizado. Itens Criados: ${createdCount}, Consultados: ${queriedCount}`);
    return { createdCount, queriedCount };
  } catch (err) {
    console.error(`[Usuário ${id}] Erro de conexão:`, err.message);
  }
}

async function runTest() {
  console.log(`Iniciando Teste de Carga no SIGTEF-SEDS: ${USERS} usuários por ${DURATION_MS / 1000} segundos...`);
  const promises = [];
  for (let i = 1; i <= USERS; i++) {
    promises.push(simulateUser(i));
  }
  
  const results = await Promise.all(promises);
  let totalCreated = 0;
  let totalQueried = 0;
  
  results.forEach(res => {
    if (res) {
      totalCreated += res.createdCount;
      totalQueried += res.queriedCount;
    }
  });
  
  console.log('====================================');
  console.log('TESTE CONCLUÍDO (SIGTEF-SEDS)');
  console.log(`Total de Itens Criados: ${totalCreated}`);
  console.log(`Total de Consultas Realizadas: ${totalQueried}`);
  console.log('====================================');
}

runTest();
