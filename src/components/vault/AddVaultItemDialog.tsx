import { useState, useRef } from 'react';
import { Camera, FileText, Video, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AddVaultItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddText: (content: string, notes?: string) => Promise<void>;
  onAddFile: (file: File, type: 'photo' | 'video', notes?: string) => Promise<void>;
}

export const AddVaultItemDialog = ({
  open,
  onOpenChange,
  onAddText,
  onAddFile,
}: AddVaultItemDialogProps) => {
  const [textContent, setTextContent] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmitText = async () => {
    if (!textContent.trim()) return;
    setLoading(true);
    try {
      await onAddText(textContent.trim(), notes.trim() || undefined);
      resetForm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFile = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const type = selectedFile.type.startsWith('image/') ? 'photo' : 'video';
      await onAddFile(selectedFile, type, notes.trim() || undefined);
      resetForm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTextContent('');
    setNotes('');
    setSelectedFile(null);
    setFilePreview(null);
    setActiveTab('text');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Evidência</DialogTitle>
          <DialogDescription>
            Salve provas de forma segura e criptografada.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="gap-2">
              <FileText className="w-4 h-4" />
              Mensagem
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-2">
              <Camera className="w-4 h-4" />
              Foto/Vídeo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="text-content">Conteúdo da Mensagem</Label>
              <Textarea
                id="text-content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Cole ou digite a mensagem que deseja salvar..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-notes">Observações (opcional)</Label>
              <Textarea
                id="text-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Data, contexto, de quem recebeu..."
                rows={2}
              />
            </div>
            <Button 
              onClick={handleSubmitText} 
              disabled={loading || !textContent.trim()}
              className="w-full"
            >
              {loading ? 'Salvando...' : 'Salvar Mensagem'}
            </Button>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 mt-4">
            {selectedFile ? (
              <div className="relative">
                {filePreview && (
                  <img 
                    src={filePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                {!filePreview && selectedFile && (
                  <div className="w-full h-48 bg-secondary rounded-lg flex items-center justify-center">
                    <Video className="w-12 h-12 text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">{selectedFile.name}</span>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={clearFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-xs">Tirar Foto</span>
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">Escolher Arquivo</span>
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="media-notes">Observações (opcional)</Label>
              <Textarea
                id="media-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Data, local, contexto..."
                rows={2}
              />
            </div>

            <Button 
              onClick={handleSubmitFile} 
              disabled={loading || !selectedFile}
              className="w-full"
            >
              {loading ? 'Criptografando e Salvando...' : 'Salvar Arquivo'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
