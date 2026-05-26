import type { Metadata } from "next";

import { companyProfile } from "@/lib/company";

export const metadata: Metadata = {
  title: "Política de Privacidade | Prismarq",
  description:
    "Política de privacidade e proteção de dados da Prismarq Comunicação Visual conforme a LGPD (Lei nº 13.709/2018).",
};

const LAST_UPDATE = "4 de maio de 2025";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-white sm:text-lg">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-white/72 sm:text-[0.9375rem]">{children}</div>
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/60" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

export default function PoliticaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10 sm:space-y-8">
      <section className="rounded-[20px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_48px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:rounded-[24px] sm:p-8">
        <p className="label-kicker text-[0.64rem]">Legal</p>
        <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
          Política de Privacidade
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
          {companyProfile.legalName} — Última atualização: {LAST_UPDATE}
        </p>
        <p className="mt-4 text-sm leading-7 text-white/72 sm:text-[0.9375rem]">
          Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais em
          conformidade com a{" "}
          <strong className="font-semibold text-white/90">Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
          Ao utilizar nosso site ou contratar nossos serviços, você concorda com os termos desta política.
        </p>
      </section>

      <div className="space-y-5 rounded-[20px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:space-y-6 sm:rounded-[24px] sm:p-8">
        <Section title="1. Quem somos">
          <p>
            Somos a <strong className="font-semibold text-white/90">{companyProfile.legalName}</strong>, empresa de
            comunicação visual com sede em {companyProfile.addressLine}, {companyProfile.cityState}, CEP{" "}
            {companyProfile.postalCode}. Operamos o site de pedidos online de gráfica com produção própria e atendimento
            direto.
          </p>
        </Section>

        <div className="border-t border-white/8" />

        <Section title="2. Dados que coletamos">
          <p>Coletamos apenas os dados necessários para prestar o serviço contratado:</p>
          <ul className="mt-2 space-y-2">
            <Li>
              <strong className="font-semibold text-white/85">Dados de cadastro:</strong> nome, e-mail e senha (hash
              irreversível).
            </Li>
            <Li>
              <strong className="font-semibold text-white/85">Dados do pedido:</strong> especificações do produto
              (tamanho, material, quantidade), arquivos de arte enviados e anotações de produção.
            </Li>
            <Li>
              <strong className="font-semibold text-white/85">Dados de pagamento:</strong> geração de QR Code PIX via
              provedor externo — não armazenamos dados de cartão.
            </Li>
            <Li>
              <strong className="font-semibold text-white/85">Dados de uso:</strong> logs de acesso (IP, user-agent,
              data/hora) para segurança e diagnóstico.
            </Li>
          </ul>
        </Section>

        <div className="border-t border-white/8" />

        <Section title="3. Como usamos seus dados">
          <ul className="space-y-2">
            <Li>Processamento e acompanhamento do pedido online.</Li>
            <Li>Comunicação sobre o status da produção e entrega.</Li>
            <Li>Envio de confirmações e notas fiscais por e-mail.</Li>
            <Li>Melhoria da plataforma com base em métricas de uso agregadas e anônimas.</Li>
            <Li>Cumprimento de obrigações legais e fiscais.</Li>
          </ul>
          <p className="mt-2">
            <strong className="font-semibold text-white/85">Não vendemos nem compartilhamos seus dados</strong> com
            terceiros para fins comerciais ou publicitários.
          </p>
        </Section>

        <div className="border-t border-white/8" />

        <Section title="4. Base legal (LGPD)">
          <p>O tratamento dos seus dados se baseia nas seguintes hipóteses legais:</p>
          <ul className="mt-2 space-y-2">
            <Li>
              <strong className="font-semibold text-white/85">Execução de contrato</strong> — para processar pedidos e
              prestar o serviço contratado (art. 7º, V).
            </Li>
            <Li>
              <strong className="font-semibold text-white/85">Obrigação legal</strong> — para cumprimento de
              obrigações fiscais e contábeis (art. 7º, II).
            </Li>
            <Li>
              <strong className="font-semibold text-white/85">Legítimo interesse</strong> — para segurança da
              plataforma e prevenção de fraudes (art. 7º, IX).
            </Li>
          </ul>
        </Section>

        <div className="border-t border-white/8" />

        <Section title="5. Armazenamento e segurança">
          <p>
            Os dados são armazenados em servidores com criptografia em trânsito (TLS/HTTPS) e em repouso. Senhas são
            armazenadas exclusivamente como hash bcrypt. Arquivos de arte enviados são mantidos pelo período necessário
            à produção e entrega.
          </p>
          <p>
            Adotamos práticas de segurança compatíveis com o estado da técnica. Em caso de incidente de segurança que
            afete seus dados, você será notificado conforme determina a LGPD.
          </p>
        </Section>

        <div className="border-t border-white/8" />

        <Section title="6. Retenção de dados">
          <ul className="space-y-2">
            <Li>
              Dados de cadastro e pedidos: mantidos pelo período necessário ao cumprimento de obrigações legais e
              fiscais (mínimo 5 anos conforme legislação tributária).
            </Li>
            <Li>
              Arquivos de arte: excluídos após a conclusão da produção, salvo solicitação de reimpressão em aberto.
            </Li>
            <Li>
              Logs de acesso: mantidos por até 6 meses para fins de segurança.
            </Li>
          </ul>
        </Section>

        <div className="border-t border-white/8" />

        <Section title="7. Compartilhamento com terceiros">
          <p>Seus dados podem ser compartilhados apenas com:</p>
          <ul className="mt-2 space-y-2">
            <Li>
              <strong className="font-semibold text-white/85">Provedor de pagamento PIX</strong> — para geração do QR
              Code e confirmação do pagamento.
            </Li>
            <Li>
              <strong className="font-semibold text-white/85">Transportadoras</strong> — nome e endereço de entrega,
              quando aplicável.
            </Li>
            <Li>
              <strong className="font-semibold text-white/85">Autoridades públicas</strong> — quando exigido por lei
              ou ordem judicial.
            </Li>
          </ul>
        </Section>

        <div className="border-t border-white/8" />

        <Section title="8. Seus direitos (LGPD, art. 18)">
          <p>Você tem os seguintes direitos sobre seus dados pessoais:</p>
          <ul className="mt-2 space-y-2">
            <Li>Confirmação da existência e acesso aos seus dados.</Li>
            <Li>Correção de dados incompletos, inexatos ou desatualizados.</Li>
            <Li>Anonimização, bloqueio ou eliminação de dados desnecessários.</Li>
            <Li>Portabilidade dos dados para outro fornecedor de serviço.</Li>
            <Li>Eliminação dos dados tratados com base no consentimento.</Li>
            <Li>Informação sobre entidades públicas e privadas com as quais compartilhamos seus dados.</Li>
            <Li>Revogação do consentimento a qualquer momento.</Li>
          </ul>
          <p className="mt-3">
            Para exercer seus direitos, envie solicitação para{" "}
            <a
              href={`mailto:${companyProfile.email}`}
              className="font-semibold text-cyan-300 underline-offset-2 hover:underline"
            >
              {companyProfile.email}
            </a>{" "}
            com o assunto &ldquo;LGPD — [seu nome]&rdquo;. Respondemos em até 15 dias úteis.
          </p>
        </Section>

        <div className="border-t border-white/8" />

        <Section title="9. Cookies e tecnologias de rastreamento">
          <p>
            Utilizamos cookies estritamente necessários para o funcionamento do site (autenticação de sessão e
            preferências do carrinho). Não utilizamos cookies de rastreamento publicitário de terceiros.
          </p>
          <p>
            Você pode gerenciar ou desativar cookies nas configurações do seu navegador. A desativação de cookies
            funcionais pode afetar partes do serviço.
          </p>
        </Section>

        <div className="border-t border-white/8" />

        <Section title="10. Alterações nesta política">
          <p>
            Podemos atualizar esta política periodicamente. Alterações relevantes serão comunicadas por e-mail ou por
            aviso no site. A data da última atualização está indicada no início do documento.
          </p>
          <p>
            O uso continuado do serviço após as alterações constitui concordância com a versão atualizada da política.
          </p>
        </Section>

        <div className="border-t border-white/8" />

        <Section title="11. Contato e encarregado de dados (DPO)">
          <p>
            Para dúvidas, solicitações ou reclamações relacionadas ao tratamento dos seus dados pessoais, entre em
            contato:
          </p>
          <div className="mt-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-4 text-sm sm:p-5">
            <p className="font-semibold text-white/90">{companyProfile.legalName}</p>
            <p className="mt-1 text-white/65">
              {companyProfile.addressLine} — {companyProfile.cityState}
            </p>
            <p className="mt-1 text-white/65">CEP {companyProfile.postalCode}</p>
            <a
              href={`mailto:${companyProfile.email}`}
              className="mt-2 block font-medium text-cyan-300 hover:underline"
            >
              {companyProfile.email}
            </a>
            <p className="mt-1 text-white/65">{companyProfile.phoneDisplay}</p>
          </div>
          <p className="mt-3">
            Caso não obtenha resposta satisfatória, você pode apresentar reclamação à{" "}
            <strong className="font-semibold text-white/85">
              Autoridade Nacional de Proteção de Dados (ANPD)
            </strong>{" "}
            pelo site{" "}
            <span className="font-medium text-white/75">gov.br/anpd</span>.
          </p>
        </Section>
      </div>
    </div>
  );
}
