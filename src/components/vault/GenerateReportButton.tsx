import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { VaultItem } from '@/hooks/useVault';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { decryptFile } from '@/lib/encryption';

interface GenerateReportButtonProps {
  items: VaultItem[];
  decryptContent: (content: string) => string | null;
  password: string;
}

export const GenerateReportButton = ({ items, decryptContent, password }: GenerateReportButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Helper function to load decrypted image from storage as base64
  const loadEncryptedImageAsBase64 = async (filePath: string): Promise<string | null> => {
    try {
      // Download the encrypted file from storage
      const { data, error } = await supabase.storage
        .from('vault-files')
        .download(filePath);

      if (error || !data) {
        console.error('Error downloading file:', error);
        return null;
      }

      // Read the encrypted content as text
      const encryptedContent = await data.text();
      
      // Decrypt the file
      const decryptedBlob = decryptFile(encryptedContent, password, 'image/jpeg');
      if (!decryptedBlob) {
        console.error('Error decrypting file');
        return null;
      }

      // Convert blob to base64 using FileReader
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(decryptedBlob);
      });
    } catch (e) {
      console.error('Error loading encrypted image:', e);
      return null;
    }
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
      description: 'Carregando e descriptografando arquivos.',
    });

    try {
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

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

      // === FIRST PAGE: Cover / Summary ===
      addHeader();
      
      let yPosition = 40;

      // Title
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Relatório de Evidências', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      doc.text('Documentadas', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Subtitle
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      doc.text('Este documento contém informações sensíveis e confidenciais', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 25;

      // Summary box
      doc.setFillColor(252, 231, 243); // Light pink background
      doc.setDrawColor(236, 72, 153);
      doc.setLineWidth(1);
      doc.roundedRect(30, yPosition, pageWidth - 60, 35, 5, 5, 'FD');
      
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total de evidências documentadas: ${items.length}`, pageWidth / 2, yPosition + 14, { align: 'center' });
      
      const photoCount = items.filter(i => i.item_type === 'photo').length;
      const videoCount = items.filter(i => i.item_type === 'video').length;
      const textCount = items.filter(i => i.item_type === 'text').length;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`${photoCount} foto(s) | ${videoCount} vídeo(s) | ${textCount} registro(s) de texto`, pageWidth / 2, yPosition + 25, { align: 'center' });
      yPosition += 50;

      // Index / Table of contents
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Índice de Evidências', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const typeLabel = item.item_type === 'photo' ? 'Fotografia' : item.item_type === 'video' ? 'Vídeo' : 'Registro de Texto';
        const dateStr = format(new Date(item.created_at), "dd/MM/yyyy", { locale: ptBR });
        
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          addHeader();
          yPosition = 30;
        }
        
        doc.setTextColor(80, 80, 80);
        doc.text(`${i + 1}. ${typeLabel} - ${dateStr}`, 25, yPosition);
        doc.text(`Página ${i + 2}`, pageWidth - 30, yPosition, { align: 'right' });
        yPosition += 8;
      }

      // === EVIDENCE PAGES: One page per item ===
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        
        // New page for each evidence
        doc.addPage();
        addHeader();
        yPosition = 35;

        // Evidence header
        const typeLabel = item.item_type === 'photo' ? 'Fotografia' : item.item_type === 'video' ? 'Vídeo' : 'Registro de Texto';
        
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(20, yPosition - 5, pageWidth - 40, 15, 3, 3, 'FD');
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`Evidência ${index + 1}: ${typeLabel}`, pageWidth / 2, yPosition + 5, { align: 'center' });
        yPosition += 20;

        // Metadata
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`Data de registro: ${format(new Date(item.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, 20, yPosition);
        yPosition += 8;

        // File info
        if (item.file_name) {
          const decryptedName = decryptContent(item.file_name);
          if (decryptedName) {
            doc.text(`Arquivo: ${decryptedName}`, 20, yPosition);
            yPosition += 6;
            
            if (item.file_size) {
              const sizeKB = Math.round(item.file_size / 1024);
              doc.text(`Tamanho: ${sizeKB} KB`, 20, yPosition);
              yPosition += 6;
            }
          }
        }

        // Notes
        if (item.notes) {
          const decryptedNotes = decryptContent(item.notes);
          if (decryptedNotes) {
            doc.setFont('helvetica', 'italic');
            doc.text(`Observações: ${decryptedNotes}`, 20, yPosition);
            doc.setFont('helvetica', 'normal');
            yPosition += 6;
          }
        }

        yPosition += 10;

        // Content based on type
        if (item.item_type === 'text' && item.encrypted_content) {
          const decrypted = decryptContent(item.encrypted_content);
          if (decrypted) {
            doc.setFillColor(250, 250, 250);
            doc.setDrawColor(220, 220, 220);
            
            const lines = doc.splitTextToSize(decrypted, pageWidth - 50);
            const textHeight = Math.min(lines.length * 6 + 15, pageHeight - yPosition - 40);
            
            doc.roundedRect(20, yPosition, pageWidth - 40, textHeight, 3, 3, 'FD');
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            let textY = yPosition + 10;
            for (const line of lines) {
              if (textY > pageHeight - 40) break;
              doc.text(line, 25, textY);
              textY += 6;
            }
          }
        }

        // Photo - Load and display decrypted image
        if (item.item_type === 'photo' && item.encrypted_file_path) {
          const decryptedPath = decryptContent(item.encrypted_file_path);
          
          if (decryptedPath) {
            const base64Image = await loadEncryptedImageAsBase64(decryptedPath);
            
            if (base64Image) {
              // Calculate image dimensions to fit page
              const maxImgWidth = pageWidth - 40;
              const maxImgHeight = pageHeight - yPosition - 50;
              
              // Use a reasonable size that fits well
              const imgWidth = Math.min(maxImgWidth, 160);
              const imgHeight = Math.min(maxImgHeight, 120);
              
              // Center the image
              const imgX = (pageWidth - imgWidth) / 2;
              
              // Add border around image
              doc.setDrawColor(200, 200, 200);
              doc.setLineWidth(1);
              doc.roundedRect(imgX - 2, yPosition - 2, imgWidth + 4, imgHeight + 4, 3, 3, 'S');
              
              // Add the image
              try {
                doc.addImage(base64Image, 'JPEG', imgX, yPosition, imgWidth, imgHeight);
              } catch (imgError) {
                console.error('Error adding image to PDF:', imgError);
                // Fallback placeholder
                doc.setFillColor(245, 245, 245);
                doc.roundedRect(imgX, yPosition, imgWidth, imgHeight, 3, 3, 'F');
                doc.setFontSize(10);
                doc.setTextColor(120, 120, 120);
                doc.text('[Erro ao carregar imagem]', pageWidth / 2, yPosition + imgHeight / 2, { align: 'center' });
              }
            } else {
              // Placeholder if image couldn't be loaded
              const imgWidth = 160;
              const imgHeight = 100;
              const imgX = (pageWidth - imgWidth) / 2;
              
              doc.setFillColor(245, 245, 245);
              doc.roundedRect(imgX, yPosition, imgWidth, imgHeight, 3, 3, 'F');
              doc.setFontSize(10);
              doc.setTextColor(120, 120, 120);
              doc.text('[Imagem protegida - consultar cofre digital]', pageWidth / 2, yPosition + 50, { align: 'center' });
            }
          }
        }

        // Video - Placeholder with download note
        if (item.item_type === 'video') {
          const imgWidth = 160;
          const imgHeight = 100;
          const imgX = (pageWidth - imgWidth) / 2;
          
          doc.setFillColor(240, 240, 250);
          doc.setDrawColor(200, 200, 220);
          doc.roundedRect(imgX, yPosition, imgWidth, imgHeight, 5, 5, 'FD');
          
          // Video icon placeholder
          doc.setFontSize(40);
          doc.setTextColor(180, 180, 200);
          doc.text('▶', pageWidth / 2, yPosition + 45, { align: 'center' });
          
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 120);
          doc.text('[Vídeo anexado]', pageWidth / 2, yPosition + 65, { align: 'center' });
          
          const decryptedName = item.file_name ? decryptContent(item.file_name) : null;
          if (decryptedName) {
            doc.setFontSize(9);
            doc.text(decryptedName, pageWidth / 2, yPosition + 75, { align: 'center' });
          }
          
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 140);
          doc.text('Disponível para download no cofre digital', pageWidth / 2, yPosition + 90, { align: 'center' });
        }
      }

      // === LAST PAGE: Disclaimer ===
      doc.addPage();
      addHeader();
      yPosition = 50;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Aviso Legal', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      doc.setFillColor(254, 243, 199); // Warning yellow
      doc.roundedRect(25, yPosition, pageWidth - 50, 60, 5, 5, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 60, 0);
      
      const disclaimer = 'Este relatório foi gerado automaticamente pelo aplicativo PorElas e contém evidências documentadas pela usuária. As informações aqui contidas são confidenciais e destinam-se exclusivamente para fins de documentação e eventual apresentação a autoridades competentes. A autenticidade das evidências pode ser verificada através do aplicativo com a senha do cofre.';
      const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 60);
      let disclaimerY = yPosition + 12;
      disclaimerLines.forEach((line: string) => {
        doc.text(line, 30, disclaimerY);
        disclaimerY += 7;
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
