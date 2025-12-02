import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  open: boolean;
  onClose: () => void;
  onShare: (code: string, language: string) => void;
}

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'sql'
];

export const CodeShareModal = ({ open, onClose, onShare }: Props) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onShare(code, language);
      setCode('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#161b22] border-[#30363d] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Share Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-[#0d1117] border-[#30363d] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#161b22] border-[#30363d] text-white">
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang} className="hover:bg-[#21262d] focus:bg-[#21262d]">
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <textarea
            className="w-full min-h-[300px] rounded-md border border-[#30363d] bg-[#0d1117] p-3 font-mono text-sm text-white placeholder:text-gray-500 focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] focus:outline-none"
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1 bg-[#238636] hover:bg-[#2ea043] text-white"
            >
              Share
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="bg-[#21262d] hover:bg-[#30363d] border-[#30363d] text-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
