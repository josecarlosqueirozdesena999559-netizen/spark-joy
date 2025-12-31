import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FileText, Shield } from 'lucide-react';

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ checked, onCheckedChange }) => {
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-xl border border-border">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
          className="mt-0.5"
        />
        <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
          Li e aceito os{' '}
          <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
            <DialogTrigger asChild>
              <button type="button" className="text-primary font-medium hover:underline">
                Termos de Uso
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Termos de Uso
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Bem-vinda ao PorElas. Ao utilizar nosso aplicativo, você concorda com os seguintes termos:
                  </p>
                  <h4 className="font-semibold text-foreground">1. Objetivo do Aplicativo</h4>
                  <p>
                    O PorElas é uma plataforma dedicada ao combate ao feminicídio, oferecendo recursos de apoio, informação e proteção para mulheres em situação de vulnerabilidade.
                  </p>
                  <h4 className="font-semibold text-foreground">2. Uso Responsável</h4>
                  <p>
                    Você se compromete a utilizar o aplicativo de forma responsável, respeitando outras usuárias e as diretrizes da comunidade.
                  </p>
                  <h4 className="font-semibold text-foreground">3. Privacidade e Anonimato</h4>
                  <p>
                    Valorizamos sua privacidade. Por isso, não permitimos upload de fotos pessoais, garantindo o anonimato de todas as usuárias.
                  </p>
                  <h4 className="font-semibold text-foreground">4. Exclusão de Conta (LGPD)</h4>
                  <p>
                    Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você pode solicitar a exclusão de sua conta a qualquer momento. Seus dados serão arquivados por período determinado para fins de auditoria jurídica, conforme exigido por lei.
                  </p>
                </div>
              </ScrollArea>
              <Button onClick={() => setTermsOpen(false)} className="w-full rounded-full">
                Entendi
              </Button>
            </DialogContent>
          </Dialog>
          {' '}e a{' '}
          <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
            <DialogTrigger asChild>
              <button type="button" className="text-primary font-medium hover:underline">
                Política de Privacidade
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Política de Privacidade
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Sua privacidade é nossa prioridade. Esta política descreve como coletamos e protegemos seus dados.
                  </p>
                  <h4 className="font-semibold text-foreground">1. Dados Coletados</h4>
                  <p>
                    Coletamos apenas informações essenciais: e-mail, nome de usuário e avatar selecionado. Não armazenamos fotos pessoais.
                  </p>
                  <h4 className="font-semibold text-foreground">2. Uso dos Dados</h4>
                  <p>
                    Seus dados são utilizados exclusivamente para funcionamento do aplicativo e melhoria dos serviços oferecidos.
                  </p>
                  <h4 className="font-semibold text-foreground">3. Proteção</h4>
                  <p>
                    Utilizamos criptografia e medidas de segurança avançadas para proteger suas informações.
                  </p>
                  <h4 className="font-semibold text-foreground">4. Retenção de Dados (LGPD)</h4>
                  <p>
                    Ao excluir sua conta, seus dados são mantidos em arquivo seguro por período determinado para fins de auditoria jurídica, conforme exigido pela legislação brasileira. Após esse período, são definitivamente removidos.
                  </p>
                  <h4 className="font-semibold text-foreground">5. Seus Direitos</h4>
                  <p>
                    Você tem direito a acessar, corrigir ou solicitar a exclusão de seus dados pessoais a qualquer momento.
                  </p>
                </div>
              </ScrollArea>
              <Button onClick={() => setPrivacyOpen(false)} className="w-full rounded-full">
                Entendi
              </Button>
            </DialogContent>
          </Dialog>
        </label>
      </div>
    </div>
  );
};