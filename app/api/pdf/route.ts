import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File;
    const year = formData.get('year') as string || '';
    const branch = formData.get('branch') as string || '';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    //Convert PDF to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const hasProfile = year && branch;

    const prompt = hasProfile
      ? `You are an expert academic counselor for StudentHub.
         A student (Year: ${year}, Branch: ${branch}) uploaded this opportunity PDF.

         Analyze the PDF and provide:

         **📋 Summary**
         - What is this opportunity? (2-3 lines)

         **✅ Eligibility Criteria**
         - List all eligibility requirements from the document

         **📅 Key Deadlines**
         - Application deadline and any other important dates

         **💰 Benefits & Stipend**
         - Scholarships amount, internship stipend, prizes, etc.

         **🎯 Eligibility Verdict for This Student**
         Based on Year ${year} and Branch ${branch}:
         - Are they ELIGIBLE or NOT ELIGIBLE?
         - Give specific reasons from the document
         - If not fully eligible, what should they do to become eligible?`
           : `You are an expert academic counselor for StudentHub.
          Analyze this opportunity PDF and provide:

         **📋 Summary**
         - What is this opportunity? (2-3 lines)

         **✅ Eligibility Criteria**
         - List all eligibility requirements

         **📅 Key Deadlines**
         - Application deadline and important dates

         **💰 Benefits & Stipend**
         - Amount, stipend, prizes etc.

         **💡 Tip**
         - Who would benefit most from this opportunity?`;
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: base64 } },
          { text: prompt }
        ]
      }]
    });

    const text = result.response.text();
    return NextResponse.json({ result: text });

  } catch (err: any) {
    console.error('PDF route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}