import type {
  Conversation,
  KnowledgeDocument,
  AssessmentSession,
  AssessmentResult,
  RevisionItem,
  LearningPath,
  ProgressAnalytics,
  UserProfile,
  KnowledgeGraph,
  SearchResult,
} from '@/types';

export const mockUser: UserProfile = {
  id: 'u1',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  learningField: 'AI & ML',
  level: 'intermediate',
  goal: 'Exam Preparation',
  dailyTarget: '1 hour',
  streak: 12,
  topics: ['Neural Networks', 'Backpropagation', 'Gradient Descent', 'CNNs', 'Transformers'],
  joinedAt: '2025-09-01',
  bio: 'CS student passionate about machine learning and AI.',
};

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    title: 'Backpropagation explanation',
    lastMessage: 'Think of backpropagation as working backward...',
    timestamp: '2h ago',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Explain backpropagation simply.',
        timestamp: '10:30 AM',
      },
      {
        id: 'm2',
        role: 'assistant',
        content:
          'Think of backpropagation as working backward through a model to understand which parameters contributed to the error. The network makes a prediction, compares it to the correct answer, then sends the error signal backward through each layer. At each layer, it calculates how much each weight contributed to the mistake and adjusts them slightly in the right direction. Over many iterations, these small adjustments add up, and the model gets better at its task.',
        citations: [
          {
            id: 'cit1',
            title: 'Neural Networks Lecture 04',
            type: 'video',
            timestamp: '32:18',
            excerpt:
              'Backpropagation computes the gradient of the loss function with respect to each weight by the chain rule, moving backward from the output layer...',
          },
          {
            id: 'cit2',
            title: 'ML Textbook',
            type: 'pdf',
            page: 72,
            excerpt:
              'The backpropagation algorithm is the standard method for computing gradients in deep neural networks...',
          },
        ],
        timestamp: '10:30 AM',
        suggestedActions: ['Explain more', 'Simplify', 'Give Example', 'Quiz Me'],
      },
    ],
  },
  {
    id: 'c2',
    title: 'Gradient descent vs Adam',
    lastMessage: 'Gradient descent uses a fixed learning rate...',
    timestamp: '1d ago',
    messages: [
      {
        id: 'm3',
        role: 'user',
        content: 'What is the difference between gradient descent and Adam optimizer?',
        timestamp: 'Yesterday',
      },
      {
        id: 'm4',
        role: 'assistant',
        content:
          'Gradient descent uses a fixed learning rate to update weights in the direction of the negative gradient. Adam (Adaptive Moment Estimation) adapts the learning rate for each parameter individually by keeping track of both the first moment (mean) and second moment (uncentered variance) of the gradients. This makes Adam converge faster and handle sparse gradients better, while standard gradient descent is simpler but may require careful learning rate tuning.',
        citations: [
          {
            id: 'cit3',
            title: 'ML Textbook',
            type: 'pdf',
            page: 85,
            excerpt:
              'Adam combines the advantages of AdaGrad and RMSProp, adapting learning rates based on moment estimates.',
          },
        ],
        timestamp: 'Yesterday',
        suggestedActions: ['Explain more', 'Give Example', 'Quiz Me'],
      },
    ],
  },
  {
    id: 'c3',
    title: 'Activation functions comparison',
    lastMessage: 'ReLU is the most commonly used activation...',
    timestamp: '3d ago',
    messages: [
      {
        id: 'm5',
        role: 'user',
        content: 'Compare ReLU, Sigmoid, and Tanh activation functions.',
        timestamp: '3 days ago',
      },
      {
        id: 'm6',
        role: 'assistant',
        content:
          'ReLU (Rectified Linear Unit) outputs the input directly if positive, otherwise zero. It is computationally efficient and helps with the vanishing gradient problem. Sigmoid squashes values between 0 and 1, making it useful for binary classification but prone to vanishing gradients in deep networks. Tanh is similar to sigmoid but outputs between -1 and 1, centering the data better. ReLU is the most commonly used in hidden layers due to its simplicity and performance.',
        citations: [
          {
            id: 'cit4',
            title: 'Week 4 Slides',
            type: 'slide',
            slide: 12,
            excerpt: 'Activation functions introduce non-linearity into the network...',
          },
        ],
        timestamp: '3 days ago',
        suggestedActions: ['Explain more', 'Simplify', 'Give Example'],
      },
    ],
  },
];

export const mockDocuments: KnowledgeDocument[] = [
  {
    id: 'd1',
    title: 'Machine Learning Textbook',
    type: 'pdf',
    pages: 342,
    status: 'indexed',
    uploadedAt: '2 weeks ago',
    fileSize: '12.4 MB',
    topics: ['Neural Networks', 'Gradient Descent', 'Optimization', 'Regularization'],
    excerpt: 'A comprehensive guide to machine learning fundamentals...',
    sections: [
      {
        id: 's1',
        title: 'Chapter 3: Neural Networks',
        page: 45,
        content:
          'Neural networks are computational models inspired by the structure of biological neurons. They consist of layers of interconnected nodes that process information...',
        highlights: ['deep learning', 'hidden layers', 'activation function'],
      },
      {
        id: 's2',
        title: 'Chapter 5: Backpropagation',
        page: 72,
        content:
          'The backpropagation algorithm computes the gradient of the loss function with respect to each weight by the chain rule, moving backward from the output layer...',
        highlights: ['chain rule', 'gradient', 'loss function'],
      },
      {
        id: 's3',
        title: 'Chapter 6: Optimization',
        page: 85,
        content:
          'Adam combines the advantages of AdaGrad and RMSProp, adapting learning rates based on moment estimates...',
        highlights: ['Adam', 'AdaGrad', 'learning rate'],
      },
    ],
  },
  {
    id: 'd2',
    title: 'Neural Networks Lecture 04',
    type: 'video',
    duration: '48 minutes',
    status: 'transcribed',
    uploadedAt: '1 week ago',
    fileSize: '320 MB',
    topics: ['Neural Networks', 'Backpropagation', 'Activation Functions'],
    excerpt: 'Lecture covering neural network architectures and training...',
    sections: [
      {
        id: 's4',
        title: 'Introduction to Backpropagation',
        timestamp: '32:18',
        content:
          'In this segment, we discuss how backpropagation works. The key idea is to propagate the error signal backward through the network...',
        highlights: ['error signal', 'backward pass', 'chain rule'],
      },
      {
        id: 's5',
        title: 'Activation Functions',
        timestamp: '15:30',
        content:
          'Activation functions introduce non-linearity. Without them, the network would just be a linear transformation regardless of depth...',
        highlights: ['non-linearity', 'ReLU', 'sigmoid'],
      },
    ],
  },
  {
    id: 'd3',
    title: 'ML Week 4 Slides',
    type: 'slide',
    slides: 42,
    status: 'indexed',
    uploadedAt: '5 days ago',
    fileSize: '8.2 MB',
    topics: ['Activation Functions', 'Loss Functions', 'Optimization'],
    excerpt: 'Week 4 lecture slides on neural network components...',
    sections: [
      {
        id: 's6',
        title: 'Slide 12: Activation Functions',
        slide: 12,
        content:
          'Activation functions introduce non-linearity into the network. Common choices include ReLU, Sigmoid, and Tanh.',
        highlights: ['ReLU', 'non-linearity'],
      },
      {
        id: 's7',
        title: 'Slide 25: Loss Functions',
        slide: 25,
        content: 'Loss functions measure how far the prediction is from the true value.',
        highlights: ['cross-entropy', 'MSE'],
      },
    ],
  },
  {
    id: 'd4',
    title: 'Backpropagation Notes',
    type: 'note',
    pages: 8,
    status: 'ready',
    uploadedAt: '3 days ago',
    fileSize: '124 KB',
    topics: ['Backpropagation', 'Chain Rule', 'Gradient Descent'],
    excerpt: 'Personal study notes on backpropagation mechanics...',
    sections: [
      {
        id: 's8',
        title: 'Key Concepts',
        page: 1,
        content:
          'Backpropagation = chain rule applied to neural networks. Forward pass computes output, backward pass computes gradients.',
        highlights: ['chain rule', 'forward pass', 'backward pass'],
      },
    ],
  },
];

export const mockAssessmentSession: AssessmentSession = {
  id: 'a1',
  title: 'Neural Networks & Optimization',
  totalQuestions: 10,
  currentQuestion: 3,
  completed: false,
  difficultyLevel: 'intermediate',
  startedAt: '2025-10-02T10:00:00Z',
  questions: [
    {
      id: 'q1',
      question: 'What is the primary purpose of an activation function in a neural network?',
      options: [
        { id: 'o1', text: 'To normalize input data' },
        { id: 'o2', text: 'To introduce non-linearity into the network' },
        { id: 'o3', text: 'To reduce the number of parameters' },
        { id: 'o4', text: 'To speed up training' },
      ],
      difficulty: 'easy',
      topic: 'Neural Networks',
      correctOptionId: 'o2',
      explanation:
        'Activation functions introduce non-linearity, allowing neural networks to learn complex patterns that linear transformations alone cannot capture.',
    },
    {
      id: 'q2',
      question: 'Which optimization algorithm uses the gradient of the loss function to update weights?',
      options: [
        { id: 'o1', text: 'K-Means Clustering' },
        { id: 'o2', text: 'Gradient Descent' },
        { id: 'o3', text: 'Principal Component Analysis' },
        { id: 'o4', text: 'Random Forest' },
      ],
      difficulty: 'easy',
      topic: 'Optimization',
      correctOptionId: 'o2',
      explanation:
        'Gradient descent updates weights by moving in the direction of the negative gradient of the loss function.',
    },
    {
      id: 'q3',
      question: 'What does the chain rule compute in backpropagation?',
      options: [
        { id: 'o1', text: 'The learning rate schedule' },
        { id: 'o2', text: 'The optimal batch size' },
        { id: 'o3', text: 'The gradient of the loss with respect to each weight' },
        { id: 'o4', text: 'The number of hidden layers needed' },
      ],
      difficulty: 'medium',
      topic: 'Backpropagation',
      correctOptionId: 'o3',
      explanation:
        'The chain rule is used to compute the gradient of the loss function with respect to each weight by multiplying partial derivatives through each layer.',
    },
    {
      id: 'q4',
      question: 'Which optimization algorithm uses the gradient of the loss function to update weights?',
      options: [
        { id: 'o1', text: 'K-Nearest Neighbors' },
        { id: 'o2', text: 'Support Vector Machine' },
        { id: 'o3', text: 'Gradient Descent' },
        { id: 'o4', text: 'Naive Bayes' },
      ],
      difficulty: 'medium',
      topic: 'Optimization',
      correctOptionId: 'o3',
      explanation: 'Gradient descent uses the gradient of the loss function.',
    },
    {
      id: 'q5',
      question: 'What is the vanishing gradient problem?',
      options: [
        { id: 'o1', text: 'When gradients become too large and cause overflow' },
        { id: 'o2', text: 'When gradients shrink to near-zero in deep networks, slowing learning' },
        { id: 'o3', text: 'When the learning rate is set too high' },
        { id: 'o4', text: 'When there are not enough training examples' },
      ],
      difficulty: 'hard',
      topic: 'Backpropagation',
      correctOptionId: 'o2',
      explanation:
        'The vanishing gradient problem occurs when gradients become extremely small as they are propagated backward through many layers, making it difficult for early layers to learn.',
    },
    {
      id: 'q6',
      question: 'How does Adam optimizer differ from standard gradient descent?',
      options: [
        { id: 'o1', text: 'Adam uses a fixed learning rate for all parameters' },
        { id: 'o2', text: 'Adam adapts learning rates per parameter using moment estimates' },
        { id: 'o3', text: 'Adam does not use gradients at all' },
        { id: 'o4', text: 'Adam only works for convex problems' },
      ],
      difficulty: 'hard',
      topic: 'Optimization',
      correctOptionId: 'o2',
      explanation:
        'Adam keeps running estimates of the first and second moments of the gradients to adaptively tune the learning rate for each parameter.',
    },
    {
      id: 'q7',
      question: 'What is L2 regularization also known as?',
      options: [
        { id: 'o1', text: 'Dropout' },
        { id: 'o2', text: 'Ridge Regression' },
        { id: 'o3', text: 'Lasso Regression' },
        { id: 'o4', text: 'Early Stopping' },
      ],
      difficulty: 'medium',
      topic: 'Regularization',
      correctOptionId: 'o2',
      explanation: 'L2 regularization adds the squared magnitude of weights to the loss function, also known as Ridge Regression.',
    },
    {
      id: 'q8',
      question: 'In a CNN, what does a convolutional layer do?',
      options: [
        { id: 'o1', text: 'It fully connects all neurons to the previous layer' },
        { id: 'o2', text: 'It applies filters to extract spatial features from the input' },
        { id: 'o3', text: 'It reduces the dimensionality using pooling' },
        { id: 'o4', text: 'It applies an activation function only' },
      ],
      difficulty: 'medium',
      topic: 'CNN',
      correctOptionId: 'o2',
      explanation: 'Convolutional layers apply learnable filters (kernels) across the input to detect spatial patterns like edges, textures, and shapes.',
    },
    {
      id: 'q9',
      question: 'What is the role of the attention mechanism in Transformers?',
      options: [
        { id: 'o1', text: 'To reduce model size' },
        { id: 'o2', text: 'To weight the importance of different input tokens dynamically' },
        { id: 'o3', text: 'To replace activation functions' },
        { id: 'o4', text: 'To normalize input data' },
      ],
      difficulty: 'hard',
      topic: 'Transformers',
      correctOptionId: 'o2',
      explanation:
        'Self-attention allows the model to weigh the relevance of each token relative to all other tokens, enabling it to capture long-range dependencies.',
    },
    {
      id: 'q10',
      question: 'What does cross-entropy loss measure?',
      options: [
        { id: 'o1', text: 'The distance between predicted and true probability distributions' },
        { id: 'o2', text: 'The average of squared errors' },
        { id: 'o3', text: 'The number of misclassified samples' },
        { id: 'o4', text: 'The variance of the predictions' },
      ],
      difficulty: 'easy',
      topic: 'Neural Networks',
      correctOptionId: 'o1',
      explanation: 'Cross-entropy loss measures the difference between two probability distributions — the predicted distribution and the true label distribution.',
    },
  ],
  answers: { q1: 'o2', q2: 'o2', q3: 'o3' },
};

export const mockAssessmentResult: AssessmentResult = {
  id: 'a1',
  score: 84,
  accuracy: 84,
  correct: 8,
  incorrect: 2,
  total: 10,
  topicBreakdown: [
    { topic: 'Neural Networks', mastery: 92 },
    { topic: 'Optimization', mastery: 81 },
    { topic: 'Backpropagation', mastery: 64 },
    { topic: 'Regularization', mastery: 88 },
  ],
  weakTopics: [
    {
      topic: 'Backpropagation',
      recall: '64% recall',
      lastAttempt: 'Today',
    },
  ],
  recommendedRevision: 'Backpropagation',
  completedAt: '2025-10-02T11:00:00Z',
  difficultyHistory: [
    { question: 1, difficulty: 'easy', correct: true },
    { question: 2, difficulty: 'easy', correct: true },
    { question: 3, difficulty: 'medium', correct: true },
    { question: 4, difficulty: 'medium', correct: true },
    { question: 5, difficulty: 'hard', correct: false },
    { question: 6, difficulty: 'hard', correct: true },
    { question: 7, difficulty: 'medium', correct: true },
    { question: 8, difficulty: 'medium', correct: true },
    { question: 9, difficulty: 'hard', correct: false },
    { question: 10, difficulty: 'easy', correct: true },
  ],
};

export const mockRevisionItems: RevisionItem[] = [
  {
    id: 'r1',
    topic: 'Backpropagation',
    reason: 'Recommended because your accuracy dropped during the last assessment.',
    estimatedTime: '5 min',
    priority: 'high',
    category: 'due-today',
    recommendations: [
      { label: 'Recent accuracy', value: '64%' },
      { label: 'Last practiced', value: '4 days ago' },
      { label: 'Related to upcoming assessment', value: 'Yes' },
    ],
  },
  {
    id: 'r2',
    topic: 'Gradient Descent',
    reason: 'Your recall has decreased since your last study session.',
    estimatedTime: '10 min',
    priority: 'medium',
    category: 'weak-topics',
    recommendations: [
      { label: 'Recent accuracy', value: '71%' },
      { label: 'Last practiced', value: '2 days ago' },
    ],
  },
  {
    id: 'r3',
    topic: 'Regularization',
    reason: 'Recently learned — reinforce with a quick review.',
    estimatedTime: '7 min',
    priority: 'low',
    category: 'recently-learned',
    recommendations: [
      { label: 'First learned', value: 'Today' },
      { label: 'Current mastery', value: '88%' },
    ],
  },
  {
    id: 'r4',
    topic: 'Vanishing Gradients',
    reason: 'High priority — this concept is foundational for upcoming topics.',
    estimatedTime: '12 min',
    priority: 'high',
    category: 'high-priority',
    recommendations: [
      { label: 'Current mastery', value: '52%' },
      { label: 'Prerequisite for', value: 'Transformers' },
    ],
  },
];

export const mockLearningPath: LearningPath = {
  id: 'lp1',
  title: 'Machine Learning Fundamentals',
  description: 'A structured path from ML basics to advanced deep learning architectures.',
  progress: 72,
  totalTopics: 8,
  completedTopics: 5,
  topics: [
    {
      id: 't1',
      title: 'Fundamentals',
      status: 'complete',
      progress: 100,
      estimatedTime: 'Done',
      description: 'Introduction to ML, types of learning, and basic terminology.',
      subtopics: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning'],
    },
    {
      id: 't2',
      title: 'Linear Regression',
      status: 'complete',
      progress: 100,
      estimatedTime: 'Done',
      description: 'Understanding linear models, loss functions, and gradient descent basics.',
      subtopics: ['Least Squares', 'Gradient Descent', 'Feature Scaling'],
    },
    {
      id: 't3',
      title: 'Neural Networks',
      status: 'complete',
      progress: 100,
      estimatedTime: 'Done',
      description: 'Neural network architecture, neurons, layers, and forward propagation.',
      subtopics: ['Perceptrons', 'Multi-layer Networks', 'Forward Pass'],
      materials: [
        { title: 'ML Textbook Ch. 3', type: 'pdf' },
        { title: 'Neural Networks Lecture 04', type: 'video' },
      ],
    },
    {
      id: 't4',
      title: 'Activation Functions',
      status: 'complete',
      progress: 100,
      estimatedTime: 'Done',
      description: 'ReLU, Sigmoid, Tanh, and their properties.',
      subtopics: ['ReLU', 'Sigmoid', 'Tanh', 'Softmax'],
    },
    {
      id: 't5',
      title: 'Loss Functions',
      status: 'complete',
      progress: 100,
      estimatedTime: 'Done',
      description: 'MSE, Cross-Entropy, and their use cases.',
      subtopics: ['MSE', 'Cross-Entropy', 'Hinge Loss'],
    },
    {
      id: 't6',
      title: 'Backpropagation',
      status: 'current',
      progress: 60,
      estimatedTime: '20 min remaining',
      description: 'The chain rule applied to neural networks for gradient computation.',
      subtopics: ['Chain Rule', 'Vanishing Gradients', 'Backward Pass'],
      materials: [
        { title: 'ML Textbook Ch. 5', type: 'pdf' },
        { title: 'Neural Networks Lecture 04', type: 'video' },
        { title: 'Backpropagation Notes', type: 'note' },
      ],
    },
    {
      id: 't7',
      title: 'CNNs',
      status: 'recommended',
      progress: 0,
      estimatedTime: '45 min',
      description: 'Convolutional Neural Networks for image processing.',
      subtopics: ['Convolutional Layers', 'Pooling', 'Feature Maps'],
    },
    {
      id: 't8',
      title: 'Transformers',
      status: 'upcoming',
      progress: 0,
      estimatedTime: '1 hour',
      description: 'Attention mechanisms and transformer architectures.',
      subtopics: ['Self-Attention', 'Multi-Head Attention', 'Positional Encoding'],
    },
  ],
};

export const mockProgress: ProgressAnalytics = {
  knowledgeScore: 78,
  retention: 84,
  consistency: 91,
  weakAreas: 3,
  knowledgeGrowth: [
    { date: 'Sep 5', score: 45 },
    { date: 'Sep 10', score: 52 },
    { date: 'Sep 15', score: 58 },
    { date: 'Sep 20', score: 63 },
    { date: 'Sep 25', score: 68 },
    { date: 'Sep 30', score: 73 },
    { date: 'Oct 2', score: 78 },
  ],
  accuracyOverTime: [
    { date: 'Sep 8', accuracy: 60 },
    { date: 'Sep 15', accuracy: 68 },
    { date: 'Sep 22', accuracy: 72 },
    { date: 'Sep 29', accuracy: 79 },
    { date: 'Oct 2', accuracy: 84 },
  ],
  studyTime: [
    { date: 'Mon', minutes: 45 },
    { date: 'Tue', minutes: 62 },
    { date: 'Wed', minutes: 30 },
    { date: 'Thu', minutes: 55 },
    { date: 'Fri', minutes: 70 },
    { date: 'Sat', minutes: 40 },
    { date: 'Sun', minutes: 50 },
  ],
  retentionData: [
    { date: 'Week 1', retention: 72 },
    { date: 'Week 2', retention: 78 },
    { date: 'Week 3', retention: 81 },
    { date: 'Week 4', retention: 84 },
  ],
  topicMastery: [
    { topic: 'Neural Networks', mastery: 92 },
    { topic: 'Optimization', mastery: 81 },
    { topic: 'Regularization', mastery: 88 },
    { topic: 'Backpropagation', mastery: 64 },
    { topic: 'CNNs', mastery: 35 },
    { topic: 'Transformers', mastery: 20 },
  ],
  weeklyActivity: [
    { day: 'Mon', hours: 1.5 },
    { day: 'Tue', hours: 2.1 },
    { day: 'Wed', hours: 1.0 },
    { day: 'Thu', hours: 1.8 },
    { day: 'Fri', hours: 2.3 },
    { day: 'Sat', hours: 1.3 },
    { day: 'Sun', hours: 1.7 },
  ],
  aiSummary:
    'Your strongest area is model architecture. Shorter study sessions are currently associated with better quiz performance. Focus on backpropagation — your recent assessments show it needs reinforcement.',
  strongestArea: 'Model Architecture',
};

export const mockKnowledgeGraph: KnowledgeGraph = {
  nodes: [
    { id: 'ml', label: 'Machine Learning', mastery: 78, x: 50, y: 8 },
    { id: 'nn', label: 'Neural Networks', mastery: 92, x: 25, y: 34 },
    { id: 'opt', label: 'Optimization', mastery: 81, x: 75, y: 34 },
    { id: 'act', label: 'Activation Functions', mastery: 88, x: 10, y: 62 },
    { id: 'bp', label: 'Backpropagation', mastery: 64, x: 23, y: 62 },
    { id: 'cnn', label: 'CNN', mastery: 35, x: 33, y: 62 },
    { id: 'transformers', label: 'Transformers', mastery: 20, x: 43, y: 62 },
    { id: 'gd', label: 'Gradient Descent', mastery: 75, x: 62, y: 62 },
    { id: 'adam', label: 'Adam', mastery: 68, x: 75, y: 62 },
    { id: 'reg', label: 'Regularization', mastery: 88, x: 88, y: 62 },
  ],
  edges: [
    { from: 'ml', to: 'nn' },
    { from: 'ml', to: 'opt' },
    { from: 'nn', to: 'act' },
    { from: 'nn', to: 'bp' },
    { from: 'nn', to: 'cnn' },
    { from: 'nn', to: 'transformers' },
    { from: 'opt', to: 'gd' },
    { from: 'opt', to: 'adam' },
    { from: 'opt', to: 'reg' },
  ],
};

export const mockSearchResults: SearchResult[] = [
  {
    id: 'sr1',
    title: 'Gradient Descent',
    type: 'pdf',
    page: 72,
    excerpt: 'Gradient descent updates weights by moving in the direction of the negative gradient...',
    documentId: 'd1',
  },
  {
    id: 'sr2',
    title: 'Gradient Descent',
    type: 'video',
    timestamp: '32:18',
    excerpt: 'In this segment, we discuss how backpropagation works with gradient descent...',
    documentId: 'd2',
  },
  {
    id: 'sr3',
    title: 'Gradient Descent',
    type: 'slide',
    slide: 14,
    excerpt: 'Week 5 slides covering optimization algorithms including gradient descent.',
    documentId: 'd3',
  },
];

export const mockLearningMemory = {
  confidentTopics: ['Linear Regression', 'Basic Python', 'Activation Functions'],
  workingOn: ['Backpropagation', 'Optimization'],
  preference: 'Simplified explanations',
};
