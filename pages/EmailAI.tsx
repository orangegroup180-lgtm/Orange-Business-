import React, { useState } from 'react';
import { Card, Button, Input, Select, TextArea } from '../components/UI';
import { Mail, Sparkles, Copy, Check } from 'lucide-react';
import { generateEmail } from '../services/geminiService';
import { AppDocument, Client } from '../types';

interface EmailAIProps {
  documents?: AppDocument[];
  clients?: Client[];
}

export const EmailAI: React.FC<EmailAIProps> = ({ documents = [], clients = [] }) => {
  const [recipient, setRecipient] = useState('');
  const [purpose, setPurpose] = useState('');
  const [tone, setTone] = useState('Professional');
  const [context, setContext] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const text = await generateEmail(recipient, purpose, tone, context);
    setResult(text);
    setLoading(false);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDocSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docId = e.target.value;
    setSelectedDocId(docId);
    
    if (docId) {
      const doc = documents.find(d => d.id === docId);
      if (doc) {
        const client = clients.find(c => c.id === doc.clientId);
        
        // Build a helpful context string from the document
        const docSummary = `[Context: ${doc.type.toUpperCase()} #${doc.id.slice(0,6)} | Total: $${doc.total.toLocaleString()} | Due: ${doc.dueDate}]`;
        
        // Append to context if not already present
        setContext(prev => prev.includes(docSummary) ? prev : (prev ? `${prev}\n${docSummary}` : docSummary));
        
        // Auto-fill recipient if empty
        if (client && !recipient) {
          setRecipient(client.name);
        }
        
        // Refined purpose suggestion logic based on type and status
        if (!purpose) {
            if (doc.type === 'invoice') {
               if (doc.status === 'overdue') setPurpose(`Urgent: Follow up on overdue invoice #${doc.id.slice(0,6)}`);
               else if (doc.status === 'paid') setPurpose(`Send receipt/acknowledgement for paid invoice #${doc.id.slice(0,6)}`);
               else setPurpose(`Send invoice #${doc.id.slice(0,6)} for payment`);
            }
            else if (doc.type === 'quote') {
                setPurpose(`Follow up on quote #${doc.id.slice(0,6)} to close deal`);
            }
            else if (doc.type === 'receipt') {
                setPurpose(`Send payment receipt #${doc.id.slice(0,6)}`);
            }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Email AI Assistant</h2>
        <p className="text-slate-500">Draft perfect business emails in seconds using Gemini AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Card title="Compose Request" className="h-fit">
          <div className="space-y-4">
            <Select 
                label="Reference Document (Optional)" 
                value={selectedDocId} 
                onChange={handleDocSelection}
            >
              <option value="">Select a document to add context...</option>
              {documents.map(doc => (
                  <option key={doc.id} value={doc.id}>
                      {doc.type.toUpperCase()} #{doc.id.slice(0,6)} - {clients.find(c => c.id === doc.clientId)?.name} (${doc.total})
                  </option>
              ))}
            </Select>

            <Input 
              label="Recipient Name" 
              placeholder="e.g. John Doe" 
              value={recipient} 
              onChange={e => setRecipient(e.target.value)} 
            />
            
            <Select label="Email Tone" value={tone} onChange={e => setTone(e.target.value)}>
              <option>Professional</option>
              <option>Friendly</option>
              <option>Urgent</option>
              <option>Persuasive</option>
              <option>Apologetic</option>
            </Select>

            <Input 
              label="Core Purpose" 
              placeholder="e.g. Follow up on invoice #1023" 
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
            />

            <TextArea 
              label="Additional Context" 
              placeholder="Any specific details to include..." 
              rows={4}
              value={context}
              onChange={e => setContext(e.target.value)}
            />

            <Button 
              className="w-full mt-2" 
              onClick={handleGenerate}
              isLoading={loading}
              disabled={!recipient || !purpose}
            >
              <Sparkles size={18} className="mr-2" /> 
              {loading ? 'Drafting Email...' : 'Generate Email'}
            </Button>
          </div>
        </Card>

        <Card title="AI Generated Draft" className="flex flex-col h-full min-h-[500px]">
          {result ? (
            <div className="flex-grow flex flex-col animate-in fade-in duration-300">
              <div className="flex-grow bg-slate-50 rounded-lg p-4 border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap font-mono">
                {result}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setResult('')}>Clear</Button>
                <Button onClick={handleCopy}>
                  {copied ? <Check size={18} className="mr-2" /> : <Copy size={18} className="mr-2" />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400 p-8 text-center border-2 border-dashed border-slate-200 rounded-lg">
              <Mail size={48} className="mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-500">Ready to write</p>
              <p className="text-sm">Fill out the form on the left to generate your email.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};