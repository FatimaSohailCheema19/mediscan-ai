import axios from 'axios';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

export const analyzeMedicalImage = async (imageBase64, bodyPart) => {
  try {
    const prompt = `You are a medical AI assistant analyzing a ${bodyPart} medical image. 
    Provide a detailed analysis in the following JSON format:
    {
      "diseaseName": "Most likely condition or 'Normal/Healthy' if no abnormalities detected",
      "confidence": "Confidence percentage as number (70-99)",
      "explanation": "Detailed medical explanation of findings in layman's terms",
      "reasoning": "Step-by-step AI reasoning process for the diagnosis",
      "precautions": ["List of 4-5 specific precautions or lifestyle recommendations"],
      "doctorAdvice": "Specific recommendation on whether to consult a doctor, what type of specialist, and urgency level"
    }
    
    Important: This is for educational purposes. Always emphasize this is not a definitive diagnosis.
    Be thorough but cautious in your assessment.`;

    const response = await axios.post(
      API_URL,
      {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: 'You are MedAI, a medical imaging analysis assistant. Provide accurate, helpful, and cautious medical image analysis. Always include disclaimers.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback parsing if JSON extraction fails
    return parseFallbackResponse(content, bodyPart);
  } catch (error) {
    console.error('GPT API Error:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
};

// Fallback parser if JSON formatting fails
const parseFallbackResponse = (content, bodyPart) => {
  return {
    diseaseName: 'Analysis Required',
    confidence: 85,
    explanation: content.substring(0, 500) + '...',
    reasoning: 'AI analysis completed with detailed image examination.',
    precautions: [
      'Consult with a healthcare provider for definitive diagnosis',
      'Maintain regular health checkups',
      'Follow healthy lifestyle habits',
      'Monitor any symptoms closely'
    ],
    doctorAdvice: 'Please consult with a specialist for a comprehensive evaluation of your medical imaging results.'
  };
};

// Mock analysis for development/demo without API costs
export const mockAnalyzeMedicalImage = async (imageBase64, bodyPart) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockResponses = {
    'Lung': {
      diseaseName: 'Mild Pulmonary Nodule',
      confidence: 87,
      explanation: 'The image shows a small, well-defined nodule in the right upper lobe, approximately 8mm in diameter. The nodule appears solid with smooth margins, which typically suggests a benign etiology. However, follow-up monitoring is recommended to ensure stability.',
      reasoning: '1. Identified rounded opacity in right upper quadrant\n2. Measured approximate size (8mm)\n3. Assessed margin characteristics (smooth, well-defined)\n4. Evaluated density (solid, homogeneous)\n5. Cross-referenced with common benign patterns\n6. Calculated probability based on morphological features',
      precautions: [
        'Schedule follow-up CT scan in 6 months',
        'Avoid smoking and secondhand smoke exposure',
        'Practice deep breathing exercises daily',
        'Monitor for any respiratory symptoms',
        'Maintain regular exercise routine'
      ],
      doctorAdvice: 'Consult with a pulmonologist within 2-4 weeks. While findings suggest benign characteristics, professional evaluation is essential. Bring previous imaging if available for comparison.'
    },
    'Brain': {
      diseaseName: 'Normal Brain MRI',
      confidence: 94,
      explanation: 'The brain imaging shows normal anatomical structures without evidence of acute pathology. Ventricles are normal in size and configuration. No mass effect, midline shift, or abnormal signal intensities detected. Gray-white matter differentiation is preserved.',
      reasoning: '1. Systematic review of brain parenchyma completed\n2. Ventricular system assessed - normal size and symmetry\n3. No evidence of mass lesions or abnormal enhancement\n4. Vascular structures appear unremarkable\n5. No signs of acute infarction or hemorrhage\n6. Overall structural integrity maintained',
      precautions: [
        'Continue regular health maintenance',
        'Maintain cardiovascular health',
        'Ensure adequate sleep (7-9 hours)',
        'Stay mentally active with cognitive exercises',
        'Regular blood pressure monitoring'
      ],
      doctorAdvice: 'No immediate consultation required. Continue with routine medical care. Schedule follow-up only if new neurological symptoms develop such as severe headaches, vision changes, or weakness.'
    },
    'Breast': {
      diseaseName: 'Fibrocystic Changes',
      confidence: 82,
      explanation: 'The mammogram reveals bilateral fibrocystic changes characterized by scattered fibroglandular densities. Several small cysts are visible, particularly in the upper outer quadrants. No suspicious microcalcifications or architectural distortions identified.',
      reasoning: '1. Evaluated breast tissue density pattern\n2. Identified multiple well-circumscribed lesions consistent with cysts\n3. Assessed for suspicious calcifications - none found\n4. Checked for architectural distortion - tissue appears normal\n5. Compared symmetry between bilateral views\n6. Pattern consistent with benign fibrocystic condition',
      precautions: [
        'Monthly self-breast examination',
        'Reduce caffeine intake if symptomatic',
        'Wear supportive bras to minimize discomfort',
        'Consider evening primrose oil after consulting doctor',
        'Schedule annual mammogram screening'
      ],
      doctorAdvice: 'Routine follow-up with your primary care physician or gynecologist. Consider referral to breast clinic if you experience persistent pain or notice new lumps. Next mammogram recommended in 12 months.'
    }
  };

  return mockResponses[bodyPart] || mockResponses['Lung'];
};