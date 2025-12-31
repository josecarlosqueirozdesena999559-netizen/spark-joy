import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, FileText, Shield, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VaultToolsCard: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: Lock,
      title: 'Cofre Seguro',
      description: 'Armazene documentos e provas de forma criptografada',
      action: () => navigate('/cofre'),
    },
    {
      icon: FileText,
      title: 'Relatórios',
      description: 'Gere relatórios das suas evidências salvas',
      action: () => navigate('/cofre'),
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-accent/40 to-muted/30 border-primary/10 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Shield className="w-5 h-5 text-primary" />
          Ferramentas de Proteção
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tools.map((tool, idx) => (
          <button
            key={idx}
            onClick={tool.action}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-accent/50 border border-border hover:border-primary/30 transition-all group"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <tool.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-medium text-foreground">{tool.title}</h4>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
};
