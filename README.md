# ESSENZA — Simulador Empresarial Inteligente

Plataforma de simulação empresarial e aprendizado gamificado desenvolvida para a **FECART 2026** (Colégio FECAP). O **ESSENZA** combina conceitos de gestão comercial, finanças, tomada de decisão estratégica e Inteligência Artificial (sistema **S.S.I.S.**).

---

## 🚀 Como Executar o Projeto Localmente

### 🛑 Importante: Não use o "Live Server" do VS Code!
* **Por que o Live Server não funciona?**  
  O Live Server serve apenas arquivos HTML/CSS estáticos simples. O **ESSENZA** é uma aplicação moderna construída em **React com TypeScript (`.tsx`)**. O navegador não consegue interpretar arquivos `.tsx` diretamente sem que eles sejam compilados pelo Vite em tempo real. Se você tentar abrir via Live Server, a tela ficará **totalmente em branco**.

---

### ✅ Passo a Passo para Rodar

1. **Abra o terminal** na pasta raiz do projeto (`Essenza`).
2. **Instale as dependências** (caso ainda não tenha feito):
   ```bash
   npm install
   ```
3. **Inicie o servidor de desenvolvimento do Vite**:
   ```bash
   npm run dev
   ```
4. **Acesse no seu navegador**:
   > 🌐 **`http://localhost:5173/`** *(ou o endereço indicado no terminal)*

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript 5
- **Bundler**: Vite 5
- **Estilização**: Vanilla CSS (Design System Executivo Premium Dark Mode + Glassmorphism)
- **Ícones**: Lucide React
- **Gráficos**: Gráfico Radar SVG nativo customizado
- **Envio de Certificado**: EmailJS (`@emailjs/browser`)
- **Versionamento**: Git & GitHub

---

## ✉️ Configuração do Envio de Certificado por E-mail (EmailJS)

Ao finalizar as 3 rodadas comerciais, o gestor recebe um **Certificado Oficial de Desempenho** assinado pela **Profa. Dra. Débora Mendonça M. Machado**. O certificado pode ser impresso ou enviado digitalmente por e-mail.

### Credenciais Configuradas:
- **Service ID**: `service_psjyr8r`
- **Public Key**: `0KWHSmZLCrygDSvZl`

Para mais detalhes sobre a criação do template no painel do EmailJS, consulte o arquivo [`CONFIGURAR_EMAIL.md`](./CONFIGURAR_EMAIL.md).

---

## 🎯 Funcionalidades do Simulador

1. **Ficha Cadastral Executiva**: Registro inicial do gestor.
2. **Painel de Decisões Estratégicas (3 Rodadas)**:
   - Alocação de orçamento: Matéria-Prima, Produção, Marketing e Logística.
   - Definição do Mix de Produção e Preço de Venda para 6 produtos da marca.
3. **Motor de Mercado Dinâmico (`marketEngine`)**:
   - Simulação de demanda baseada em elasticidade de preço, investimentos e concorrentes (Rival Volume e Rival Premium).
   - Eventos aleatórios de mercado (internos e externos).
4. **Inteligência S.S.I.S. (`ssisEngine`)**:
   - Diagnósticos preventivos durante as decisões.
   - Análise de indicadores empresariais e feedbacks pedagógicos.
   - Notícias automáticas da rodada.
5. **Relatório Final & Certificação**:
   - Classificação do perfil de gestão.
   - Avaliação pedagógica detalhada (Planejamento, Finanças, Pessoas e Inovação).
   - Emissão de Certificado Oficial assinado com opção de envio por e-mail e impressão em PDF.

---

## 👥 Equipe e Instituição

- **Alunos Desenvolvedores**:
  - Beatriz Lancellotti Albanez Fernandes
  - Lucca Cappellanno Paniagua
  - Laura Berti Pontes
- **Apoio Acadêmico**: Colégio FECAP — **FECART 2026**
- **Coordenação**: Profa. Dra. Débora Mendonça M. Machado (Coordenadora dos Cursos Técnicos — Colégio FECAP)
