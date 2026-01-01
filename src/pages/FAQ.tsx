import { ArrowLeft, HelpCircle, Shield, Lock, Heart, MessageCircle, MapPin, Bell, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const navigate = useNavigate();

  const faqCategories = [
    {
      title: "Sobre o Aplicativo",
      icon: HelpCircle,
      questions: [
        {
          question: "O que é o PorElas?",
          answer: "O PorElas é um aplicativo de apoio e proteção para mulheres em situação de violência doméstica. Oferecemos ferramentas de emergência, mapa de delegacias especializadas, cofre digital seguro para armazenar provas, feed de apoio comunitário e chat com IA especializada."
        },
        {
          question: "O aplicativo é gratuito?",
          answer: "Sim, o PorElas é totalmente gratuito. Todas as funcionalidades estão disponíveis sem nenhum custo, incluindo o cofre digital, mapa de delegacias, botão de emergência e chat com IA."
        },
        {
          question: "Preciso me identificar para usar o app?",
          answer: "Não. Você cria apenas um nome de usuário (apelido) e não precisa fornecer nome real, CPF ou qualquer documento. Seu anonimato é nossa prioridade."
        },
        {
          question: "O app funciona offline?",
          answer: "Algumas funcionalidades básicas funcionam offline, mas para acessar o cofre digital, mapa em tempo real e o feed de apoio, você precisa de conexão com a internet."
        }
      ]
    },
    {
      title: "Privacidade e Segurança",
      icon: Shield,
      questions: [
        {
          question: "Meus dados estão seguros?",
          answer: "Sim. Utilizamos criptografia AES-256 para o cofre digital, comunicações protegidas por TLS 1.3, e todos os dados são armazenados em servidores seguros com Row Level Security (RLS). Nenhum terceiro tem acesso às suas informações."
        },
        {
          question: "Alguém pode ver o que guardo no cofre?",
          answer: "Não. O cofre digital usa criptografia de ponta a ponta (E2E). Somente você, com sua senha pessoal, consegue acessar os arquivos. Nem mesmo nossa equipe técnica consegue visualizar o conteúdo."
        },
        {
          question: "O que acontece se eu perder minha senha do cofre?",
          answer: "Por segurança, não armazenamos sua senha do cofre. Se você esquecê-la, não será possível recuperar os dados criptografados. Recomendamos guardar a senha em local seguro."
        },
        {
          question: "As conversas com a IA são salvas?",
          answer: "As conversas são criptografadas e armazenadas temporariamente apenas para você. Elas são automaticamente excluídas após 24 horas para garantir sua privacidade."
        },
        {
          question: "Como excluo minha conta e todos os dados?",
          answer: "Você pode excluir sua conta a qualquer momento nas configurações do perfil. Todos os seus dados serão permanentemente removidos de nossos servidores, incluindo posts, comentários e arquivos do cofre."
        }
      ]
    },
    {
      title: "Cofre Digital",
      icon: Lock,
      questions: [
        {
          question: "O que posso guardar no cofre?",
          answer: "Você pode armazenar fotos, vídeos, áudios, documentos e anotações de texto. Todos os tipos de provas que possam ser úteis para um eventual processo judicial."
        },
        {
          question: "Existe limite de armazenamento?",
          answer: "Cada arquivo pode ter até 10MB. Recomendamos comprimir vídeos muito grandes antes de enviar para garantir melhor performance."
        },
        {
          question: "Posso gerar um relatório do cofre?",
          answer: "Sim! O cofre possui um botão para gerar um relatório em PDF com todos os itens armazenados, incluindo data e hora de cada registro. Esse relatório pode ser usado como documentação em processos legais."
        },
        {
          question: "Os arquivos do cofre podem ser usados como prova?",
          answer: "Sim. Os arquivos armazenados mantêm metadados como data e hora de criação, e o relatório gerado pode servir como documentação complementar em processos judiciais. Recomendamos consultar um advogado para orientações específicas."
        }
      ]
    },
    {
      title: "Feed e Comunidade",
      icon: Heart,
      questions: [
        {
          question: "O que posso publicar no feed?",
          answer: "O feed é um espaço seguro para compartilhar experiências, buscar apoio e oferecer palavras de encorajamento a outras mulheres. Posts ofensivos, de ódio ou que violem as diretrizes são removidos."
        },
        {
          question: "Outras pessoas podem me identificar?",
          answer: "Não. Você aparece apenas com seu nome de usuário (apelido) e um avatar genérico. Não exibimos localização, foto real ou qualquer informação pessoal."
        },
        {
          question: "Como denuncio um conteúdo inadequado?",
          answer: "Cada post e comentário possui um botão de denúncia (três pontinhos). Ao denunciar, nosso sistema de IA analisa o conteúdo e, se necessário, aplica penalidades ao usuário infrator."
        },
        {
          question: "O que acontece se eu violar as regras?",
          answer: "Dependendo da gravidade, você pode receber advertências temporárias ou ter a conta suspensa. Casos graves de assédio ou ameaças resultam em banimento permanente."
        }
      ]
    },
    {
      title: "Chat com IA",
      icon: MessageCircle,
      questions: [
        {
          question: "A IA pode me dar aconselhamento jurídico?",
          answer: "A IA oferece orientações gerais e informações sobre seus direitos, mas não substitui o aconselhamento de um advogado. Para questões legais específicas, recomendamos buscar assistência jurídica profissional."
        },
        {
          question: "A IA pode me ajudar em uma emergência?",
          answer: "A IA pode fornecer orientações e números de emergência, mas em situações de perigo imediato, use o botão de emergência do app ou ligue diretamente para 190 (Polícia) ou 180 (Central da Mulher)."
        },
        {
          question: "Posso confiar nas informações da IA?",
          answer: "A IA foi treinada com informações sobre violência doméstica, direitos da mulher e recursos de apoio no Brasil. As informações são baseadas em fontes confiáveis, mas sempre recomendamos verificar com profissionais especializados."
        }
      ]
    },
    {
      title: "Mapa e Emergência",
      icon: MapPin,
      questions: [
        {
          question: "O mapa mostra todas as delegacias?",
          answer: "O mapa prioriza Delegacias Especializadas de Atendimento à Mulher (DEAMs), mas também mostra delegacias comuns quando não há DEAMs próximas. Você pode ver a distância e traçar rotas até cada local."
        },
        {
          question: "Como funciona o botão de emergência?",
          answer: "O botão de emergência permite ligar rapidamente para serviços de socorro como 190 (Polícia), 180 (Central da Mulher) e 192 (SAMU). Alguns recursos podem exigir permissão de localização."
        },
        {
          question: "O app rastreia minha localização?",
          answer: "A localização é usada apenas para mostrar delegacias próximas e calcular rotas. Não armazenamos seu histórico de localização e você pode desativar essa permissão a qualquer momento."
        }
      ]
    },
    {
      title: "Notificações",
      icon: Bell,
      questions: [
        {
          question: "Que tipo de notificações recebo?",
          answer: "Você pode receber notificações sobre respostas aos seus posts, apoios recebidos e atualizações importantes do aplicativo. Todas as notificações podem ser configuradas nas permissões do app."
        },
        {
          question: "Como desativo as notificações?",
          answer: "Você pode desativar as notificações nas configurações do seu dispositivo ou nas permissões do aplicativo. Recomendamos manter ativas para não perder informações importantes."
        }
      ]
    },
    {
      title: "Conta e Dados",
      icon: Users,
      questions: [
        {
          question: "Como altero meu nome de usuário?",
          answer: "Atualmente não é possível alterar o nome de usuário após o cadastro. Se necessário, você pode criar uma nova conta com um nome diferente."
        },
        {
          question: "Como altero meu avatar?",
          answer: "Você pode alterar seu avatar a qualquer momento nas configurações do perfil. Oferecemos diversos ícones para você escolher."
        },
        {
          question: "O que são os dados que o app coleta?",
          answer: "Coletamos apenas: email (para login), nome de usuário, avatar escolhido e conteúdos que você cria (posts, comentários, arquivos do cofre). Não coletamos nome real, CPF, endereço ou dados sensíveis."
        },
        {
          question: "Posso exportar meus dados?",
          answer: "O cofre digital permite exportar um relatório em PDF com todos os seus arquivos. Para outros dados, entre em contato conosco através do app."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">
              Perguntas Frequentes
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 pb-24 space-y-6">
        <p className="text-muted-foreground text-sm">
          Encontre respostas para as dúvidas mais comuns sobre o PorElas.
        </p>

        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-3">
            <div className="flex items-center gap-2">
              <category.icon className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">{category.title}</h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-2">
              {category.questions.map((faq, faqIndex) => (
                <AccordionItem
                  key={faqIndex}
                  value={`${categoryIndex}-${faqIndex}`}
                  className="border border-border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        {/* Contact Section */}
        <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
          <h3 className="font-semibold text-foreground mb-2">
            Não encontrou sua dúvida?
          </h3>
          <p className="text-sm text-muted-foreground">
            Se você tem uma pergunta que não está aqui, use o chat com IA do aplicativo 
            ou entre em contato através das nossas redes sociais.
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center pt-4">
          Última atualização: Janeiro de 2026
        </p>
      </main>
    </div>
  );
};

export default FAQ;
