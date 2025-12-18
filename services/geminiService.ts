
import { GoogleGenAI, Type } from "@google/genai";
import { SupplyChainData, PredictiveAlert } from "../types";

export const getSupplyChainInsights = async (data: SupplyChainData[]): Promise<{ summary: string; alerts: PredictiveAlert[] }> => {
  // Always create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date API key.
  // We use process.env.API_KEY directly as it is guaranteed to be pre-configured and valid.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Sample data to keep tokens low
  const sample = data.slice(-20).map(d => ({
    t: d.timestamp,
    inv: d.inventoryLevel,
    lead: d.leadTime,
    state: d.state
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this supply chain data and identify potential risks. 
      Data: ${JSON.stringify(sample)}
      
      Respond in JSON format with two fields:
      - summary: A professional 2-sentence summary of overall health.
      - alerts: An array of objects with fields: title, description, severity (low, medium, high).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING }
                },
                required: ['title', 'description', 'severity']
              }
            }
          },
          required: ['summary', 'alerts']
        }
      }
    });

    // The text property of the response object is used directly to retrieve the generated string.
    const text = response.text || "{}";
    const result = JSON.parse(text);
    
    return {
      summary: result.summary || "No automated summary available.",
      alerts: (result.alerts || []).map((a: any, i: number) => ({
        ...a,
        id: `alert-${i}-${Date.now()}`,
        timestamp: new Date().toISOString()
      }))
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "Error generating insights. Our experts are monitoring the situation manually.",
      alerts: []
    };
  }
};
