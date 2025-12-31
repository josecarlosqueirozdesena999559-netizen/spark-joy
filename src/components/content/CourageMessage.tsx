import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Quote } from 'lucide-react';

interface CourageMessageProps {
  message: string;
  visible: boolean;
}

export const CourageMessage: React.FC<CourageMessageProps> = ({ message, visible }) => {
  if (!visible || !message) return null;

  return (
    <Card className="bg-gradient-to-r from-primary/20 via-accent/30 to-secondary/30 border-primary/20 shadow-lg animate-fade-in">
      <CardContent className="p-5">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary fill-primary/30" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start gap-1 mb-1">
              <Quote className="w-4 h-4 text-primary/60 rotate-180" />
            </div>
            <p className="text-foreground font-medium italic leading-relaxed">
              {message}
            </p>
            <div className="flex justify-end mt-1">
              <Quote className="w-4 h-4 text-primary/60" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
