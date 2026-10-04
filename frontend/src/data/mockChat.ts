import type { ChatMessage, ChatSource, AgentActivity } from '@/types';

export const mockChatSources: ChatSource[] = [
  {
    id: 'src-001',
    title: 'Deep Learning Notes',
    type: 'pdf',
    page: 42,
    snippet: 'Backpropagation is a supervised learning algorithm used to train neural networks by computing the gradient of the loss function with respect to each weight by the chain rule.',
  },
  {
    id: 'src-002',
    title: 'Neural Networks Slides',
    type: 'ppt',
    slide: 18,
    snippet: 'The backpropagation algorithm works by propagating the error backward through the network. A forward pass computes the output, then the error is calculated, and gradients are propagated backward to update weights.',
  },
  {
    id: 'src-003',
    title: 'Lecture 5',
    type: 'video',
    timestamp: '12:42',
    snippet: 'In this lecture, we cover backpropagation in detail. The key insight is that we use the chain rule of calculus to compute how each weight contributes to the overall error.',
  },
];

export const mockChatHistory: ChatMessage[] = [
  {
    id: 'msg-001',
    role: 'student',
    content: 'What is backpropagation?',
    timestamp: '10:30 AM',
  },
  {
    id: 'msg-002',
    role: 'ai',
    content:
      'Backpropagation is a fundamental algorithm used to train neural networks. Here\'s how it works:\n\n**1. Forward Pass:** Input data flows through the network, layer by layer, producing a prediction. Each neuron applies a weight and activation function.\n\n**2. Loss Calculation:** The prediction is compared to the actual target using a loss function (e.g., Mean Squared Error or Cross-Entropy), measuring how far off the prediction is.\n\n**3. Backward Pass (Gradient Computation):** Using the chain rule of calculus, the algorithm computes the gradient of the loss with respect to each weight in the network. This tells us how much each weight contributed to the error.\n\n**4. Weight Update:** Weights are adjusted in the opposite direction of the gradient to minimize the loss. This is done using an optimizer like SGD or Adam with a learning rate controlling step size.\n\nThe process repeats for many iterations (epochs) until the network learns to make accurate predictions.',
    sources: mockChatSources,
    timestamp: '10:30 AM',
  },
];

export const mockAgentActivities: AgentActivity[] = [
  {
    agent: 'Planner Agent',
    status: 'done',
    description: 'Understanding student request',
  },
  {
    agent: 'Tutor Agent',
    status: 'done',
    description: 'Retrieving relevant sources from knowledge base',
  },
  {
    agent: 'Assessment Agent',
    status: 'idle',
    description: 'Selecting adaptive questions',
  },
  {
    agent: 'Recommendation Agent',
    status: 'idle',
    description: 'Preparing next learning step',
  },
];

export const mockAiResponses: Record<string, string> = {
  'explain simply':
    "Think of backpropagation like a feedback system. When a neural network makes a prediction that's wrong, backpropagation figures out which parts of the network caused the error and adjusts them slightly. It's like a student getting an exam back, seeing which questions they got wrong, and studying those specific topics harder next time.\n\nThe key idea: learn from mistakes by tracing the error back to its source.",
  'explain deeply':
    "Backpropagation is mathematically an application of the chain rule from calculus applied to computational graphs.\n\n**Mathematical Foundation:**\nFor a network with layers L₁ → L₂ → ... → Lₙ, the loss L is a function of the output. The gradient of L with respect to any weight wᵢⱼ in layer l is:\n\n∂L/∂wᵢⱼ = ∂L/∂zⱼ · ∂zⱼ/∂wᵢⱼ\n\nwhere zⱼ is the weighted sum at neuron j. The key insight is that ∂L/∂zⱼ can be computed recursively from the layer above:\n\n∂L/∂zⱼ = Σₖ (∂L/∂zₖ · wⱼₖ) · f'(zⱼ)\n\nThis recursive computation flows backward through the network, hence 'back' propagation. The time complexity is O(weights) per sample, making it efficient.",
  'give an example':
    "Imagine you're training a neural network to recognize handwritten digits.\n\n**Forward Pass:** You show it an image of a '7'. The network processes it through its layers and predicts '2' with 60% confidence.\n\n**Loss Calculation:** The true label is '7', so the loss is high.\n\n**Backward Pass:** Backpropagation traces back through the network:\n- The output layer neurons for '7' should have been more active\n- The error signal propagates backward, identifying which hidden neurons contributed to the wrong prediction\n- Each weight receives a gradient showing how to adjust to reduce the error\n\n**Update:** Weights are nudged slightly. After thousands of such iterations with different images, the network learns to correctly identify digits.",
  'give an analogy':
    "Think of backpropagation like a restaurant kitchen trying to improve a recipe.\n\nA customer (the loss function) says the soup is too salty. The head chef (output layer) tells the sous chef (hidden layer) 'reduce the salt you passed me.' The sous chef traces back to the prep cook (input layer) who measured the salt, and tells them to use less next time.\n\nEach person in the chain adjusts their contribution based on feedback from the person above them. Over many batches, the recipe improves — just like weights in a neural network improve over many training examples.",
  summarize:
    "Backpropagation trains neural networks by: (1) making a prediction (forward pass), (2) measuring the error, (3) computing how each weight contributed to the error using the chain rule (backward pass), and (4) adjusting weights to reduce future errors. It repeats this cycle until the network learns.",
  'quiz me':
    "I'll generate an adaptive quiz for you based on your current mastery. Let me start a quiz focused on your weaker areas first.\n\nClick 'Start Adaptive Quiz' to begin!",
  'show related topics':
    'Related topics to backpropagation:\n\n1. **Gradient Descent** — The optimization algorithm that uses the gradients from backpropagation\n2. **Chain Rule** — The mathematical foundation enabling gradient computation through layers\n3. **Vanishing/Exploding Gradients** — Common problems in deep networks during backprop\n4. **Activation Functions** — Choice affects gradient flow (ReLU vs Sigmoid)\n5. **Optimizers** — SGD, Adam, RMSProp use backprop gradients differently',
};

export const defaultAiResponse =
  "Based on your learning materials, here's what I found:\n\nThis concept is covered across multiple sources in your knowledge base. The key points are:\n\n1. **Definition:** The core concept involves understanding the fundamental principles and how they relate to the broader topic.\n\n2. **Application:** In practice, this is applied through structured processes that build on foundational knowledge.\n\n3. **Connection to your materials:** Your uploaded textbooks and lecture notes cover this topic in detail.\n\nWould you like me to explain this more simply, give an example, or quiz you on this topic?";
