
import { GoogleGenAI, Type } from "@google/genai";
import { VehicleType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Defining the schema as a standard object for responseSchema config
const recommendationSchema = {
  type: Type.OBJECT,
  properties: {
    recommendedVehicle: { 
      type: Type.STRING, 
      enum: Object.values(VehicleType),
      description: "The best vehicle type for the user's needs" 
    },
    reasoning: { 
      type: Type.STRING, 
      description: "Explanation of why this vehicle was chosen" 
    },
    estimatedTime: { 
      type: Type.STRING, 
      description: "Estimated travel time based on context" 
    },
    suggestedRoute: { 
      type: Type.STRING, 
      description: "A brief description of the optimal path" 
    }
  },
  required: ["recommendedVehicle", "reasoning", "estimatedTime"]
};

export const getSmartRecommendation = async (userQuery: string, passengers: number) => {
  try {
    const response = await ai.models.generateContent({
      // Use the recommended model for basic text reasoning tasks
      model: 'gemini-3-flash-preview',
      contents: `User request: "${userQuery}". Number of passengers: ${passengers}. Suggest the best vehicle from: BIKE, RICKSHAW, COROLLA, COROLLA_CROSS, REVO, FORTUNER, HIACE, COASTER.`,
      config: {
        systemInstruction: `You are an expert transport dispatcher. Recommend the most efficient vehicle based on passenger count and user needs. 
        - BIKE: 1 passenger (Solo, fast)
        - RICKSHAW: 1-3 passengers (Short distance, local)
        - COROLLA: 1-4 passengers (Standard sedan comfort)
        - COROLLA_CROSS: 1-4 passengers (Premium choice for weddings like Baraat or Valima, event functions, or high-end car rental services)
        - REVO: 1-4 passengers (Powerful pickup for rough roads or prestige)
        - FORTUNER: 1-7 passengers (Luxury SUV, large family or high status)
        - HIACE: 8-14 passengers (Large group van)
        - COASTER: 15-30 passengers (Mini bus for events)`,
        responseMimeType: "application/json",
        responseSchema: recommendationSchema,
      }
    });

    // Access text property directly as per Gemini API best practices
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return null;
  }
};
