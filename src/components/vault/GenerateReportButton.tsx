import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { VaultItem } from '@/hooks/useVault';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GenerateReportButtonProps {
  items: VaultItem[];
  decryptContent: (content: string) => string | null;
}

export const GenerateReportButton = ({ items, decryptContent }: GenerateReportButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateReport = async () => {
    if (items.length === 0) {
      toast({
        title: 'Cofre vazio',
        description: 'Adicione evidências antes de gerar o relatório',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      // Dynamic import of jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Evidências', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Subtitle
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(`Gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text('Este documento contém informações confidenciais', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Items
      items.forEach((item, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Item header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const typeLabel = item.item_type === 'photo' ? 'Foto' : item.item_type === 'video' ? 'Vídeo' : 'Mensagem';
        doc.text(`${index + 1}. ${typeLabel}`, 20, yPosition);
        yPosition += 6;

        // Date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);
        doc.text(`Data: ${format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, yPosition);
        yPosition += 6;
        doc.setTextColor(0, 0, 0);

        // Content
        if (item.encrypted_content) {
          const decrypted = decryptContent(item.encrypted_content);
          if (decrypted) {
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(decrypted, pageWidth - 40);
            lines.forEach((line: string) => {
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
              }
              doc.text(line, 20, yPosition);
              yPosition += 5;
            });
          }
        }

        // File info
        if (item.file_name) {
          const decryptedName = decryptContent(item.file_name);
          if (decryptedName) {
            doc.text(`Arquivo: ${decryptedName}`, 20, yPosition);
            yPosition += 5;
          }
        }

        // Notes
        if (item.notes) {
          const decryptedNotes = decryptContent(item.notes);
          if (decryptedNotes) {
            doc.setTextColor(100, 100, 100);
            doc.text(`Observações: ${decryptedNotes}`, 20, yPosition);
            yPosition += 5;
            doc.setTextColor(0, 0, 0);
          }
        }

        yPosition += 10;
      });

      // Footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${totalPages} | Documento confidencial`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`relatorio-evidencias-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);

      toast({
        title: 'Relatório gerado!',
        description: 'O PDF foi salvo no seu dispositivo',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o relatório',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={generateReport} 
      disabled={loading || items.length === 0}
      variant="outline"
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      Gerar Relatório PDF
    </Button>
  );
};
