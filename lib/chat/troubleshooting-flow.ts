import { ChatResponse } from '@/lib/types/chat';

// Knowledge base for technical troubleshooting
const TROUBLESHOOTING_KB = {
  ac: {
    'not-cooling': {
      title: 'AC Not Cooling Properly',
      steps: [
        "First, let's check your thermostat. Is it set to 'cool' and is the temperature set lower than the current room temperature?",
        "Next, please check the air filter. A dirty or clogged filter can significantly block airflow. Have you cleaned or replaced it recently?",
        "Make sure all vents in the room are open and not blocked by furniture or curtains.",
        "Let's look at the outdoor unit. Is there any debris, leaves, or other obstructions around it that could be blocking airflow?",
        "Please check your home's circuit breaker panel. Has the breaker for the AC unit tripped?",
        "After checking these things, it's best to wait about 1-2 hours to see if the cooling improves.",
      ],
      escalation:
        'If the AC is still not cooling after these steps, or if you notice any ice on the coils or hear unusual electrical noises, it is best to have a professional take a look. I can help you schedule a technician.',
    },
    'strange-noises': {
      title: 'Strange AC Noises',
      steps: [
        'Could you describe the noise? Is it a rattling, grinding, squealing, clicking, or buzzing sound?',
        "A **rattling** sound can sometimes be fixed by checking for loose screws on the unit's panels or clearing debris from the outdoor unit. Please turn off the power before checking.",
        "A **grinding** or **squealing** noise often indicates a serious motor or belt issue. If you hear this, please turn off the AC immediately to prevent further damage.",
        "A **clicking** sound is often normal during startup and shutdown. However, if it's continuous, it could be a relay problem.",
        "A **buzzing** sound can indicate an electrical issue. If it's loud or persistent, turn off the unit.",
      ],
      escalation:
        'If you hear grinding, squealing, or a loud, persistent buzzing noise, or if you smell something burning, please stop using the AC immediately. These issues require professional diagnosis. I can arrange for a technician to visit.',
    },
    'water-leakage': {
      title: 'AC Water Leakage',
      steps: [
        'First, please turn off the AC unit to prevent any electrical hazards or water damage.',
        'Can you see if the condensate drain pan (usually located under the indoor unit) is overflowing?',
        'Sometimes, the condensate drain line can get clogged. If you can safely access it, you can try to clear any visible blockage.',
        'A very dirty air filter can also cause the coils to freeze and leak water when they melt. When was the last time the filter was changed?',
      ],
      escalation:
        'If there is a major leak, if any electrical parts are wet, or if you see that the coils are frozen, it is a safety risk. We strongly recommend professional service. Shall I help you book a technician?',
    },
    'not-turning-on': {
      title: 'AC Won\'t Turn On',
      steps: [
        "Let's start with the basics. Have you checked that the unit is plugged in and the circuit breaker hasn't tripped?",
        'If you use a remote control, could you try replacing the batteries?',
        'Please double-check that the thermostat is set to "cool" and has power.',
        'If possible, you could try plugging another appliance into the same outlet to confirm the outlet is working.',
      ],
      escalation:
        'If the AC still does not turn on after these checks, or if you notice a burning smell or see sparks, please do not try anything else. This indicates a more serious electrical problem. I can connect you with a technician right away.',
    },
  },
  refrigerator: {
    'not-cooling': {
      title: 'Refrigerator Not Cooling',
      steps: [
        "First, let's check the temperature settings. The fridge should be set to around 3-4°C (37-40°F) and the freezer to -18°C (0°F).",
        "A simple way to check the door seal is to close the door on a piece of paper. If you can pull the paper out easily, the seal might be weak and need cleaning or replacement.",
        "The condenser coils (usually at the back or bottom of the unit) can get dusty, which affects cooling. Have they been cleaned recently?",
        "Also, ensure the fridge isn't too packed with food, as this can block air circulation.",
      ],
      escalation:
        "If the fridge still isn't cooling after 4-6 hours, or if you notice the compressor is not running at all or making unusual sounds, it's time for a professional diagnosis. I can help you schedule a service call.",
    },
    'strange-noises': {
      title: 'Strange Refrigerator Noises',
      steps: [
        'Many refrigerator noises are normal. Can you describe the sound? Is it humming, gurgling, clicking, rattling, or something else?',
        '**Humming** and **gurgling** are usually normal sounds of the compressor and refrigerant flowing.',
        'A **clicking** sound is often the defrost timer and is also normal.',
        'If you hear **rattling**, check if items on top of the fridge are vibrating or if the unit is level on the floor.',
      ],
      escalation:
        'However, a loud **grinding**, **squealing**, or a very loud, constant **humming** can indicate a problem with a fan motor or the compressor. If you hear these, it is best to get it checked. Shall I arrange for a technician?',
    },
    'water-leakage': {
      title: 'Water Leaking from Fridge',
      steps: [
        'Water leakage is often caused by a blocked defrost drain. This small hole is usually at the bottom back of the refrigerator compartment. You can try clearing it gently with a pipe cleaner.',
        'Please check that the refrigerator is level on the floor. If it tilts forward, water may not drain properly.',
        'Inspect the door seals for any tears or gaps where warm air could be entering and causing excess condensation.',
      ],
      escalation:
        'If you find a large amount of water, or if the leak is near any electrical components, please unplug the refrigerator for safety. In these cases, professional help is needed. I can schedule a technician for you.',
    },
  },
};

// Type definitions for our troubleshooting flow
type Appliance = 'ac' | 'refrigerator';
type Issue = keyof typeof TROUBLESHOOTING_KB.ac | keyof typeof TROUBLESHOOTING_KB.refrigerator;

interface TroubleshootingState {
  appliance: Appliance | null;
  issue: Issue | null;
  currentStep: number;
  active: boolean;
}

export class TroubleshootingFlow {
  private state: TroubleshootingState;

  constructor() {
    this.state = {
      appliance: null,
      issue: null,
      currentStep: 0,
      active: false,
    };
  }

  // Check if a message triggers the troubleshooting flow
  public checkForTrigger(message: string): { trigger: boolean; appliance: Appliance | null } {
    const lowerMessage = message.toLowerCase();
    const hasAppliance = lowerMessage.includes('ac') || lowerMessage.includes('air conditioner') || lowerMessage.includes('fridge') || lowerMessage.includes('refrigerator');
    const hasProblem = lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('not working') || lowerMessage.includes('broken');

    if (hasAppliance && hasProblem) {
      if (lowerMessage.includes('ac') || lowerMessage.includes('air conditioner')) {
        return { trigger: true, appliance: 'ac' };
      }
      if (lowerMessage.includes('fridge') || lowerMessage.includes('refrigerator')) {
        return { trigger: true, appliance: 'refrigerator' };
      }
    }

    return { trigger: false, appliance: null };
  }

  // Start a new troubleshooting session
  public start(appliance: Appliance, issue: Issue): ChatResponse {
    this.state = {
      appliance,
      issue,
      currentStep: 0,
      active: true,
    };
    const kb = (TROUBLESHOOTING_KB as any)[appliance]?.[issue];
    return {
      text: `I understand you're having an issue with your ${appliance.toUpperCase()}: ${
        kb.title
      }. Let's try a few things.\n\n${kb.steps[0]}`,
      quickReplies: [
        { text: "Yes, I've tried that", value: 'next_step' },
        { text: "No, let me check", value: 'check_now' },
        { text: "That's not the problem", value: 'wrong_issue' },
      ],
    };
  }

  // Get the next step in the flow
  public nextStep(): ChatResponse {
    if (!this.state.active || !this.state.appliance || !this.state.issue) {
      return this.getEscalationResponse();
    }

    this.state.currentStep++;
    const kb = (TROUBLESHOOTING_KB as any)[this.state.appliance]?.[this.state.issue];

    if (this.state.currentStep < kb.steps.length) {
      return {
        text: kb.steps[this.state.currentStep],
        quickReplies: [
          { text: "Okay, what's next?", value: 'next_step' },
          { text: 'I need more help', value: 'escalate' },
          { text: 'Stop troubleshooting', value: 'stop' },
        ],
      };
    } else {
      this.state.active = false;
      return {
        text: kb.escalation,
        quickReplies: [
          { text: 'Yes, book a technician', value: 'book_technician' },
          { text: 'No, thank you', value: 'end_chat' },
        ],
      };
    }
  }

  // Handle user responses
  public handleResponse(response: string): ChatResponse | null {
    if (!this.state.active) return null;

    const lowerResponse = response.toLowerCase();

    if (lowerResponse.includes('yes') || lowerResponse.includes('next')) {
      return this.nextStep();
    }

    if (lowerResponse.includes('no') || lowerResponse.includes('stop')) {
      this.state.active = false;
      return {
        text: 'Okay. If you need more help, feel free to ask. Is there anything else I can assist you with?',
      };
    }

    if (lowerResponse.includes('escalate') || lowerResponse.includes('technician')) {
        this.state.active = false;
        return this.getEscalationResponse();
    }

    // Default to providing the current step again if response is unclear
    return this.getCurrentStepResponse();
  }

  // Stop the current flow
  public stop(): void {
    this.state.active = false;
  }

  public isActive(): boolean {
    return this.state.active;
  }

  private getCurrentStepResponse(): ChatResponse {
    if (!this.state.active || !this.state.appliance || !this.state.issue) {
      return this.getEscalationResponse();
    }
    const kb = (TROUBLESHOOTING_KB as any)[this.state.appliance]?.[this.state.issue];
    return {
        text: kb.steps[this.state.currentStep],
    }
  }

  private getEscalationResponse(): ChatResponse {
    if (!this.state.appliance || !this.state.issue) {
        return {
            text: "I see you need more help. I can connect you with a technician. Shall I proceed?",
            quickReplies: [
                { text: 'Yes, book a technician', value: 'book_technician' },
                { text: 'No, thank you', value: 'end_chat' },
            ],
        }
    }
    const kb = (TROUBLESHOOTING_KB as any)[this.state.appliance]?.[this.state.issue];
    return {
      text: kb.escalation,
      quickReplies: [
        { text: 'Yes, book a technician', value: 'book_technician' },
        { text: 'No, thank you', value: 'end_chat' },
      ],
    };
  }

  // A simple method to select an issue based on keywords
  public selectIssue(appliance: Appliance, message: string): Issue | null {
    const lowerMessage = message.toLowerCase();
    const issues = Object.keys(TROUBLESHOOTING_KB[appliance]);

    if (lowerMessage.includes('cool') || lowerMessage.includes('cold')) return 'not-cooling' as Issue;
    if (lowerMessage.includes('noise') || lowerMessage.includes('sound')) return 'strange-noises' as Issue;
    if (lowerMessage.includes('leak') || lowerMessage.includes('water')) return 'water-leakage' as Issue;
    if (appliance === 'ac' && (lowerMessage.includes('turn on') || lowerMessage.includes('power'))) return 'not-turning-on' as Issue;

    return issues[0] as Issue; // Default to the first issue if no keywords match
  }
}
