import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText, Database, Key, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const Termos: React.FC = () => {
  const navigate = useNavigate();
  const lastUpdated = '01 de Janeiro de 2025';

  return (
    <div className="min-h-screen bg-secondary/30 safe-area-inset pb-8">
      {/* Header */}
      <header className="gradient-primary py-4 sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary-foreground">Termos e Privacidade</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Intro Card */}
        <Card className="border-primary/20 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">PorElas</h2>
                <p className="text-sm text-muted-foreground">Segurança e Proteção para Mulheres</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Este documento descreve os Termos de Uso, Política de Privacidade e medidas de segurança 
              implementadas no aplicativo PorElas. Última atualização: {lastUpdated}.
            </p>
          </CardContent>
        </Card>

        {/* Terms of Use */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Termos de Uso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-2">1. Aceitação dos Termos</h3>
              <p>
                Ao utilizar o aplicativo PorElas, você concorda com estes Termos de Uso. 
                O aplicativo é destinado exclusivamente para mulheres que buscam apoio, 
                informação e segurança em situações de vulnerabilidade. O uso indevido 
                resultará em suspensão ou banimento permanente da plataforma.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">2. Descrição do Serviço</h3>
              <p>
                O PorElas oferece uma plataforma segura com as seguintes funcionalidades:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>Comunidade de apoio com publicações anônimas</li>
                <li>Chat de suporte com inteligência artificial</li>
                <li>Cofre digital criptografado para armazenamento de documentos e evidências</li>
                <li>Mapa de delegacias e pontos de apoio próximos</li>
                <li>Botão de emergência para situações de risco</li>
                <li>Conteúdo educacional sobre direitos e proteção</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">3. Conduta do Usuário</h3>
              <p>Ao utilizar o PorElas, você concorda em:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>Não compartilhar conteúdo ofensivo, discriminatório ou que promova violência</li>
                <li>Respeitar outras usuárias e suas experiências</li>
                <li>Não utilizar a plataforma para fins comerciais ou spam</li>
                <li>Não tentar burlar medidas de segurança do aplicativo</li>
                <li>Reportar conteúdo inadequado através das ferramentas disponíveis</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">4. Sistema de Moderação</h3>
              <p>
                O PorElas utiliza um sistema automatizado de moderação com inteligência artificial 
                para análise de conteúdo reportado. Violações podem resultar em:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li><strong>Nível 1:</strong> Aviso formal com suspensão temporária de 24 horas</li>
                <li><strong>Nível 2:</strong> Suspensão de 7 dias</li>
                <li><strong>Nível 3:</strong> Banimento permanente da plataforma</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">5. Limitação de Responsabilidade</h3>
              <p>
                O PorElas não substitui serviços de emergência oficiais. Em situações de risco 
                imediato, sempre contate as autoridades competentes (190 - Polícia, 180 - Central 
                da Mulher). O aplicativo é uma ferramenta complementar de apoio e informação.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-primary" />
              Política de Privacidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-2">1. Dados Coletados</h3>
              <p>O PorElas coleta os seguintes dados para funcionamento do serviço:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li><strong>Dados de cadastro:</strong> E-mail, nome de usuário (apelido anônimo) e avatar escolhido</li>
                <li><strong>Dados de uso:</strong> Publicações, comentários e interações na comunidade</li>
                <li><strong>Dados do cofre:</strong> Arquivos e notas armazenados (criptografados)</li>
                <li><strong>Dados de localização:</strong> Apenas quando autorizado, para funcionalidades do mapa</li>
                <li><strong>Dados de chat:</strong> Conversas com IA (criptografadas e auto-deletadas em 24h)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">2. Uso dos Dados</h3>
              <p>Seus dados são utilizados exclusivamente para:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>Prover e melhorar os serviços do aplicativo</li>
                <li>Garantir a segurança da comunidade através de moderação</li>
                <li>Enviar notificações relevantes sobre interações</li>
                <li>Gerar estatísticas anônimas e agregadas</li>
              </ul>
              <p className="mt-2 font-medium text-foreground">
                NÃO vendemos, compartilhamos ou transferimos seus dados pessoais para terceiros 
                para fins comerciais ou de marketing.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">3. Anonimato e Proteção de Identidade</h3>
              <p>
                O PorElas foi projetado para proteger sua identidade. Você é identificada 
                apenas por um nome de usuário de sua escolha e um avatar. Seu e-mail é usado 
                apenas para autenticação e recuperação de conta, nunca sendo exibido publicamente.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">4. Retenção de Dados</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Dados de conta: Mantidos enquanto a conta estiver ativa</li>
                <li>Publicações: Mantidas até exclusão pelo usuário ou moderação</li>
                <li>Mensagens de chat: Automaticamente excluídas após 24 horas</li>
                <li>Dados do cofre: Mantidos até exclusão pelo usuário</li>
                <li>Conta excluída: Dados removidos ou anonimizados em até 30 dias</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">5. Seus Direitos (LGPD)</h3>
              <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incorretos</li>
                <li>Solicitar exclusão de dados (portabilidade)</li>
                <li>Revogar consentimento a qualquer momento</li>
                <li>Solicitar informações sobre compartilhamento de dados</li>
              </ul>
              <p className="mt-2">
                Para exercer seus direitos, acesse as configurações do perfil ou entre em contato 
                através do e-mail: privacidade@porelas.app
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="shadow-md border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="w-5 h-5 text-green-600" />
              Segurança e Criptografia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200 font-medium">
                Sua segurança é nossa prioridade máxima. O PorElas implementa múltiplas camadas 
                de proteção para garantir que seus dados estejam sempre seguros.
              </p>
            </div>

            <section>
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Criptografia de Dados
              </h3>
              <ul className="space-y-2 ml-2">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-xs bg-secondary px-2 py-1 rounded">AES-256</span>
                  <span>Criptografia simétrica de nível militar para dados do cofre digital</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-xs bg-secondary px-2 py-1 rounded">TLS 1.3</span>
                  <span>Todas as comunicações são criptografadas em trânsito</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-xs bg-secondary px-2 py-1 rounded">HTTPS</span>
                  <span>Conexões seguras com certificados SSL válidos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-xs bg-secondary px-2 py-1 rounded">bcrypt</span>
                  <span>Senhas armazenadas com hash criptográfico irreversível</span>
                </li>
              </ul>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Segurança do Banco de Dados
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Row Level Security (RLS) - Cada usuário acessa apenas seus próprios dados</li>
                <li>Políticas de acesso granulares por tabela e operação</li>
                <li>Backups automáticos diários com retenção de 30 dias</li>
                <li>Isolamento de dados por usuário em nível de banco de dados</li>
                <li>Auditoria de acessos e modificações</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Server className="w-4 h-4" />
                Infraestrutura
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Servidores em data centers com certificação SOC 2 Type II</li>
                <li>Infraestrutura Supabase com conformidade GDPR e HIPAA</li>
                <li>Edge Functions para processamento seguro de dados sensíveis</li>
                <li>Monitoramento 24/7 com alertas de segurança</li>
                <li>Proteção contra DDoS e ataques de força bruta</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-foreground mb-2">Cofre Digital - Proteção Especial</h3>
              <p>
                O Cofre Digital utiliza criptografia de ponta-a-ponta (E2E). Isso significa que:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>Seus arquivos são criptografados antes de sair do seu dispositivo</li>
                <li>A chave de criptografia é derivada da sua senha pessoal do cofre</li>
                <li>Nem mesmo os administradores do PorElas podem acessar seus arquivos</li>
                <li>Cada arquivo tem uma chave única de criptografia</li>
                <li>Metadados também são criptografados</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-foreground mb-2">Chat com IA - Privacidade Reforçada</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Mensagens criptografadas com AES-256 antes do armazenamento</li>
                <li>Auto-exclusão automática após 24 horas</li>
                <li>Processamento via API segura com chaves gerenciadas</li>
                <li>Nenhum histórico é usado para treinar modelos de IA</li>
                <li>Conversas não são associadas a dados de identificação pessoal</li>
              </ul>
            </section>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Contato e Suporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Para dúvidas, sugestões ou exercer seus direitos de privacidade:
            </p>
            <div className="space-y-2">
              <p><strong>E-mail:</strong> contato@porelas.app</p>
              <p><strong>Privacidade:</strong> privacidade@porelas.app</p>
              <p><strong>Suporte:</strong> suporte@porelas.app</p>
            </div>
            <Separator />
            <p className="text-xs">
              PorElas - Aplicativo de Segurança e Apoio para Mulheres<br />
              Versão 1.0.0 | © 2025 Todos os direitos reservados
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4">
          <Button
            variant="outline"
            onClick={() => navigate('/perfil')}
            className="rounded-full"
          >
            Voltar ao Perfil
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Termos;
