import { useEffect } from 'react';
import { downloadExcelExample } from '@/utils/generate-excel';

export default function DownloadExample() {
  useEffect(() => {
    downloadExcelExample();
    window.location.href = '/';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Скачивание файла...</h1>
        <p className="text-muted-foreground">Файл-пример начнёт загружаться автоматически</p>
      </div>
    </div>
  );
}
