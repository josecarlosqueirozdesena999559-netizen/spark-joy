import React, { useState, useRef } from 'react';
import { Image, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreatePostFormProps {
  userId: string;
  userAvatar: string;
  onPostCreated: () => void;
}

const avatarIcons: Record<string, string> = {
  heart: '❤️',
  star: '⭐',
  flower: '🌸',
  butterfly: '🦋',
  rainbow: '🌈',
  moon: '🌙',
  sun: '☀️',
  leaf: '🍃',
};

const CreatePostForm: React.FC<CreatePostFormProps> = ({ userId, userAvatar, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Imagem muito grande',
          description: 'A imagem deve ter no máximo 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    let imageUrl: string | null = null;

    try {
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          content: content.trim(),
          image_url: imageUrl,
        });

      if (postError) throw postError;

      setContent('');
      removeImage();
      setIsFocused(false);
      onPostCreated();
      
      toast({
        title: 'Publicado!',
        description: 'Sua história foi compartilhada com a comunidade.',
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível publicar. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4 rounded-2xl border-border/50 shadow-sm overflow-hidden">
      <CardContent className="p-3">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-lg shrink-0 ring-2 ring-primary/20">
              {avatarIcons[userAvatar] || '❤️'}
            </div>
            <div className="flex-1 min-w-0">
              <Textarea
                placeholder="Compartilhe sua história..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsFocused(true)}
                className={`resize-none border-0 p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 text-[15px] transition-all ${
                  isFocused || content ? 'min-h-[60px]' : 'min-h-[40px]'
                }`}
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mt-3 rounded-xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-48 object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full h-7 w-7 bg-background/80 backdrop-blur-sm"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Actions - only show when focused or has content */}
              {(isFocused || content || imagePreview) && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-9 w-9 text-primary/70 hover:text-primary hover:bg-primary/10"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                    >
                      <Image className="w-5 h-5" />
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || (!content.trim() && !image)}
                    size="sm"
                    className="rounded-full gap-2 h-9 px-4"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Publicar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;
