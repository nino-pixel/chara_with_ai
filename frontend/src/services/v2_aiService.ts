import { GoogleGenerativeAI, type Part } from '@google/generative-ai'
import { TOOLS, executeTool } from './aiTools'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  actions?: string[]
  isError?: boolean
}

export interface AiResponse {
  content: string
  actions?: string[]
}

const API_KEY = 'AIzaSyCNcUmK9BeqJakoW4oTlHYWpREuYSPVCXs'

// ──────────────────────────────────────────────
//   AUDIO TRANSCRIPTION via Gemini inline audio
// ──────────────────────────────────────────────
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const mimeType = audioBlob.type || 'audio/webm'
  const buffer = await audioBlob.arrayBuffer()
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

  const body = {
    contents: [
      {
        parts: [
          { text: 'Transcribe this audio recording exactly as spoken. Return only the transcription, no extra text.' },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
      },
    ],
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Transcription failed: ${err}`)
  }

  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
}


// ──────────────────────────────────────────────
//   MULTI-TURN CHAT SESSION
// ──────────────────────────────────────────────
console.log('[AiService] Initializing with model: gemini-2.5-flash');
const SYSTEM_INSTRUCTION = `You are Chara AI — an intelligent real estate system assistant for Chara Realty in Bulacan, Philippines.

You have full access to the company's live CRM data through function tools and can perform actions across ALL modules.

TODAY'S DATE: ${new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
LOCATION: You are running inside the Admin Panel of Chara Realty's management system.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAPABILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLIENTS
- List and search clients (by name, email, status)
- Add new clients (name, email, phone, source, notes)
- Update client details (name, phone, email, status, notes, admin notes)
- Check for duplicates before adding

PROPERTIES
- List properties (filter by status, type, or search by title)
- Add new property listings (title, type, location, price, beds, baths, area, status)
- Update property details (status, price, location, notes)
- Status flow: draft → available → reserved → under_negotiation → processing_docs → sold

INQUIRIES / LEADS
- List leads (filter by status or search by name)
- Create new inquiries (name, email, phone, property, message, budget, timeline)
- Automatically link inquiry to existing property if found
- Update lead status and priority (new → contacted → qualified → converted → lost)

DEALS
- List deals (filter by status)
- Create deals linking a client to a property (client must exist first)
- Update deal status, admin notes, closing date, final sale price
- Deal pipeline: Inquiry → Negotiation → Reserved → Processing Documents → Closed | Cancelled

ANALYTICS
- Get system-wide statistics or per-module breakdowns

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAFETY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 🚨 MANDATORY: Before adding any record (Client, Property, Inquiry, Deal), you MUST ensure all REQUIRED fields are provided.
- If mandatory information is missing, request it from the user before proceeding.
- REQUIRED FIELDS:
  - CLIENTS: Full Name, Email, Phone, Province, Municipality, Barangay.
  - PROPERTIES: Title, Type, Location, Price.
  - DEALS: Client Name, Property Title.
  - INQUIRIES: Name, Email, Phone, Source.
- MEDIA & DOCUMENTS: You cannot process or upload images, files, or documents. Inform the user that these must be added manually via the property or deal details page after the record is created.
- NO TECHNICAL TERMS: Do not use programming or system architecture language. Do not mention "calling tools," "executing functions," "parameters," "API," "backend," or internal field names like "finalSalePrice" or "createdAt." Speak only as a human administrative assistant.
- DATA INTERPRETATION & COMPARISON:
  - **Month-over-Month Analysis**: When users ask for a comparison (e.g., "this month vs last month"), use the monthlySalesSummary or monthlyLeads data to calculate differences and report them clearly.
  - **Deal Conversion Rate** is calculated as (Closed Deals / Total Registered Clients) * 100.
  - **Monthly Sales** is the sum of prices for all deals with a status of 'Closed' that were closed/updated in the current month.
  - **Active Listings** include only properties with 'available' or 'under_negotiation' status.
- PERSONALITY (VOICE OPTIMIZED):
  - Tone: Business-formal, helpful, and proactive.
  - Speech Flow: Use commas frequently to create natural pauses for the voice engine. Provide concise but detailed explanations.
  - No Emojis: Strictly avoid emojis.
  - Proactive: If you notice a trend (e.g., sales increasing), highlight it formally.
- CHECK duplicates before creating clients or properties.
- VERIFY client existence before creating a deal.
- For DESTRUCTIVE updates (e.g. Cancellation), confirm with the user before proceeding.
- Never delete data unless explicitly instructed to "delete."
- Log all actions with formal summaries.
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Website Developer: **Antonino Balinado Jr.** (Independent Developer)
- Developer Contact: [antoninobalinado756@gmail.com](mailto:antoninobalinado756@gmail.com)
- Developer Social: [Facebook Profile (antoninobalinadojr)](https://www.facebook.com/ninobalinadojr/)
- Owner of CHara Realty: **Celine Hara**.
- Data Sources: You have access to information from the Dashboard, Data Tables, and Activity Logs.
- Business Logic: You can assist users with calculations, performance estimates, and business-related projections based on system data.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONALITY & FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Personality: Professional, formal, and strictly administrative.
- Tone: Business-formal. Avoid casual language, enthusiasm, or technical jargon.
- Emoji Restriction: DO NOT use emojis.
- Formatting: Standard Markdown. Bold **important information**.
- Tables: Use for lists or data comparisons.
- Confirmation: Always state the result of an action clearly.
- Error Handling: Provide formal explanations for failures or missing data.
`

// Persist UI messages in memory (resets on full page refresh)
let uiMessages: Message[] = [
  {
    id: '0',
    role: 'assistant',
    content: `Welcome to the Chara Realty Administration System. I am your integrated AI assistant.

I have been configured to assist you with operations across all system modules, including Clients, Properties, Inquiries, and Deals. You may request data search, record creation, or status updates through this interface.

How may I assist you with your administrative tasks today?`,
    timestamp: new Date(),
  },
]

// Store chat history per session (for Gemini API)
let chatHistory: Array<{ role: string; parts: Part[] }> = []

export function getMessages() {
  return [...uiMessages]
}

export function addUiMessage(msg: Message) {
  uiMessages.push(msg)
}

export function resetAiChat() {
  chatHistory = []
  const welcome: Message = {
    id: Date.now().toString(),
    role: 'assistant',
    content: 'The conversation has been cleared. How may I assist you next?',
    timestamp: new Date(),
  }
  uiMessages = [welcome]
  return welcome
}

export async function processAiMessage(userMessage: string): Promise<AiResponse> {
  // Hardcoded as requested by the user
  const apiKey = 'AIzaSyCNcUmK9BeqJakoW4oTlHYWpREuYSPVCXs'

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: TOOLS,
    systemInstruction: SYSTEM_INSTRUCTION,
  })

  // Add user message to history
  chatHistory.push({
    role: 'user',
    parts: [{ text: userMessage }],
  })

  const chat = model.startChat({
    history: chatHistory.slice(0, -1), // all history except current message
  })

  let response = await chat.sendMessage(userMessage)
  const actions: string[] = []

  // Agentic loop: keep handling function calls until the model is done
  let iterations = 0
  while (response.response.functionCalls()?.length && iterations < 5) {
    iterations++
    const calls = response.response.functionCalls()!
    const functionResults: Part[] = []

    for (const call of calls) {
      actions.push(call.name.toUpperCase())
      const result = executeTool(call.name, call.args as Record<string, unknown>)
      functionResults.push({
        functionResponse: {
          name: call.name,
          response: { result },
        },
      })
    }

    // Feed results back to the model
    response = await chat.sendMessage(functionResults)
  }

  const finalText = response.response.text()

  // Add assistant response to history
  chatHistory.push({
    role: 'model',
    parts: [{ text: finalText }],
  })

  return {
    content: finalText,
    actions: actions.length > 0 ? [...new Set(actions)] : undefined,
  }
}
