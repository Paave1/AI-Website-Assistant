"use client";
import {useState} from 'react';
import {PDFDocument, StandardFonts, rgb} from 'pdf-lib';

type PdfData = {url: string; aiSummary: {good: string[]; issues: string[]; steps: string[]}};

export default function PdfButton({data}: {data: PdfData}) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const drawText = (text: string, x: number, y: number, size = 12, bold = false) => {
        page.drawText(text, {x, y, size, font: bold ? fontBold : font, color: rgb(0, 0, 0)});
      };

      let y = 800;
      drawText('AI Website Assistant', 40, y, 18, true);
      y -= 20;
      drawText(new Date().toLocaleString(), 40, y);
      y -= 30;
      drawText(`URL: ${data.url}`, 40, y);
      y -= 30;
      drawText('Summary', 40, y, 14, true);
      y -= 18;

      const writeList = (title: string, items: string[]) => {
        drawText(title, 40, y, 12, true);
        y -= 16;
        for (const item of items) {
          const lines = wrap(item, 90);
          for (const line of lines) {
            drawText(`• ${line}`, 50, y);
            y -= 14;
          }
          y -= 6;
        }
      };

      writeList("What's good", data.aiSummary.good || []);
      writeList('Issues', data.aiSummary.issues || []);
      writeList('Next steps', data.aiSummary.steps || []);

      const dataUri = await pdfDoc.saveAsBase64({dataUri: true});
      const a = document.createElement('a');
      a.href = dataUri;
      a.download = 'website-report.pdf';
      a.click();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={onClick} disabled={loading} className="bg-black text-white px-3 py-2 rounded">
      {loading ? 'Generating…' : 'Download PDF'}
    </button>
  );
}

function wrap(text: string, max: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > max) {
      lines.push(current.trim());
      current = w;
    } else {
      current += ' ' + w;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}


