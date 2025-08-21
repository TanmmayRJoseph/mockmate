/* eslint-disable @typescript-eslint/no-explicit-any */
// Add this at the top of your component file
declare global {
    interface Window {
      SpeechRecognition: typeof SpeechRecognition;
      webkitSpeechRecognition: typeof SpeechRecognition;
    }
  
    interface SpeechRecognition extends EventTarget {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      start(): void;
      stop(): void;
      abort(): void;
      onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
      onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
      onend: ((this: SpeechRecognition, ev: Event) => any) | null;
      onerror: ((this: SpeechRecognition, ev: any) => any) | null;
      onnomatch: ((this: SpeechRecognition, ev: any) => any) | null;
      onresult: ((this: SpeechRecognition, ev: any) => any) | null;
      onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
      onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
      onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
      onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    }
  }

  export {};