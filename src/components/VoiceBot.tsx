import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Type declarations for Web Speech API
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

// Hardcoded FAQ responses for MVP
const phishingFAQ = {
  "what is phishing": "Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information like passwords, credit card numbers, or personal data through fake emails, websites, or messages.",
  "how can i stay safe": "Stay safe by: verifying sender identity, checking URLs carefully, never clicking suspicious links, using two-factor authentication, keeping software updated, and being cautious with personal information sharing.",
  "tell me about email red flags": "Email red flags include: urgent language, generic greetings, suspicious attachments, mismatched sender addresses, poor grammar, requests for personal information, and unfamiliar or suspicious links.",
  "what are common phishing tactics": "Common tactics include fake login pages, urgent account suspension notices, fake prize notifications, malicious attachments, CEO fraud, and social engineering through phone calls or messages.",
  "how to verify emails": "Verify emails by checking the sender's domain, hovering over links to see real URLs, contacting the organization directly, looking for spelling errors, and being wary of unexpected urgent requests."
};

export const VoiceBot = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome or Safari.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setResponse('');
      toast({
        title: "Listening",
        description: "Speak your question now...",
      });
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        const spokenText = finalTranscript.toLowerCase().trim();
        setTranscript(spokenText);
        processQuestion(spokenText);
        recognition.stop();
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      let errorMessage = "Could not process your speech. Please try again.";
      
      switch (event.error) {
        case 'network':
          errorMessage = "Network error. Please check your internet connection and try again.";
          break;
        case 'not-allowed':
          errorMessage = "Microphone access denied. Please allow microphone access and try again.";
          break;
        case 'no-speech':
          errorMessage = "No speech detected. Please speak clearly and try again.";
          break;
        case 'audio-capture':
          errorMessage = "Microphone not found. Please check your microphone and try again.";
          break;
        case 'service-not-allowed':
          errorMessage = "Speech service not available. Please try again later.";
          break;
      }
      
      toast({
        title: "Speech Recognition Error",
        description: errorMessage,
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
      toast({
        title: "Recognition Failed",
        description: "Could not start speech recognition. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const processQuestion = (question: string) => {
    setIsLoading(true);
    
    // Simple keyword matching for MVP
    const answer = findBestMatch(question);
    
    setTimeout(() => {
      setResponse(answer);
      setIsLoading(false);
      speakResponse(answer);
    }, 500);
  };

  const findBestMatch = (question: string): string => {
    const normalizedQuestion = question.toLowerCase().trim();
    
    // Check for exact matches first
    for (const [key, value] of Object.entries(phishingFAQ)) {
      if (normalizedQuestion.includes(key)) {
        return value;
      }
    }
    
    // Check for partial matches with keywords
    if (normalizedQuestion.includes('phishing') || normalizedQuestion.includes('phish')) {
      return phishingFAQ["what is phishing"];
    }
    if (normalizedQuestion.includes('safe') || normalizedQuestion.includes('protect')) {
      return phishingFAQ["how can i stay safe"];
    }
    if (normalizedQuestion.includes('email') || normalizedQuestion.includes('red flag')) {
      return phishingFAQ["tell me about email red flags"];
    }
    if (normalizedQuestion.includes('verify') || normalizedQuestion.includes('check')) {
      return phishingFAQ["how to verify emails"];
    }
    
    return "I'm here to help with phishing awareness! Try asking about 'what is phishing', 'how to stay safe', 'email red flags', or 'how to verify emails'.";
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-6 w-6 text-primary" />
          Phishing Awareness Voice Bot
        </CardTitle>
        <CardDescription>
          Ask me anything about phishing protection and cybersecurity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="h-16 w-16 rounded-full shadow-[var(--shadow-security)]"
          >
            {isListening ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            {isListening ? "Listening... Speak your question" : "Click to ask a question"}
          </p>
        </div>

        {transcript && (
          <div className="p-4 bg-secondary rounded-lg">
            <h4 className="font-medium text-secondary-foreground mb-2">You asked:</h4>
            <p className="text-secondary-foreground">"{transcript}"</p>
          </div>
        )}

        {isLoading && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground">Processing your question...</p>
          </div>
        )}

        {response && !isLoading && (
          <div className="p-4 bg-card border border-primary/20 rounded-lg">
            <h4 className="font-medium text-card-foreground mb-2 flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary" />
              Security Bot Response:
            </h4>
            <p className="text-card-foreground leading-relaxed">{response}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Try asking:</strong></p>
          <p>• "What is phishing?"</p>
          <p>• "How can I stay safe?"</p>
          <p>• "Tell me about email red flags"</p>
        </div>
      </CardContent>
    </Card>
  );
};