// AI & Machine Learning Icon Set
// Imported as raw SVG so we can render inline and inherit currentColor.

import aiBrain from './AI Brain, artificial intelligence, brain, AI, smart.svg?raw'
import aiChip from './AI Chip, microchip, technology, processor, artificial intelligence.svg?raw'
import algorithmDiagram from './Algorithm Diagram, diagram, machine learning, data, flowchart.svg?raw'
import automatedWorkflow from './Automated Workflow, automation, process, technology, AI.svg?raw'
import chatbot from './Chatbot, AI, customer service, messaging, automated.svg?raw'
import cloudComputing from './Cloud Computing, AI, data, internet, technology.svg?raw'
import dataNetwork from './Data Network, data, internet, machine learning, connectivity.svg?raw'
import dataScienceChart from './Data Science Chart, chart, analytics, big data, machine learning.svg?raw'
import machineLearningGear from './Machine Learning Gear, settings, machine learning, AI, mechanics.svg?raw'
import neuralNetwork from './Neural Network, neural network, AI, algorithm, technology.svg?raw'
import predictiveAnalytics from './Predictive Analytics, data, forecasting, AI, machine learning.svg?raw'
import quantumComputing from './Quantum Computing, quantum, technology, future, AI.svg?raw'
import roboticsAutomation from './Robotics Automation, automation, AI, technology, machine.svg?raw'
import selfDrivingCar from './Self-Driving Car, car, autonomous, vehicle, AI.svg?raw'
import smartAssistant from './Smart Assistant, AI, voice, technology, automated.svg?raw'
import virtualRealityAI from './Virtual Reality AI, VR, AI, immersive, technology.svg?raw'

export const AI_ICONS = {
  aiBrain,
  aiChip,
  algorithmDiagram,
  automatedWorkflow,
  chatbot,
  cloudComputing,
  dataNetwork,
  dataScienceChart,
  machineLearningGear,
  neuralNetwork,
  predictiveAnalytics,
  quantumComputing,
  roboticsAutomation,
  selfDrivingCar,
  smartAssistant,
  virtualRealityAI,
} as const

export type AIIconName = keyof typeof AI_ICONS
