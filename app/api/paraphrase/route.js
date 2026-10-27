import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const textFile = formData.get('file');
    let text = formData.get('text');

    // Agar fayl yuklangan bo'lsa, uni formatiga qarab o'qib olamiz
    if (textFile) {
      const buffer = Buffer.from(await textFile.arrayBuffer());
      const fileName = textFile.name.toLowerCase();

      if (fileName.endsWith('.pdf')) {
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
      } else if (fileName.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } else if (fileName.endsWith('.txt')) {
        text = buffer.toString('utf-8');
      }
    }

    if (!text || text.trim() === "") {
      return NextResponse.json({ success: false, error: "Matn topilmadi yoki fayl bo'sh!" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "dummy_key",
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Sen professional ilmiy muharrirsan. Quyidagi matnning asl ma'nosini va ilmiy faktlarini 100% saqlab qolgan holda, uni plagiat dasturlari sezmaydigan qilib (paraphrase), sinonimlar va gap qurilishini o'zgartirib, yuqori darajadagi akademik o'zbek tilida qayta yozib ber." 
        },
        { 
          role: "user", 
          content: text 
        }
      ],
      temperature: 0.7,
    });
    
    const responseText = response.choices[0].message.content;
    return NextResponse.json({ success: true, text: responseText });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}