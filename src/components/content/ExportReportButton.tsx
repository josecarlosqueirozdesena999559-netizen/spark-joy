import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileDown, FileText, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ExportReportButton: React.FC = () => {
  const navigate = useNavigate();

  const handleExport = () => {
    // Navigate to vault where the actual export functionality exists
    navigate('/cofre');
  };

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/20 border-primary/20 shadow-lg">
      <CardContent className="p-5">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-1">Gerar Relatório em PDF</h3>
            <p className="text-sm text-muted-foreground">
              Exporte todas as suas evidências e registros de forma segura
            </p>
          </div>

          <Button 
            onClick={handleExport}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
            size="lg"
          >
            <FileDown className="w-5 h-5" />
            Acessar Cofre para Exportar
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
