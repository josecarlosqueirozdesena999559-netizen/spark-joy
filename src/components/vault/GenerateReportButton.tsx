import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { VaultItem } from '@/hooks/useVault';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface GenerateReportButtonProps {
  items: VaultItem[];
  decryptContent: (content: string) => string | null;
}

export const GenerateReportButton = ({ items, decryptContent }: GenerateReportButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Helper function to load image as base64
  const loadImageAsBase64 = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxWidth = 300;
          const maxHeight = 200;
          let width = img.width;
          let height = img.height;
          
          // Scale down if needed
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const generateReport = async () => {
    if (items.length === 0) {
      toast({
        title: 'Cofre vazio',
        description: 'Adicione evidências antes de gerar o relatório.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    toast({
      title: 'Gerando relatório...',
      description: 'Carregando imagens e preparando o documento.',
    });
    try {
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentPage = 1;

      // Helper function to add header to each page
      const addHeader = () => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(236, 72, 153); // Primary pink color
        doc.text('PorElas - Relatório Confidencial de Evidências', 20, 15);
        doc.setDrawColor(236, 72, 153);
        doc.setLineWidth(0.5);
        doc.line(20, 18, pageWidth - 20, 18);
      };

      // Helper function to add footer to each page
      const addFooter = (pageNum: number, totalPages: number) => {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${pageNum} de ${totalPages} | Documento confidencial - Uso restrito`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      };

      // Add first page header
      addHeader();
      
      let yPosition = 30;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Relatório de Evidências Documentadas', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Subtitle
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      doc.text('Este documento contém informações sensíveis e confidenciais', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Summary box
      doc.setFillColor(252, 231, 243); // Light pink background
      doc.setDrawColor(236, 72, 153);
      doc.roundedRect(20, yPosition, pageWidth - 40, 20, 3, 3, 'FD');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total de evidências documentadas: ${items.length}`, pageWidth / 2, yPosition + 8, { align: 'center' });
      
      const photoCount = items.filter(i => i.item_type === 'photo').length;
      const videoCount = items.filter(i => i.item_type === 'video').length;
      const textCount = items.filter(i => i.item_type === 'text').length;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`${photoCount} foto(s) | ${videoCount} vídeo(s) | ${textCount} registro(s) de texto`, pageWidth / 2, yPosition + 15, { align: 'center' });
      yPosition += 30;

      // Process each item
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          currentPage++;
          addHeader();
          yPosition = 30;
        }

        // Item container
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        
        // Item header with number
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(20, yPosition, pageWidth - 40, 10, 2, 2, 'F');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const typeLabel = item.item_type === 'photo' ? 'Fotografia' : item.item_type === 'video' ? 'Vídeo' : 'Registro de Texto';
        doc.text(`Evidência ${index + 1}: ${typeLabel}`, 25, yPosition + 7);
        yPosition += 15;

        // Date
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Data de registro: ${format(new Date(item.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, 25, yPosition);
        yPosition += 8;
        doc.setTextColor(0, 0, 0);

        // Content
        if (item.encrypted_content) {
          const decrypted = decryptContent(item.encrypted_content);
          if (decrypted) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Conteúdo:', 25, yPosition);
            yPosition += 5;
            
            const lines = doc.splitTextToSize(decrypted, pageWidth - 50);
            for (const line of lines) {
              if (yPosition > pageHeight - 40) {
                doc.addPage();
                currentPage++;
                addHeader();
                yPosition = 30;
              }
              doc.text(line, 25, yPosition);
              yPosition += 5;
            }
            yPosition += 3;
          }
        }

        // File info with image embedding
        if (item.file_name && item.encrypted_file_path) {
          const decryptedName = decryptContent(item.file_name);
          const decryptedPath = decryptContent(item.encrypted_file_path);
          
          if (decryptedName) {
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            doc.text(`Arquivo: ${decryptedName}`, 25, yPosition);
            yPosition += 5;
            
            if (item.file_size) {
              const sizeKB = Math.round(item.file_size / 1024);
              doc.text(`Tamanho: ${sizeKB} KB`, 25, yPosition);
              yPosition += 5;
            }
          }

          // Embed image if it's a photo
          if (item.item_type === 'photo' && decryptedPath) {
            try {
              const { data } = supabase.storage.from('vault-files').getPublicUrl(decryptedPath);
              if (data?.publicUrl) {
                const base64Image = await loadImageAsBase64(data.publicUrl);
                
                if (base64Image) {
                  // Check if we need a new page for the image
                  if (yPosition > pageHeight - 80) {
                    doc.addPage();
                    currentPage++;
                    addHeader();
                    yPosition = 30;
                  }
                  
                  // Add image border
                  doc.setDrawColor(200, 200, 200);
                  doc.setLineWidth(0.5);
                  doc.roundedRect(24, yPosition - 1, 82, 52, 2, 2, 'S');
                  
                  // Add the actual image
                  doc.addImage(base64Image, 'JPEG', 25, yPosition, 80, 50);
                  yPosition += 55;
                } else {
                  // Fallback placeholder if image couldn't be loaded
                  doc.setFillColor(245, 245, 245);
                  doc.roundedRect(25, yPosition, 80, 30, 2, 2, 'F');
                  doc.setFontSize(8);
                  doc.setTextColor(120, 120, 120);
                  doc.text('[Imagem protegida - consultar cofre digital]', 65, yPosition + 15, { align: 'center' });
                  yPosition += 35;
                }
              }
            } catch (e) {
              // Fallback placeholder on error
              doc.setFillColor(245, 245, 245);
              doc.roundedRect(25, yPosition, 80, 30, 2, 2, 'F');
              doc.setFontSize(8);
              doc.setTextColor(120, 120, 120);
              doc.text('[Imagem protegida - consultar cofre digital]', 65, yPosition + 15, { align: 'center' });
              yPosition += 35;
            }
          }
          
          // Video placeholder
          if (item.item_type === 'video' && decryptedPath) {
            doc.setFillColor(240, 240, 250);
            doc.roundedRect(25, yPosition, 80, 30, 2, 2, 'F');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 120);
            doc.text('[Vídeo anexado - consultar cofre digital]', 65, yPosition + 12, { align: 'center' });
            doc.text(decryptedName || 'Arquivo de vídeo', 65, yPosition + 20, { align: 'center' });
            yPosition += 35;
          }
        }

        // Notes
        if (item.notes) {
          const decryptedNotes = decryptContent(item.notes);
          if (decryptedNotes) {
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            doc.setFont('helvetica', 'italic');
            doc.text(`Observações: ${decryptedNotes}`, 25, yPosition);
            yPosition += 5;
            doc.setFont('helvetica', 'normal');
          }
        }

        // Separator
        doc.setDrawColor(230, 230, 230);
        doc.line(20, yPosition + 3, pageWidth - 20, yPosition + 3);
        yPosition += 12;
      }

      // Add disclaimer at the end
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        currentPage++;
        addHeader();
        yPosition = 30;
      }
      
      yPosition += 10;
      doc.setFillColor(254, 243, 199); // Warning yellow
      doc.roundedRect(20, yPosition, pageWidth - 40, 25, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Aviso Legal', 25, yPosition + 7);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const disclaimer = 'Este relatório foi gerado automaticamente pelo aplicativo PorElas e contém evidências documentadas pela usuária. As informações aqui contidas são confidenciais e destinam-se exclusivamente para fins de documentação e eventual apresentação a autoridades competentes.';
      const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 50);
      let disclaimerY = yPosition + 12;
      disclaimerLines.forEach((line: string) => {
        doc.text(line, 25, disclaimerY);
        disclaimerY += 4;
      });

      // Add footers to all pages
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(i, totalPages);
      }

      // Save the PDF
      doc.save(`porelas-relatorio-evidencias-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);

      toast({
        title: 'Relatório gerado com sucesso',
        description: 'O documento PDF foi salvo no seu dispositivo.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: 'Não foi possível gerar o documento. Tente novamente.',
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
      Gerar Relatório
    </Button>
  );
};
