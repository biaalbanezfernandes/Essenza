# Como configurar o EmailJS para o Certificado ESSENZA

## 1. Criar conta gratuita
Acesse: https://www.emailjs.com  
Crie uma conta gratuita (permite até 200 e-mails/mês).

## 2. Conectar seu e-mail (Service)
1. No painel, clique em **Email Services** → **Add New Service**
2. Escolha **Gmail** (ou outro)
3. Conecte com a conta `biaalbanezfernandes@gmail.com`
4. Anote o **Service ID** (ex: `service_abc123`)

## 3. Criar o Template
1. Clique em **Email Templates** → **Create New Template**
2. Cole o conteúdo abaixo no campo **Content (HTML)**:

```html
<div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; background: #060913; color: #f3f4f6; padding: 3rem; border: 3px double #d4af37; border-radius: 12px;">

  <div style="text-align:center; margin-bottom: 2rem;">
    <span style="border: 1px solid #d4af37; padding: 0.4rem 1.2rem; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: #d4af37;">
      Colégio FECAP — FECART 2026
    </span>
  </div>

  <h1 style="text-align:center; font-style: italic; font-weight: normal; font-size: 2rem; color: #fff; margin-bottom: 0.5rem;">
    Certificado de Desempenho
  </h1>
  <div style="width: 60px; height: 2px; background: #d4af37; margin: 0 auto 2rem;"></div>

  <p style="text-align:center; line-height: 1.8; color: #9ca3af; font-size: 1rem;">
    Certificamos que <strong style="color:#fff; font-size: 1.1rem;">{{to_name}}</strong> participou do
    Simulador Empresarial <strong style="color: #d4af37;">ESSENZA</strong> na Feira Científica
    <strong style="color:#fff;">FECART 2026</strong>. Ao longo de 3 rodadas comerciais,
    demonstrou habilidades de gestão estratégica, financeira e operacional,
    sendo classificado(a) com o perfil:
  </p>

  <h2 style="text-align:center; color: #d4af37; font-size: 1.8rem; margin: 1.5rem 0;">
    {{profile_name}}
  </h2>
  <p style="text-align:center; color: #9ca3af; font-size: 0.9rem; margin-bottom: 2rem;">
    {{profile_desc}}
  </p>

  <table style="width: 100%; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 1rem 0; margin-bottom: 2rem; text-align: center;">
    <tr>
      <td><span style="font-size:0.65rem; color:#6b7280; display:block; text-transform:uppercase;">Planejamento</span><strong style="color:#fff;">{{avg_planning}}</strong></td>
      <td><span style="font-size:0.65rem; color:#6b7280; display:block; text-transform:uppercase;">Finanças</span><strong style="color:#fff;">{{avg_finance}}</strong></td>
      <td><span style="font-size:0.65rem; color:#6b7280; display:block; text-transform:uppercase;">Pessoas</span><strong style="color:#fff;">{{avg_people}}</strong></td>
      <td><span style="font-size:0.65rem; color:#6b7280; display:block; text-transform:uppercase;">Inovação</span><strong style="color:#fff;">{{avg_innovation}}</strong></td>
    </tr>
  </table>

  <div style="text-align: center; margin-bottom: 2rem;">
    <div style="border-bottom: 1px solid rgba(255,255,255,0.3); width: 260px; margin: 0 auto 0.5rem;"></div>
    <strong style="color: #fff; font-size: 0.9rem;">Profa. Dra. Débora Mendonça M. Machado</strong><br>
    <span style="color: #9ca3af; font-size: 0.8rem;">Coordenadora dos Cursos Técnicos — Colégio FECAP</span><br>
    <span style="color: #6b7280; font-size: 0.75rem;">Ph.D. em Gestão de Projetos, Inovação e Empreendedorismo</span>
  </div>

  <p style="text-align: center; color: #6b7280; font-size: 0.75rem;">São Paulo, {{issue_date}}</p>
</div>
```

3. Configure os campos do template:
   - **To Email**: `{{to_email}}`
   - **Subject**: `Certificado ESSENZA FECART 2026 — {{to_name}}`
4. Anote o **Template ID** (ex: `template_xyz456`)

## 4. Pegar a Public Key
No painel, vá em **Account** → **General** → copie a **Public Key**

## 5. Inserir no código
Abra o arquivo `src/views/FinalReport.tsx` e substitua as linhas:

```ts
const EMAILJS_SERVICE_ID  = 'service_ea25zeo';   // Service ID ativo
const EMAILJS_TEMPLATE_ID = 'template_q6gvfd3';  // Template ID ativo
const EMAILJS_PUBLIC_KEY  = 'nyfgnr8aavqMopwpz';  // Public Key ativa
```

## 6. Testar
Finalize uma simulação e você verá duas opções:
1.  **Enviar Certificado Agora**: Envia o e-mail formatado via EmailJS.
2.  **Baixar Certificado (PDF)**: Gera e baixa um arquivo PDF de alta qualidade do certificado.

## Notas sobre o PDF
A nova funcionalidade de PDF utiliza as bibliotecas `jspdf` e `html2canvas`, que já foram adicionadas às dependências do projeto. O certificado gerado preserva a identidade visual escura e sofisticada do Essenza.
