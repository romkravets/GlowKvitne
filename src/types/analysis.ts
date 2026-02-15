export interface LarsonAnalysis {
  undertone: {
    result: string;
    confidence: string;
    indicators: string[];
    scientificReasoning: string;
  };
  value: {
    result: string;
    skinLevel: string;
    hairLevel: string;
    eyeLevel: string;
    overallContrast: string;
  };
  chroma: {
    result: string;
    skinClarity: string;
    eyeClarity: string;
    reasoning: string;
  };
  seasonalType: {
    primary: string;
    confidence: string;
    reasoning: string;
    secondaryPossibility?: string;
    whyNotOthers: string;
  };
  colorPalette: {
    bestColors: {
      neutrals: string[];
      accents: string[];
      metals: string;
      whites: string[];
      blacks: string[];
    };
    avoidColors: string[];
    reasoning: string;
  };
}

export interface KibbeAnalysis {
  boneStructure?: {
    type: string;
    shoulders: string;
    hips: string;
    hands: string;
    jawline: string;
    reasoning: string;
  };
  verticalLine?: {
    result: string;
    height?: string;
    apparentHeight: string;
    reasoning: string;
  };
  flesh?: {
    type: string;
    muscleDefinition: string;
    curveType: string;
    reasoning: string;
  };
  facialFeatures: {
    yinYangBalance: string;
    cheekbones: string;
    nose: string;
    lips: string;
    eyes: string;
    chin: string;
    overallImpression: string;
  };
  kibbeType: {
    result?: string;
    preliminaryResult?: string;
    confidence: string;
    reasoning: string;
    yinYangScore: string;
    keyCharacteristics: string[];
  };
  styleRecommendations: {
    silhouettes: string[];
    avoidSilhouettes: string[];
    necklines: string[];
    lengths: string;
    fabrics: string;
    patterns: string;
    details: string;
    waistEmphasis: string;
    accessories: string;
  };
}

export interface CelebrityMatch {
  name: string;
  larsonType: string;
  kibbeType: string;
  similarity: number;
  matchReason: string;
  bestLooks: Array<{
    description: string;
    whyItWorks: string;
    howToRecreate: string;
  }>;
}

export interface IntegratedRecommendations {
  signatureStyle: {
    description: string;
    capsuleWardrobe: Array<{
      item: string;
      color: string;
      silhouette: string;
      fabric: string;
      why: string;
    }>;
  };
  makeup: {
    lipColors: string[];
    eyeColors: string[];
    blushColors: string[];
    application: string;
  };
  hair: {
    colors: string[];
    styles: string;
    avoid: string;
  };
  jewelryAndAccessories: {
    metals: string;
    size: string;
    style: string;
  };
  celebrityTwins: CelebrityMatch[];
}

export interface AnalysisResult {
  larsonAnalysis: LarsonAnalysis;
  kibbeAnalysis: KibbeAnalysis;
  integratedRecommendations: IntegratedRecommendations;
  scientificValidation: {
    larsonConfidence: string;
    kibbeConfidence: string;
    methodology: string;
    limitationsAndNotes: string[];
    nextSteps: string[];
  };
}

export interface AnalysisResponse {
  success: boolean;
  message: string;
  result: AnalysisResult;
}
