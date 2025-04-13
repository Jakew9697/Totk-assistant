import { NextResponse } from 'next/server';
import type { Message } from '@/hooks/useChat';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function formatResponseForReadability(text: string): string {
  if (!text) return text;
  
  const containsTaskPatterns = /how to|steps|guide|tutorial|process|walkthrough|steps to|instructions/i.test(text);
  const containsNumberedList = /\d+\.\s+[A-Z]/m.test(text);
  
  if ((containsTaskPatterns || containsNumberedList) && text.length > 200) {
    return formatTaskResponse(text);
  }
  
  return formatGeneralResponse(text);
}

function formatTaskResponse(text: string): string {
  let result: string[] = [];
  
  result.push("━━━━━━━━ GUIDE ━━━━━━━━");
  result.push("");
  
  let mainContent = text;
  
  mainContent = mainContent.replace(/^#+\s+(.*)$/mg, "$1");
  
  let sections: Array<{type: string, content: string}> = [];
  
  const introParagraphMatch = mainContent.match(/^([^0-9\n][\s\S]+?)(?=\n*\d+\.|\n*STEP|\n*\[Step\])/i);
  if (introParagraphMatch && introParagraphMatch[1].length > 10) {
    sections.push({
      type: "intro",
      content: introParagraphMatch[1].trim()
    });
    
    mainContent = mainContent.replace(introParagraphMatch[1], "").trim();
  }
  
  const sectionPatterns = [
    { pattern: /equipment|gear|items|prep|weapons/i, name: "EQUIPMENT & PREPARATION" },
    { pattern: /strategy|approach|combat|methods|tactics/i, name: "STRATEGY" },
    { pattern: /steps|instructions|process|procedure|how can i|how to/i, name: "STEP-BY-STEP GUIDE" },
    { pattern: /tips|hints|advice|note|important/i, name: "TIPS & TRICKS" },
    { pattern: /rewards|loot|drops|items obtained/i, name: "REWARDS" }
  ];
  
  if (sections.length > 0) {
    result.push(sections[0].content);
    result.push("");
  }
  
  const stepLines = mainContent.split('\n');
  let currentSection = "STEP-BY-STEP GUIDE";
  let stepCounter = 1;
  let hasAddedMainSection = false;
  
  for (let i = 0; i < stepLines.length; i++) {
    let line = stepLines[i].trim();
    if (!line) continue;
    
    for (const section of sectionPatterns) {
      if (section.pattern.test(line) && line.length < 50) {
        currentSection = section.name;
        result.push("");
        result.push("━━ " + currentSection + " ━━");
        result.push("");
        hasAddedMainSection = true;
        line = '';
        break;
      }
    }
    
    if (!line) continue;
    
    if (!hasAddedMainSection && (stepCounter === 1) && /^\d+\./.test(line)) {
      result.push("━━ STEP-BY-STEP GUIDE ━━");
      result.push("");
      hasAddedMainSection = true;
    }
    
    if (/^\d+\./.test(line)) {
      const stepNumber = line.match(/^(\d+)\./)?.[1] || stepCounter.toString();
      const stepContent = line.replace(/^\d+\.\s*/, '').trim();
      
      result.push(`${stepNumber}. ${stepContent}`);
      stepCounter++;
      
      result.push("");
    } else if (line.length > 10) {
      result.push(line);
      
      if (i < stepLines.length - 1 && stepLines[i+1].trim() && !stepLines[i+1].trim().startsWith("•")) {
        result.push("");
      }
    }
  }
  
  if (!text.toLowerCase().includes('tip') && !text.toLowerCase().includes('hint') && 
      !text.toLowerCase().includes('note') && !text.toLowerCase().includes('remember')) {
    result.push("");
    result.push("━━ NOTE ━━");
    result.push("");
    result.push("Remember to save your game before attempting challenging tasks!");
  }
  
  for (let i = result.length - 1; i > 0; i--) {
    if (result[i] === "" && result[i-1] === "") {
      result.splice(i, 1);
    }
  }
  
  return result.join('\n');
}

function formatGeneralResponse(text: string): string {
  let result: string[] = [];
  
  const headers: string[] = [];
  text = text.replace(/^#+\s+(.*)$/mg, (_, h) => {
    headers.push(h.trim());
    return '';
  }).trim();
  
  if (headers.length > 0 && headers[0].length < 50) {
    result.push(`━━━━━━━━ ${headers[0].toUpperCase()} ━━━━━━━━`);
  } else {
    result.push("━━━━━━━━ ZELDA GUIDE ━━━━━━━━");
  }
  result.push("");
  
  let paragraphs = text.split(/\n\s*\n/);
  
  paragraphs.forEach(paragraph => {
    if (!paragraph.trim()) return;
    
    if (/^[A-Z][A-Z\s]+:/.test(paragraph) || headers.includes(paragraph.trim())) {
      result.push("");
      result.push(`━━ ${paragraph.replace(':', '').trim().toUpperCase()} ━━`);
      result.push("");
      return;
    }
    
    if (/^[•\-*]\s+/.test(paragraph)) {
      const items = paragraph.split(/\n/).filter(item => item.trim());
      result.push(...items);
      result.push("");
      return;
    }
    
    if (/best|important|recommended|ideal|powerful|effective|strongest|key|notable|tip|hint/i.test(paragraph) &&
        paragraph.length < 200) {
      result.push(`» ${paragraph.trim()}`);
      result.push("");
      return;
    }
    
    if (paragraph.length > 120) {
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      
      let currentParagraph = '';
      sentences.forEach(sentence => {
        if (currentParagraph.length + sentence.length > 120 && currentParagraph) {
          result.push(currentParagraph.trim());
          result.push("");
          currentParagraph = sentence;
        } else {
          currentParagraph += sentence;
        }
      });
      
      if (currentParagraph) {
        result.push(currentParagraph.trim());
        result.push("");
      }
    } else {
      result.push(paragraph);
      result.push("");
    }
  });
  
  if (text.match(/location|place|area|region|map/i) && !text.includes("LOCATION")) {
    result.push("━━ LOCATION INFO ━━");
    result.push("");
    result.push("You can mark this location on your map by selecting it in your Sheikah Slate.");
  }
  
  for (let i = result.length - 1; i > 0; i--) {
    if (result[i] === "" && result[i-1] === "") {
      result.splice(i, 1);
    }
  }
  
  if (result[result.length - 1] === "") {
    result.pop();
  }
  
  return result.join('\n');
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const lastMessage = messages.filter(msg => msg.role === 'user').pop();
    
    if (!lastMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      );
    }
    const systemMessage: Message = {
      role: 'system',
      content: `You are a knowledgeable guide for "The Legend of Zelda: Tears of the Kingdom" with a slight organic Zelda themed persona.
      Provide clear, direct answers about game mechanics, locations, items, enemies, and quest solutions.
      Keep responses factual and helpful.
      Be concise and straight to the point while maintaining a hint of Zelda's wisdom.
      Focus on providing useful information rather than roleplaying extensively.
      If asked about topics outside of Zelda games, briefly acknowledge the user that you only answer questions about Tears of the Kingdom and no other topics.`
    };
    
    const apiMessages = [
      systemMessage,
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 500
    });
    
    const zeldaResponse: Message = {
      role: 'assistant',
      content: formatResponseForReadability(completion.choices[0].message.content ?? '') || "I apologize, but I couldn't generate a response."
    };
    
    return NextResponse.json(zeldaResponse);
    
  } catch (error) {
    console.error('Error processing chat request:', error);
    if (error instanceof OpenAI.APIError) {
        console.error('OpenAI API returned an error:', {
          status: error.status,
          message: error.message,
          code: error.code,
          type: error.type,
        });
      } else {
        console.error('Unexpected error:', error);
      }
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
