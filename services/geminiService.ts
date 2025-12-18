
import { GoogleGenAI, Type } from "@google/genai";
import { SupplyChainData, PredictiveAlert } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSupplyChainInsights = async (data: SupplyChainData[]): Promise<{ summary: string; alerts: PredictiveAlert[] }> => {
  if (!process.env.API_KEY) {
    return {
      summary: "API Key not found. Please provide an API key for live AI insights.",
      alerts: []
    };
  }

  // Sample data to keep tokens low
  const sample = data.slice(-20).map(d => ({
    t: d.timestamp,
    inv: d.inventoryLevel,
    lead: d.leadTime,
    region: d.region
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
                  severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
                },
                required: ['title', 'description', 'severity']
              }
            }
          },
          required: ['summary', 'alerts']
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      summary: result.summary,
      alerts: result.alerts.map((a: any, i: number) => ({
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
