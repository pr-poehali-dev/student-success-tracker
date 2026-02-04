import { useEffect } from 'react';
import { downloadTeamsExcelExample } from '@/utils/generate-excel';

export default function DownloadTeamsExample() {
  useEffect(() => {
    downloadTeamsExcelExample();
    window.location.href = '/';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Скачивание файла...</h1>
        <p className="text-muted-foreground">Файл-пример для импорта команд начнёт загружаться автоматически</p>
      </div>
    </div>
  );
}
