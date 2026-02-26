import ReactMarkdown from 'react-markdown';

// Mock function to get help content
// In real app, read from files or DB
const getHelpContent = (slug: string) => {
    const helpDocs: any = {
        'fakturace': '# Fakturace\n\nJak vystavit první fakturu?\n1. Jděte do sekce Faktury\n2. Klikněte na "Nová faktura"\n3. Vyberte klienta...',
        'sklad': '# Skladové hospodářství\n\nVulpi podporuje multi-skladové hospodářství. Můžete převádět zboží mezi sklady a dělat inventury.',
        'api': '# API Dokumentace\n\nPro vývojáře nabízíme REST API. Klíče vygenerujete v nastavení.'
    };
    return helpDocs[slug] || '# Nápověda\n\nVítejte v dokumentaci Vulpi. Vyberte téma vlevo.';
};

export default function HelpPage({ searchParams }: { searchParams: { topic?: string } }) {
  const topic = searchParams.topic || 'index';
  const content = getHelpContent(topic);

  return (
    <div className="max-w-6xl mx-auto p-6 flex gap-8">
      <div className="w-64 flex-shrink-0">
          <h2 className="text-xl font-bold mb-4">Témata</h2>
          <ul className="space-y-2">
              <li><a href="/help?topic=fakturace" className="text-blue-600 hover:underline">Fakturace</a></li>
              <li><a href="/help?topic=sklad" className="text-blue-600 hover:underline">Sklad & Zásoby</a></li>
              <li><a href="/help?topic=api" className="text-blue-600 hover:underline">API & Integrace</a></li>
          </ul>
      </div>
      
      <div className="flex-1 bg-white dark:bg-gray-800 p-8 rounded shadow prose dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
