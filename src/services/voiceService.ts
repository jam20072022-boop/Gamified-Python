// Advanced Smart Voice Service for PyQuest
// Provides Native English Pronunciation for Programming Keywords and Fluent Arabic for Explanations
// Solves pronunciation bugs (e.g., misreading 'range' as 'ranj') via dual-engine speech synthesis

export type VoiceMode = 'bilingual' | 'ar' | 'en';

export interface VoiceToken {
  text: string;
  lang: 'ar' | 'en';
}

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking = false;
  private isPaused = false;
  private rate = 0.95;
  private voiceMode: VoiceMode = 'bilingual';
  private cachedVoices: SpeechSynthesisVoice[] = [];

  // Known programming keywords and tokens that must be spoken in native US English accent
  private codeKeywordsSet = new Set([
    'range',
    'for',
    'in',
    'total',
    'print',
    'def',
    'return',
    'import',
    'from',
    'as',
    'if',
    'else',
    'elif',
    'while',
    'break',
    'continue',
    'pass',
    'true',
    'false',
    'none',
    'int',
    'float',
    'str',
    'bool',
    'list',
    'dict',
    'tuple',
    'set',
    'len',
    'sum',
    'min',
    'max',
    'numpy',
    'pandas',
    'matplotlib',
    'pyplot',
    'scikit-learn',
    'dataframe',
    'series',
    'array',
    'fit',
    'predict',
    'accuracy',
    'lambda',
    'class',
    'self',
    'indentation',
    'loop',
    'syntax',
  ]);

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.cachedVoices = this.synth.getVoices();
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.cachedVoices.length && this.synth) {
      this.cachedVoices = this.synth.getVoices();
    }
    return this.cachedVoices;
  }

  public getBestVoice(lang: 'ar' | 'en'): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    if (lang === 'ar') {
      return (
        voices.find(
          (v) =>
            v.lang.startsWith('ar') &&
            (v.name.includes('Google') ||
              v.name.includes('Maged') ||
              v.name.includes('Tarik') ||
              v.name.includes('Laila') ||
              v.name.includes('Salma') ||
              v.name.includes('Natural'))
        ) ||
        voices.find((v) => v.lang.startsWith('ar') || v.lang.includes('ar')) ||
        null
      );
    } else {
      return (
        voices.find(
          (v) =>
            v.lang === 'en-US' &&
            (v.name.includes('Google US English') ||
              v.name.includes('Natural') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny') ||
              v.name.includes('Guy') ||
              v.name.includes('David'))
        ) ||
        voices.find((v) => v.lang.startsWith('en-US')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        null
      );
    }
  }

  /**
   * Intelligently parses mixed text into tokens (Arabic vs English Code Terms)
   * This guarantees that English terms like "range" are pronounced by native US English engine
   * while surrounding Arabic explanation is spoken in pure fluent Arabic.
   */
  public tokenizeMixedText(text: string): VoiceToken[] {
    // Strip markdown formatting
    const cleaned = text.replace(/[`*#]/g, '');

    // Split text into words and preserve delimiters
    const rawTokens = cleaned.split(/(\s+|[،,.:;!؟?()\[\]])/);
    const result: VoiceToken[] = [];
    let currentBuffer = '';
    let currentLang: 'ar' | 'en' | null = null;

    for (const token of rawTokens) {
      if (!token) continue;

      // Check if token contains English letters
      const hasEnglish = /[a-zA-Z]/.test(token);
      const isPurePunctuationOrWhitespace = /^[\s،,.:;!؟?()\[\]]+$/.test(token);

      if (isPurePunctuationOrWhitespace) {
        // Append punctuation to current segment
        currentBuffer += token;
        continue;
      }

      const tokenLang: 'ar' | 'en' = hasEnglish ? 'en' : 'ar';

      if (currentLang === null) {
        currentLang = tokenLang;
        currentBuffer = token;
      } else if (currentLang === tokenLang) {
        currentBuffer += token;
      } else {
        // Language switched, flush buffer
        if (currentBuffer.trim()) {
          result.push({ text: currentBuffer, lang: currentLang });
        }
        currentLang = tokenLang;
        currentBuffer = token;
      }
    }

    if (currentBuffer.trim()) {
      result.push({ text: currentBuffer, lang: currentLang || 'ar' });
    }

    return result;
  }

  /**
   * Speaks text according to the selected mode:
   * - 'bilingual': Hybrid mode. Arabic sentences in Arabic voice, English keywords in native US English voice.
   * - 'ar': Pure Arabic voice.
   * - 'en': Pure native English voice.
   */
  public speak(
    text: string,
    requestedLang: 'ar' | 'en' = 'ar',
    onBoundary?: (charIndex: number) => void,
    onEnd?: () => void
  ) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    if (this.voiceMode === 'en' || requestedLang === 'en') {
      // Pure native English mode
      const utterance = new SpeechSynthesisUtterance(text.replace(/[`*#]/g, ''));
      utterance.lang = 'en-US';
      utterance.rate = this.rate;
      utterance.pitch = 1.0;
      const voice = this.getBestVoice('en');
      if (voice) utterance.voice = voice;

      utterance.onboundary = (e) => onBoundary && onBoundary(e.charIndex);
      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      this.isSpeaking = true;
      this.synth.speak(utterance);
      return;
    }

    // Hybrid Bilingual Mode: split into language chunks
    const tokens = this.tokenizeMixedText(text);
    if (!tokens.length) {
      if (onEnd) onEnd();
      return;
    }

    this.isSpeaking = true;
    let finishedCount = 0;

    tokens.forEach((t, idx) => {
      const isLast = idx === tokens.length - 1;
      const utterance = new SpeechSynthesisUtterance(t.text);

      if (t.lang === 'en') {
        utterance.lang = 'en-US';
        utterance.rate = Math.max(0.8, this.rate * 0.9); // clear, measured English pronunciation
        utterance.pitch = 1.02;
        const voice = this.getBestVoice('en');
        if (voice) utterance.voice = voice;
      } else {
        utterance.lang = 'ar-SA';
        utterance.rate = this.rate;
        utterance.pitch = 1.0;
        const voice = this.getBestVoice('ar');
        if (voice) utterance.voice = voice;
      }

      utterance.onend = () => {
        finishedCount++;
        if (finishedCount >= tokens.length) {
          this.isSpeaking = false;
          if (onEnd) onEnd();
        }
      };

      utterance.onerror = () => {
        finishedCount++;
        if (finishedCount >= tokens.length) {
          this.isSpeaking = false;
          if (onEnd) onEnd();
        }
      };

      this.synth!.speak(utterance);
    });
  }

  /**
   * Pronounces a single programming term with authentic native US English accent
   * (e.g. 'range' -> pronounced crystal clear as [reɪndʒ] with no dialect distortion)
   */
  public speakNativeEnglishWord(word: string, onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    const cleanWord = word.replace(/[`*#()]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanWord);
    utterance.lang = 'en-US';
    utterance.rate = 0.82; // slightly slower for maximum clarity
    utterance.pitch = 1.05;

    const usVoice = this.getBestVoice('en');
    if (usVoice) utterance.voice = usVoice;

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.isSpeaking = true;
    this.synth.speak(utterance);
  }

  public setVoiceMode(mode: VoiceMode) {
    this.voiceMode = mode;
  }

  public getVoiceMode(): VoiceMode {
    return this.voiceMode;
  }

  public setRate(rate: number) {
    this.rate = Math.max(0.6, Math.min(1.5, rate));
  }

  public getRate(): number {
    return this.rate;
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
    }
  }

  public isVoiceActive(): boolean {
    return this.isSpeaking;
  }
}

export const voiceService = new VoiceService();
