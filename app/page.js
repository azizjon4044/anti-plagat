"use client";
import { useState } from 'react';
import { UploadCloud, RefreshCw, Download, FileText, FileUp } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleParaphrase = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        if (!inputText) {
          alert("Iltimos, matn kiriting yoki fayl yuklang!");
          setIsLoading(false);
          return;
        }
        formData.append('text', inputText);
      }
      
      const res = await fetch('/api/paraphrase', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        setOutputText(data.text);
      } else {
        alert("Xatolik: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi.");
    }
    setIsLoading(false);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const blob = new Blob([outputText], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(blob);
    element.download = "Natija_AI.txt";
    document.body.appendChild(element);
    element.click();
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(outputText, 180);
    doc.text(splitText, 15, 15);
    doc.save("Natija_AI.pdf");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setInputText(`Tanlangan fayl: ${file.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">AntiPlagiat <span className="text-blue-600">AI</span></h1>
          <p className="text-gray-500">PDF, Word va Matnli fayllarni plagiatdan tozalash va akademik darajada qayta yozish tizimi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4 text-blue-600 font-semibold">
              <div className="flex items-center gap-2"><UploadCloud size={20} /> Matn yoki Fayl Kiritish</div>
              <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-xl flex items-center gap-2 text-sm transition-all">
                <FileUp size={16} /> Fayl yuklash (.pdf, .docx, .txt)
                <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
              </label>
            </div>
            <textarea 
              value={inputText}
              onChange={(e) => { setInputText(e.target.value); setSelectedFile(null); }}
              placeholder="Matnni shu yerga yozing yoki yuqoridan fayl yuklang..."
              className="flex-1 w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 resize-none outline-none"
            ></textarea>
            {selectedFile && <p className="text-xs text-blue-500 mt-2">Yuklangan fayl: {selectedFile.name}</p>}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <FileText size={20} /> AI Natijasi
              </div>
              {outputText && (
                <div className="flex gap-2">
                  <button onClick={handleDownloadTxt} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all font-medium">
                    <Download size={14} /> .TXT
                  </button>
                  <button onClick={handleDownloadPdf} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all font-medium">
                    <Download size={14} /> .PDF
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 w-full p-4 bg-gray-50 rounded-xl overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
              {outputText ? outputText : <span className="text-gray-400">AI natijasi shu yerda namoyon bo'ladi...</span>}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            object-type="button"
            onClick={handleParaphrase}
            disabled={isLoading}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1'}`}
          >
            {isLoading ? <RefreshCw size={24} className="animate-spin" /> : <RefreshCw size={24} />}
            {isLoading ? 'Fayl o‘qilmoqda va AI ishlamoqda...' : 'Plagiatdan Tozalash'}
          </button>
        </div>
      </div>
    </div>
  );
}